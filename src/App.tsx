import React, { useState, useEffect } from 'react';
import {
  Navbar,
  HomeDashboard,
  SubmitComplaintForm,
  ComplaintTracking,
  MyComplaintsList,
  AdminDashboard,
  AIAnalytics,
  AIAssistantChat,
  EmergencyComplaintModal,
  LoginModal,
  LoginPage,
} from './components';
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  User,
  AppNotification,
  AssignedTechnician,
} from './types';
import {
  SAMPLE_COMPLAINTS,
  SAMPLE_NOTIFICATIONS,
  DEMO_STUDENT,
  DEMO_USERS,
} from './sampleData';
import {
  getStoredCurrentUser,
  setStoredCurrentUser,
  syncStoredUsersWithBackend,
} from './utils/userStorage';
import { CheckCircle2, AlertTriangle, Bell, X, ShieldAlert } from 'lucide-react';

export type ActiveView =
  | 'dashboard'
  | 'submit'
  | 'tracking'
  | 'my-complaints'
  | 'admin'
  | 'analytics'
  | 'assistant'
  | 'login';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return getStoredCurrentUser() || DEMO_STUDENT;
  });
  const [complaints, setComplaints] = useState<Complaint[]>(SAMPLE_COMPLAINTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(SAMPLE_NOTIFICATIONS);
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    SAMPLE_COMPLAINTS[0]?.id || null
  );
  const [prefillCategory, setPrefillCategory] = useState<ComplaintCategory | null>(null);

  // Sync users with backend on initial load
  useEffect(() => {
    syncStoredUsersWithBackend().catch((err) => {
      console.warn('Initial user sync error:', err);
    });
  }, []);

  // Modals
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    type?: 'success' | 'alert' | 'emergency';
  } | null>(null);

  const showToast = (
    title: string,
    description: string,
    type: 'success' | 'alert' | 'emergency' = 'success'
  ) => {
    setToastMessage({ title, description, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setStoredCurrentUser(user);
    showToast('Identity Confirmed', `Signed in as ${user.name} (${user.role.toUpperCase()})`, 'success');
  };

  const handleLogout = () => {
    setStoredCurrentUser(null);
    setCurrentUser(null as any);
    setCurrentView('login');
    showToast('Logged Out', 'You have been signed out of the maintenance portal.', 'alert');
  };

  // Notification creation helper (Requirement 8)
  const addNotification = (
    title: string,
    message: string,
    complaintId?: string,
    type: 'submission' | 'assigned' | 'status_change' | 'resolved' | 'emergency' = 'status_change'
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      complaintId,
      timestamp: 'Just now',
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // 1. Handle Complaint Submission (Requirement 3, 4, 8)
  const handleSubmitSuccess = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    setSelectedComplaintId(newComplaint.id);

    // Trigger submission notification (Requirement 8)
    addNotification(
      'Complaint Submitted Successfully',
      `Ticket #${newComplaint.id} has been registered for ${newComplaint.building} (${newComplaint.roomNumber}).`,
      newComplaint.id,
      'submission'
    );

    showToast(
      'Complaint Ticket Logged',
      `Assigned Ticket ID: ${newComplaint.id}. Opening live tracker...`,
      'success'
    );

    setCurrentView('tracking');
  };

  // 2. Handle Emergency Submission (Requirement 2, 8)
  const handleEmergencySubmit = (emergencyComplaint: Complaint) => {
    setComplaints((prev) => [emergencyComplaint, ...prev]);
    setSelectedComplaintId(emergencyComplaint.id);

    // Trigger emergency notification
    addNotification(
      'CRITICAL EMERGENCY DISPATCHED',
      `Immediate response crew notified for ${emergencyComplaint.building} (${emergencyComplaint.roomNumber}).`,
      emergencyComplaint.id,
      'emergency'
    );

    showToast(
      'Emergency Crew Dispatched!',
      `Immediate 2-Hour SLA activated for Ticket #${emergencyComplaint.id}`,
      'emergency'
    );

    setCurrentView('tracking');
  };

  // 3. Handle Admin Assignment (Requirement 6, 8)
  const handleAssignTechnician = (complaintId: string, technician: AssignedTechnician) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const now = new Date().toISOString();
          const updatedTimeline = [
            ...c.timeline,
            {
              status: 'Assigned' as ComplaintStatus,
              timestamp: now,
              actor: `${currentUser.name} (Admin)`,
              note: `Assigned to ${technician.name} (${technician.department}).`,
            },
          ];
          return {
            ...c,
            assignedTechnician: technician,
            status: c.status === 'Submitted' ? 'Assigned' : c.status,
            updatedAt: now,
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );

    // Send assigned notification (Requirement 8)
    addNotification(
      'Technician Assigned',
      `Complaint #${complaintId} has been assigned to ${technician.name} (${technician.department}).`,
      complaintId,
      'assigned'
    );

    showToast(
      'Technician Assigned',
      `${technician.name} has been deployed to work on #${complaintId}.`,
      'success'
    );
  };

  // 4. Handle Admin Status Update (Requirement 6, 8)
  const handleUpdateStatus = (
    complaintId: string,
    newStatus: ComplaintStatus,
    notes?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const now = new Date().toISOString();
          const updatedTimeline = [
            ...c.timeline,
            {
              status: newStatus,
              timestamp: now,
              actor: `${currentUser.name} (Facility Ops)`,
              note: notes || `Ticket transitioned to ${newStatus}.`,
            },
          ];
          return {
            ...c,
            status: newStatus,
            statusNotes: notes || c.statusNotes,
            updatedAt: now,
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );

    // Send status change or resolved notification (Requirement 8)
    const isResolved = newStatus === 'Resolved' || newStatus === 'Closed';
    addNotification(
      isResolved ? 'Complaint Resolved' : `Status Updated: ${newStatus}`,
      isResolved
        ? `Complaint #${complaintId} has been marked resolved. Please confirm and review.`
        : `Complaint #${complaintId} is now marked as ${newStatus}. Note: ${notes || 'Updated by dispatch'}.`,
      complaintId,
      isResolved ? 'resolved' : 'status_change'
    );

    showToast(
      isResolved ? 'Ticket Marked Resolved' : `Status: ${newStatus}`,
      `Ticket #${complaintId} updated successfully.`,
      isResolved ? 'success' : 'alert'
    );
  };

  // 5. Handle Feedback rating update
  const handleUpdateFeedback = (id: string, rating: number, feedback: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            userRating: rating,
            userFeedback: feedback,
          };
        }
        return c;
      })
    );
    showToast('Feedback Received', `Thank you for rating service with ${rating} stars!`, 'success');
  };

  // Clear all notifications
  const handleClearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeView={currentView}
        onNavigate={(view) => {
          if (view === 'ai-assistant') {
            setCurrentView('assistant');
          } else {
            setCurrentView(view as ActiveView);
          }
          if (view !== 'submit') setPrefillCategory(null);
        }}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenLoginModal={() => setCurrentView('login')}
        onLogout={handleLogout}
        onSwitchUser={(role) => {
          const match = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
          handleLoginSuccess(match);
        }}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
        onSelectNotification={(id) => {
          setSelectedComplaintId(id);
          setCurrentView('tracking');
        }}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {currentView === 'dashboard' && (
          <HomeDashboard
            currentUser={currentUser}
            complaints={complaints}
            onNavigate={(view, cat) => {
              setCurrentView(view as ActiveView);
              if (cat) setPrefillCategory(cat);
            }}
            onSelectComplaint={(id) => {
              setSelectedComplaintId(id);
              setCurrentView('tracking');
            }}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          />
        )}

        {currentView === 'submit' && (
          <SubmitComplaintForm
            currentUser={currentUser}
            prefillCategory={prefillCategory}
            onSubmitSuccess={handleSubmitSuccess}
          />
        )}

        {currentView === 'tracking' && (
          <ComplaintTracking
            complaints={complaints}
            selectedComplaintId={selectedComplaintId}
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            onUpdateFeedback={handleUpdateFeedback}
          />
        )}

        {currentView === 'my-complaints' && (
          <MyComplaintsList
            currentUser={currentUser}
            complaints={complaints}
            onSelectComplaint={(id) => {
              setSelectedComplaintId(id);
              setCurrentView('tracking');
            }}
            onNavigateSubmit={() => {
              setPrefillCategory(null);
              setCurrentView('submit');
            }}
            initialCategoryFilter={prefillCategory}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            complaints={complaints}
            onAssignTechnician={handleAssignTechnician}
            onUpdateStatus={handleUpdateStatus}
            onSelectComplaintForTracking={(id) => {
              setSelectedComplaintId(id);
              setCurrentView('tracking');
            }}
          />
        )}

        {currentView === 'analytics' && <AIAnalytics complaints={complaints} />}

        {currentView === 'assistant' && (
          <AIAssistantChat
            currentUser={currentUser}
            onNavigateSubmitWithPrompt={(promptText) => {
              setCurrentView('submit');
            }}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            currentUser={currentUser}
            onLoginSuccess={(user) => {
              handleLoginSuccess(user);
              setCurrentView('dashboard');
            }}
            onLogout={handleLogout}
            complaints={complaints}
            onNavigateDashboard={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">College Maintenance Complaint AI</span>
            <span className="text-slate-300">|</span>
            <span>Estate & Facility Management System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>24x7 Campus Emergency: Ext 100</span>
            <span>•</span>
            <span>Powered by Google Gemini 2.5 Flash</span>
          </div>
        </div>
      </footer>

      {/* Emergency Complaint Modal */}
      <EmergencyComplaintModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        currentUser={currentUser}
        onEmergencySubmit={handleEmergencySubmit}
      />

      {/* Login & User Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast('Welcome!', `Logged in as ${user.name} (${user.role.toUpperCase()})`, 'success');
        }}
      />

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 border text-xs max-w-sm ${
              toastMessage.type === 'emergency'
                ? 'bg-red-600 text-white border-red-700'
                : toastMessage.type === 'alert'
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toastMessage.type === 'emergency' ? (
              <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm">{toastMessage.title}</div>
              <div className="text-slate-200 mt-0.5">{toastMessage.description}</div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
