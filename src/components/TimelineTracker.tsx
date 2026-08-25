import React from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  Search,
  Wrench,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Check
} from 'lucide-react';
import { ComplaintStatus, TimelineEvent } from '../types';
import { Language, translations } from '../utils/translations';

interface TimelineTrackerProps {
  currentStatus: ComplaintStatus;
  timeline: TimelineEvent[];
  language: Language;
  isEscalated?: boolean;
}

export const TimelineTracker: React.FC<TimelineTrackerProps> = ({
  currentStatus,
  timeline,
  language,
  isEscalated,
}) => {
  const t = translations[language];

  const standardSteps: Array<{ status: ComplaintStatus; label: string; icon: any }> = [
    { status: 'Submitted', label: t.timelineSubmitted, icon: Clock },
    { status: 'AI Analyzed', label: t.timelineAiAnalyzed, icon: Sparkles },
    { status: 'Assigned', label: t.timelineAssigned, icon: UserCheck },
    { status: 'Work in Progress', label: t.timelineWip, icon: Wrench },
    { status: 'Resolved', label: t.timelineResolved, icon: ShieldCheck },
    { status: 'Citizen Verification', label: t.timelineCitizenVerification, icon: UserCheck },
    { status: 'Closed', label: t.timelineClosed, icon: CheckCircle2 },
  ];

  const getStepIndex = (status: ComplaintStatus): number => {
    switch (status) {
      case 'Submitted': return 0;
      case 'AI Analyzed': return 1;
      case 'Assigned': return 2;
      case 'Under Review': return 2.5;
      case 'Work in Progress': return 3;
      case 'Resolved': return 4;
      case 'Citizen Verification': return 5;
      case 'Closed': return 6;
      case 'Reopened': return 3.5;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full space-y-6">
      {/* Horizontal Flow Indicator */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 overflow-x-auto">
        <div className="min-w-[600px] flex items-center justify-between relative">
          {/* Progress bar background line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
          
          {/* Active progress fill */}
          <div
            className={`absolute top-4 left-4 h-0.5 transition-all duration-500 -z-0 ${
              currentStatus === 'Reopened' ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
            style={{
              width: `${Math.min(100, (Math.max(0, currentIndex) / (standardSteps.length - 1)) * 100)}%`
            }}
          />

          {standardSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentIndex && currentStatus !== 'Reopened';
            const isCurrent = (idx === Math.floor(currentIndex)) || (step.status === currentStatus);
            const isReopenedStage = currentStatus === 'Reopened' && idx === 3;

            return (
              <div key={step.status} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isReopenedStage
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                      : isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {isCompleted && !isCurrent ? <Check size={14} className="stroke-[3]" /> : <Icon size={14} />}
                </div>
                <span
                  className={`text-[11px] mt-2 font-semibold text-center whitespace-nowrap ${
                    isCurrent ? 'text-emerald-800 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {currentStatus === 'Reopened' && (
          <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900 font-medium">
            <RotateCcw size={16} className="text-amber-600 shrink-0" />
            <span>
              {language === 'hi'
                ? 'शिकायत नागरिक द्वारा पुनः खोली गई है। अधिकारी द्वारा दुबारा निवारण किया जा रहा है।'
                : 'Grievance was reopened by citizen upon inspection. Active rework in progress.'}
            </span>
          </div>
        )}

        {isEscalated && (
          <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-900 font-medium">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>
              {language === 'hi'
                ? '⚠ अतिदेय/गंभीर स्थिति के कारण यह मामला उच्च अधिकारियों को एस्केलेट किया गया है।'
                : '⚠ Overdue/Critical: This complaint has been formally escalated to Senior Block & District Officers.'}
            </span>
          </div>
        )}
      </div>

      {/* Detailed Event Log */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {language === 'hi' ? 'कार्यवाही विवरण व समय-रेखा (Audit Trail)' : 'Action History & Audit Trail'}
        </h4>
        <div className="space-y-2.5">
          {timeline.map((event, index) => (
            <div
              key={index}
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition flex items-start gap-3"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-bold text-slate-900">{event.title}</span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {event.timestamp
                      ? new Date(event.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recently'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>By: <strong className="text-slate-600">{event.updatedBy}</strong></span>
                  {event.role && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">{event.role}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
