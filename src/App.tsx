import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { DeviceFrame } from "./components/common/DeviceFrame";
import { AuthModal } from "./components/auth/AuthModal";
import { NotificationDrawer } from "./components/common/NotificationDrawer";
import { AvatarModal } from "./components/profile/AvatarModal";

import { AdminDashboard } from "./components/admin/AdminDashboard";
import { FacultyDashboard } from "./components/faculty/FacultyDashboard";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { AICampusAssistant } from "./components/ai/AICampusAssistant";

const MainAppContent: React.FC = () => {
  const { userProfile, viewMode, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const role = userProfile?.role || "student";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#002147] flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">Government Engineering College, Arsikere</h2>
        <p className="text-xs text-amber-200 mt-1">Synchronizing Realtime Firestore Database...</p>
      </div>
    );
  }

  const renderActiveView = () => {
    if (activeTab === "ai") {
      return <AICampusAssistant />;
    }

    if (role === "admin") {
      return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
    } else if (role === "faculty") {
      return <FacultyDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
    } else {
      return <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Header */}
      <Header
        onOpenAuth={() => setAuthModalOpen(true)}
        onToggleNotifications={() => setNotificationsOpen(true)}
      />

      {/* Main Layout Container */}
      {viewMode === "website" ? (
        // Desktop / Tablet Website Portal View
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {renderActiveView()}
          </main>
        </div>
      ) : (
        // Android Phone App Simulator View
        <div className="flex-1">
          <DeviceFrame
            activeTabTitle={`GEC ERP - ${activeTab.toUpperCase()}`}
            onBackToDashboard={() => setActiveTab("dashboard")}
          >
            <div className="pb-16">{renderActiveView()}</div>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobile={true} />
          </DeviceFrame>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <AvatarModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
