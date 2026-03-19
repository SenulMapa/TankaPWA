import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Upload, Trash2, X, QrCode, CheckCircle2, MapPin } from 'lucide-react';
import { getUserProfile, QUOTA_LIMITS } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { fetchNearbyStations, checkNearStation, logPassiveReport } from '@/src/services/fuelService';
import { UserProfile } from '@/src/types';

export const QR: React.FC = () => {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState(0);
  const [reportedStation, setReportedStation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedQr = localStorage.getItem('tanka_qr_base64');
    if (savedQr) {
      setQrImage(savedQr);
    }

    // Load user profile and calculate quota
    const userProfile = getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      const limit = QUOTA_LIMITS[userProfile.vehicleType];
      // Get remaining from localStorage or default to full limit
      const savedRemaining = localStorage.getItem('tanka_quota_remaining');
      setQuotaRemaining(savedRemaining ? parseFloat(savedRemaining) : limit);
    }

    // Passive QR reporting - check if near a station
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const stations = await fetchNearbyStations(lat, lng, 50);
        const nearStation = checkNearStation(lat, lng, stations);
        
        if (nearStation) {
          // Log passive report
          logPassiveReport(nearStation.id, 'AVAILABLE');
          setReportedStation(nearStation.name);
          
          // Show confirmation for 2 seconds
          setTimeout(() => setReportedStation(null), 2000);
        }
      }, () => {
        // Silently fail if no GPS permission
      });
    }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setQrImage(base64String);
        localStorage.setItem('tanka_qr_base64', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setQrImage(null);
    localStorage.removeItem('tanka_qr_base64');
  };

  const quotaLimit = profile ? QUOTA_LIMITS[profile.vehicleType] : 60;
  const quotaPercentage = quotaRemaining / quotaLimit;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative h-full min-h-[calc(100vh-56px)] py-4 sm:py-8"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none data-grid-overlay"></div>

      {/* Location Report Toast */}
      <AnimatePresence>
        {reportedStation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-tertiary/20 border border-tertiary/30 px-4 py-2 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-tertiary" />
            <span className="text-[10px] font-mono text-tertiary uppercase tracking-widest">
              LOCATION_REPORTED
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Content Container */}
      <div className="w-full max-w-md flex flex-col gap-4 sm:gap-8 relative z-10">
        {/* Header Label */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <h1 className="font-headline font-bold text-[#F5A623] text-xl sm:text-2xl tracking-tighter uppercase">NATIONAL FUEL PASS - QR</h1>
          <div className="flex justify-center items-center gap-2">
            <span className="h-[1px] w-6 sm:w-8 bg-outline-variant/40"></span>
            <p className="font-mono text-[8px] sm:text-[10px] text-outline tracking-[0.2em]">IDENTIFICATION_SECURE</p>
            <span className="h-[1px] w-6 sm:w-8 bg-outline-variant/40"></span>
          </div>
        </div>

        {/* QR Code Module */}
        <div className="qr-gradient-border group">
          <div className="bg-surface-container-lowest p-4 sm:p-8 flex flex-col items-center justify-center aspect-square relative">
            {/* Corner Brackets */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary"></div>

            {/* The QR Code Image */}
            <div className="bg-white p-4 w-full h-full shadow-[0_0_40px_rgba(245,166,35,0.1)] flex items-center justify-center overflow-hidden">
              {qrImage ? (
                <img
                  alt="National Fuel Pass QR Code"
                  className="w-full h-full object-contain mix-blend-multiply cursor-pointer"
                  src={qrImage}
                  onClick={() => setIsFullScreen(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <QrCode className="w-16 h-16 text-outline/20" />
                  <p className="text-[10px] font-mono text-outline uppercase tracking-widest">No QR Uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info Cards */}
        <div className="grid grid-cols-2 gap-[1px] bg-outline-variant/20 border border-outline-variant/20">
          <div className="bg-surface-container p-4">
            <p className="font-mono text-[9px] text-outline uppercase tracking-widest mb-1">Vehicle No</p>
            <p className="font-headline font-bold text-lg text-on-surface">{profile?.plateNumber || 'N/A'}</p>
          </div>
          <div className="bg-surface-container p-4">
            <p className="font-mono text-[9px] text-outline uppercase tracking-widest mb-1">Vehicle Type</p>
            <p className="font-headline font-bold text-lg text-on-surface capitalize">{profile?.vehicleType.replace('_', ' ') || 'N/A'}</p>
          </div>
          <div className="col-span-2 bg-surface-container-high p-5 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-mono text-[9px] text-primary uppercase tracking-widest mb-1">Quota Remaining</p>
                <p className="font-headline font-black text-4xl text-on-surface leading-none">
                  {quotaRemaining.toFixed(2)}
                  <span className="text-sm font-medium text-outline ml-1">L</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] text-outline uppercase tracking-widest mb-1">Monthly Limit</p>
                <p className="font-headline font-bold text-xl text-on-surface">{quotaLimit}L</p>
              </div>
            </div>
            {/* Brutalist Step Gauge */}
            <div className="flex gap-1 h-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1",
                    i < quotaPercentage * 10 ? "bg-primary" : "bg-surface-container-highest"
                  )}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {qrImage ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsFullScreen(true)}
                className="bg-primary text-on-primary h-14 font-headline font-bold flex items-center justify-center gap-3 transition-all hover:bg-primary-container duration-200 active:scale-95"
              >
                <Maximize2 className="w-5 h-5" />
                FULL SCREEN
              </button>
              <button
                onClick={handleRemove}
                className="bg-error/10 text-error border border-error/30 h-14 font-headline font-bold flex items-center justify-center gap-3 transition-all hover:bg-error/20 duration-200 active:scale-95"
              >
                <Trash2 className="w-5 h-5" />
                REMOVE
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-primary text-on-primary h-14 font-headline font-bold flex items-center justify-center gap-3 transition-all hover:bg-primary-container duration-200 active:scale-95 shadow-[4px_4px_0px_0px_rgba(245,166,35,0.3)]"
            >
              <Upload className="w-5 h-5" />
              ADD QR CODE
            </button>
          )}

          {qrImage && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-surface-container border border-outline-variant h-12 font-mono text-[10px] font-bold flex items-center justify-center gap-3 transition-all hover:bg-surface-container-high duration-200 active:scale-95 uppercase tracking-widest"
            >
              <Upload className="w-4 h-4" />
              Replace QR Image
            </button>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isFullScreen && qrImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-8 right-8 text-white p-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="w-full max-w-sm aspect-square bg-white p-4">
              <img
                src={qrImage}
                alt="Fuel Pass QR Full"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="mt-8 font-mono text-xs text-primary font-bold animate-pulse uppercase tracking-[0.3em]">
              Ready for Terminal Scan
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
