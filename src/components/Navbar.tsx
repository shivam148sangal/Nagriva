import React, { useState } from 'react';
import {
  Shield,
  Bell,
  Globe,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin,
  BarChart3,
  FileText,
  RotateCcw,
  Menu,
  X,
  ChevronDown,
  Building2,
  Landmark,
  Briefcase,
  Wrench,
  ShieldCheck,
  Radio,
  KeyRound,
} from 'lucide-react';
import { User, NotificationItem, PortalType } from '../types';
import { Language, translations } from '../utils/translations';
import { LiveStatusBadge } from './LiveStatusBadge';

interface NavbarProps {
  currentUser: User;
  onSwitchUser?: (role: 'citizen' | 'authority') => void;
  onSwitchPortal?: (portal: PortalType) => void;
  onRoleToggle?: () => void;
  onOpenLogin?: () => void;
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onTabChange?: (tab: 'dashboard' | 'map' | 'analytics' | 'insights') => void;
  language: Language;
  setLanguage?: (lang: Language) => void;
  onLanguageChange?: (lang: Language) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onOpenReportModal: () => void;
  onResetDemo?: () => void;
  onSelectNotificationComplaint?: (complaintId: string) => void;
  isSocketConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onSwitchPortal,
  onRoleToggle,
  onOpenLogin,
  activeTab,
  setActiveTab,
  onTabChange,
  language,
  setLanguage,
  onLanguageChange,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenReportModal,
  onResetDemo,
  onSelectNotificationComplaint,
  isSocketConnected = true,
}) => {
  const t = translations[language];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleTabClick = (tabId: 'dashboard' | 'map' | 'analytics' | 'insights') => {
    if (onTabChange) onTabChange(tabId);
    if (setActiveTab) setActiveTab(tabId);
  };

  const handleLanguageToggle = (lang: Language) => {
    if (onLanguageChange) onLanguageChange(lang);
    if (setLanguage) setLanguage(lang);
  };

  const portalBadgeInfo = (portal: PortalType = 'citizen') => {
    switch (portal) {
      case 'ward':
        return { label: 'Ward Portal', code: '/ward', icon: Building2, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'panchayat':
        return { label: 'Gram Pradhan', code: '/panchayat', icon: Landmark, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'district':
        return { label: 'District Cell', code: '/district', icon: Briefcase, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'department':
        return { label: 'Line Dept', code: '/department', icon: Wrench, color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      case 'government-admin':
        return { label: 'Govt Apex Admin', code: '/government-admin', icon: ShieldCheck, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default:
        return { label: 'Citizen Portal', code: '/citizen', icon: UserIcon, color: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30' };
    }
  };

  const currentBadge = portalBadgeInfo(currentUser.portal || (currentUser.role === 'citizen' ? 'citizen' : 'panchayat'));
  const BadgeIcon = currentBadge.icon;

  const navItems = [
    { id: 'dashboard' as const, label: t.navDashboard, icon: FileText },
    { id: 'map' as const, label: t.navGisMap, icon: MapPin },
    { id: 'analytics' as const, label: t.navAnalytics, icon: BarChart3 },
    { id: 'insights' as const, label: t.navAiInsights, icon: Sparkles },
  ];

  return (
    <header className="bg-indigo-900 text-white border-b border-indigo-800 sticky top-0 z-40 shadow-sm shrink-0">
      {/* Top Professional Polish Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <Shield className="w-6 h-6 text-indigo-900 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {language === 'hi' ? 'ग्रामसेवा' : 'GramSewa'}
                </h1>
                <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold tracking-wide ${currentBadge.color}`}>
                  <BadgeIcon size={11} />
                  <span>{currentBadge.code}</span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-indigo-200/80 font-medium">
                {language === 'hi' ? 'ग्रामीण शासन और निवारण पोर्टल' : 'Rural Multi-Portal Governance'}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-indigo-950/60 p-1 rounded-xl border border-indigo-800/80">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-800/40'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-indigo-900' : 'text-indigo-300'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Area: Live Status, Language, Switch Portal, Notifications, User Profile */}
          <div className="flex items-center gap-3">
            <LiveStatusBadge isConnected={isSocketConnected} />

            {/* Language Switcher Pill */}
            <div className="hidden sm:flex items-center bg-indigo-800/50 rounded-full px-2.5 py-1 border border-indigo-700">
              <span className="text-[11px] font-medium text-indigo-200 mr-1.5">Lang:</span>
              <button
                id="lang-btn-en"
                type="button"
                onClick={() => handleLanguageToggle('en')}
                className={`text-xs px-2 py-0.5 rounded font-semibold transition ${
                  language === 'en'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                id="lang-btn-hi"
                type="button"
                onClick={() => handleLanguageToggle('hi')}
                className={`text-xs px-2 py-0.5 rounded font-semibold transition ${
                  language === 'hi'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Quick Demo Reset */}
            {onResetDemo && (
              <button
                id="reset-demo-btn"
                type="button"
                onClick={onResetDemo}
                title="Reset sample data"
                className="hidden xl:flex items-center gap-1 text-xs text-indigo-300 hover:text-white transition px-2 py-1 rounded bg-indigo-800/30 hover:bg-indigo-800/60 border border-indigo-700/50"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}

            {/* Switch User / Auth Button */}
            {onOpenLogin && (
              <button
                id="switch-portal-header-btn"
                type="button"
                onClick={onOpenLogin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700/80 hover:bg-indigo-600 active:scale-95 text-white font-semibold text-xs border border-indigo-500/40 transition cursor-pointer shadow-xs"
              >
                <KeyRound size={13} className="text-amber-300" />
                <span>Switch / Sign In</span>
              </button>
            )}

            {/* Citizen Report CTA */}
            {currentUser.role === 'citizen' && (
              <button
                id="header-report-btn"
                type="button"
                onClick={onOpenReportModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white font-semibold text-xs shadow-sm border border-indigo-400/40 transition cursor-pointer"
              >
                <span>{t.reportProblemBtn}</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notifications-bell-btn"
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-800/60 transition focus:outline-hidden cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 bg-indigo-900 text-white flex items-center justify-between border-b border-indigo-800">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-indigo-300" />
                      <span className="text-sm font-semibold">{t.navNotifications}</span>
                      <span className="text-xs bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-700">
                        {unreadCount} unread
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs text-indigo-300 hover:text-white underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (onMarkNotificationRead) onMarkNotificationRead(n.id);
                            if (n.complaintId && onSelectNotificationComplaint) {
                              onSelectNotificationComplaint(n.complaintId);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !n.read ? 'bg-indigo-50/60 font-medium' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock size={10} />
                            <span>{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Badge */}
            <div className="relative border-l border-indigo-700 pl-3 sm:pl-4">
              <button
                id="user-profile-menu-btn"
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-indigo-800/60 transition text-left cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white truncate max-w-[130px] leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-indigo-300 font-medium">
                    {currentUser.designation || 'Citizen User'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-500 border-2 border-indigo-400 flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
                  {currentUser.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'GS'}
                </div>
                <ChevronDown size={14} className="text-indigo-300 hidden sm:block" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 bg-slate-50 rounded-lg mb-2 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.loggedAs}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'citizen'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {currentUser.role === 'citizen' ? '👤 CITIZEN' : '🏛️ OFFICIAL'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-indigo-950">{currentUser.name}</p>
                    {currentUser.officialId && (
                      <p className="text-[11px] font-mono font-bold text-indigo-600">ID: {currentUser.officialId}</p>
                    )}
                    <p className="text-xs text-slate-600">{currentUser.village} ({currentUser.ward})</p>
                    {currentUser.designation && (
                      <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{currentUser.designation}</p>
                    )}
                    {currentUser.department && (
                      <p className="text-[10px] text-slate-500">{currentUser.department}</p>
                    )}
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Active Portal:</span>
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        /{currentUser.portal}/dashboard
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {onOpenLogin && (
                      <button
                        id="open-custom-login-btn"
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenLogin();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition flex items-center gap-2 cursor-pointer"
                      >
                        <KeyRound size={14} className="text-indigo-600" />
                        <span>Switch Account / Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-800/60"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Secondary Sub-nav on Tablet/Mobile */}
        <div className="lg:hidden flex items-center gap-2 pb-2.5 overflow-x-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-white text-indigo-900 font-semibold shadow-xs'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-800/40'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-indigo-800 space-y-1 bg-indigo-950/90 rounded-b-xl px-2 mb-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-indigo-300">
              <span>Language:</span>
              <button
                type="button"
                onClick={() => handleLanguageToggle('en')}
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  language === 'en' ? 'bg-white text-indigo-900' : 'text-indigo-200'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageToggle('hi')}
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  language === 'hi' ? 'bg-white text-indigo-900' : 'text-indigo-200'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {onOpenLogin && (
              <button
                type="button"
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-semibold text-xs transition cursor-pointer"
              >
                <KeyRound size={14} className="text-amber-300" />
                <span>Sign In / Switch User</span>
              </button>
            )}

            {currentUser.role === 'citizen' && (
              <button
                type="button"
                onClick={() => {
                  onOpenReportModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 rounded-lg bg-indigo-500 text-white font-semibold text-xs shadow-sm"
              >
                <span>{t.reportProblemBtn}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

