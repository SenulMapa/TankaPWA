import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Fuel } from 'lucide-react';
import { UserProfile } from '@/src/types';
import { saveUserProfile } from '@/src/constants';
import { cn } from '@/src/lib/utils';

interface OnboardingProps {
  onComplete: () => void;
}

const VEHICLE_TYPES: { value: UserProfile['vehicleType']; label: string; quota: number }[] = [
  { value: 'motorcycle', label: 'Motorcycle', quota: 5 },
  { value: 'three_wheeler', label: 'Three-Wheeler', quota: 15 },
  { value: 'motor_car', label: 'Motor Car', quota: 15 },
  { value: 'van', label: 'Van', quota: 40 },
  { value: 'bus', label: 'Bus', quota: 60 },
  { value: 'lorry', label: 'Lorry', quota: 200 },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<UserProfile['vehicleType']>('motor_car');
  const [name, setName] = useState('');

  const handleComplete = () => {
    const profile: UserProfile = {
      plateNumber: plateNumber.toUpperCase(),
      vehicleType,
      name: name.trim() || undefined,
      onboarded: true,
    };
    saveUserProfile(profile);
    onComplete();
  };

  const canProceed = step === 1 ? plateNumber.length >= 4 : step === 2 ? !!vehicleType : true;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-primary-container/10 border border-primary-container rounded-full flex items-center justify-center mb-4">
            <Fuel className="w-8 h-8 text-primary-container" />
          </div>
          <h1 className="font-headline font-bold text-2xl text-primary-container uppercase tracking-tighter">
            TANKA OH
          </h1>
          <p className="font-mono text-[10px] text-outline uppercase tracking-[0.2em] mt-2">
            FUEL MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "flex-1 h-1",
                s <= step ? "bg-primary-container" : "bg-surface-container-highest"
              )}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-surface-container border border-outline-variant p-6 space-y-6">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <h2 className="font-headline font-bold text-lg text-on-surface uppercase mb-2">
                  Vehicle Plate Number
                </h2>
                <p className="text-xs text-outline mb-4">
                  Enter your vehicle plate number for odd/even eligibility tracking.
                </p>
              </div>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 text-on-surface font-mono uppercase placeholder:text-outline/50 focus:border-primary-container focus:outline-none"
                autoFocus
              />
              <div className="text-[10px] font-mono text-outline uppercase">
                Last digit: <span className="text-primary-container font-bold">{plateNumber.slice(-1) || '_'}</span>
                {plateNumber.length >= 1 && (
                  <span> → {parseInt(plateNumber.slice(-1)) % 2 === 0 ? 'EVEN' : 'ODD'} day fueling</span>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <h2 className="font-headline font-bold text-lg text-on-surface uppercase mb-2">
                  Vehicle Type
                </h2>
                <p className="text-xs text-outline mb-4">
                  Select your vehicle type for quota allocation.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setVehicleType(type.value)}
                    className={cn(
                      "p-3 border text-left transition-all",
                      vehicleType === type.value
                        ? "bg-primary-container/10 border-primary-container"
                        : "bg-surface-container-lowest border-outline-variant hover:border-primary-container/50"
                    )}
                  >
                    <div className="font-mono text-xs uppercase text-on-surface">{type.label}</div>
                    <div className="text-[9px] text-outline mt-1">{type.quota}L/month</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <h2 className="font-headline font-bold text-lg text-on-surface uppercase mb-2">
                  Your Name (Optional)
                </h2>
                <p className="text-xs text-outline mb-4">
                  For personalized experience. Can be skipped.
                </p>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 text-on-surface placeholder:text-outline/50 focus:border-primary-container focus:outline-none"
              />
              
              {/* Summary */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-outline uppercase">Plate</span>
                  <span className="font-mono text-on-surface">{plateNumber}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-outline uppercase">Vehicle</span>
                  <span className="font-mono text-on-surface">{VEHICLE_TYPES.find(v => v.value === vehicleType)?.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-outline uppercase">Quota</span>
                  <span className="font-mono text-on-surface">{VEHICLE_TYPES.find(v => v.value === vehicleType)?.quota}L/month</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-surface-container-high border border-outline-variant text-outline font-mono text-[10px] uppercase tracking-widest hover:bg-surface-bright transition-colors"
              >
                BACK
              </button>
            )}
            <button
              onClick={step === 3 ? handleComplete : () => setStep(step + 1)}
              disabled={!canProceed}
              className={cn(
                "flex-1 py-3 font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                canProceed
                  ? "bg-primary-container text-on-primary hover:opacity-90 active:scale-95"
                  : "bg-surface-container-highest text-outline cursor-not-allowed opacity-50"
              )}
            >
              {step === 3 ? (
                <>
                  <Check className="w-4 h-4" />
                  COMPLETE
                </>
              ) : (
                'NEXT'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
