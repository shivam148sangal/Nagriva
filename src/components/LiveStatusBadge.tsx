import React from 'react';
import { Activity, Wifi, WifiOff } from 'lucide-react';

interface LiveStatusBadgeProps {
  isConnected: boolean;
  lastUpdated?: Date | string | number;
}

export const LiveStatusBadge: React.FC<LiveStatusBadgeProps> = ({ isConnected, lastUpdated }) => {
  const formatTime = (d?: Date | string | number) => {
    try {
      const dateObj = d ? new Date(d) : new Date();
      if (isNaN(dateObj.getTime())) {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Live';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/90 shadow-xs border border-slate-200 backdrop-blur-xs">
      {isConnected ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <Wifi size={12} />
            Live Data
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 hidden sm:inline text-[11px]">
            Synced: {formatTime(lastUpdated)}
          </span>
        </>
      ) : (
        <>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <WifiOff size={12} />
            Reconnecting...
          </span>
        </>
      )}
    </div>
  );
};
