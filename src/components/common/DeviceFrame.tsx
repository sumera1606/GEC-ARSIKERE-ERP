import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Wifi, Battery, Signal, Smartphone, Globe, ArrowLeft, MoreVertical } from "lucide-react";

interface DeviceFrameProps {
  children: React.ReactNode;
  activeTabTitle?: string;
  onBackToDashboard?: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  activeTabTitle = "GEC Arsikere Mobile ERP",
  onBackToDashboard,
}) => {
  const { viewMode, setViewMode } = useAuth();

  if (viewMode === "website") {
    // Standard Website Portal view
    return <div className="w-full h-full">{children}</div>;
  }

  // Android Mobile App Simulator Frame View
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-2 sm:p-6 flex flex-col items-center justify-center">
      {/* Device Header Controller Banner */}
      <div className="mb-4 flex items-center justify-between w-full max-w-sm px-2 text-white">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-semibold">Android App Simulator</span>
        </div>
        <button
          onClick={() => setViewMode("website")}
          className="flex items-center space-x-1 text-xs text-[#D4AF37] hover:underline"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Switch to Web Portal</span>
        </button>
      </div>

      {/* Android Phone Shell */}
      <div className="w-full max-w-[390px] h-[780px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-gray-700 relative flex flex-col overflow-hidden ring-1 ring-white/20">
        {/* Notch / Camera Hole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-900 rounded-full border border-gray-800" />
        </div>

        {/* Screen Container */}
        <div className="w-full h-full bg-slate-50 dark:bg-gray-900 rounded-[38px] flex flex-col overflow-hidden relative border border-gray-800">
          {/* Android Status Bar */}
          <div className="bg-[#002147] text-white pt-3 pb-1 px-5 flex items-center justify-between text-xs font-medium z-40 select-none">
            <span>09:41</span>
            <div className="flex items-center space-x-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

          {/* Android App Top Bar */}
          <div className="bg-[#002147] text-white px-4 py-2.5 flex items-center justify-between shadow-md border-b border-[#D4AF37]/30 z-40">
            <div className="flex items-center space-x-2">
              {onBackToDashboard && (
                <button
                  onClick={onBackToDashboard}
                  className="p-1 text-gray-200 hover:text-white rounded"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-sm font-bold truncate max-w-[200px]">{activeTabTitle}</h2>
            </div>
            <MoreVertical className="w-4 h-4 text-[#D4AF37]" />
          </div>

          {/* Android App Main Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 pb-16">
            {children}
          </div>

          {/* Android Bottom Gesture Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400 dark:bg-gray-600 rounded-full z-50" />
        </div>
      </div>
    </div>
  );
};
