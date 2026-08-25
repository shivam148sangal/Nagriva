import React, { useState } from 'react';
import {
  User,
  Shield,
  Phone,
  Lock,
  X,
  MapPin,
  CheckCircle2,
  Building,
  UserCheck
} from 'lucide-react';
import { User as UserType } from '../types';
import { Language, translations } from '../utils/translations';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
  language: Language;
}

const DEMO_ACCOUNTS: UserType[] = [
  {
    id: 'user-1',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    role: 'citizen',
    portal: 'citizen',
    village: 'Rampur Gram Panchayat',
    ward: 'Ward 3',
    district: 'Varanasi',
    language: 'hi',
    designation: 'Citizen',
    status: 'active',
  },
  {
    id: 'user-2',
    name: 'Sunita Devi',
    phone: '9876543211',
    role: 'citizen',
    portal: 'citizen',
    village: 'Sundarpur Gram Panchayat',
    ward: 'Ward 2',
    district: 'Varanasi',
    language: 'hi',
    designation: 'Citizen',
    status: 'active',
  },
  {
    id: 'user-3',
    name: 'Officer Rajesh Verma',
    phone: '9876543212',
    role: 'gram_pradhan',
    portal: 'panchayat',
    village: 'Rampur Gram Panchayat',
    ward: 'Block HQ',
    district: 'Varanasi',
    department: 'Panchayati Raj',
    designation: 'Panchayat Development Officer (PDO)',
    language: 'en',
    status: 'active',
  },
  {
    id: 'user-4',
    name: 'Engineer Amit Patel',
    phone: '9876543213',
    role: 'department_officer',
    portal: 'department',
    village: 'Kashi Vidyapeeth Tehsil',
    ward: 'Divisional Office',
    district: 'Varanasi',
    department: 'Jal Jeevan & Water Department',
    designation: 'Department Officer',
    language: 'en',
    status: 'active',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  language,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'citizen' | 'authority'>('citizen');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('Rampur Gram Panchayat');
  const [ward, setWard] = useState('Ward 3');
  const [department, setDepartment] = useState('Panchayati Raj');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newUser: UserType = {
      id: `user-${Date.now()}`,
      name,
      phone,
      role: activeTab === 'authority' ? 'gram_pradhan' : 'citizen',
      portal: activeTab === 'authority' ? 'panchayat' : 'citizen',
      village,
      ward,
      district: 'Varanasi',
      department: activeTab === 'authority' ? (department as any) : undefined,
      designation: activeTab === 'authority' ? 'Panchayat Development Officer (PDO)' : 'Citizen',
      language,
      status: 'active',
    };

    onLogin(newUser);
    onClose();
  };

  const handleSelectDemo = (acc: UserType) => {
    onLogin(acc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <UserCheck size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.login} / GramSewa Access
              </h3>
              <p className="text-xs text-slate-400">
                Single Sign-On & Role Selection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick 1-Click Demo Profiles */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              ⚡ Quick 1-Click Demo Sign-in
            </span>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      acc.role !== 'citizen' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {acc.role !== 'citizen' ? <Shield size={16} /> : <User size={16} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                        {acc.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 block">
                        {acc.role !== 'citizen' ? `${acc.designation} (${acc.department})` : `${acc.village} • ${acc.ward}`}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                    acc.role !== 'citizen' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">Or Custom Sign-In</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Role Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('citizen')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'citizen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.citizen}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('authority')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'authority' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.authority}
            </button>
          </div>

          {/* Custom Form */}
          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Phone (OTP) *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>

            {activeTab === 'citizen' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Gram Panchayat</label>
                  <select
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Rampur Gram Panchayat">Rampur</option>
                    <option value="Sundarpur Gram Panchayat">Sundarpur</option>
                    <option value="Belur Gram Panchayat">Belur</option>
                    <option value="Kalyanpur Gram Panchayat">Kalyanpur</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Ward</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={e => setWard(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Panchayat Development Office">Panchayat Development Office</option>
                  <option value="Jal Jeevan & Water Dept">Jal Jeevan & Water Dept</option>
                  <option value="PWD Road Infrastructure">PWD Road Infrastructure</option>
                  <option value="Rural Electricity Board">Rural Electricity Board</option>
                  <option value="Swachh Bharat & Sanitation">Swachh Bharat & Sanitation</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Sign In to GramSewa
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
