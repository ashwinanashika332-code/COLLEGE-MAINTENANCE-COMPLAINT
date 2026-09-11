import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Bot,
  PlusCircle,
  FileText,
  Search,
  ShieldCheck,
  BarChart3,
  Bell,
  UserCheck,
  Menu,
  X,
  Building2,
  PhoneCall,
  CheckCircle2,
  Clock,
  Sparkles,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { User, NotificationItem } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeView?: string;
  activeTab?: string;
  onNavigate?: (view: any) => void;
  setActiveTab?: (tab: string) => void;
  onOpenEmergency?: () => void;
  onOpenEmergencyModal?: () => void;
  onOpenLogin?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onClearNotifications?: () => void;
  onSelectComplaintForTracking?: (complaintId: string) => void;
  onSelectNotification?: (id: string) => void;
  onSwitchUser?: (role: 'student' | 'staff' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  activeTab,
  onNavigate,
  setActiveTab,
  onOpenEmergency,
  onOpenEmergencyModal,
  onOpenLogin,
  onOpenLoginModal,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onSelectComplaintForTracking,
  onSelectNotification,
  onSwitchUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const currentActive = activeView || activeTab || 'dashboard';

  const handleNavigate = (id: string) => {
    if (onNavigate) onNavigate(id);
    if (setActiveTab) setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleEmergency = () => {
    if (onOpenEmergency) onOpenEmergency();
    if (onOpenEmergencyModal) onOpenEmergencyModal();
  };

  const handleOpenLogin = () => {
    if (onOpenLogin) onOpenLogin();
    if (onOpenLoginModal) onOpenLoginModal();
  };

  const handleSelectNotif = (complaintId?: string, notifId?: string) => {
    if (notifId && onMarkNotificationRead) onMarkNotificationRead(notifId);
    if (complaintId) {
      if (onSelectComplaintForTracking) onSelectComplaintForTracking(complaintId);
      if (onSelectNotification) onSelectNotification(complaintId);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: Building2 },
    { id: 'submit', label: 'Submit Complaint', icon: PlusCircle },
    { id: 'my-complaints', label: 'My Complaints', icon: FileText },
    { id: 'tracking', label: 'Complaint Status', icon: Search },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, highlight: true },
    { id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck, adminOnly: true },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
    { id: 'login', label: currentUser ? 'My Profile' : 'Sign In', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-4 py-1 text-xs text-blue-200 flex items-center justify-between border-b border-blue-800/40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            CAMPUS DISPATCH ACTIVE
          </span>
          <span className="hidden sm:inline text-slate-300">
            Central Maintenance Office: 24/7 AI Automated Ticket Router
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1 text-red-300 hover:text-red-200 font-semibold transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-red-400 animate-pulse" />
            <span>Emergency Hotline: Ext 100</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Crest */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold ring-2 ring-blue-400/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-['Space_Grotesk']">
                  CAMPUS<span className="text-blue-400">FIX</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">College Maintenance Complaint AI</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentActive === item.id;
              if (item.adminOnly && currentUser?.role !== 'admin') {
                return null;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : item.highlight
                      ? 'text-indigo-300 hover:bg-indigo-950/60 hover:text-indigo-200'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-indigo-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons & Profile Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Emergency Action Button */}
            <button
              id="emergency-btn-nav"
              onClick={handleEmergency}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all border border-red-500 hover:scale-105 active:scale-95"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce" />
              <span className="hidden sm:inline">Emergency</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                id="notifications-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 py-2 z-50 animate-in fade-in-50 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-sm text-slate-900">Campus Alerts</span>
                    </div>
                    {onClearNotifications && notifications.length > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            handleSelectNotif(n.complaintId, n.id);
                            setShowNotifications(false);
                          }}
                          className={`px-4 py-2.5 hover:bg-blue-50/70 transition-colors cursor-pointer text-left ${
                            !n.read ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                          {n.complaintId && (
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-600 font-medium">
                              <span>Ticket #{n.complaintId}</span>
                              <span>•</span>
                              <span>Tap to view tracking</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current User & Role Switcher */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-btn"
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs font-bold text-white truncate max-w-[120px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {currentUser.role}
                    </div>
                  </div>
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 p-2 z-50 animate-in fade-in-50 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/80 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            currentUser.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : currentUser.role === 'staff'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.collegeId}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.department}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          handleNavigate('login');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span>View & Edit Stored Information</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          handleNavigate('login');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-600" />
                        <span>Switch Institutional Account</span>
                      </button>
                    </div>

                    {onSwitchUser && (
                      <div className="border-t border-slate-100 pt-1 pb-1">
                        <p className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Quick Demo Switch
                        </p>
                        <button
                          onClick={() => {
                            onSwitchUser('student');
                            setShowRoleMenu(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-100 flex items-center justify-between"
                        >
                          <span>Aarav (Student - CS)</span>
                          {currentUser.role === 'student' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                        <button
                          onClick={() => {
                            onSwitchUser('staff');
                            setShowRoleMenu(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-100 flex items-center justify-between"
                        >
                          <span>Dr. Anita (Faculty/Staff)</span>
                          {currentUser.role === 'staff' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                        <button
                          onClick={() => {
                            onSwitchUser('admin');
                            setShowRoleMenu(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-100 flex items-center justify-between"
                        >
                          <span>Dean Vance (Admin / Officer)</span>
                          {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          if (onLogout) {
                            onLogout();
                          }
                          handleNavigate('login');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavigate('login')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActive === item.id;
            if (item.adminOnly && currentUser?.role !== 'admin') {
              return null;
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
