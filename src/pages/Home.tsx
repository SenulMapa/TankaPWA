import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { FuelStation } from '@/src/types';
import { fetchNearbyStations, getDailyBriefing } from '@/src/services/fuelService';
import { 
  getUserProfile, 
  isPlateEligible, 
  getNextEligibleDate, 
  daysUntil, 
  isWednesday,
  isEvenDay 
} from '@/src/constants';

export const Home: React.FC = () => {
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [briefing, setBriefing] = useState<string>('');
  const [briefingTime, setBriefingTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [eligible, setEligible] = useState<boolean>(true);
  const [plateNumber, setPlateNumber] = useState<string>('');
  const [nextEligible, setNextEligible] = useState<Date | null>(null);
  const [isWed, setIsWed] = useState(false);
  const [evenDay, setEvenDay] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setPlateNumber(profile.plateNumber);
      const elig = isPlateEligible(profile.plateNumber);
      setEligible(elig);
      setNextEligible(getNextEligibleDate(profile.plateNumber));
    }
    setIsWed(isWednesday());
    setEvenDay(isEvenDay());
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Get user location
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const nearby = await fetchNearbyStations(lat, lng, 50);
        setStations(nearby.slice(0, 3));
      }, async () => {
        // Fallback to Colombo center if geolocation fails
        const nearby = await fetchNearbyStations(6.9271, 79.8612, 50);
        setStations(nearby.slice(0, 3));
      });

      const { message, date } = getDailyBriefing();
      setBriefing(message);
      setBriefingTime(date);

      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 max-w-2xl mx-auto"
    >
      {/* Wednesday Holiday Banner */}
      {isWed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-container/20 border border-error/30 p-3 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
          <div>
            <p className="text-xs font-mono text-error uppercase tracking-widest">WEDNESDAY_HOLIDAY</p>
            <p className="text-[10px] text-outline">REDUCED_OPERATIONS_EXPECTED</p>
          </div>
        </motion.div>
      )}

      {/* Odd/Even Eligibility Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "border p-4 sm:p-6 relative overflow-hidden",
          eligible 
            ? "bg-tertiary/10 border-tertiary/30" 
            : "bg-error-container/10 border-error/30"
        )}
      >
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Calendar className={cn("w-24 h-24", eligible ? "text-tertiary" : "text-error")} />
        </div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[8px] sm:text-[10px] font-mono text-outline uppercase tracking-[0.2em] mb-2">
              PUMP_ELIGIBILITY
            </p>
            <div className="flex items-center gap-2 mb-2">
              {eligible ? (
                <CheckCircle2 className="w-6 h-6 text-tertiary flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-error flex-shrink-0" />
              )}
              <h2 className={cn(
                "font-headline font-bold text-xl sm:text-2xl uppercase tracking-tighter",
                eligible ? "text-tertiary" : "text-error"
              )}>
                {eligible ? 'ELIGIBLE_TODAY' : 'NOT_ELIGIBLE_TODAY'}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <div className={cn(
              "px-2 py-1 text-[10px] font-mono uppercase tracking-widest",
              evenDay ? "bg-primary-container/20 text-primary-container" : "bg-outline/20 text-outline"
            )}>
              {evenDay ? 'EVEN DAY' : 'ODD DAY'}
            </div>
          </div>
        </div>
        
        {plateNumber && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono text-outline">Plate:</span>
              <span className="font-headline font-bold text-on-surface">{plateNumber}</span>
              <span className="text-[10px] font-mono text-outline">
                ({parseInt(plateNumber.slice(-1)) % 2 === 0 ? 'EVEN' : 'ODD'} digit)
              </span>
            </div>
            {!eligible && nextEligible && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-outline">Next eligible:</span>
                <span className="font-headline font-bold text-on-surface">
                  {daysUntil(nextEligible)} day{daysUntil(nextEligible) !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] font-mono text-outline">
                  ({nextEligible.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Daily Fuel Briefing */}
      <section className="border border-outline-variant/30 bg-surface-container p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <span className="text-[8px] sm:text-[10px] font-mono tracking-[0.2em] text-outline uppercase">Daily Briefing // {briefingTime}</span>
          <span className="bg-primary/10 text-primary-container px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold border border-primary/20">LIVE_DATA</span>
        </div>
        <h2 className="font-headline font-bold text-3xl sm:text-4xl leading-none text-primary-container mb-3 sm:mb-4 tracking-tighter">
          FUEL STATUS <br/> UPDATE.
        </h2>
        <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
          {briefing}
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-outline-variant/20 border border-outline-variant/20">
        <div className="bg-[#0E0E0E] p-3 sm:p-4">
          <p className="text-[8px] sm:text-[10px] text-outline uppercase mb-1 font-mono">National Stock</p>
          <div className="flex items-end gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-headline font-bold text-on-surface">1.2M</span>
            <span className="text-[8px] sm:text-[10px] text-tertiary font-mono mb-1">MT</span>
          </div>
        </div>
        <div className="bg-[#0E0E0E] p-3 sm:p-4">
          <p className="text-[8px] sm:text-[10px] text-outline uppercase mb-1 font-mono">Active Pumps</p>
          <div className="flex items-end gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-headline font-bold text-on-surface">92</span>
            <span className="text-[8px] sm:text-[10px] text-tertiary font-mono mb-1">%</span>
          </div>
        </div>
      </div>

      {/* Nearest Stations */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
          <h3 className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-outline uppercase">Nearest Stations</h3>
          <span className="text-[8px] sm:text-[10px] text-primary-container flex items-center gap-1 font-bold">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            COLOMBO_SOUTH
          </span>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {isLoading ? (
            <div className="text-xs font-mono text-outline uppercase tracking-widest animate-pulse p-4">Scanning for nearby terminals...</div>
          ) : stations.map((station) => (
            <div
              key={station.id}
              className="bg-surface-container-low border border-outline-variant/20 p-3 sm:p-4 flex items-center justify-between hover:border-primary-container/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 sm:gap-4">
                <div className={cn(
                  "w-1 h-8 sm:h-10",
                  station.status === 'AVAILABLE' ? "bg-tertiary" :
                  station.status === 'UNAVAILABLE' ? "bg-error" : "bg-outline"
                )}></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-sm sm:text-lg leading-none tracking-tight truncate">{station.name}</span>
                    <span className="text-[8px] sm:text-[10px] font-mono text-outline uppercase flex-shrink-0">{station.operator}</span>
                  </div>
                  <div className="flex gap-2 sm:gap-3 mt-1">
                    <span className="text-[8px] sm:text-[10px] font-mono text-outline uppercase truncate">{station.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={cn(
                  "text-[10px] sm:text-xs font-mono block font-bold",
                  station.status === 'AVAILABLE' ? "text-tertiary" :
                  station.status === 'UNAVAILABLE' ? "text-error" : "text-outline"
                )}>
                  {station.status}
                </span>
                <span className="text-[8px] sm:text-[10px] text-outline">{station.distance}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access Actions */}
      <section className="grid grid-cols-2 gap-2 sm:gap-4 pb-4 sm:pb-8">
        <button className="flex flex-col items-start justify-between p-3 sm:p-5 border-2 border-primary-container bg-primary-container/5 hover:bg-primary-container/10 transition-all active:scale-95 text-left h-24 sm:h-32">
          <div className="text-primary-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 7v10"/><path d="M7 12h10"/></svg>
          </div>
          <div>
            <span className="font-headline font-bold text-sm sm:text-lg text-primary-container block leading-none">QR Wallet</span>
            <span className="text-[8px] sm:text-[10px] text-outline uppercase font-mono mt-0.5 sm:mt-1">Ready for scan</span>
          </div>
        </button>
        <button className="flex flex-col items-start justify-between p-3 sm:p-5 border-2 border-outline-variant bg-transparent hover:border-primary transition-all active:scale-95 text-left h-24 sm:h-32">
          <div className="text-on-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div>
            <span className="font-headline font-bold text-sm sm:text-lg text-on-surface block leading-none">Log Fill-up</span>
            <span className="text-[8px] sm:text-[10px] text-outline uppercase font-mono mt-0.5 sm:mt-1">Manual Entry</span>
          </div>
        </button>
      </section>
    </motion.div>
  );
};
