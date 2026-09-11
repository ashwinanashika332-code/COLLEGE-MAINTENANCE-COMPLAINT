import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  Shield,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Lock,
  Mail,
  Building2,
  Phone,
  Hash,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  AlertCircle,
  Sparkles,
  Save,
  RotateCcw,
  LogOut,
  Users,
  Home,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { User, Role, Complaint } from '../types';
import { COLLEGE_DEPARTMENTS, CAMPUS_BUILDINGS, DEMO_USERS } from '../sampleData';
import {
  saveUserInformation,
  authenticateUser,
  getAllStoredUsers,
  setStoredCurrentUser,
} from '../utils/userStorage';

interface LoginPageProps {
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  complaints?: Complaint[];
  onNavigateDashboard?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  complaints = [],
  onNavigateDashboard,
}) => {
  // Tabs: 'signin' | 'register' | 'profile'
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'profile'>(
    currentUser ? 'profile' : 'signin'
  );

  // Sign In Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  // Registration Form States
  const [regRole, setRegRole] = useState<Role>('student');
  const [regName, setRegName] = useState('');
  const [regCollegeId, setRegCollegeId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState(COLLEGE_DEPARTMENTS[0]);
  const [regPhone, setRegPhone] = useState('');
  const [regBuilding, setRegBuilding] = useState(CAMPUS_BUILDINGS[4]); // Hostel Block A
  const [regRoom, setRegRoom] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Profile Edit States (for current logged in user)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editDepartment, setEditDepartment] = useState(currentUser?.department || COLLEGE_DEPARTMENTS[0]);
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editBuilding, setEditBuilding] = useState(currentUser?.blockOrHostel || CAMPUS_BUILDINGS[0]);
  const [editRoom, setEditRoom] = useState(currentUser?.roomNumber || '');
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);
  const [profileSuccessNotice, setProfileSuccessNotice] = useState<string | null>(null);

  // Stored users on device
  const [allAccounts, setAllAccounts] = useState<User[]>([]);

  useEffect(() => {
    refreshAccounts();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditDepartment(currentUser.department);
      setEditPhone(currentUser.phone || '');
      setEditBuilding(currentUser.blockOrHostel || CAMPUS_BUILDINGS[0]);
      setEditRoom(currentUser.roomNumber || '');
    }
  }, [currentUser]);

  const refreshAccounts = () => {
    const list = getAllStoredUsers();
    setAllAccounts(list);
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessMessage(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Please provide your College ID or Institutional Email.');
      return;
    }

    setLoginLoading(true);
    try {
      const result = await authenticateUser(loginIdentifier, loginPassword || undefined);
      if (result.success && result.user) {
        setLoginSuccessMessage(`Authentication successful! Logged in as ${result.user.name}`);
        setTimeout(() => {
          onLoginSuccess(result.user!);
          setActiveTab('profile');
        }, 500);
      } else {
        setLoginError(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login request encountered an error.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    if (!regName.trim()) {
      setRegError('Please provide your full legal name.');
      return;
    }

    if (!regCollegeId.trim()) {
      setRegError('Please enter your Institutional College ID / Roll Number.');
      return;
    }

    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }

    setRegLoading(true);
    try {
      const cleanId = regCollegeId.trim().toUpperCase();
      const cleanEmail = regEmail.trim().toLowerCase() || `${cleanId.toLowerCase()}@campus.edu`;

      const newUser: User = {
        id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        name: regName.trim(),
        collegeId: cleanId,
        email: cleanEmail,
        department: regDepartment,
        role: regRole,
        phone: regPhone.trim() || undefined,
        blockOrHostel: regBuilding,
        roomNumber: regRoom.trim() || undefined,
        password: regPassword.trim() || 'password123',
        registeredAt: new Date().toISOString(),
      };

      await saveUserInformation(newUser);
      refreshAccounts();

      setRegSuccessMessage(
        `Account for ${newUser.name} created and saved to campus database! Logged in automatically.`
      );

      setTimeout(() => {
        onLoginSuccess(newUser);
        setActiveTab('profile');
      }, 700);
    } catch (err: any) {
      setRegError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  // Quick Demo Account Selection
  const handleSelectDemo = async (demo: User) => {
    setLoginIdentifier(demo.collegeId);
    setLoginPassword(demo.password || 'password123');
    setLoginLoading(true);
    setLoginError(null);

    try {
      await saveUserInformation(demo);
      setTimeout(() => {
        onLoginSuccess(demo);
        setActiveTab('profile');
        setLoginLoading(false);
      }, 350);
    } catch (err) {
      onLoginSuccess(demo);
      setActiveTab('profile');
      setLoginLoading(false);
    }
  };

  // Save Profile Edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaveProfileLoading(true);
    setProfileSuccessNotice(null);

    const updated: User = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      department: editDepartment,
      phone: editPhone.trim() || undefined,
      blockOrHostel: editBuilding,
      roomNumber: editRoom.trim() || undefined,
    };

    try {
      await saveUserInformation(updated);
      onLoginSuccess(updated);
      refreshAccounts();
      setIsEditingProfile(false);
      setProfileSuccessNotice('Your institutional profile was updated and stored successfully.');
      setTimeout(() => setProfileSuccessNotice(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaveProfileLoading(false);
    }
  };

  // Switch to another stored account
  const handleSwitchAccount = (user: User) => {
    setStoredCurrentUser(user);
    onLoginSuccess(user);
    setActiveTab('profile');
  };

  // User's complaints metrics
  const userComplaints = currentUser
    ? complaints.filter(
        (c) =>
          c.collegeId?.toLowerCase() === currentUser.collegeId.toLowerCase() ||
          c.studentName?.toLowerCase() === currentUser.name.toLowerCase()
      )
    : [];

  const pendingCount = userComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const resolvedCount = userComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus Identity & Authentication Portal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Secure single-sign-on for college students, faculty staff, and estate administration.
          </p>
        </div>

        {currentUser && onNavigateDashboard && (
          <button
            onClick={onNavigateDashboard}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span>Go to Maintenance Dashboard</span>
          </button>
        )}
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="bg-slate-50/80 px-4 sm:px-6 pt-4 border-b border-slate-200 flex flex-wrap gap-2">
          {currentUser && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Current Profile & Stored Info</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}

          <button
            onClick={() => setActiveTab('signin')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'signin'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Institutional Sign In</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Student / Staff</span>
          </button>
        </div>

        {/* Tab 1: Profile & Stored Information */}
        {activeTab === 'profile' && currentUser && (
          <div className="p-6 sm:p-8 space-y-6">
            {profileSuccessNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{profileSuccessNotice}</span>
              </div>
            )}

            {/* Digital Campus Identity Badge */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-blue-900/40">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-2xl font-black flex items-center justify-center shadow-lg ring-4 ring-white/10">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        {currentUser.name}
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          currentUser.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : currentUser.role === 'staff'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-blue-200 mt-1 font-mono">
                      <span>ID: {currentUser.collegeId}</span>
                      <span>•</span>
                      <span>{currentUser.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isEditingProfile ? 'Cancel Editing' : 'Edit Stored Profile'}</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-red-200 border border-red-400/30 transition-all flex items-center gap-1.5"
                    title="Sign out of this session"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* ID Card Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-slate-300 relative z-10">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Institutional Email</span>
                  </div>
                  <div className="text-white font-medium mt-1 truncate">{currentUser.email}</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Contact Phone</span>
                  </div>
                  <div className="text-white font-medium mt-1">
                    {currentUser.phone || 'Not provided'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Campus Location</span>
                  </div>
                  <div className="text-white font-medium mt-1 truncate">
                    {currentUser.blockOrHostel || 'Campus Block'}
                    {currentUser.roomNumber ? ` (${currentUser.roomNumber})` : ''}
                  </div>
                </div>
              </div>

              {/* Maintenance Metrics for this User */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-400">Filed Complaints:</span>{' '}
                    <span className="font-bold text-white ml-1">{userComplaints.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Active / In Progress:</span>{' '}
                    <span className="font-bold text-amber-300 ml-1">{pendingCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Resolved:</span>{' '}
                    <span className="font-bold text-emerald-300 ml-1">{resolvedCount}</span>
                  </div>
                </div>
                <div className="text-[11px] text-blue-200/80 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Institutional Record</span>
                </div>
              </div>
            </div>

            {/* Edit Form (if toggled) */}
            {isEditingProfile && (
              <form
                onSubmit={handleSaveProfile}
                className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Save className="w-4 h-4 text-blue-600" />
                    <span>Update Stored User Information</span>
                  </h3>
                  <span className="text-xs text-slate-500">Changes will be saved persistently</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      {COLLEGE_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hostel / Campus Building
                    </label>
                    <select
                      value={editBuilding}
                      onChange={(e) => setEditBuilding(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      {CAMPUS_BUILDINGS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Room / Cabin Number
                    </label>
                    <input
                      type="text"
                      value={editRoom}
                      onChange={(e) => setEditRoom(e.target.value)}
                      placeholder="e.g. Room 204"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveProfileLoading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {saveProfileLoading ? (
                      <span>Saving to Storage...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Stored Information</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Quick Switch to other stored accounts */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Accounts Stored On This Device ({allAccounts.length})
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Tap to instantly switch session</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {allAccounts.map((acc) => {
                  const isCurrent = acc.id === currentUser.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => !isCurrent && handleSwitchAccount(acc)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-400/20'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-xs text-slate-900 truncate">{acc.name}</div>
                        {isCurrent ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-blue-600 hover:underline font-semibold">
                            Switch
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {acc.collegeId}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600">
                        <span className="capitalize font-semibold">{acc.role}</span>
                        <span className="truncate max-w-[120px] text-slate-400">
                          {acc.department.split('&')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Institutional Sign In */}
        {activeTab === 'signin' && (
          <div className="p-6 sm:p-8 space-y-6">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="font-semibold">{loginError}</span>
              </div>
            )}

            {loginSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{loginSuccessMessage}</span>
              </div>
            )}

            {/* Quick 1-Click Fill Demo Credentials */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Instant 1-Click Demo Profiles</span>
                </span>
                <span className="text-[11px] text-blue-700">Pre-seeded campus accounts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="p-3 rounded-xl bg-white border border-blue-200 hover:border-blue-600 hover:shadow-sm text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                        {demo.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700">
                        {demo.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">{demo.collegeId}</div>
                    <div className="text-[9px] text-blue-600 font-medium mt-1 truncate">
                      {demo.department}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Standard Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-4 max-w-lg mx-auto pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional College ID or Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. CS2023-4819 or student@campus.edu"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your university ID or official campus email address.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password / PIN
                  </label>
                  <span className="text-[11px] text-slate-400">(Demo password: password123)</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember my session on this campus browser</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Create new account
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loginLoading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Maintenance Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Register New User */}
        {activeTab === 'register' && (
          <div className="p-6 sm:p-8 space-y-6">
            {regError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="font-semibold">{regError}</span>
              </div>
            )}

            {regSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{regSuccessMessage}</span>
              </div>
            )}

            {/* Role Toggle Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Your Campus Institutional Role
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setRegRole('student');
                    if (!regCollegeId) setRegCollegeId('CS2024-');
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    regRole === 'student'
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegRole('staff');
                    if (!regCollegeId) setRegCollegeId('FAC-');
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    regRole === 'staff'
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Faculty / Staff</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegRole('admin');
                    if (!regCollegeId) setRegCollegeId('ADMIN-');
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    regRole === 'admin'
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Estate Admin</span>
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      regRole === 'student' ? 'e.g. Rohan Gupta' : 'e.g. Dr. K. Ramanathan'
                    }
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institutional College ID / Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={regRole === 'student' ? 'e.g. CS2024-5129' : 'e.g. FAC-EE-204'}
                    value={regCollegeId}
                    onChange={(e) => setRegCollegeId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student.name@campus.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Auto-defaults to [collegeId]@campus.edu if empty.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Faculty Wing
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {COLLEGE_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (SMS alerts)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98XXX XXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campus Residence / Block
                  </label>
                  <select
                    value={regBuilding}
                    onChange={(e) => setRegBuilding(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {CAMPUS_BUILDINGS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Room / Cabin / Lab Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 314"
                    value={regRoom}
                    onChange={(e) => setRegRoom(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Portal Access Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Already registered? Back to Sign In
                </button>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {regLoading ? (
                    <span>Registering & Storing Info...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Save</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Security & Data Storage Footer Note */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            User profile data is securely stored locally and synchronized with the Campus Estate
            Database.
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">System v2.5 • Verified SSO</span>
      </div>
    </div>
  );
};
