import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  User,
  Phone,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  Bot,
  FileText,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Check,
  MessageSquare,
  Star,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from './HomeDashboard';

interface ComplaintTrackingProps {
  complaints: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint: (id: string) => void;
  onUpdateFeedback?: (id: string, rating: number, feedback: string) => void;
}

const STATUS_STEPS: ComplaintStatus[] = [
  'Submitted',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export const ComplaintTracking: React.FC<ComplaintTrackingProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  onUpdateFeedback,
}) => {
  const [searchQuery, setSearchQuery] = useState(selectedComplaintId || '');
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(5);
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Pick selected complaint or fallback to first
  const activeComplaint =
    complaints.find((c) => c.id.toLowerCase() === searchQuery.trim().toLowerCase()) ||
    complaints.find((c) => c.id === selectedComplaintId) ||
    complaints[0];

  const getStepIndex = (status: ComplaintStatus) => {
    return STATUS_STEPS.indexOf(status);
  };

  const currentStepIdx = activeComplaint ? getStepIndex(activeComplaint.status) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Search Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 font-['Space_Grotesk']">
              Complaint Status & Live Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Search by Complaint ID (e.g. CMC-2026-1048) or select a recent ticket from your history.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Complaint ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Quick Ticket Selector Chips */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex-shrink-0">Quick Switch:</span>
          {complaints.slice(0, 6).map((c) => {
            const isSelected = activeComplaint?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSearchQuery(c.id);
                  onSelectComplaint(c.id);
                  setFeedbackSubmitted(false);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold flex-shrink-0 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.id}
              </button>
            );
          })}
        </div>
      </div>

      {activeComplaint ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tracking Details: 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Progress Stepper Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-blue-700">
                      {activeComplaint.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        activeComplaint.urgency === 'Emergency'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : activeComplaint.urgency === 'High'
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {activeComplaint.urgency} Urgency
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">
                    {activeComplaint.summary || activeComplaint.rewrittenComplaint}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block">Logged On</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {new Date(activeComplaint.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Visual Multi-Step Stepper */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                  Resolution Progress Workflow
                </span>
                <div className="relative flex items-center justify-between">
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
                  <div
                    className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 -z-0"
                    style={{
                      width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />

                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCompleted
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-white'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {idx < currentStepIdx ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`mt-2 text-[11px] font-bold whitespace-nowrap ${
                            isCurrent
                              ? 'text-blue-700 font-extrabold'
                              : isCompleted
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Note or Resolution update */}
              {activeComplaint.statusNotes && (
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-bold text-blue-900">Dispatcher Status Update: </strong>
                    <span>{activeComplaint.statusNotes}</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Rewritten Complaint vs Original Student Report Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    AI Complaint Assistant Transformation
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Rewritten for Professional Maintenance Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original raw input */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Original Student / Staff Description:
                  </span>
                  <p className="text-xs text-slate-700 italic">
                    “{activeComplaint.rawDescription}”
                  </p>
                </div>

                {/* Rewritten professional output */}
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                    AI Enhanced Formal Work Order:
                  </span>
                  <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                    “{activeComplaint.rewrittenComplaint}”
                  </p>
                </div>
              </div>

              {activeComplaint.safetyAction && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Safety Instructions: </strong>
                    {activeComplaint.safetyAction}
                  </span>
                </div>
              )}
            </div>

            {/* Audit Trail Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Ticket Activity & Audit Log</span>
              </h3>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activeComplaint.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{event.status}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(event.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{event.note}</p>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      Actor: {event.actor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Satisfaction / Feedback Rating (When resolved or closed) */}
            {(activeComplaint.status === 'Resolved' || activeComplaint.status === 'Closed') && (
              <div className="bg-emerald-50/70 rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-sm text-emerald-950">
                      Resolution Confirmation & Feedback
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">Problem Fixed</span>
                </div>

                {!feedbackSubmitted ? (
                  <div className="space-y-3">
                    <p className="text-xs text-emerald-800">
                      Has this maintenance issue been resolved to your satisfaction? Please rate your service technician:
                    </p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= userRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {userRating} / 5 Stars
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder="Optional comment (e.g. Technician arrived quickly, great job)..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackSubmitted(true);
                          if (onUpdateFeedback) {
                            onUpdateFeedback(activeComplaint.id, userRating, feedbackNote);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Thank you for your feedback! Rating recorded for this work order.</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Details & Assigned Team Card */}
          <div className="space-y-6">
            {/* Assigned Maintenance Team Card (Requirement 5) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Maintenance Team
              </span>

              {activeComplaint.assignedTechnician ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                      {activeComplaint.assignedTechnician.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {activeComplaint.assignedTechnician.name}
                      </h4>
                      <p className="text-[11px] text-blue-600 font-semibold">
                        {activeComplaint.assignedTechnician.badge}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Division:</span>
                      <span className="font-bold text-slate-800 text-right">
                        {activeComplaint.assignedTechnician.department}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Contact Phone:</span>
                      <a
                        href={`tel:${activeComplaint.assignedTechnician.phone}`}
                        className="font-mono font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{activeComplaint.assignedTechnician.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs text-amber-800">
                  <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1 animate-spin" />
                  <span className="font-bold block">Awaiting Dispatch Assignment</span>
                  <span className="text-[11px] text-amber-700">
                    Recommended: {activeComplaint.suggestedDepartment}
                  </span>
                </div>
              )}

              {/* Estimated Resolution Time (Requirement 5) */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide block">
                  Estimated Resolution Time
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-black text-blue-900 font-['Space_Grotesk']">
                    {activeComplaint.estimatedResolutionHours} Hours
                  </span>
                  <span className="text-[11px] text-blue-700 font-medium">
                    ({activeComplaint.urgency === 'Emergency' ? 'Emergency 2-hour SLA' : 'Standard Campus SLA'})
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Metadata Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Facility Ticket Meta
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Building:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {activeComplaint.building}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Room / Area:</span>
                  <span className="font-bold text-slate-800">{activeComplaint.roomNumber}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-bold text-slate-800">{activeComplaint.category}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Reported By:</span>
                  <span className="font-bold text-slate-800">
                    {activeComplaint.studentName} ({activeComplaint.collegeId})
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {activeComplaint.department}
                  </span>
                </div>
              </div>
            </div>

            {/* Attached Photo Evidence Card */}
            {activeComplaint.photoUrl && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Attached Photo Evidence
                  </span>
                  <button
                    onClick={() => setActivePhotoModal(activeComplaint.photoUrl || null)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Enlarge</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div
                  onClick={() => setActivePhotoModal(activeComplaint.photoUrl || null)}
                  className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer group relative"
                >
                  <img
                    src={activeComplaint.photoUrl}
                    alt="Complaint Evidence"
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Click to view full image
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {activeComplaint.photoName || 'attachment_photo.jpg'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No complaint matching this ID</h3>
          <p className="text-xs text-slate-500 mt-1">
            Check the ID or select one of your recent complaint tickets.
          </p>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
            <img
              src={activePhotoModal}
              alt="Enlarged Evidence"
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-bold hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
