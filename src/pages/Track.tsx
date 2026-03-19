import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, CheckCircle, Zap, Loader2 } from 'lucide-react';
import { FUEL_LOGS, getUserProfile, QUOTA_LIMITS } from '@/src/constants';
import { predictNextFillup } from '@/src/services/fuelService';
import { UserProfile } from '@/src/types';

export const Track: React.FC = () => {
  const [prediction, setPrediction] = useState<string>('');
  const [daysUntil, setDaysUntil] = useState<number>(7);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    const loadPrediction = async () => {
      setIsLoading(true);
      const result = predictNextFillup(FUEL_LOGS);
      setPrediction(result.prediction);
      setDaysUntil(result.days);
      setIsLoading(false);
    };
    loadPrediction();
  }, []);

  const monthlyLimit = profile ? QUOTA_LIMITS[profile.vehicleType] : 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 sm:px-6 py-8 max-w-5xl mx-auto relative"
    >
      <div className="absolute inset-0 data-grid-overlay pointer-events-none"></div>

      {/* Consumption Overview */}
      <section className="mb-8 sm:mb-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="font-headline text-on-surface-variant text-[10px] tracking-[0.2em] mb-2">METRICS // CONSUMPTION_OVERVIEW</h2>
            <h1 className="font-headline font-bold text-4xl sm:text-5xl md:text-6xl text-primary leading-none tracking-tighter">ANALYTICS.CORE</h1>
          </div>
          <div className="text-right">
            <span className="font-mono text-tertiary text-[10px] tracking-widest bg-tertiary/10 px-2 py-1 border border-tertiary/20">SYSTEM_OPTIMAL</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-outline-variant/20 border border-outline-variant/20">
          <div className="bg-surface-container p-4 sm:p-6">
            <p className="font-headline text-[9px] sm:text-xs text-on-surface-variant tracking-widest mb-4 uppercase">Monthly Spend</p>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="font-headline font-bold text-4xl sm:text-5xl md:text-6xl text-on-surface tracking-tighter">42,850</span>
              <span className="font-headline font-medium text-sm sm:text-xl text-outline tracking-tight">LKR</span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center gap-1 sm:gap-2 text-error text-[9px] sm:text-xs font-mono">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>+12.4% FROM PREVIOUS CYCLE</span>
            </div>
          </div>
          <div className="bg-surface-container p-4 sm:p-6 border-l border-outline-variant/20">
            <p className="font-headline text-[9px] sm:text-xs text-on-surface-variant tracking-widest mb-4 uppercase">Avg Consumption</p>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="font-headline font-bold text-4xl sm:text-5xl md:text-6xl text-on-surface tracking-tighter">08.2</span>
              <span className="font-headline font-medium text-sm sm:text-xl text-outline tracking-tight">L/100KM</span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center gap-1 sm:gap-2 text-tertiary text-[9px] sm:text-xs font-mono">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>BELOW VEHICLE AVERAGE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Prediction Card */}
      <section className="mb-8 sm:mb-12 relative z-10">
        <div className="border-2 border-primary-container bg-surface-container-lowest p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-primary-container p-2 sm:p-3">
              <Zap className="text-on-primary w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-primary-container text-base sm:text-lg tracking-tight uppercase">PREDICTIVE_ENGINE</h3>
              <p className="text-[9px] sm:text-xs font-mono text-outline uppercase tracking-widest">Algorithm_V1.0 // Pattern_Analysis</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 py-6 sm:py-8">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary-container" />
              <span className="font-mono text-[9px] sm:text-xs uppercase tracking-widest text-outline">Analyzing consumption patterns...</span>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-surface-container-high border-l-4 border-primary p-3 sm:p-4">
                <p className="text-on-surface font-medium text-sm sm:text-lg leading-snug">
                  {prediction}
                </p>
                <p className="text-on-surface-variant text-[10px] sm:text-sm mt-2">
                  Based on your fill-up history pattern
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="bg-surface-container p-2 sm:p-3 flex flex-col gap-1 border border-outline-variant/20 min-w-[120px]">
                  <span className="text-[8px] sm:text-[10px] text-outline tracking-widest uppercase">Next In</span>
                  <span className="font-mono text-primary-container font-bold text-lg sm:text-xl">{daysUntil} Days</span>
                </div>
                <div className="bg-surface-container p-2 sm:p-3 flex flex-col gap-1 border border-outline-variant/20 min-w-[120px]">
                  <span className="text-[8px] sm:text-[10px] text-outline tracking-widest uppercase">Monthly Limit</span>
                  <span className="font-mono text-primary-container font-bold text-lg sm:text-xl">{monthlyLimit}L</span>
                </div>
                <div className="bg-surface-container p-2 sm:p-3 flex flex-col gap-1 border border-outline-variant/20 min-w-[120px]">
                  <span className="text-[8px] sm:text-[10px] text-outline tracking-widest uppercase">Est. Wait</span>
                  <span className="font-mono text-primary-container font-bold text-lg sm:text-xl">4-6 MIN</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Logs */}
      <section className="mb-16 sm:mb-20 relative z-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-outline-variant/20 pb-3 sm:pb-4">
          <h3 className="font-headline font-bold text-lg sm:text-2xl tracking-tight">RECENT_LOGS</h3>
          <button className="font-headline text-[9px] sm:text-xs tracking-widest text-primary border border-primary/20 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-primary/10 transition-colors uppercase">
            Export_CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs sm:text-sm">
            <thead>
              <tr className="text-outline border-b border-outline-variant/20">
                <th className="py-3 sm:py-4 font-normal tracking-widest uppercase text-[9px] sm:text-xs">Entry_Date</th>
                <th className="py-3 sm:py-4 font-normal tracking-widest uppercase text-[9px] sm:text-xs">Fuel_Vol</th>
                <th className="py-3 sm:py-4 font-normal tracking-widest uppercase text-[9px] sm:text-xs">Trans_Cost</th>
                <th className="py-3 sm:py-4 font-normal tracking-widest uppercase text-[9px] sm:text-xs text-right">Unit_Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {FUEL_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-3 sm:py-5 text-on-surface">{log.date}</td>
                  <td className="py-3 sm:py-5 text-on-surface">{log.volume.toFixed(2)} L</td>
                  <td className="py-3 sm:py-5 text-primary">{log.cost.toLocaleString('en-LK', { minimumFractionDigits: 2 })} LKR</td>
                  <td className="py-3 sm:py-5 text-outline text-right">{log.unitPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button className="bg-surface-container-high text-on-surface border border-outline-variant px-6 sm:px-8 py-3 sm:py-4 font-headline font-bold text-[9px] sm:text-sm tracking-[0.2em] hover:bg-surface-bright transition-all active:scale-95 uppercase">
            Load_More_Entries
          </button>
        </div>
      </section>
    </motion.div>
  );
};
