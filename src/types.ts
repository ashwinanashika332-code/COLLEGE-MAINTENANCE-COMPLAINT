export type Role = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  collegeId: string;
  email: string;
  department: string;
  role: Role;
  phone?: string;
  blockOrHostel?: string;
  roomNumber?: string;
  avatarUrl?: string;
  registeredAt?: string;
  password?: string;
}

export type ComplaintCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Classroom'
  | 'Furniture'
  | 'Cleaning'
  | 'Internet / Wi-Fi'
  | 'Laboratory'
  | 'Hostel'
  | 'Other';

export type ComplaintUrgency = 'Low' | 'Medium' | 'High' | 'Emergency';

export type ComplaintStatus =
  | 'Submitted'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export interface AssignedTechnician {
  id: string;
  name: string;
  department: string;
  phone: string;
  assignedAt: string;
  badge: string;
}

export interface TimelineEvent {
  status: ComplaintStatus;
  timestamp: string;
  actor: string;
  note: string;
}

export interface Complaint {
  id: string;
  studentName: string;
  collegeId: string;
  userRole: 'student' | 'staff';
  department: string;
  email?: string;
  location: string;
  building: string;
  roomNumber: string;
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  urgencyReason?: string;
  rawDescription: string;
  rewrittenComplaint: string;
  summary: string;
  suggestedDepartment: string;
  photoUrl?: string;
  photoName?: string;
  status: ComplaintStatus;
  statusNotes?: string;
  assignedTechnician?: AssignedTechnician;
  estimatedResolutionHours: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: TimelineEvent[];
  safetyAction?: string;
  aiPowered?: boolean;
}

export interface NotificationItem {
  id: string;
  complaintId?: string;
  title: string;
  message: string;
  type: 'submission' | 'submitted' | 'assigned' | 'status_change' | 'resolved' | 'emergency';
  timestamp: string;
  read: boolean;
}

export type AppNotification = NotificationItem;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  category: ComplaintCategory;
  urgency: ComplaintUrgency;
  urgencyReason: string;
  rewrittenComplaint: string;
  suggestedDepartment: string;
  summary: string;
  estimatedResolutionHours: number;
  recommendedSafetyAction: string;
  aiPowered?: boolean;
}

export interface AIInsightsReport {
  topRecurringProblem: string;
  vulnerableBuilding: string;
  preventiveActions: string[];
  aiExecutiveSummary: string;
}
