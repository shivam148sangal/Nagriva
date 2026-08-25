import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Layers,
  Clock,
  Building2,
  ShieldAlert,
  ArrowRight,
  Info,
  MapPin
} from 'lucide-react';
import { AIAnalysisResult } from '../types';
import { Language, translations } from '../utils/translations';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  analysis: AIAnalysisResult | null;
  language: Language;
  isSubmitting?: boolean;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  analysis,
  language,
  isSubmitting,
}) => {
  if (!isOpen || !analysis) return null;
  const t = translations[language];

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 85) return 'text-rose-600';
    if (score >= 70) return 'text-orange-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header with AI Badge */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide">
              <Sparkles size={14} className="text-emerald-300" />
              {language === 'hi' ? 'AI स्वचालित वर्गीकरण इंजन' : 'GramSewa AI Triage Engine'}
            </span>
            <span className="text-xs text-slate-300">
              Confidence: {Math.round(analysis.categoryConfidence * 100)}%
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            {t.aiAnalysisTitle}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {t.aiAnalysisSubtitle}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Category */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                {t.detectedCategory}
              </span>
              <span className="text-sm font-bold text-slate-900 block truncate">
                {analysis.detectedCategory}
              </span>
            </div>

            {/* Severity */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                {t.severity}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${getSeverityBadge(analysis.severity)}`}>
                {analysis.severity}
              </span>
            </div>

            {/* Priority Score */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                {t.priorityScore}
              </span>
              <span className={`text-base font-extrabold ${getPriorityColor(analysis.priorityScore)}`}>
                {analysis.priorityScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </span>
            </div>

            {/* SLA hours */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                {t.slaEstimate}
              </span>
              <span className="text-sm font-bold text-indigo-700 flex items-center gap-1">
                <Clock size={14} />
                {analysis.estimatedSlaHours}h SLA
              </span>
            </div>
          </div>

          {/* Department Routing */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-start gap-3">
            <Building2 size={20} className="text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-indigo-900 block uppercase tracking-wide">
                {t.suggestedDept}
              </span>
              <p className="text-sm font-semibold text-indigo-950 mt-0.5">
                {analysis.suggestedDepartment}
              </p>
            </div>
          </div>

          {/* Duplicate Detection Alert */}
          {analysis.duplicateInfo.isDuplicate ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
              <Layers size={20} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    {t.duplicateAlert}
                  </span>
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {analysis.duplicateInfo.duplicateCount} similar reports
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed font-medium">
                  {analysis.duplicateInfo.reason}
                </p>
                <div className="mt-2 text-[11px] text-amber-800 flex items-center gap-1 font-semibold">
                  <Info size={13} />
                  <span>
                    {language === 'hi'
                      ? 'क्लस्टर प्राथमिकता स्वतः बढ़ा दी गई है ताकि अधिकारी तुरंत कार्रवाई करें।'
                      : 'Complaint weight escalated to prioritize departmental crew dispatch.'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>
                {language === 'hi'
                  ? 'कोई समान शिकायत नहीं पाई गई (नया अनूठा मामला)।'
                  : 'Zero duplicate complaints detected in this 500m radius.'}
              </span>
            </div>
          )}

          {/* AI Governance Recommendation */}
          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles size={14} />
              <span>{t.aiRecommendation}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{analysis.aiRecommendation}"
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
          <button
            id="ai-modal-edit-btn"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
          >
            {language === 'hi' ? 'विवरण बदलें' : 'Edit Details'}
          </button>

          <button
            id="ai-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <span>{isSubmitting ? t.submitting : t.proceedToSubmit}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
