import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { getUserProfile, QUOTA_LIMITS } from '@/src/constants';
import { UserProfile } from '@/src/types';

export const Track: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);
  }, []);

  const monthlyLimit = profile ? QUOTA_LIMITS[profile.vehicleType] : 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 sm:px-6 py-8 max-w-5xl mx-auto relative"
    >
      <div className="absolute inset-0 data-grid-overlay pointer-events-none"></div>

      {/* Consumption Overview - Coming Soon */}
      <section className="mb-8 sm:mb-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="font-headline text-on-surface-variant text-[10px] tracking-[0.2em] mb-2">METRICS // CONSUMPTION_OVERVIEW</h2>
            <h1 className="font-headline font-bold text-4xl sm:text-5xl md:text-6xl text-primary leading-none tracking-tighter">ANALYTICS.CORE</h1>
          </div>
          <div className="text-right">
            <span className="font-mono text-tertiary text-[10px] tracking-widest bg-tertiary/10 px-2 py-1 border border-tertiary/20">COMING_SOON</span>
          </div>
        </div>

        <div className="border border-outline-variant/20 bg-surface-container-low p-8 text-center">
          <p className="font-headline font-bold text-xl text-outline uppercase tracking-widest mb-2">Coming Soon</p>
          <p className="text-xs text-outline-variant">Consumption metrics and analytics will appear here once you start logging fill-ups</p>
        </div>
      </section>

      {/* Prediction Card - Coming Soon */}
      <section className="mb-8 sm:mb-12 relative z-10">
        <div className="border-2 border-primary-container bg-surface-container-lowest p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-primary-container p-2 sm:p-3">
              <Zap className="text-on-primary w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-primary-container text-base sm:text-lg tracking-tight uppercase">PREDICTIVE_ENGINE</h3>
              <p className="text-[9px] sm:text-xs font-mono text-outline uppercase tracking-widest">COMING_SOON</p>
            </div>
          </div>
          <div className="border border-outline-variant/20 bg-surface-container-low p-6 text-center">
            <p className="font-headline font-bold text-xl text-outline uppercase tracking-widest mb-2">Coming Soon</p>
            <p className="text-xs text-outline-variant">AI-powered fill-up predictions will appear here once you start logging fuel-ups</p>
          </div>
        </div>
      </section>

      {/* Recent Logs - Coming Soon */}
      <section className="mb-16 sm:mb-20 relative z-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-outline-variant/20 pb-3 sm:pb-4">
          <h3 className="font-headline font-bold text-lg sm:text-2xl tracking-tight">RECENT_LOGS</h3>
          <span className="font-mono text-[9px] sm:text-xs tracking-widest text-outline uppercase">COMING_SOON</span>
        </div>
        <div className="border border-outline-variant/20 bg-surface-container-low p-8 text-center">
          <p className="font-headline font-bold text-xl text-outline uppercase tracking-widest mb-2">Coming Soon</p>
          <p className="text-xs text-outline-variant">Fuel log history and export functionality will appear here</p>
        </div>
      </section>
    </motion.div>
  );
};
