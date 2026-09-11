import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Building,
  User,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintStatus, User as UserType } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from './HomeDashboard';

interface MyComplaintsListProps {
  currentUser: UserType;
  complaints: Complaint[];
  onSelectComplaint: (id: string) => void;
  onNavigateSubmit: () => void;
  initialCategoryFilter?: ComplaintCategory | null;
}

export const MyComplaintsList: React.FC<MyComplaintsListProps> = ({
  currentUser,
  complaints,
  onSelectComplaint,
  onNavigateSubmit,
  initialCategoryFilter,
}) => {
  const [viewScope, setViewScope] = useState<'my' | 'all'>('my');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>(
    initialCategoryFilter || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    // Scope filter
    if (viewScope === 'my' && c.collegeId !== currentUser.collegeId) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && c.status !== statusFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && c.category !== categoryFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchDesc = c.rewrittenComplaint.toLowerCase().includes(q) || c.rawDescription.toLowerCase().includes(q);
      const matchLoc = c.location.toLowerCase().includes(q) || c.building.toLowerCase().includes(q);
      const matchName = c.studentName.toLowerCase().includes(q);
      if (!matchId && !matchDesc && !matchLoc && !matchName) return false;
    }

    return true;
  });

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 font-['Space_Grotesk']">
              Campus Complaints Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse and monitor tickets submitted by you or across campus departments.
          </p>
        </div>

        <button
          onClick={onNavigateSubmit}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Filter and Scope Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Scope Toggle: My Complaints vs All Campus */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl max-w-xs">
            <button
              onClick={() => setViewScope('my')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'my'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Complaints ({complaints.filter((c) => c.collegeId === currentUser.collegeId).length})
            </button>
            <button
              onClick={() => setViewScope('all')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'all'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Campus ({complaints.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, room, keyword..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          </div>
        </div>

        {/* Status and Category dropdown filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-red-600 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints List Grid */}
      {filteredComplaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComplaints.map((complaint) => {
            const CatIcon = CATEGORY_ICONS[complaint.category] || HelpCircle;
            const catColors = CATEGORY_COLORS[complaint.category] || CATEGORY_COLORS.Other;

            return (
              <div
                key={complaint.id}
                onClick={() => onSelectComplaint(complaint.id)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top line with ID & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-2 rounded-xl ${catColors.bg} ${catColors.text}`}>
                        <CatIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="font-mono text-xs font-black text-blue-700">
                          {complaint.id}
                        </span>
                        <span className="text-slate-400 text-xs mx-1.5">•</span>
                        <span className="text-xs font-bold text-slate-700">
                          {complaint.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          complaint.urgency === 'Emergency'
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : complaint.urgency === 'High'
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {complaint.urgency}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
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

                  {/* Summary title */}
                  <h3 className="font-bold text-sm text-slate-900 mt-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {complaint.summary || complaint.rewrittenComplaint}
                  </h3>

                  {/* Formal rewritten description */}
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {complaint.rewrittenComplaint}
                  </p>

                  {/* Location & Team info */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{complaint.building} ({complaint.roomNumber})</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>ETA: {complaint.estimatedResolutionHours}h</span>
                    </span>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Track Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No complaints found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {viewScope === 'my'
              ? "You haven't logged any complaints under your ID yet, or your search filter didn't match."
              : 'No complaints match the current filter selection.'}
          </p>
          <button
            onClick={onNavigateSubmit}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
          >
            Submit a New Complaint
          </button>
        </div>
      )}
    </div>
  );
};
