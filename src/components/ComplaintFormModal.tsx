import React, { useState } from 'react';
import {
  X,
  MapPin,
  Camera,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Navigation,
  FileText,
  Building,
  UploadCloud
} from 'lucide-react';
import { ComplaintCategory, LocationData, AIAnalysisResult } from '../types';
import { Language, translations } from '../utils/translations';
import { VoiceInputButton } from './VoiceInputButton';
import { LeafletMap } from './LeafletMap';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  language: Language;
  onRunAiAnalysis: (description: string, additionalDetails: string, category: string, location: any) => Promise<AIAnalysisResult>;
}

const CATEGORIES: ComplaintCategory[] = [
  'Water Supply',
  'Roads',
  'Electricity',
  'Sanitation',
  'Waste Management',
  'Drainage',
  'Street Lights',
  'Healthcare',
  'Education',
  'Other',
];

const SAMPLE_EVIDENCE_IMAGES = [
  { label: 'Damaged Road Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Water Leakage / Pipe', url: 'https://images.unsplash.com/photo-1584441405886-bc91be61e56a?w=800&auto=format&fit=crop&q=80' },
  { label: 'Electricity Spark / Transformer', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sanitation / Drain Block', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
];

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  language,
  onRunAiAnalysis,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [category, setCategory] = useState<ComplaintCategory>('Roads');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Varanasi');
  const [block, setBlock] = useState('Kashi Vidyapeeth');
  const [village, setVillage] = useState('Rampur Gram Panchayat');
  const [ward, setWard] = useState('Ward 3');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState(25.3215);
  const [longitude, setLongitude] = useState(82.9782);
  const [imageUrl, setImageUrl] = useState(SAMPLE_EVIDENCE_IMAGES[0].url);
  const [customImageFile, setCustomImageFile] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVoiceDescription = (text: string) => {
    setDescription(text);
    if (!title && text.length > 5) {
      setTitle(text.slice(0, 60));
    }
  };

  const handleVoiceAdditional = (text: string) => {
    setAdditionalDetails(text);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          setLatitude(25.3215);
          setLongitude(82.9782);
        }
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomImageFile(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage(language === 'hi' ? 'कृपया समस्या का विवरण दर्ज करें' : 'Please provide problem description');
      return;
    }
    setErrorMessage('');
    setIsAnalyzing(true);

    try {
      const locationData: LocationData = {
        state,
        district,
        block,
        village,
        ward,
        landmark,
        latitude,
        longitude,
      };

      // Trigger AI triage & confirm
      await onSubmit({
        category,
        title: title || `${category} issue at ${village}`,
        description,
        additionalDetails,
        location: locationData,
        imageUrl: customImageFile || imageUrl,
        voiceLanguageUsed: language,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit grievance');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                <FileText size={18} />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.formTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t.formSubtitle}
            </p>
          </div>
          <button
            id="close-complaint-form-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitWithAi} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Problem Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. {t.categoryLabel} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {CATEGORIES.map(cat => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    id={`cat-select-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2 rounded-lg text-xs font-semibold text-center transition border ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-200 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {t.categories[cat] || cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Description with Integrated Voice-to-Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. {t.descLabel} *
              </label>
              <div className="flex items-center gap-2">
                <VoiceInputButton
                  language={language}
                  currentValue={description}
                  onTranscript={handleVoiceDescription}
                  fieldLabel="Problem Description"
                  size="sm"
                />
              </div>
            </div>

            <textarea
              id="complaint-desc-input"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t.descPlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span>{t.voiceTip}</span>
            </p>
          </div>

          {/* Additional Details with Voice */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. {t.additionalDetailsLabel} (Optional)
              </label>
              <VoiceInputButton
                language={language}
                currentValue={additionalDetails}
                onTranscript={handleVoiceAdditional}
                fieldLabel="Additional Details"
                size="sm"
              />
            </div>

            <input
              id="complaint-additional-input"
              type="text"
              value={additionalDetails}
              onChange={e => setAdditionalDetails(e.target.value)}
              placeholder={t.additionalDetailsPlaceholder}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Location Details & Map Pinpoint */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600" />
                4. Location & Gram Panchayat *
              </label>
              <button
                type="button"
                onClick={handleUseGPS}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200"
              >
                <Navigation size={12} />
                <span>{t.useMyLocation}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.state}</span>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.district}</span>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.block}</span>
                <input
                  type="text"
                  value={block}
                  onChange={e => setBlock(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.village}</span>
                <select
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="Rampur Gram Panchayat">Rampur Gram Panchayat</option>
                  <option value="Sundarpur Gram Panchayat">Sundarpur Gram Panchayat</option>
                  <option value="Belur Gram Panchayat">Belur Gram Panchayat</option>
                  <option value="Kalyanpur Gram Panchayat">Kalyanpur Gram Panchayat</option>
                  <option value="Shivpur Gram Panchayat">Shivpur Gram Panchayat</option>
                </select>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.ward}</span>
                <select
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="Ward 1">Ward 1</option>
                  <option value="Ward 2">Ward 2</option>
                  <option value="Ward 3">Ward 3</option>
                  <option value="Ward 4">Ward 4</option>
                  <option value="Ward 5">Ward 5</option>
                </select>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.landmark}</span>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Near Kali Mandir"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Pinpoint Map */}
            <div className="mt-2">
              <LeafletMap
                isPicker
                selectedLocation={{ latitude, longitude }}
                onSelectLocation={handleLocationSelect}
                language={language}
                height="180px"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
                <span>Lat: {latitude.toFixed(4)}, Long: {longitude.toFixed(4)}</span>
                <span className="text-emerald-700 font-semibold">{t.locationDetermined}</span>
              </div>
            </div>
          </div>

          {/* Photo / Evidence Upload */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              5. {t.uploadImageLabel}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Image Preview */}
              <div className="relative h-32 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Evidence Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center text-slate-400 text-xs">
                    <ImageIcon size={24} className="mx-auto mb-1 opacity-60" />
                    <span>No image selected</span>
                  </div>
                )}
              </div>

              {/* Upload or Choose Preset */}
              <div className="space-y-2">
                <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 shadow-xs transition">
                  <UploadCloud size={16} className="text-emerald-600" />
                  <span>Choose Photo from Device / Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <div className="text-[11px] text-slate-500 font-medium">
                  Or select realistic evidence template:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {SAMPLE_EVIDENCE_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageUrl(sample.url);
                        setCustomImageFile(null);
                      }}
                      className={`text-[10px] text-left p-1.5 rounded-md border truncate transition font-medium ${
                        imageUrl === sample.url
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              id="submit-complaint-ai-btn"
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Sparkles size={16} />
              <span>{isAnalyzing ? t.submitting : t.submitBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
