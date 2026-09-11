import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  PhoneCall,
  Flame,
  Droplets,
  Zap,
  FlaskConical,
  Send,
  Building,
  ShieldAlert,
} from 'lucide-react';
import { Complaint, User } from '../types';
import { CAMPUS_BUILDINGS, TECHNICIANS } from '../sampleData';

interface EmergencyComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onEmergencySubmit: (complaint: Complaint) => void;
}

export const EmergencyComplaintModal: React.FC<EmergencyComplaintModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onEmergencySubmit,
}) => {
  const [emergencyType, setEmergencyType] = useState('Electrical Hazard (Sparking/Smoke)');
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0]);
  const [roomNumber, setRoomNumber] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const emergencyPresets = [
    {
      title: 'Electrical Spark / Burning Odor',
      category: 'Electrical',
      icon: Zap,
      desc: 'Active sparks, exposed wire, or burning smell from main panel',
    },
    {
      title: 'Pipe Burst & Hallway Flooding',
      category: 'Plumbing',
      icon: Droplets,
      desc: 'High-pressure water leakage pooling near electrical conduits',
    },
    {
      title: 'Chemical / Toxic Fume Leak',
      category: 'Laboratory',
      icon: FlaskConical,
      desc: 'Fume hood breakdown, chemical spill, or gas valve issue',
    },
    {
      title: 'Elevator Trapped / Structural Fault',
      category: 'Hostel',
      icon: AlertTriangle,
      desc: 'Occupants trapped or severe ceiling plaster falling',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() && !details.trim()) return;

    const generatedId = `CMC-EMERGENCY-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const selectedPreset = emergencyPresets.find((p) => p.title === emergencyType) || emergencyPresets[0];

    const newComplaint: Complaint = {
      id: generatedId,
      studentName: currentUser.name,
      collegeId: currentUser.collegeId,
      userRole: currentUser.role === 'admin' ? 'staff' : currentUser.role,
      department: currentUser.department,
      email: currentUser.email,
      location: `${building}, ${roomNumber || 'Immediate Area'}`,
      building,
      roomNumber: roomNumber || 'Urgent Zone',
      category: selectedPreset.category as any,
      urgency: 'Emergency',
      urgencyReason: 'CRITICAL HAZARD: Student reported active safety risk requiring instant 2-hour response team.',
      rawDescription: `${emergencyType}: ${details || 'Immediate dispatch required'}`,
      rewrittenComplaint: `CRITICAL CAMPUS EMERGENCY: ${emergencyType} reported at ${building} (${roomNumber || 'Main Area'}). Immediate physical hazard detected. Estate rapid emergency crew dispatched with high priority.`,
      summary: `[EMERGENCY] ${emergencyType} at ${building}`,
      suggestedDepartment: 'Campus Emergency Response & Facility Dispatch',
      photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      photoName: 'emergency_hazard_report.jpg',
      status: 'Assigned',
      assignedTechnician: TECHNICIANS[1], // Immediate master technician
      estimatedResolutionHours: 2,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'Submitted',
          timestamp: now,
          actor: `${currentUser.name} (EMERGENCY HOTLINE)`,
          note: 'Critical emergency ticket logged.',
        },
        {
          status: 'Assigned',
          timestamp: now,
          actor: 'Rapid Auto-Dispatch',
          note: 'Auto-assigned to Marcus Brody & Campus Security Unit.',
        },
      ],
      safetyAction: 'Evacuate immediate 10-meter radius, isolate area, and alert nearby block warden.',
      aiPowered: true,
    };

    onEmergencySubmit(newComplaint);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden">
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 p-6 text-white flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 text-white animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight font-['Space_Grotesk']">
                  Campus Emergency Maintenance
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-red-700 uppercase">
                  2-Hour SLA
                </span>
              </div>
              <p className="text-xs text-red-100 mt-1">
                For immediate hazards risking life, safety, severe water damage, or electrical fire.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 24/7 Hotline Contacts Bar */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center justify-between text-xs text-red-900 font-semibold">
          <div className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-bounce" />
            <span>Campus Security Desk:</span>
            <span className="font-mono font-bold text-red-700">Ext 100 / (555) 019-2424</span>
          </div>
          <span className="text-[11px] text-red-600 font-bold hidden sm:inline">24x7 Available</span>
        </div>

        {/* Emergency Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
              Select Hazard Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {emergencyPresets.map((preset, idx) => {
                const Icon = preset.icon;
                const isSelected = emergencyType === preset.title;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEmergencyType(preset.title)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-red-600 bg-red-50/80 ring-2 ring-red-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-red-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{preset.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{preset.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Building <span className="text-red-500">*</span>
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white font-semibold"
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
                Specific Room / Wing <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Room 204 or 2nd Floor Corridor"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Urgent Situation Description
            </label>
            <textarea
              rows={2}
              required
              placeholder="Describe what is happening right now (e.g. water flooding hallway, sparks flying from panel)..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Immediate Safety Action:</strong> Stay clear of wet surfaces, do not touch electrical equipment, and advise other students to keep distance.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Emergency Response</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
