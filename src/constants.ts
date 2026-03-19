import { FuelStation, FuelLog, UserQuota, UserProfile } from './types';

// Quota limits by vehicle type (Liters per month)
export const QUOTA_LIMITS: Record<UserProfile['vehicleType'], number> = {
  motorcycle: 5,
  three_wheeler: 15,
  motor_car: 15,
  van: 40,
  bus: 60,
  lorry: 200,
};

// Get user profile from localStorage
export function getUserProfile(): UserProfile | null {
  const stored = localStorage.getItem('tanka_user_profile');
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}

// Save user profile to localStorage
export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem('tanka_user_profile', JSON.stringify(profile));
}

// Check if today is an odd or even day
export function isEvenDay(): boolean {
  return new Date().getDate() % 2 === 0;
}

// Check if plate is eligible today based on odd/even system
export function isPlateEligible(plateNumber: string): boolean {
  const lastDigit = parseInt(plateNumber.slice(-1));
  if (isNaN(lastDigit)) return true; // Non-numeric plates always eligible
  const evenDay = isEvenDay();
  return evenDay ? lastDigit % 2 === 0 : lastDigit % 2 !== 0;
}

// Get next eligible date for a plate
export function getNextEligibleDate(plateNumber: string): Date {
  const today = new Date();
  const lastDigit = parseInt(plateNumber.slice(-1));
  
  for (let i = 1; i <= 31; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    const isEven = nextDate.getDate() % 2 === 0;
    const digitEven = lastDigit % 2 === 0;
    
    if ((isEven && digitEven) || (!isEven && !digitEven)) {
      return nextDate;
    }
  }
  return today;
}

// Format days until date
export function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Check if today is Wednesday
export function isWednesday(): boolean {
  return new Date().getDay() === 3;
}

export const STATIONS: FuelStation[] = [
  {
    id: 'STATION_LK_COL_0042',
    name: 'LANKA IOC - KOLLUPITIYA',
    operator: 'LIOC',
    location: 'Kollupitiya',
    distance: '2.8 KM',
    lat: 6.9128,
    lng: 79.8507,
    status: 'AVAILABLE',
    fuels: [
      { type: '92_OCTANE_PETROL', available: true, amount: 4200 },
      { type: '95_OCTANE_PREMIUM', available: false, amount: 0 },
      { type: 'SUPER_DIESEL', available: true, amount: 1250 },
    ],
    queueLength: '400M',
    lastReport: '10_MINS_AGO_USER_0921',
  },
  {
    id: 'STATION_LK_COL_0012',
    name: 'Ceypetco',
    operator: 'CEYPETCO',
    location: 'Bambalapitiya',
    distance: '0.4 KM',
    lat: 6.8981,
    lng: 79.8550,
    status: 'AVAILABLE',
    fuels: [
      { type: '92_OCTANE_PETROL', available: true },
      { type: 'DIESEL', available: true },
    ],
    queueLength: '150M',
    lastReport: '5_MINS_AGO_USER_0882',
  },
  {
    id: 'STATION_LK_COL_0088',
    name: 'Sinopec',
    operator: 'SINOPEC',
    location: 'Wellawatte',
    distance: '1.2 KM',
    lat: 6.8820,
    lng: 79.8600,
    status: 'UNAVAILABLE',
    fuels: [
      { type: '95_OCTANE_PREMIUM', available: false },
      { type: 'SUPER_DIESEL', available: false },
    ],
    queueLength: '0M',
    lastReport: '1_HOUR_AGO_USER_0771',
  },
];

export const FUEL_LOGS: FuelLog[] = [
  { id: '1', date: '2023.OCT.24', volume: 32.40, cost: 12450.00, unitPrice: 384.25 },
  { id: '2', date: '2023.OCT.18', volume: 40.15, cost: 15417.00, unitPrice: 384.00 },
  { id: '3', date: '2023.OCT.10', volume: 15.20, cost: 5840.00, unitPrice: 384.21 },
  { id: '4', date: '2023.OCT.02', volume: 24.80, cost: 9143.00, unitPrice: 368.67 },
];

// Default quota display (will be overridden by user profile)
export const DEFAULT_QUOTA: UserQuota = {
  vehicleNo: 'CAB-1234',
  fuelType: 'DIESEL',
  remaining: 20.00,
  limit: 60,
};
