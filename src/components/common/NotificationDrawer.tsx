import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { Announcement } from "../../types";
import { X, Bell, Calendar, Sparkles, Megaphone, CheckCircle2 } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "announcements"), (snap) => {
      const list: Announcement[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(list);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col text-gray-900 dark:text-gray-100">
          {/* Drawer Header */}
          <div className="bg-[#002147] text-white p-4 flex items-center justify-between border-b border-[#D4AF37]/30">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-bold text-sm">GEC Arsikere Notices & Alerts</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feed List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-[#002147] text-[#D4AF37] px-2 py-0.5 rounded-full">
                    {ann.targetAudience || "All"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : "Today"}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{ann.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{ann.content}</p>
                <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span>Posted by {ann.postedBy || "College Admin"}</span>
                  {ann.priority === "High" && (
                    <span className="text-red-500 font-bold">Important Notice</span>
                  )}
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <div className="text-center p-8 text-gray-400 text-xs">
                No recent notices or notifications available.
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 text-center">
            Real-time Cloud Messaging Feed • GEC Arsikere
          </div>
        </div>
      </div>
    </div>
  );
};
