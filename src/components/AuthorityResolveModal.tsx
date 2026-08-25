import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  UploadCloud,
  CheckCircle2,
  Image as ImageIcon,
  Wrench
} from 'lucide-react';
import { Complaint } from '../types';
import { Language, translations } from '../utils/translations';
import { VoiceInputButton } from './VoiceInputButton';

interface AuthorityResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  language: Language;
  onResolve: (complaintId: string, resolutionDescription: string, evidenceImageUrl: string, actionTaken: string) => Promise<void>;
}

const SAMPLE_RESOLUTION_PROOFS = [
  { label: 'Repaired Pothole Asphalting', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80' },
  { label: 'Replaced Water Pipeline', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' },
  { label: 'Installed Transformer / Electric Pole', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80' },
];

export const AuthorityResolveModal: React.FC<AuthorityResolveModalProps> = ({
  isOpen,
  onClose,
  complaint,
  language,
  onResolve,
}) => {
  if (!isOpen || !complaint) return null;
  const t = translations[language];

  const [resolutionDescription, setResolutionDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [evidenceImageUrl, setEvidenceImageUrl] = useState(SAMPLE_RESOLUTION_PROOFS[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionDescription.trim()) return;
    setIsSubmitting(true);
    try {
      await onResolve(
        complaint.id,
        resolutionDescription,
        evidenceImageUrl,
        actionTaken || 'Field maintenance work completed per departmental norms.'
      );
      onClose();
    } catch (err) {
      console.error('Resolve error:', err);
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
              <Wrench size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.resolveDialogTitle}
              </h3>
              <p className="text-xs text-slate-400">
                Grievance ID: {complaint.complaintId}
              </p>
            </div>
          </div>
          <button
            id="close-resolve-modal-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Resolution Description with Voice Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.resolutionNotes} *
              </label>
              <VoiceInputButton
                language={language}
                currentValue={resolutionDescription}
                onTranscript={txt => setResolutionDescription(txt)}
                fieldLabel="Resolution Description"
                size="sm"
              />
            </div>
            <textarea
              rows={3}
              value={resolutionDescription}
              onChange={e => setResolutionDescription(e.target.value)}
              placeholder={t.resolutionNotesPlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              required
            />
          </div>

          {/* Action Taken Summary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Specific Work Performed / Materials Used
            </label>
            <input
              type="text"
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              placeholder="e.g. 40mm Bitumen patch, 6-inch GI pipe replacement, Transformer coil winding"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Photo Evidence of Work Done */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {t.evidencePhoto}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="h-28 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
                <img
                  src={evidenceImageUrl}
                  alt="Resolution Evidence"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-600">Select Resolution Photo:</div>
                {SAMPLE_RESOLUTION_PROOFS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEvidenceImageUrl(s.url)}
                    className={`w-full text-left text-[11px] p-1.5 rounded border truncate transition ${
                      evidenceImageUrl === s.url
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
            ℹ Note: Marking as resolved triggers a notification to citizen <strong>{complaint.citizenName}</strong> for mandatory on-ground verification before the grievance can be closed.
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              id="submit-resolve-work-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>{t.markResolved}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
