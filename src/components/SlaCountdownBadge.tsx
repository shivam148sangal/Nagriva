import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SlaCountdownBadgeProps {
  deadline: string;
  isResolvedOrClosed: boolean;
  slaBreached?: boolean;
}

export const SlaCountdownBadge: React.FC<SlaCountdownBadgeProps> = ({
  deadline,
  isResolvedOrClosed,
  slaBreached = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isApproaching, setIsApproaching] = useState<boolean>(false);

  useEffect(() => {
    if (isResolvedOrClosed) return;

    const calculateTime = () => {
      const now = Date.now();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0 || slaBreached) {
        setIsExpired(true);
        const overHours = Math.floor(Math.abs(diff) / 3600000);
        const overMins = Math.floor((Math.abs(diff) % 3600000) / 60000);
        setTimeRemaining(`Breached (${overHours}h ${overMins}m ago)`);
      } else {
        setIsExpired(false);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setIsApproaching(hours < 6);
        setTimeRemaining(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m remaining`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 10000);
    return () => clearInterval(interval);
  }, [deadline, isResolvedOrClosed, slaBreached]);

  if (isResolvedOrClosed) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} />
        SLA Met
      </span>
    );
  }

  if (isExpired || slaBreached) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
        <ShieldAlert size={13} className="text-rose-600" />
        {timeRemaining || '🔴 SLA Breached'}
      </span>
    );
  }

  if (isApproaching) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <AlertTriangle size={13} className="text-amber-600" />
        {timeRemaining} (Urgent)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
      <Clock size={12} className="text-indigo-600" />
      {timeRemaining}
    </span>
  );
};
