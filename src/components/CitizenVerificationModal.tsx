import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  Sparkles,
  X,
  Send,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { Complaint } from '../types';
import { Language, translations } from '../utils/translations';
import { VoiceInputButton } from './VoiceInputButton';

interface CitizenVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  language: Language;
  onVerify: (complaintId: string, verificationStatus: 'completely_resolved' | 'partially_resolved' | 'not_resolved', citizenComments: string, feedbackData?: any) => Promise<void>;
}

export const CitizenVerificationModal: React.FC<CitizenVerificationModalProps> = ({
  isOpen,
  onClose,
  complaint,
  language,
  onVerify,
}) => {
  if (!isOpen || !complaint) return null;
  const t = translations[language];

  const [verificationChoice, setVerificationChoice] = useState<'completely_resolved' | 'partially_resolved' | 'not_resolved'>('completely_resolved');
  const [comments, setComments] = useState('');
  
  // Feedback state for completely resolved
  const [rating, setRating] = useState(5);
  const [responseTimeRating, setResponseTimeRating] = useState(5);
  const [satisfaction, setSatisfaction] = useState<'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied'>('very_satisfied');
  const [feedbackComments, setFeedbackComments] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const feedbackPayload = verificationChoice === 'completely_resolved' ? {
        rating,
        responseTimeRating,
        satisfaction,
        comments: feedbackComments || comments || 'Resolved satisfactorily on site.',
        wasCompletelyResolved: true,
      } : undefined;

      await onVerify(
        complaint.id,
        verificationChoice,
        comments || (verificationChoice === 'completely_resolved' ? 'Citizen confirmed on-site resolution.' : 'Citizen rejected resolution.'),
        feedbackPayload
      );
      onClose();
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.verificationTitle}
              </h3>
              <p className="text-xs text-slate-400">
                Grievance ID: {complaint.complaintId}
              </p>
            </div>
          </div>
          <button
            id="close-verify-modal-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Authority Resolution Summary Card */}
          {complaint.resolution && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Action Taken by Authority:</span>
                <span className="font-semibold text-slate-700">{complaint.resolution.resolvedBy}</span>
              </div>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                "{complaint.resolution.resolutionDescription}"
              </p>
              {complaint.resolution.evidenceImageUrl && (
                <div className="mt-2 h-28 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={complaint.resolution.evidenceImageUrl}
                    alt="Resolution Evidence"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          )}

          {/* Primary Verification Prompt */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              ❓ {t.verificationPrompt}
            </label>

            <div className="space-y-2.5">
              {/* Option 1: Completely Resolved */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  verificationChoice === 'completely_resolved'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="verificationChoice"
                  value="completely_resolved"
                  checked={verificationChoice === 'completely_resolved'}
                  onChange={() => setVerificationChoice('completely_resolved')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">{t.optCompletelyResolved}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'hi'
                      ? 'कार्य संतोषजनक रहा। शिकायत औपचारिक रूप से बंद कर दी जाएगी।'
                      : 'Work was completed satisfactorily. Closes the complaint permanently.'}
                  </p>
                </div>
              </label>

              {/* Option 2: Partially Resolved */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  verificationChoice === 'partially_resolved'
                    ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="verificationChoice"
                  value="partially_resolved"
                  checked={verificationChoice === 'partially_resolved'}
                  onChange={() => setVerificationChoice('partially_resolved')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RotateCcw size={16} className="text-amber-600" />
                    <span className="text-xs font-bold text-slate-900">{t.optPartiallyResolved}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'hi'
                      ? 'कुछ काम हुआ लेकिन अभी कमियां बाकी हैं। शिकायत दोबारा खोली जाएगी।'
                      : 'Some repairs occurred but unfinished issues remain. Reopens complaint for rework.'}
                  </p>
                </div>
              </label>

              {/* Option 3: Not Resolved */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  verificationChoice === 'not_resolved'
                    ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="verificationChoice"
                  value="not_resolved"
                  checked={verificationChoice === 'not_resolved'}
                  onChange={() => setVerificationChoice('not_resolved')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-600" />
                    <span className="text-xs font-bold text-slate-900">{t.optNotResolved}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'hi'
                      ? 'समस्या बिल्कुल ठीक नहीं हुई। शिकायत पुनः खुलेगी और उच्च अधिकारी को एस्केलेट होगी।'
                      : 'Problem persists on the ground. Reopens and escalates case to Senior Block Officer.'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Citizen Feedback / Reopening Comments */}
          {verificationChoice === 'completely_resolved' ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                {t.feedbackTitle}
              </h4>

              {/* Star Rating */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.satisfactionQuestion}
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-500 transition hover:scale-110"
                    >
                      <Star
                        size={22}
                        className={s <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Comments with Voice */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">
                    {t.feedbackCommentsLabel}
                  </span>
                  <VoiceInputButton
                    language={language}
                    currentValue={feedbackComments}
                    onTranscript={txt => setFeedbackComments(txt)}
                    fieldLabel="Feedback"
                    size="sm"
                  />
                </div>
                <input
                  type="text"
                  value={feedbackComments}
                  onChange={e => setFeedbackComments(e.target.value)}
                  placeholder={language === 'hi' ? 'अपना अनुभव या सुझाव साझा करें...' : 'Share your feedback or remarks...'}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50/60 border border-amber-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  {t.reopenReasonLabel} *
                </label>
                <VoiceInputButton
                  language={language}
                  currentValue={comments}
                  onTranscript={txt => setComments(txt)}
                  fieldLabel="Reopen Reason"
                  size="sm"
                />
              </div>
              <textarea
                rows={2}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder={t.reopenReasonPlaceholder}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              id="submit-verification-action-btn"
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm transition active:scale-95 flex items-center gap-2 ${
                verificationChoice === 'completely_resolved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : verificationChoice === 'partially_resolved'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {verificationChoice === 'completely_resolved' && <CheckCircle2 size={16} />}
              {verificationChoice === 'partially_resolved' && <RotateCcw size={16} />}
              {verificationChoice === 'not_resolved' && <AlertTriangle size={16} />}
              <span>
                {verificationChoice === 'completely_resolved'
                  ? t.confirmResolutionBtn
                  : verificationChoice === 'partially_resolved'
                  ? t.reopenComplaintBtn
                  : t.reopenAndEscalateBtn}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
