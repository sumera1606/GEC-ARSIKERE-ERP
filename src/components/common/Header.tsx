import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  GraduationCap,
  Smartphone,
  Globe,
  Sun,
  Moon,
  Bell,
  LogOut,
  UserCheck,
  ShieldAlert,
  Database,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  onOpenAuth: () => void;
  onToggleNotifications: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onToggleNotifications,
  unreadCount = 2,
}) => {
  const {
    userProfile,
    viewMode,
    setViewMode,
    darkMode,
    setDarkMode,
    logout,
    seedDatabase,
    setDemoRole,
    setIsAvatarModalOpen,
  } = useAuth();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    await seedDatabase();
    setSeeding(false);
    alert("Database seeded with sample GEC Arsikere records!");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#002147] text-white shadow-lg border-b border-[#D4AF37]/40 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & College Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE082] via-[#D4AF37] to-[#B38F24] flex items-center justify-center text-[#002147] shadow-lg font-bold glow-box-gold transition-transform hover:scale-105">
              <GraduationCap className="w-6 h-6 text-[#002147]" />
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg leading-tight tracking-tight text-white flex items-center gap-2">
                GEC Arsikere
                <span className="text-[#D4AF37] text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 border border-[#D4AF37]/50 shadow-sm animate-pulse">
                  VTU ERP 2.0
                </span>
              </h1>
              <p className="text-[11px] text-gray-300 hidden sm:block font-medium">
                Govt. Engineering College, Arsikere • Hassan Dist
              </p>
            </div>
          </div>

          {/* Center: Device View Switcher (Website vs Android App) */}
          <div className="hidden md:flex items-center bg-black/30 p-1 rounded-full border border-white/15 shadow-inner">
            <button
              onClick={() => setViewMode("website")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === "website"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#f3cf65] text-[#002147] shadow-md font-extrabold"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Portal View</span>
            </button>
            <button
              onClick={() => setViewMode("android")}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === "android"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#f3cf65] text-[#002147] shadow-md font-extrabold"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android App</span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-xl border border-[#D4AF37]/50 transition-all text-[#D4AF37] font-bold shadow-sm"
                title="Switch role preview"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" style={{ animationDuration: '6s' }} />
                <span className="capitalize">{userProfile?.role || "Select Role"}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl py-2 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-1 text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider">
                    ⚡ Quick Portal Switch
                  </div>
                  <button
                    onClick={() => {
                      setDemoRole("admin");
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-amber-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors ${
                      userProfile?.role === "admin" ? "text-[#002147] dark:text-amber-400 font-extrabold bg-amber-50/50" : "font-semibold"
                    }`}
                  >
                    <span>Administrator</span>
                    {userProfile?.role === "admin" && <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />}
                  </button>
                  <button
                    onClick={() => {
                      setDemoRole("faculty");
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-amber-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors ${
                      userProfile?.role === "faculty" ? "text-[#002147] dark:text-amber-400 font-extrabold bg-amber-50/50" : "font-semibold"
                    }`}
                  >
                    <span>Faculty Portal</span>
                    {userProfile?.role === "faculty" && <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />}
                  </button>
                  <button
                    onClick={() => {
                      setDemoRole("student");
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-amber-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors ${
                      userProfile?.role === "student" ? "text-[#002147] dark:text-amber-400 font-extrabold bg-amber-50/50" : "font-semibold"
                    }`}
                  >
                    <span>Student Hub</span>
                    {userProfile?.role === "student" && <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Seed Data Button */}
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Seed Sample GEC Data"
            >
              <Database className={`w-4 h-4 ${seeding ? "animate-spin text-[#D4AF37]" : ""}`} />
            </button>

            {/* Notification Bell */}
            <button
              onClick={onToggleNotifications}
              className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#002147] animate-ping" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile / Login */}
            {userProfile ? (
              <div className="flex items-center space-x-2.5 pl-2.5 border-l border-white/20">
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-white/10 transition-all group"
                  title="Customize avatar profile"
                >
                  <div className="relative">
                    {userProfile.avatarUrl ? (
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.name}
                        className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#D4AF37] shadow-sm group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#002147] flex items-center justify-center font-black text-xs shadow-sm ring-1 ring-white/30 group-hover:scale-105 transition-transform">
                        {userProfile.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#D4AF37] text-[#002147] rounded-full flex items-center justify-center text-[8px] font-black shadow-sm">
                      ✨
                    </span>
                  </div>

                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-white truncate max-w-[120px] group-hover:text-amber-200 transition-colors">
                      {userProfile.name}
                    </p>
                    <p className="text-[10px] text-amber-300 font-semibold capitalize">
                      {userProfile.role} • {userProfile.usn || userProfile.employeeId || "Staff"}
                    </p>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-red-300 hover:text-red-100 hover:bg-red-500/20 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-gradient-to-r from-[#D4AF37] to-[#f3cf65] text-[#002147] font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all hover:scale-105"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* High Energy Campus Ticker Banner */}
      <div className="bg-[#001836] border-t border-[#D4AF37]/20 py-1.5 px-4 overflow-hidden text-[11px] font-bold text-amber-200/90 flex items-center justify-between">
        <div className="flex items-center space-x-2 shrink-0 pr-4 border-r border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="uppercase text-[10px] tracking-wider text-[#D4AF37] font-black">VTU LIVE</span>
        </div>
        <div className="truncate px-3 text-gray-200 font-medium">
          🔥 <span className="font-bold text-white">IA-2 Time Table Released</span> • Faculty Department Management Live • Opinion Polls Active • VTU CBCS Credit Calculator Active
        </div>
        <div className="hidden lg:block text-[10px] text-amber-300/80 font-mono shrink-0 pl-3">
          GEC ARSIKERE • VTU CODE: 4AL
        </div>
      </div>
    </header>
  );
};
