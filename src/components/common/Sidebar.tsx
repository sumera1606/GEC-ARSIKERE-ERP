import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  BookOpen,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  FileText,
  Briefcase,
  Library,
  Bot,
  Calculator,
  Bell,
  Clock,
  Send,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobile = false }) => {
  const { userProfile, setIsAvatarModalOpen } = useAuth();
  const role = userProfile?.role || "student";

  const getNavItems = () => {
    if (role === "admin") {
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "students", label: "Students & Approvals", icon: Users },
        { id: "faculty", label: "Faculty Directory", icon: UserCheck },
        { id: "departments", label: "Depts & Subjects", icon: Building2 },
        { id: "timetable", label: "Timetable Management", icon: Clock },
        { id: "attendance", label: "Attendance Reports", icon: CheckSquare },
        { id: "marks", label: "Marks & Analytics", icon: FileSpreadsheet },
        { id: "announcements", label: "Announcements & Cal", icon: Bell },
        { id: "placement", label: "Placement Cell", icon: Briefcase },
        { id: "library", label: "Library Management", icon: Library },
        { id: "ai", label: "AI Campus Assistant", icon: Bot, badge: "Gemini" },
      ];
    } else if (role === "faculty") {
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "departments", label: "Depts & Branches", icon: Building2 },
        { id: "attendance", label: "Take Attendance", icon: CheckSquare },
        { id: "marks", label: "Enter Marks", icon: FileSpreadsheet },
        { id: "assignments", label: "Assignments & Materials", icon: FileText },
        { id: "timetable", label: "View Timetable", icon: Clock },
        { id: "students", label: "My Class Students", icon: Users },
        { id: "announcements", label: "Post Notice", icon: Bell },
        { id: "leave", label: "Leave Requests", icon: Send },
        { id: "ai", label: "AI Campus Assistant", icon: Bot, badge: "Gemini" },
      ];
    } else {
      // Student
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "attendance", label: "My Attendance", icon: CheckSquare },
        { id: "marks", label: "My Marks & Grades", icon: FileSpreadsheet },
        { id: "timetable", label: "Class Timetable", icon: Clock },
        { id: "assignments", label: "Assignments & Notes", icon: BookOpen },
        { id: "calendar", label: "Academic Calendar", icon: Calendar },
        { id: "announcements", label: "Announcements", icon: Bell },
        { id: "cgpa", label: "CGPA Calculator", icon: Calculator },
        { id: "leave", label: "Apply Leave", icon: Send },
        { id: "placement", label: "Placement Cell", icon: Briefcase },
        { id: "library", label: "Library Portal", icon: Library },
        { id: "ai", label: "AI Campus Assistant", icon: Bot, badge: "Gemini" },
      ];
    }
  };

  const navItems = getNavItems();

  if (isMobile) {
    // Android App Bottom Nav (Top 5 key actions + More)
    const mobileShortNav = navItems.slice(0, 5);
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-[#002147] text-white border-t border-[#D4AF37]/30 flex items-center justify-around py-2 px-1 z-30 shadow-lg">
        {mobileShortNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center text-[10px] py-1 px-2 rounded-lg transition-all ${
                isActive
                  ? "text-[#D4AF37] font-bold scale-105"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-[#D4AF37]" : ""}`} />
              <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Desktop Web Portal Sidebar
  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 transition-colors duration-200">
      {/* Role Banner */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-amber-500/10 via-transparent to-blue-500/10">
        <button
          onClick={() => setIsAvatarModalOpen(true)}
          className="w-full text-left flex items-center space-x-3 group p-1 rounded-2xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all"
          title="Click to change profile avatar"
        >
          <div className="relative shrink-0">
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#D4AF37] shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#002147] to-[#001229] text-[#D4AF37] flex items-center justify-center font-black text-sm shadow-md ring-2 ring-[#D4AF37]/30 group-hover:scale-105 transition-transform">
                {userProfile?.name?.charAt(0) || "U"}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#D4AF37] text-[#002147] rounded-full flex items-center justify-center text-[9px] font-black shadow-sm">
              ✨
            </span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900 dark:text-white truncate">
                {userProfile?.name || "Guest User"}
              </h3>
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-[#002147] text-[#D4AF37] uppercase tracking-wider border border-[#D4AF37]/30">
                {role}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold group-hover:underline">
                Avatar ✏️
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[#002147] text-[#D4AF37] shadow-lg scale-[1.02] ring-1 ring-[#D4AF37]/40"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:translate-x-1"
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? "text-[#D4AF37]" : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-[#002147] flex items-center gap-0.5 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 text-center">
        GEC Arsikere ERP v2.4 • VTU Affiliated
      </div>
    </aside>
  );
};
