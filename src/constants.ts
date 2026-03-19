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
