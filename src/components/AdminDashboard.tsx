import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  X,
  FileCheck,
  User,
  Building,
  Phone,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Send,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  ComplaintUrgency,
  AssignedTechnician,
} from '../types';
import { CAMPUS_BUILDINGS, TECHNICIANS } from '../sampleData';
import { CATEGORY_ICONS, CATEGORY_COLORS } from './HomeDashboard';

interface AdminDashboardProps {
  complaints: Complaint[];
  onAssignTechnician: (complaintId: string, technician: AssignedTechnician) => void;
  onUpdateStatus: (complaintId: string, newStatus: ComplaintStatus, notes?: string) => void;
  onSelectComplaintForTracking: (complaintId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  onAssignTechnician,
  onUpdateStatus,
  onSelectComplaintForTracking,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [assignModalComplaint, setAssignModalComplaint] = useState<Complaint | null>(null);
  const [statusModalComplaint, setStatusModalComplaint] = useState<Complaint | null>(null);
  const [newStatusSelection, setNewStatusSelection] = useState<ComplaintStatus>('In Progress');
  const [statusNotesInput, setStatusNotesInput] = useState('');
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (locationFilter !== 'all' && c.building !== locationFilter) return false;
    if (urgencyFilter !== 'all' && c.urgency !== urgencyFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchText = c.rewrittenComplaint.toLowerCase().includes(q) || c.rawDescription.toLowerCase().includes(q);
      const matchUser = c.studentName.toLowerCase().includes(q) || c.collegeId.toLowerCase().includes(q);
      const matchRoom = c.roomNumber.toLowerCase().includes(q);
      if (!matchId && !matchText && !matchUser && !matchRoom) return false;
    }

    return true;
  });

  // Admin stats
  const totalTickets = complaints.length;
  const pendingSubmitted = complaints.filter((c) => c.status === 'Submitted').length;
  const activeJobs = complaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const emergencies = complaints.filter((c) => c.urgency === 'Emergency' && c.status !== 'Closed').length;

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

  const statuses: ComplaintStatus[] = [
    'Submitted',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
  ];

  const urgencies: ComplaintUrgency[] = ['Low', 'Medium', 'High', 'Emergency'];

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalComplaint) return;
    onUpdateStatus(statusModalComplaint.id, newStatusSelection, statusNotesInput);
    setStatusModalComplaint(null);
    setStatusNotesInput('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400 ring-1 ring-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black tracking-tight font-['Space_Grotesk']">
              Estate Administration & Facility Operations Dispatch
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management control: assign technicians, update job tickets, and inspect photos.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-mono">
            {filtered.length} Displayed / {totalTickets} Total
          </span>
        </div>
      </div>

      {/* Admin Quick Metric Cards (Requirement 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Tickets
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900 font-['Space_Grotesk']">{totalTickets}</div>
          <span className="text-[10px] text-slate-500">All semester complaints</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Pending Dispatch
          </span>
          <div className="mt-1 text-2xl font-black text-amber-600 font-['Space_Grotesk']">{pendingSubmitted}</div>
          <span className="text-[10px] text-slate-500">Needs staff assignment</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            Active Jobs
          </span>
          <div className="mt-1 text-2xl font-black text-blue-600 font-['Space_Grotesk']">{activeJobs}</div>
          <span className="text-[10px] text-slate-500">Assigned / In Progress</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Resolved
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-600 font-['Space_Grotesk']">{resolvedCount}</div>
          <span className="text-[10px] text-slate-500">Fixed & signed off</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-red-200 bg-red-50/40 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-600 animate-pulse" />
            <span>Emergencies</span>
          </span>
          <div className="mt-1 text-2xl font-black text-red-600 font-['Space_Grotesk']">{emergencies}</div>
          <span className="text-[10px] text-red-700 font-semibold">2-Hour Rapid Response</span>
        </div>
      </div>

      {/* Multi-Dimensional Filters Bar (Requirement 6: category, location, priority, status) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ticket ID, reporter, room, description..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            {(categoryFilter !== 'all' || locationFilter !== 'all' || urgencyFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setLocationFilter('all');
                  setUrgencyFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* 4 Required Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* 1. Category */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Location */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Location / Building
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              <option value="all">All Campus Buildings</option>
              {CAMPUS_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Priority / Urgency */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Priority Level
            </label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              <option value="all">All Priorities</option>
              {urgencies.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Workflow Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Work Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Ticket ID & Urgency</th>
                <th className="px-4 py-3">Issue Summary & Location</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Assigned Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((complaint) => {
                const CatIcon = CATEGORY_ICONS[complaint.category] || ShieldCheck;
                const catColors = CATEGORY_COLORS[complaint.category] || CATEGORY_COLORS.Other;

                return (
                  <tr key={complaint.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* Ticket ID & Urgency */}
                    <td className="px-4 py-3.5 whitespace-nowrap align-top">
                      <div className="font-mono font-black text-blue-700 text-xs">{complaint.id}</div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          complaint.urgency === 'Emergency'
                            ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
                            : complaint.urgency === 'High'
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : complaint.urgency === 'Medium'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {complaint.urgency}
                      </span>
                    </td>

                    {/* Summary & Location */}
                    <td className="px-4 py-3.5 max-w-xs align-top">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {complaint.summary || complaint.rewrittenComplaint}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {complaint.rewrittenComplaint}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{complaint.building}</span>
                        <span>•</span>
                        <span className="text-blue-600">{complaint.roomNumber}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 whitespace-nowrap align-top">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${catColors.bg} ${catColors.text} font-bold text-[11px]`}>
                        <CatIcon className="w-3.5 h-3.5" />
                        <span>{complaint.category}</span>
                      </span>
                    </td>

                    {/* Reporter */}
                    <td className="px-4 py-3.5 whitespace-nowrap align-top">
                      <div className="font-bold text-slate-800">{complaint.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{complaint.collegeId}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{complaint.department}</div>
                    </td>

                    {/* Assigned Staff */}
                    <td className="px-4 py-3.5 whitespace-nowrap align-top">
                      {complaint.assignedTechnician ? (
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>{complaint.assignedTechnician.name}</span>
                          </div>
                          <div className="text-[10px] text-blue-600 font-semibold truncate max-w-[130px]">
                            {complaint.assignedTechnician.department}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssignModalComplaint(complaint)}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Assign Staff</span>
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap align-top">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          complaint.status === 'Resolved' || complaint.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : complaint.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap align-top space-x-1">
                      {/* View Photo if exists */}
                      {complaint.photoUrl && (
                        <button
                          onClick={() => setPhotoModalUrl(complaint.photoUrl || null)}
                          title="View Attached Photo"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-block"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Assign button */}
                      <button
                        onClick={() => setAssignModalComplaint(complaint)}
                        title="Change / Assign Staff"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors inline-block"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>

                      {/* Status Update button */}
                      <button
                        onClick={() => {
                          setStatusModalComplaint(complaint);
                          setNewStatusSelection(complaint.status);
                          setStatusNotesInput(complaint.statusNotes || '');
                        }}
                        title="Update Ticket Status"
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors inline-block text-[11px] px-2"
                      >
                        Update Status
                      </button>

                      {/* Track Details */}
                      <button
                        onClick={() => onSelectComplaintForTracking(complaint.id)}
                        title="View Full Detail Stepper"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors inline-block"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Assign Maintenance Staff */}
      {assignModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Assign Maintenance Technician</h3>
                <p className="text-xs text-blue-200">Ticket #{assignModalComplaint.id}</p>
              </div>
              <button
                onClick={() => setAssignModalComplaint(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Complaint Summary:</span>
                <p className="text-slate-600 line-clamp-2">{assignModalComplaint.rewrittenComplaint}</p>
                <div className="mt-2 text-[11px] text-blue-700 font-semibold">
                  AI Recommended Wing: {assignModalComplaint.suggestedDepartment}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Staff Member / Specialist:
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {TECHNICIANS.map((tech) => (
                    <button
                      key={tech.id}
                      onClick={() => {
                        onAssignTechnician(assignModalComplaint.id, tech);
                        setAssignModalComplaint(null);
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                          {tech.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                            {tech.name}
                          </div>
                          <div className="text-[10px] text-slate-500">{tech.department}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 group-hover:underline">
                        Assign
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Update Complaint Status */}
      {statusModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Update Ticket Resolution Status</h3>
                <p className="text-xs text-slate-400 font-mono">#{statusModalComplaint.id}</p>
              </div>
              <button
                onClick={() => setStatusModalComplaint(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Change Status To:
                </label>
                <select
                  value={newStatusSelection}
                  onChange={(e) => setNewStatusSelection(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technician Work Note / Resolution Detail:
                </label>
                <textarea
                  rows={3}
                  value={statusNotesInput}
                  onChange={(e) => setStatusNotesInput(e.target.value)}
                  placeholder="e.g. Replaced capacitor, tested ceiling fan, works at full speed."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalComplaint(null)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  Confirm & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: View Uploaded Photo Modal (Requirement 6) */}
      {photoModalUrl && (
        <div
          onClick={() => setPhotoModalUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
            <img
              src={photoModalUrl}
              alt="Uploaded Maintenance Photo"
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
            <div className="p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Uploaded Evidence Photo</span>
              <button
                onClick={() => setPhotoModalUrl(null)}
                className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
