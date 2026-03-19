import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Layers, CheckCircle2, XCircle, RefreshCw, Navigation, AlertTriangle, Clock, Send, Check, ExternalLink, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, ZoomControl, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FuelStation } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { fetchNearbyStations } from '@/src/services/fuelService';

// Fix Leaflet marker icon issue
import 'leaflet/dist/leaflet.css';

// Custom Marker Icon Generator
const createCustomIcon = (status: string, isSelected: boolean) => {
  const color = status === 'AVAILABLE' ? '#58ed80' :
                status === 'UNAVAILABLE' ? '#ffb4ab' : '#9f8e7a';
  const shadow = status === 'AVAILABLE' ? '0 0 10px #58ed80' :
                 status === 'UNAVAILABLE' ? '0 0 10px #ffb4ab' : 'none';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative flex items-center justify-center">
        ${status === 'AVAILABLE' ? `<div class="absolute -inset-2 bg-[#58ed80]/20 animate-pulse rounded-full"></div>` : ''}
        <div style="
          width: ${isSelected ? '20px' : '16px'};
          height: ${isSelected ? '20px' : '16px'};
          background-color: ${color};
          border: 2px solid #131313;
          box-shadow: ${shadow};
          transition: all 0.2s ease;
          ${isSelected ? 'transform: scale(1.2); border-color: #ffc880;' : ''}
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// User location icon
const userLocationIcon = L.divIcon({
  className: 'user-location-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute -inset-4 bg-[#58ed80]/30 animate-ping rounded-full"></div>
      <div class="w-4 h-4 bg-[#58ed80] border-2 border-white rounded-full shadow-[0_0_15px_#58ed80]"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to handle map center changes
const MapController = ({ center, userLocation }: { center?: [number, number], userLocation?: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    } else if (userLocation) {
      map.setView(userLocation, 13);
    }
  }, [center, userLocation, map]);
  return null;
};

export const Map: React.FC = () => {
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportStatus, setReportStatus] = useState<'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE'>('AVAILABLE');
  const [queueTime, setQueueTime] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const loadStations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation([lat, lng]);
        const data = await fetchNearbyStations(lat, lng, 100);
        setStations(data);
        setIsLoading(false);
      }, async () => {
        const data = await fetchNearbyStations(6.9271, 79.8612, 100);
        setStations(data);
        setUserLocation([6.9271, 79.8612]);
        setIsLoading(false);
      });
    } catch (err) {
      setError('Failed to fetch station data');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  const handleOpenGoogleMaps = (station: FuelStation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}&destination_place_id=${station.name}`;
    window.open(url, '_blank');
  };

  const handleReportSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('REPORT_SUBMITTED', {
      stationId: selectedStation?.id,
      status: reportStatus,
      queueTime
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsReporting(false);
    }, 2000);
  };

  return (
    <div className="relative w-full h-full overflow-hidden min-h-[calc(100vh-144px)]">
      {/* Leaflet Map */}
      <div className="absolute inset-0 z-0 bg-surface-container-lowest">
        <MapContainer
          center={userLocation || [6.9271, 79.8612]}
          zoom={userLocation ? 13 : 12}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          />

          <ZoomControl position="topright" />
          <MapController userLocation={userLocation} center={selectedStation ? [selectedStation.lat, selectedStation.lng] : undefined} />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>
                <div className="text-xs font-mono">Your Location</div>
              </Popup>
            </Marker>
          )}

          {/* Station Markers */}
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={createCustomIcon(station.status, selectedStation?.id === station.id)}
              eventHandlers={{
                click: () => setSelectedStation(station),
              }}
            />
          ))}
        </MapContainer>

        {/* Map UI Overlay */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={loadStations}
            className={cn(
              "bg-surface-container-high border border-outline-variant p-2 hover:bg-surface-bright active:scale-95 transition-all",
              isLoading && "animate-spin"
            )}
          >
            <RefreshCw className="w-5 h-5 text-on-surface" />
          </button>
          {error && (
            <div className="bg-error-container/80 text-on-error-container px-2 py-1 text-[8px] font-mono uppercase tracking-widest border border-error/20">
              {error}
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button 
            onClick={() => userLocation && navigator.geolocation.getCurrentPosition(pos => {
              setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            })}
            className="bg-surface-container-high border border-outline-variant p-2 hover:bg-surface-bright active:scale-95"
          >
            <Crosshair className="w-5 h-5 text-on-surface" />
          </button>
          <button className="bg-surface-container-high border border-outline-variant p-2 hover:bg-surface-bright active:scale-95">
            <Layers className="w-5 h-5 text-on-surface" />
          </button>
        </div>
      </div>

      {/* Floating Station Info Sheet */}
      <section className="absolute bottom-0 left-0 w-full z-[1001] pointer-events-none">
        <AnimatePresence mode="wait">
          {selectedStation && !isReporting && (
            <motion.div
              key={selectedStation.id}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="w-full max-w-2xl mx-auto bg-surface-container border border-outline-variant pointer-events-auto overflow-hidden shadow-2xl md:rounded-t-lg"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-outline-variant/30 flex justify-between items-start bg-surface-container-high/50">
                <div className="flex gap-3 md:gap-4 items-center flex-1 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container-lowest border border-outline-variant flex items-center justify-center font-headline font-black text-primary-container text-lg md:text-xl flex-shrink-0">
                    {selectedStation.operator === 'CEYPETCO' ? 'C' : selectedStation.operator === 'LIOC' ? 'L' : 'S'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-headline font-bold text-base md:text-xl uppercase tracking-tight text-on-surface truncate">{selectedStation.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-outline flex-shrink-0" />
                      <p className="text-xs font-mono text-outline uppercase tracking-widest truncate">{selectedStation.location}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className={cn(
                    "inline-block px-2 md:px-3 py-1 text-[8px] md:text-[10px] font-mono uppercase tracking-widest font-bold",
                    selectedStation.status === 'AVAILABLE' ? "bg-tertiary/20 text-tertiary" :
                    selectedStation.status === 'UNAVAILABLE' ? "bg-error-container text-on-error-container" :
                    "bg-outline/20 text-outline"
                  )}>
                    {selectedStation.status}
                  </div>
                </div>
              </div>

              {/* Body Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Fuel Status */}
                <div className="p-4 md:p-6 border-b md:border-b-0 md:border-r border-outline-variant/30">
                  <h3 className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-4">AVAILABILITY_MATRIX</h3>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-tertiary fill-tertiary/20 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-bold tracking-tight uppercase">92 OCTANE</span>
                      </div>
                      <span className="font-mono text-xs tabular text-on-surface-variant">IN_STOCK</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-tertiary fill-tertiary/20 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-bold tracking-tight uppercase">AUTO DIESEL</span>
                      </div>
                      <span className="font-mono text-xs tabular text-on-surface-variant">IN_STOCK</span>
                    </div>
                  </div>
                </div>

                {/* Queue Data & Actions */}
                <div className="p-4 md:p-6 bg-surface-container-lowest">
                  <h3 className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-4">REALTIME_TELEMETRY</h3>
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-mono text-outline uppercase tracking-widest">EST_WAIT_TIME</span>
                        <span className="text-xl md:text-2xl font-headline font-black tabular text-on-surface">~25 MIN</span>
                      </div>
                      <div className="flex gap-1 h-3">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex-1",
                              i < 4 ? "bg-primary" : "bg-primary/20"
                            )}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono text-outline uppercase">LAST_UPDATE</p>
                        <p className="text-xs font-mono text-on-surface">14 MIN AGO</p>
                      </div>
                      <button
                        onClick={() => setIsReporting(true)}
                        className="bg-primary text-on-primary font-mono text-[10px] font-bold px-3 md:px-4 py-2 hover:opacity-90 active:scale-95 transition-transform uppercase tracking-widest flex-shrink-0"
                      >
                        UPDATE
                      </button>
                    </div>
                    <button
                      onClick={() => handleOpenGoogleMaps(selectedStation)}
                      className="w-full bg-surface-container-high border border-outline-variant text-on-surface font-mono text-[10px] font-bold px-4 py-2 hover:bg-surface-bright active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Google Maps
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* User Reporting Sheet */}
          {isReporting && (
            <motion.div 
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              className="max-w-4xl mx-auto bg-surface-container-high border-2 border-primary pointer-events-auto overflow-hidden shadow-2xl"
            >
              <div className="p-6 space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="font-headline font-bold text-2xl uppercase tracking-tight text-primary">Crowdsource Report</h2>
                  <button onClick={() => setIsReporting(false)} className="text-outline hover:text-on-surface">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {isSubmitted ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-tertiary/20 rounded-full flex items-center justify-center">
                      <Check className="w-10 h-10 text-tertiary" />
                    </div>
                    <h3 className="font-headline font-bold text-xl uppercase tracking-widest">Report Transmitted</h3>
                    <p className="text-xs font-mono text-outline uppercase">Thank you for contributing to the network.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <p className="text-[10px] font-mono text-outline uppercase tracking-widest">1. Current Availability</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(['AVAILABLE', 'LIMITED', 'UNAVAILABLE'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setReportStatus(status)}
                            className={cn(
                              "py-3 border font-mono text-[10px] font-bold uppercase tracking-widest transition-all",
                              reportStatus === status 
                                ? "bg-primary text-on-primary border-primary" 
                                : "bg-surface-container border-outline-variant text-outline hover:border-primary/40"
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] font-mono text-outline uppercase tracking-widest">2. Queue Length</p>
                        <p className="font-headline font-bold text-xl text-primary">{queueTime} MIN</p>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="60" 
                        step="5"
                        value={queueTime}
                        onChange={(e) => setQueueTime(parseInt(e.target.value))}
                        className="w-full h-2 bg-surface-container-highest rounded-none appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[8px] font-mono text-outline uppercase">
                        <span>No Queue</span>
                        <span>30 Min</span>
                        <span>60+ Min</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleReportSubmit}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary text-on-primary font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Transmitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Report
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};
