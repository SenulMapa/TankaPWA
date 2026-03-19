import React from 'react';
import { Terminal, Bell, User, Home as HomeIcon, Map as MapIcon, QrCode, BarChart3 } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#e5e2e1] font-sans selection:bg-primary-container selection:text-on-primary overflow-hidden">
      {/* Top App Bar */}
      <header className="bg-[#131313] fixed top-0 w-full z-50 border-b border-[#524534]/20 h-14 sm:h-16 flex justify-between items-center px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Terminal className="text-[#F5A623] w-4 h-4 sm:w-5 sm:h-5" />
          <h1 className="font-headline font-bold uppercase text-lg sm:text-xl text-[#F5A623] tracking-tighter">
            TANKA OH
          </h1>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <button className="text-[#9F8E7A] hover:bg-[#2A2A2A] transition-colors p-1.5 sm:p-2 cursor-pointer">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="text-[#9F8E7A] hover:bg-[#2A2A2A] transition-colors p-1.5 sm:p-2 cursor-pointer">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 sm:pt-16 pb-16 sm:pb-20 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 sm:h-20 px-2 sm:px-4 bg-[#0A0A0A] border-t border-[#333333] z-50 safe-area-bottom">
        <NavTab to="/" icon={<HomeIcon className="w-5 h-5" />} label="HOME" />
        <NavTab to="/map" icon={<MapIcon className="w-5 h-5" />} label="MAP" />
        <NavTab to="/qr" icon={<QrCode className="w-5 h-5" />} label="QR" />
        <NavTab to="/track" icon={<BarChart3 className="w-5 h-5" />} label="TRACK" />
      </nav>
    </div>
  );
};

interface NavTabProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavTab: React.FC<NavTabProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center py-2 w-full transition-all duration-200 min-w-[64px]",
          isActive
            ? "text-[#F5A623] border-t-2 border-[#F5A623]"
            : "text-[#524534] hover:text-[#FFC880]"
        )
      }
    >
      <div className="mb-0.5">{icon}</div>
      <span className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase">{label}</span>
    </NavLink>
  );
};
