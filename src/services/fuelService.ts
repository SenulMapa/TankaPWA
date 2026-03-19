import { FuelStation, FuelLog } from '../types';

const JEDACH_API_BASE = 'https://jedach-fuel-api.mapasenul.workers.dev/api';

// Haversine formula for distance calculation
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Seeded availability status based on station ID
export function getSeededStatus(stationId: string): 'AVAILABLE' | 'UNAVAILABLE' | 'REPLENISHING' {
  const hash = stationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const statuses: ('AVAILABLE' | 'UNAVAILABLE' | 'REPLENISHING')[] = ['AVAILABLE', 'UNAVAILABLE', 'REPLENISHING'];
  return statuses[hash % 3];
}

export async function fetchNearbyStations(lat: number, lng: number, radius: number = 50): Promise<FuelStation[]> {
  try {
    // Fetch all stations from API
    const allUrl = `${JEDACH_API_BASE}/stations`;
    const response = await fetch(allUrl);
    if (!response.ok) throw new Error('API_OFFLINE');
    const result = await response.json();
    const data = result.data || result;

    // Filter by distance client-side
    const stations: FuelStation[] = data
      .filter((s: any) => {
        const sLat = s.lat || s.latitude;
        const sLng = s.lng || s.longitude;
        if (!sLat || !sLng) return false;
        const dist = calculateDistance(lat, lng, sLat, sLng);
        return dist <= radius; // Filter within radius km
      })
      .map((s: any) => {
        const sLat = s.lat || s.latitude;
        const sLng = s.lng || s.longitude;
        const dist = calculateDistance(lat, lng, sLat, sLng);

        return {
          id: s.id || `STATION_${s.name.replace(/\s+/g, '_')}`,
          name: s.name,
          operator: s.operator || 'Independent',
          location: s.location || s.city || 'Unknown',
          distance: `${dist.toFixed(1)} KM`,
          lat: sLat,
          lng: sLng,
          status: getSeededStatus(s.id || s.name),
          fuels: s.fuels || [
            { type: '92_OCTANE_PETROL', available: true },
            { type: 'DIESEL', available: true }
          ],
          queueLength: s.queue_length || 'N/A',
          lastReport: s.last_updated || 'RECENT',
        };
      });

    return stations.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  } catch (err) {
    console.error('Failed to fetch stations:', err);
    return [];
  }
}

// Hardcoded daily briefing messages - rotates based on date
const BRIEFING_MESSAGES = [
  "Supply stabilized across Western Province. Inventory levels at Kolonnawa Terminal are currently at 84%.",
  "Fuel availability remains consistent. Minor queues reported at peak hours in Colombo Metro stations.",
  "National stock levels adequate. No supply disruptions expected this week.",
  "Diesel inventory at 78% capacity. Petrol stocks stable across all distribution centers.",
  "Weekend demand surge anticipated. Current wait times averaging 15-25 minutes at major outlets.",
  "Monsoon season logistics adjusted. All regional terminals operating at normal capacity.",
  "Price stability maintained. No revisions expected until next fiscal review.",
  "Holiday season demand projections within manageable range. Strategic reserves activated.",
];

export function getDailyBriefing(): { message: string, date: string } {
  const today = new Date();
  const dayIndex = today.getDate() % BRIEFING_MESSAGES.length;
  const message = BRIEFING_MESSAGES[dayIndex];
  const dateStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return { message, date: dateStr };
}

// Algorithmic prediction based on fill-up history
export function predictNextFillup(logs: FuelLog[]): { prediction: string, days: number } {
  if (logs.length < 2) {
    return { prediction: "Insufficient data for prediction", days: 7 };
  }

  // Calculate average days between fill-ups
  const dates = logs.map(log => new Date(log.date).getTime()).sort((a, b) => a - b);
  const intervals: number[] = [];
  
  for (let i = 1; i < dates.length; i++) {
    const daysDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    intervals.push(daysDiff);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const lastFillup = new Date(dates[dates.length - 1]);
  const nextFillup = new Date(lastFillup.getTime() + avgInterval * 24 * 60 * 60 * 1000);
  
  const daysUntil = Math.ceil((nextFillup.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const prediction = daysUntil <= 0 
    ? "Due for refill soon"
    : `Next refill in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;

  return { prediction, days: Math.max(0, daysUntil) };
}

// Check if user is near a station (for passive QR reporting)
export function checkNearStation(userLat: number, userLng: number, stations: FuelStation[]): FuelStation | null {
  const THRESHOLD_KM = 0.1; // 100 meters
  
  for (const station of stations) {
    const dist = calculateDistance(userLat, userLng, station.lat, station.lng);
    if (dist <= THRESHOLD_KM) {
      return station;
    }
  }
  return null;
}

// Log passive report to localStorage
export function logPassiveReport(stationId: string, status: 'AVAILABLE' | 'UNAVAILABLE') {
  const existing = JSON.parse(localStorage.getItem('tanka_passive_reports') || '[]');
  const newReport = {
    stationId,
    timestamp: Date.now(),
    status,
    type: 'passive'
  };
  
  // Keep last 100 reports
  const updated = [newReport, ...existing].slice(0, 100);
  localStorage.setItem('tanka_passive_reports', JSON.stringify(updated));
}
