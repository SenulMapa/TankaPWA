export interface FuelStation {
  id: string;
  name: string;
  operator: string;
  location: string;
  distance: string;
  lat: number;
  lng: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'REPLENISHING';
  fuels: {
    type: string;
    available: boolean;
    amount?: number;
  }[];
  queueLength: string;
  lastReport: string;
}

export interface FuelLog {
  id: string;
  date: string;
  volume: number;
  cost: number;
  unitPrice: number;
}

export interface UserQuota {
  vehicleNo: string;
  fuelType: string;
  remaining: number;
  limit: number;
}

export interface UserProfile {
  plateNumber: string;
  vehicleType: 'motorcycle' | 'three_wheeler' | 'motor_car' | 'van' | 'bus' | 'lorry';
  name?: string;
  onboarded: boolean;
}

export interface PassiveReport {
  stationId: string;
  timestamp: number;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  type: 'passive';
}
