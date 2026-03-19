import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Onboarding } from './components/Onboarding';
import { Home } from './pages/Home';
import { Map } from './pages/Map';
import { QR } from './pages/QR';
import { Track } from './pages/Track';
import { getUserProfile } from './constants';

export default function App() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    setNeedsOnboarding(!profile?.onboarded);
    setChecked(true);
  }, []);

  if (!checked) {
    return null;
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={() => setNeedsOnboarding(false)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="map" element={<Map />} />
          <Route path="qr" element={<QR />} />
          <Route path="track" element={<Track />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
