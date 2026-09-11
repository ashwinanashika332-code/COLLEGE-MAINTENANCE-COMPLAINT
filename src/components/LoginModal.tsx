import React, { useState } from 'react';
import { X, GraduationCap, Briefcase, Shield, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { User, Role } from '../types';
import { COLLEGE_DEPARTMENTS, DEMO_USERS } from '../sampleData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(COLLEGE_DEPARTMENTS[0]);
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !collegeId.trim()) return;

    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      collegeId: collegeId.trim().toUpperCase(),
      email: email.trim() || `${collegeId.toLowerCase()}@campus.edu`,
      department,
      role,
      phone: phone.trim() || undefined,
    };

    onLogin(newUser);
    onClose();
  };

  const handleSelectDemo = (demo: User) => {
    onLogin(demo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50 duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-600/50 text-blue-200">
                <UserCheck className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold">College Campus Portal Access</h2>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Sign in with your verified Institutional credentials
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Toggle Selector */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                if (!collegeId) setCollegeId('CS2023-');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                role === 'student'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('staff');
                if (!collegeId) setCollegeId('FAC-');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                role === 'staff'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Staff / Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                if (!collegeId) setCollegeId('ADMIN-');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                role === 'admin'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {/* Quick Demo Credentials */}
          <div className="mb-6 p-3 rounded-xl bg-blue-50/70 border border-blue-100">
            <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>Instant Test Drive (1-Click Fill)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleSelectDemo(demo)}
                  className="p-2 rounded-lg bg-white border border-blue-200 text-left hover:border-blue-500 hover:bg-blue-50 transition-all text-xs group"
                >
                  <div className="font-bold text-slate-800 text-[11px] group-hover:text-blue-700 truncate">
                    {demo.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{demo.collegeId}</div>
                  <div className="text-[9px] text-blue-600 font-semibold uppercase mt-0.5">
                    {demo.role}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'student' ? 'e.g. Aarav Sharma' : 'e.g. Dr. Anita Roy'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  College ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'student' ? 'e.g. CS2023-4819' : 'e.g. FAC-MECH-102'}
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98XXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {COLLEGE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Maintenance Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
