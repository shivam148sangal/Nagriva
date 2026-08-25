import React, { useState } from 'react';
import axios from 'axios';
import {
  PortalType,
  User,
} from '../../types';
import { Language, translations } from '../../utils/translations';
import {
  Shield,
  User as UserIcon,
  Building2,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Globe,
  Info,
  Layers,
  Key,
} from 'lucide-react';

interface PortalAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
  language: Language;
  initialMode?: 'main' | 'citizen-login' | 'citizen-signup' | 'official-login';
}

export const PortalAuthModal: React.FC<PortalAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language,
  initialMode = 'main',
}) => {
  const [viewMode, setViewMode] = useState<'main' | 'citizen-login' | 'citizen-signup' | 'official-login'>(initialMode);
  
  // Citizen Login State
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');

  // Citizen Sign Up State
  const [citizenName, setCitizenName] = useState('');
  const [citizenRegPhone, setCitizenRegPhone] = useState('');
  const [citizenRegEmail, setCitizenRegEmail] = useState('');
  const [citizenRegPassword, setCitizenRegPassword] = useState('password123');
  const [citizenLanguage, setCitizenLanguage] = useState<Language>(language || 'hi');
  const [citizenAreaType, setCitizenAreaType] = useState<'rural' | 'urban'>('rural');
  const [citizenState, setCitizenState] = useState('Uttar Pradesh');
  const [citizenDistrict, setCitizenDistrict] = useState('Varanasi');
  const [citizenBlock, setCitizenBlock] = useState('Kashi Vidyapeeth');
  const [citizenVillage, setCitizenVillage] = useState('Rampur Gram Panchayat');
  const [citizenWard, setCitizenWard] = useState('Ward 3');

  // Official Login State
  const [officialId, setOfficialId] = useState('');
  const [officialPassword, setOfficialPassword] = useState('password123');

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Demo Government Official IDs for quick evaluation
  const seededOfficialQuickList = [
    { id: 'GOV-ADMIN-0001', name: 'Dr. Anand Swaroop, IAS', role: 'Government Admin', portal: 'government-admin' },
    { id: 'GOV-WARD-0001', name: 'Amit Patel', role: 'Ward Member (Ward 5)', portal: 'ward' },
    { id: 'GOV-PRADHAN-0002', name: 'Suresh Chandra Sharma', role: 'Gram Pradhan', portal: 'panchayat' },
    { id: 'GOV-PDO-0003', name: 'Officer Rajesh Verma', role: 'PDO (Panchayat Dev)', portal: 'panchayat' },
    { id: 'GOV-DIST-0004', name: 'District Magistrate Cell', role: 'DPRO / District Officer', portal: 'district' },
    { id: 'GOV-DEPT-0005', name: 'Eng. Rajesh Verma', role: 'Jal Jeevan Dept Officer', portal: 'department' },
    { id: 'GOV-DEPT-0006', name: 'Er. Sunil Dixit', role: 'PWD Dept Head', portal: 'department' },
  ];

  // 1. Citizen Login Handler
  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.post('/api/auth/citizen/login', {
        phone: citizenPhone || undefined,
        password: citizenPassword || 'password123',
      });
      if (res.data.success) {
        onLoginSuccess(res.data.user, res.data.token);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Citizen login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Citizen 1-Click
  const handleDemoCitizenLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.post('/api/auth/citizen/login', {
        phone: '9845123098', // Ramesh Kumar
        password: 'password123',
      });
      if (res.data.success) {
        onLoginSuccess(res.data.user, res.data.token);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Demo citizen login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Citizen Sign Up Handler
  const handleCitizenSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !citizenRegPhone.trim()) {
      setErrorMsg('Full Name and Mobile Number are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.post('/api/auth/citizen/register', {
        name: citizenName,
        phone: citizenRegPhone,
        email: citizenRegEmail || undefined,
        password: citizenRegPassword || 'password123',
        language: citizenLanguage,
        areaType: citizenAreaType,
        state: citizenState,
        district: citizenDistrict,
        block: citizenBlock,
        village: citizenVillage,
        ward: citizenWard,
      });

      if (res.data.success) {
        onLoginSuccess(res.data.user, res.data.token);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Citizen registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Government Official Login Handler
  const handleOfficialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialId.trim()) {
      setErrorMsg('Please enter your Government Official Unique ID.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.post('/api/auth/official/login', {
        officialId: officialId.trim(),
        password: officialPassword || 'password123',
      });

      if (res.data.success) {
        onLoginSuccess(res.data.user, res.data.token);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
        'Authentication failed. Invalid Official ID or account not provisioned by Government Admin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-6 relative">
        
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 text-lg p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          ✕
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="p-3 rounded-2xl bg-indigo-900 text-white shadow-md">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">GramSewa Authentication</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure Unified Governance & Grievance Redressal Portal
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. MAIN ENTRY SCREEN: ONLY 2 OPTIONS (Citizen vs Government Official) */}
        {/* ================================================================= */}
        {viewMode === 'main' && (
          <div className="mt-6 space-y-6">
            <div className="text-center max-w-md mx-auto">
              <p className="text-sm font-semibold text-slate-800">
                Please select your identity to access GramSewa
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Citizens can self-register or sign in. Government officials authenticate using their official credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Option 1: 👤 Citizen */}
              <div className="p-6 rounded-2xl border-2 border-indigo-100 hover:border-indigo-400 bg-gradient-to-b from-indigo-50/50 to-white transition shadow-xs flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition">
                    <UserIcon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>👤 Citizen</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Submit civic complaints, upload photo/voice evidence, track live SLA progress, and verify ground resolution.
                  </p>
                </div>

                <div className="mt-6 space-y-2.5">
                  <button
                    id="citizen-login-entry-btn"
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setViewMode('citizen-login');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Citizen Login</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    id="citizen-signup-entry-btn"
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setViewMode('citizen-signup');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Citizen Sign Up</span>
                  </button>
                </div>
              </div>

              {/* Option 2: 🏛️ Government Official */}
              <div className="p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-gradient-to-b from-slate-50 to-white transition shadow-xs flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition">
                    <Building2 size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>🏛️ Government Official</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    For Ward Members, Gram Pradhans, Panchayat Officers, District Officials, Line Department Engineers & Government Admins.
                  </p>

                  <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <Info size={13} className="shrink-0 mt-0.5 text-amber-700" />
                    <span>Official accounts are provisioned exclusively by the Government Admin. No public registration.</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    id="official-login-entry-btn"
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setViewMode('official-login');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <KeyRound size={14} />
                    <span>Official Login</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. CITIZEN LOGIN SCREEN */}
        {/* ================================================================= */}
        {viewMode === 'citizen-login' && (
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setViewMode('main');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Selection</span>
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserIcon size={18} className="text-indigo-600" />
                <span>Citizen Login</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in to report or track your village complaints on /citizen/dashboard
              </p>
            </div>

            <form onSubmit={handleCitizenLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number / Email Address
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9845123098 or ramesh.kumar@gramsewa.in"
                    value={citizenPhone}
                    onChange={e => setCitizenPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password / Security PIN
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter password (default: password123)"
                    value={citizenPassword}
                    onChange={e => setCitizenPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDemoCitizenLogin}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200"
                >
                  <Sparkles size={13} />
                  <span>1-Click Demo Citizen (Ramesh)</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Login to /citizen</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="pt-3 text-center border-t border-slate-100">
                <span className="text-xs text-slate-500">Don't have a citizen account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setViewMode('citizen-signup');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Create Citizen Account (Sign Up)
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. CITIZEN SIGN UP SCREEN */}
        {/* ================================================================= */}
        {viewMode === 'citizen-signup' && (
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setViewMode('main');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Selection</span>
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserIcon size={18} className="text-indigo-600" />
                <span>Create Citizen Account (Sign Up)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Register with your village and ward details. Your account is automatically assigned role: CITIZEN.
              </p>
            </div>

            <form onSubmit={handleCitizenSignUp} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={citizenName}
                    onChange={e => setCitizenName(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={citizenRegPhone}
                    onChange={e => setCitizenRegPhone(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="ramesh@gmail.com"
                    value={citizenRegEmail}
                    onChange={e => setCitizenRegEmail(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    value={citizenRegPassword}
                    onChange={e => setCitizenRegPassword(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Language</label>
                  <select
                    value={citizenLanguage}
                    onChange={e => setCitizenLanguage(e.target.value as Language)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Area Type & Hierarchy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Area Type</label>
                  <div className="flex gap-4 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="areaType"
                        value="rural"
                        checked={citizenAreaType === 'rural'}
                        onChange={() => setCitizenAreaType('rural')}
                      />
                      <span>Rural (Gram Panchayat)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="areaType"
                        value="urban"
                        checked={citizenAreaType === 'urban'}
                        onChange={() => setCitizenAreaType('urban')}
                      />
                      <span>Urban / Semi-urban</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={citizenState}
                    onChange={e => setCitizenState(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    value={citizenDistrict}
                    onChange={e => setCitizenDistrict(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Block / Taluka</label>
                  <input
                    type="text"
                    value={citizenBlock}
                    onChange={e => setCitizenBlock(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Village / Gram Panchayat</label>
                  <input
                    type="text"
                    value={citizenVillage}
                    onChange={e => setCitizenVillage(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ward Number / Locality</label>
                <input
                  type="text"
                  value={citizenWard}
                  onChange={e => setCitizenWard(e.target.value)}
                  placeholder="e.g. Ward 3"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('main')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Create Citizen Account & Login</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="pt-2 text-center border-t border-slate-100">
                <span className="text-xs text-slate-500">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setViewMode('citizen-login');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Citizen Login
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. GOVERNMENT OFFICIAL LOGIN SCREEN (Official Unique ID + PIN) */}
        {/* ================================================================= */}
        {viewMode === 'official-login' && (
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setViewMode('main');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Selection</span>
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-slate-900" />
                <span>Government Official Authentication</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your Government-Issued Unique GramSewa ID. You will be automatically routed to your assigned portal based on your designation.
              </p>
            </div>

            <form onSubmit={handleOfficialLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Official Unique ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. GOV-ADMIN-0001, GOV-WARD-0001, GOV-PRADHAN-0002"
                    value={officialId}
                    onChange={e => setOfficialId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Unique ID format: <code className="font-mono text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">GOV-[ROLE]-[XXXX]</code>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Security Password / PIN
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="•••••••• (default: password123)"
                    value={officialPassword}
                    onChange={e => setOfficialPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Fast Testing Official ID Badges */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Quick Reference: Seeded Government IDs
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Click to populate</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {seededOfficialQuickList.map(off => (
                    <button
                      key={off.id}
                      type="button"
                      onClick={() => {
                        setOfficialId(off.id);
                        setOfficialPassword('password123');
                      }}
                      className={`p-2 rounded-xl text-left border transition flex items-center justify-between cursor-pointer ${
                        officialId.toUpperCase() === off.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-mono text-[11px] font-bold text-indigo-700">{off.id}</div>
                        <div className="text-[10px] text-slate-600">{off.name}</div>
                        <div className="text-[9px] text-slate-400 font-semibold">{off.role}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                        /{off.portal}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('main')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Key size={14} />
                  <span>Verify ID & Auto-Route Portal</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
