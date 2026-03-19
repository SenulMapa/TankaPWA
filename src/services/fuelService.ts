import { FuelStation } from '../types';

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
    const allUrl = `${JEDACH_API_BASE}/stations`;
    const response = await fetch(allUrl);
    if (!response.ok) throw new Error('API_OFFLINE');
    const result = await response.json();
    const data = result.data || result;

    const stations: FuelStation[] = data
      .filter((s: any) => {
        const sLat = s.lat || s.latitude;
        const sLng = s.lng || s.longitude;
        if (!sLat || !sLng) return false;
        const dist = calculateDistance(lat, lng, sLat, sLng);
        return dist <= radius;
      })
      .map((s: any) => ({
        id: s.id || `STATION_${s.name.replace(/\s+/g, '_')}`,
        name: s.name,
        operator: s.operator || 'Independent',
        location: s.location || s.city || 'Unknown',
        distance: `${calculateDistance(lat, lng, s.lat || s.latitude, s.lng || s.longitude).toFixed(1)} KM`,
        lat: s.lat || s.latitude,
        lng: s.lng || s.longitude,
        status: getSeededStatus(s.id || s.name),
        fuels: s.fuels || [{ type: '92_OCTANE_PETROL', available: true }, { type: 'DIESEL', available: true }],
        queueLength: s.queue_length || 'N/A',
        lastReport: s.last_updated || 'RECENT',
      }));

    return stations.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  } catch (err) {
    console.error('Failed to fetch stations:', err);
    return [];
  }
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
