import React from 'react';
import {
  PlusCircle,
  FileText,
  Search,
  AlertTriangle,
  Bot,
  Zap,
  Droplets,
  Monitor,
  Armchair,
  Sparkles,
  Wifi,
  FlaskConical,
  Home,
  HelpCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  PhoneCall,
  Flame,
  Activity,
  User,
} from 'lucide-react';
import { Complaint, ComplaintCategory, User as UserType } from '../types';

interface HomeDashboardProps {
  currentUser: UserType;
  complaints: Complaint[];
  onNavigate: (tab: string, category?: ComplaintCategory) => void;
  onOpenEmergency: () => void;
  onSelectComplaint: (id: string) => void;
  onCategoryFilterClick?: (category: ComplaintCategory) => void;
}

export const CATEGORY_ICONS: Record<ComplaintCategory, React.ElementType> = {
  Electrical: Zap,
  Plumbing: Droplets,
  Classroom: Monitor,
  Furniture: Armchair,
  Cleaning: Sparkles,
  'Internet / Wi-Fi': Wifi,
  Laboratory: FlaskConical,
  Hostel: Home,
  Other: HelpCircle,
};

export const CATEGORY_COLORS: Record<ComplaintCategory, { bg: string; text: string; ring: string }> = {
  Electrical: { bg: 'bg-amber-500/10', text: 'text-amber-700', ring: 'ring-amber-500/20' },
  Plumbing: { bg: 'bg-cyan-500/10', text: 'text-cyan-700', ring: 'ring-cyan-500/20' },
  Classroom: { bg: 'bg-indigo-500/10', text: 'text-indigo-700', ring: 'ring-indigo-500/20' },
  Furniture: { bg: 'bg-amber-700/10', text: 'text-amber-800', ring: 'ring-amber-700/20' },
  Cleaning: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', ring: 'ring-emerald-500/20' },
  'Internet / Wi-Fi': { bg: 'bg-blue-500/10', text: 'text-blue-700', ring: 'ring-blue-500/20' },
  Laboratory: { bg: 'bg-purple-500/10', text: 'text-purple-700', ring: 'ring-purple-500/20' },
  Hostel: { bg: 'bg-rose-500/10', text: 'text-rose-700', ring: 'ring-rose-500/20' },
  Other: { bg: 'bg-slate-500/10', text: 'text-slate-700', ring: 'ring-slate-500/20' },
};

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentUser,
  complaints,
  onNavigate,
  onOpenEmergency,
  onSelectComplaint,
  onCategoryFilterClick,
}) => {
  // Statistics
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const emergencyCount = complaints.filter((c) => c.urgency === 'Emergency' && c.status !== 'Closed').length;
  const myComplaintsCount = complaints.filter((c) => c.collegeId === currentUser.collegeId).length;

  const categories: ComplaintCategory[] = [
    'Electrical',
    'Plumbing',
    'Classroom',
    'Furniture',
    'Cleaning',
    'Internet / Wi-Fi',
    'Laboratory',
    'Hostel',
    'Other',
  ];

  const recentComplaints = [...complaints].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Automated Maintenance System • Live</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Space_Grotesk']">
              Welcome, {currentUser.name}
            </h1>
            <button
              onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-blue-200 border border-white/20 transition-all cursor-pointer"
              title="View or update stored user information"
            >
              <User className="w-3 h-3 text-blue-300" />
              <span>{currentUser.collegeId} • {currentUser.role.toUpperCase()}</span>
            </button>
          </div>
          <p className="text-sm sm:text-base text-blue-100/90 mt-2 leading-relaxed">
            Report broken campus facilities, classroom AV, leaking pipes, or Wi-Fi bugs in seconds. Our Gemini AI engine categorizes, assesses urgency, and dispatches directly to college repair crews.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('submit')}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Complaint</span>
            </button>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-blue-300" />
              <span>Talk to AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Droplets className="w-80 h-80" />
        </div>
      </div>

      {/* Primary 5 Requested Action Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Core Navigation</span>
          </h2>
          <span className="text-xs text-slate-500">Fast access controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Submit Complaint */}
          <div
            id="action-submit-complaint"
            onClick={() => onNavigate('submit')}
            className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                Submit Complaint
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Log a maintenance issue with photo and AI auto-refinement.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
              <span>Report issue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. My Complaints */}
          <div
            id="action-my-complaints"
            onClick={() => onNavigate('my-complaints')}
            className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                My Complaints
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review all issues logged from ID <span className="font-mono">{currentUser.collegeId}</span>.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                <span>View list</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                {myComplaintsCount} tickets
              </span>
            </div>
          </div>

          {/* 3. Complaint Status */}
          <div
            id="action-complaint-status"
            onClick={() => onNavigate('tracking')}
            className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                Complaint Status
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Track progress stage, assigned technician, and ETA.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span>Track Ticket</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Emergency Complaint */}
          <div
            id="action-emergency-complaint"
            onClick={onOpenEmergency}
            className="group p-5 rounded-2xl bg-red-50/70 border border-red-200 hover:border-red-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md shadow-red-500/20">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-red-950 group-hover:text-red-700 transition-colors">
                  Emergency Complaint
                </h3>
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              </div>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                Immediate 2-hour SLA for sparks, gas, structural risk, flooding.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                <span>Instant dispatch</span>
                <PhoneCall className="w-3 h-3 text-red-600" />
              </span>
              <span className="text-[10px] font-bold text-red-800 bg-red-200/80 px-2 py-0.5 rounded-full">
                Ext 100
              </span>
            </div>
          </div>

          {/* 5. AI Assistant */}
          <div
            id="action-ai-assistant"
            onClick={() => onNavigate('ai-assistant')}
            className="group p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                AI Assistant
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                CampusFix interactive bot diagnoses tickets, SLAs & regulations.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-700">
              <span>Ask AI anything</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Facility Operations Real-Time Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Logged</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-['Space_Grotesk']">{totalCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Campus complaints this week</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 font-['Space_Grotesk']">{inProgressCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Technicians on-site</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 font-['Space_Grotesk']">{resolvedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Closed & verified</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Emergency Active</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-red-600 font-['Space_Grotesk']">{emergencyCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">High hazard priority</p>
        </div>
      </div>

      {/* Complaint Categories Quick Filter Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Campus Complaint Categories</h2>
            <p className="text-xs text-slate-500">Tap a category to filter ongoing complaints</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const colors = CATEGORY_COLORS[cat];
            const count = complaints.filter((c) => c.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => {
                  if (onCategoryFilterClick) {
                    onCategoryFilterClick(cat);
                  } else {
                    onNavigate('my-complaints', cat);
                  }
                }}
                className={`p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center justify-center group`}
              >
                <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-1.5 ring-1 ${colors.ring} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 truncate w-full group-hover:text-blue-600">
                  {cat}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  {count} {count === 1 ? 'ticket' : 'tickets'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Live Complaints Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Campus Maintenance Tickets</h2>
            <p className="text-xs text-slate-500">Latest active issues reported across departments</p>
          </div>
          <button
            onClick={() => onNavigate('my-complaints')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all complaints</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentComplaints.map((complaint) => {
            const CatIcon = CATEGORY_ICONS[complaint.category] || HelpCircle;
            const catColors = CATEGORY_COLORS[complaint.category] || CATEGORY_COLORS.Other;

            return (
              <div
                key={complaint.id}
                onClick={() => onSelectComplaint(complaint.id)}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${catColors.bg} ${catColors.text}`}>
                        <CatIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="font-mono text-[11px] font-bold text-blue-700">{complaint.id}</span>
                        <span className="text-xs text-slate-400 mx-1.5">•</span>
                        <span className="text-xs font-semibold text-slate-600">{complaint.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          complaint.urgency === 'Emergency'
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : complaint.urgency === 'High'
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : complaint.urgency === 'Medium'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {complaint.urgency}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          complaint.status === 'Resolved' || complaint.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : complaint.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">
                    {complaint.summary || complaint.rewrittenComplaint}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {complaint.rewrittenComplaint}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{complaint.building}</span>
                    <span>•</span>
                    <span className="text-slate-600">{complaint.roomNumber}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <User className="w-3.5 h-3.5" />
                    <span>{complaint.studentName} ({complaint.collegeId})</span>
                  </div>
                  <span className="font-semibold text-blue-600 flex items-center gap-1 group-hover:underline">
                    <span>Track progress</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
