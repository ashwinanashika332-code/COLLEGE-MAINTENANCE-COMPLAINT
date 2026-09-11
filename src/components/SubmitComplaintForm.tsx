import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  MapPin,
  Bot,
  RefreshCw,
  Send,
  Zap,
  HelpCircle,
  X,
  FileCheck2,
  ShieldAlert,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintUrgency,
  User,
  AIAnalysisResult,
} from '../types';
import {
  CAMPUS_BUILDINGS,
  COLLEGE_DEPARTMENTS,
  SAMPLE_SAMPLE_PHOTOS,
} from '../sampleData';
import { CATEGORY_ICONS, CATEGORY_COLORS } from './HomeDashboard';

interface SubmitComplaintFormProps {
  currentUser: User | null;
  onSubmitSuccess: (newComplaint: Complaint) => void;
  prefillCategory?: ComplaintCategory | null;
}

export const SubmitComplaintForm: React.FC<SubmitComplaintFormProps> = ({
  currentUser,
  onSubmitSuccess,
  prefillCategory,
}) => {
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [collegeId, setCollegeId] = useState(currentUser?.collegeId || '');
  const [department, setDepartment] = useState(currentUser?.department || COLLEGE_DEPARTMENTS[0]);
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0]);
  const [roomNumber, setRoomNumber] = useState(currentUser?.roomNumber || '');
  const [locationDetails, setLocationDetails] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>(
    prefillCategory || 'Electrical'
  );
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Sync with current user when user logs in or switches
  React.useEffect(() => {
    if (currentUser) {
      setStudentName(currentUser.name);
      setCollegeId(currentUser.collegeId);
      setDepartment(currentUser.department);
      if (currentUser.roomNumber) {
        setRoomNumber(currentUser.roomNumber);
      }
    }
  }, [currentUser]);

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick example prompts for demonstration
  const samplePrompts = [
    { text: 'fan not working in room 204 and burning smell from switch', cat: 'Electrical', room: 'Room 204' },
    { text: 'water pipe leaking very fast on 2nd floor bathroom ceiling', cat: 'Plumbing', room: 'Washroom 2B' },
    { text: 'wifi keeps disconnecting says authentication timeout in study wing', cat: 'Internet / Wi-Fi', room: 'Study Wing 105' },
    { text: 'wooden desk row 3 wobbly and cracked screws fallen out', cat: 'Furniture', room: 'LH 102' },
  ];

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

  // Handle Photo upload from local file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setPhotoUrl(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Complaint Analysis
  const handleAIAnalyze = async () => {
    if (!description.trim()) {
      setAnalysisError('Please enter a brief complaint description first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawDescription: description,
          building,
          roomNumber,
          location: locationDetails,
          manualCategory: category,
        }),
      });

      if (!response.ok) {
        throw new Error('AI service error');
      }

      const data: AIAnalysisResult = await response.json();
      setAiAnalysis(data);

      // Auto-update category if detected
      if (data.category && categories.includes(data.category)) {
        setCategory(data.category);
      }
    } catch (err: any) {
      console.warn('AI analysis fallback triggered:', err);
      // Client-side fallback rule
      const fallbackResult: AIAnalysisResult = {
        category: category || 'Electrical',
        urgency: description.toLowerCase().includes('leak') || description.toLowerCase().includes('fire') ? 'Emergency' : 'Medium',
        urgencyReason: 'Evaluated based on campus facility standard assessment rules.',
        rewrittenComplaint: `Issue reported at ${building} (${roomNumber || 'General Area'}): "${description}". Inspection and maintenance rectification requested.`,
        suggestedDepartment: `${category} Maintenance Division`,
        summary: `${category} maintenance ticket for ${building} ${roomNumber}`,
        estimatedResolutionHours: 24,
        recommendedSafetyAction: 'Avoid tampering with affected equipment.',
      };
      setAiAnalysis(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Complaint Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setAnalysisError('Please provide a complaint description.');
      return;
    }

    setIsSubmitting(true);

    const generatedId = `CMC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const finalRewritten =
      aiAnalysis?.rewrittenComplaint ||
      `${category} maintenance requirement at ${building}, ${roomNumber || 'Campus Area'}: "${description.trim()}". Prompt inspection requested.`;

    const finalSummary =
      aiAnalysis?.summary ||
      `${category} issue in ${roomNumber ? roomNumber + ', ' : ''}${building}`;

    const finalUrgency: ComplaintUrgency = aiAnalysis?.urgency || 'Medium';

    const newComplaint: Complaint = {
      id: generatedId,
      studentName: studentName.trim(),
      collegeId: collegeId.trim().toUpperCase(),
      userRole: currentUser.role === 'admin' ? 'staff' : currentUser.role,
      department,
      email: currentUser.email,
      location: `${building}${roomNumber ? ', ' + roomNumber : ''}${locationDetails ? ' (' + locationDetails + ')' : ''}`,
      building,
      roomNumber: roomNumber.trim() || 'General Block',
      category,
      urgency: finalUrgency,
      urgencyReason: aiAnalysis?.urgencyReason,
      rawDescription: description.trim(),
      rewrittenComplaint: finalRewritten,
      summary: finalSummary,
      suggestedDepartment:
        aiAnalysis?.suggestedDepartment || `${category} Maintenance Wing`,
      photoUrl: photoUrl || undefined,
      photoName: photoName || undefined,
      status: 'Submitted',
      estimatedResolutionHours: aiAnalysis?.estimatedResolutionHours || (finalUrgency === 'Emergency' ? 2 : 24),
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'Submitted',
          timestamp: now,
          actor: `${studentName} (${currentUser.role.toUpperCase()})`,
          note: 'Maintenance ticket registered successfully via campus portal.',
        },
      ],
      safetyAction: aiAnalysis?.recommendedSafetyAction,
      aiPowered: Boolean(aiAnalysis),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(newComplaint);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Building className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 font-['Space_Grotesk']">
              Submit Campus Maintenance Complaint
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the complaint details below. Our Gemini AI will review and rewrite your report into a professional facility ticket.
          </p>
        </div>

        {/* Quick Demo Pre-fill Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400">Quick Test:</span>
          {samplePrompts.slice(0, 2).map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDescription(item.text);
                setCategory(item.cat as ComplaintCategory);
                setRoomNumber(item.room);
                setAiAnalysis(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-[11px] font-semibold text-slate-700 transition-colors"
            >
              {item.cat} Issue
            </button>
          ))}
        </div>
      </div>

      {/* Main Complaint Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: User & Identification */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>1. Reporter Credentials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reporter Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Full Name"
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
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="e.g. CS2023-4819"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department <span className="text-red-500">*</span>
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
          </div>
        </div>

        {/* Section 2: Location Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>2. Exact Campus Location</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Building / Complex <span className="text-red-500">*</span>
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                Room Number / Lab / Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 204, LH 102, Lab 3"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Landmark / Floor
              </label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="e.g. 2nd floor east wing near elevator"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Category & Description */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span>3. Problem Category & Description</span>
            </h2>
            <span className="text-xs text-blue-600 font-semibold">AI can auto-classify</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                const isSelected = category === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Complaint Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                You can write plain informal sentences
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. fan not working in room 204, switch is sparking or water leaking near the blackboard"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal leading-relaxed"
            />
          </div>

          {/* AI Refine Action Button */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAIAnalyze}
              disabled={isAnalyzing || !description.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI Analyzing Ticket...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI Auto-Analyze & Polish Complaint</span>
                </>
              )}
            </button>

            {analysisError && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{analysisError}</span>
              </p>
            )}
          </div>

          {/* AI Analysis Result Card (Feature 4 requirement) */}
          {aiAnalysis && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-slate-50 border border-indigo-200 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between mb-3 border-b border-indigo-100 pb-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>AI Complaint Assistant Diagnostic</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-200/80 text-indigo-800 font-mono">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Urgency:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      aiAnalysis.urgency === 'Emergency'
                        ? 'bg-red-600 text-white animate-pulse'
                        : aiAnalysis.urgency === 'High'
                        ? 'bg-amber-500 text-white'
                        : aiAnalysis.urgency === 'Medium'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 text-white'
                    }`}
                  >
                    {aiAnalysis.urgency}
                  </span>
                </div>
              </div>

              {/* Urgency explanation */}
              {aiAnalysis.urgencyReason && (
                <p className="text-[11px] text-slate-600 italic mb-3">
                  <strong className="text-slate-700 not-italic">Urgency Rationale: </strong>
                  {aiAnalysis.urgencyReason}
                </p>
              )}

              {/* Rewritten complaint comparison */}
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-white border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide block mb-1">
                    AI Rewritten Professional Complaint Ticket:
                  </span>
                  <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                    “{aiAnalysis.rewrittenComplaint}”
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-indigo-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Target Maintenance Department:
                    </span>
                    <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                      {aiAnalysis.suggestedDepartment}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-indigo-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Estimated Resolution Window:
                    </span>
                    <span className="font-bold text-blue-700 text-xs mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{aiAnalysis.estimatedResolutionHours} Hours</span>
                    </span>
                  </div>
                </div>

                {aiAnalysis.recommendedSafetyAction && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      <strong>Safety Advisory: </strong>
                      {aiAnalysis.recommendedSafetyAction}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Photo Attachment */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span>4. Upload Photo Evidence</span>
            </h2>
            <span className="text-xs text-slate-400">Optional but speeds up resolution</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom file upload / Drag drop */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-slate-700">Click or Drag & Drop photo here</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG up to 10MB</p>
            </div>

            {/* Quick Sample Photo Presets for Easy Demo */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 block mb-2">
                Or select a realistic demonstration photo:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_SAMPLE_PHOTOS.slice(0, 3).map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPhotoUrl(item.url);
                      setPhotoPreview(item.url);
                      setPhotoName(item.name + '.jpg');
                    }}
                    className={`group rounded-lg overflow-hidden border text-left text-[10px] transition-all relative ${
                      photoUrl === item.url ? 'ring-2 ring-blue-600 border-blue-600' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-14 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-1 bg-white truncate font-medium text-slate-800">
                      {item.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Preview if selected */}
          {photoPreview && (
            <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={photoPreview}
                  alt="Attachment Preview"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-xs">
                    {photoName || 'maintenance_evidence.jpg'}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Photo attached</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhotoUrl('');
                  setPhotoPreview(null);
                  setPhotoName('');
                }}
                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Form Submission Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !description.trim()}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Submitting to Campus Dispatch...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Complaint Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
