import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  X,
  Upload,
  Sparkles,
  Check,
  User,
  Image as ImageIcon,
  Camera,
  Link as LinkIcon,
  Smile,
  Zap,
  Plus,
  Tag,
} from "lucide-react";

const GALLERY_AVATARS = [
  {
    id: "av1",
    name: "Tech Scholar",
    category: "Vector Avatar",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechScholar",
  },
  {
    id: "av2",
    name: "Code Lead",
    category: "Vector Avatar",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeEngineer",
  },
  {
    id: "av3",
    name: "Cyber Creator",
    category: "Minimalist Art",
    url: "https://api.dicebear.com/7.x/micah/svg?seed=CyberCreator",
  },
  {
    id: "av4",
    name: "VTU Academic Lead",
    category: "Persona Graphic",
    url: "https://api.dicebear.com/7.x/personas/svg?seed=AcademicLead",
  },
  {
    id: "av5",
    name: "Design Strategist",
    category: "Vector Illustration",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=DesignStrategist",
  },
  {
    id: "av6",
    name: "Robotics Bot",
    category: "Tech & Cyber",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=RoboticsSpecialist",
  },
  {
    id: "av7",
    name: "Campus Mentor",
    category: "Sketch Style",
    url: "https://api.dicebear.com/7.x/notionists/svg?seed=CampusMentor",
  },
  {
    id: "av8",
    name: "AI Lab Mascot",
    category: "Tech & Cyber",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=AILabBot",
  },
  {
    id: "av9",
    name: "Creative Coder",
    category: "Vector Avatar",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CreativeCoder",
  },
  {
    id: "av10",
    name: "Research Scholar",
    category: "Minimalist Art",
    url: "https://api.dicebear.com/7.x/micah/svg?seed=ResearchScholar",
  },
  {
    id: "av11",
    name: "GEC Geometric Crest",
    category: "Abstract Shape",
    url: "https://api.dicebear.com/7.x/shapes/svg?seed=GECArsikere",
  },
  {
    id: "av12",
    name: "Smart Scholar",
    category: "Vector Illustration",
    url: "https://api.dicebear.com/7.x/lorelei/svg?seed=SmartVector",
  },
];

const DEFAULT_BADGES = [
  "⚡ VTU Ranker Grind",
  "💻 Coding & Coffee",
  "📚 Exam Sprint Mode",
  "🔬 Lab Experiment Lead",
  "🚀 Project Hackathon",
  "☕ Faculty Mentor",
];

const QUICK_EMOJIS = ["🔥", "💻", "⚡", "🚀", "🎯", "☕", "📚", "🏆", "🧪", "✨"];

export const AvatarModal: React.FC = () => {
  const { userProfile, updateAvatarUrl, isAvatarModalOpen, setIsAvatarModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState<"gallery" | "upload">("gallery");
  const [selectedUrl, setSelectedUrl] = useState<string>(
    userProfile?.avatarUrl || GALLERY_AVATARS[0].url
  );
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  
  const [badgesList, setBadgesList] = useState<string[]>(() => {
    const initial = [...DEFAULT_BADGES];
    if (userProfile?.moodBadge && !initial.includes(userProfile.moodBadge)) {
      initial.unshift(userProfile.moodBadge);
    }
    return initial;
  });

  const [selectedBadge, setSelectedBadge] = useState<string>(
    userProfile?.moodBadge || DEFAULT_BADGES[0]
  );
  
  const [customBadgeInput, setCustomBadgeInput] = useState<string>("");
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🔥");
  const [showAddBadgeInput, setShowAddBadgeInput] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (userProfile?.avatarUrl) {
      setSelectedUrl(userProfile.avatarUrl);
    }
    if (userProfile?.moodBadge) {
      setSelectedBadge(userProfile.moodBadge);
      if (!badgesList.includes(userProfile.moodBadge)) {
        setBadgesList((prev) => [userProfile.moodBadge!, ...prev]);
      }
    }
  }, [userProfile]);

  if (!isAvatarModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Please upload an image smaller than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setSelectedUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setSelectedUrl(customUrlInput.trim());
    }
  };

  const handleAddCustomBadge = () => {
    if (!customBadgeInput.trim()) return;
    const fullBadge = `${selectedEmoji} ${customBadgeInput.trim()}`;
    if (!badgesList.includes(fullBadge)) {
      setBadgesList((prev) => [fullBadge, ...prev]);
    }
    setSelectedBadge(fullBadge);
    setCustomBadgeInput("");
    setShowAddBadgeInput(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAvatarUrl(selectedUrl, selectedBadge);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsAvatarModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#002147] via-[#001736] to-[#002147] text-white p-6 relative">
          <button
            onClick={() => setIsAvatarModalOpen(false)}
            className="absolute top-5 right-5 p-2 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-[#D4AF37] text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Personal Identity & Vibe</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Customize Campus Avatar
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            Select an expressive portrait or upload your own avatar for GEC Arsikere ERP.
          </p>

          {/* Current Live Preview Card */}
          <div className="mt-4 flex items-center space-x-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="relative">
              <img
                src={selectedUrl}
                alt="Selected Avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#D4AF37] shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback";
                }}
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-[#D4AF37] text-[#002147] rounded-full text-[10px] font-black shadow-md">
                <Camera className="w-3 h-3" />
              </span>
            </div>
            <div>
              <p className="text-sm font-black text-white">
                {userProfile?.name || "Student / Faculty"}
              </p>
              <p className="text-[11px] text-amber-300 font-semibold capitalize">
                {userProfile?.role} • {userProfile?.usn || userProfile?.employeeId || "Staff"}
              </p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#002147] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm">
                {selectedBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === "gallery"
                ? "border-[#002147] text-[#002147] dark:text-amber-400 dark:border-amber-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Curated Avatar Gallery</span>
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === "upload"
                ? "border-[#002147] text-[#002147] dark:text-amber-400 dark:border-amber-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo / URL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "gallery" && (
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-[#D4AF37]" /> Click any expressive avatar to equip:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {GALLERY_AVATARS.map((item) => {
                  const isSelected = selectedUrl === item.url;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedUrl(item.url)}
                      className={`relative group p-2 rounded-2xl border transition-all text-center flex flex-col items-center ${
                        isSelected
                          ? "border-[#002147] bg-amber-50/80 dark:bg-amber-950/30 ring-2 ring-[#002147] dark:ring-amber-400 shadow-md scale-105"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 mt-1.5 truncate w-full">
                        {item.name}
                      </span>
                      <span className="text-[9px] text-gray-400">{item.category}</span>

                      {isSelected && (
                        <span className="absolute top-1 right-1 bg-[#002147] text-amber-400 p-0.5 rounded-full shadow-sm">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-5">
              {/* File Drag & Drop Box */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-6 text-center hover:border-[#002147] dark:hover:border-amber-400 transition-colors bg-gray-50/50 dark:bg-gray-900/50">
                <Upload className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Drop your profile photo here, or browse
                </p>
                <p className="text-[11px] text-gray-400 mt-1 mb-4">
                  Supports PNG, JPG, WEBP up to 3MB
                </p>

                <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs cursor-pointer shadow-md hover:bg-[#001736] transition-all">
                  <Camera className="w-4 h-4" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Direct URL Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#D4AF37]" /> Or Paste Image Web Link (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/my-photo.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002147]"
                  />
                  <button
                    onClick={handleApplyCustomUrl}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Expressive Mood Badge Selector */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Expressive Campus Mood Badge:
              </p>
              <button
                type="button"
                onClick={() => setShowAddBadgeInput(!showAddBadgeInput)}
                className="text-xs font-extrabold text-[#002147] dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddBadgeInput ? "Close Custom" : "Create Own Badge"}</span>
              </button>
            </div>

            {/* Custom Badge Creator Input Form */}
            {showAddBadgeInput && (
              <div className="p-3 bg-amber-50/70 dark:bg-gray-800/80 rounded-2xl border border-amber-200 dark:border-gray-700 space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#D4AF37]" /> Create Custom Vibe Badge:
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] font-bold text-gray-500 shrink-0">Emoji:</span>
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`px-2 py-1 rounded-lg text-xs transition-transform ${
                        selectedEmoji === emoji
                          ? "bg-[#002147] text-white scale-110 shadow-sm"
                          : "bg-white dark:bg-gray-700 hover:scale-105"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-2.5">
                    <span className="text-sm mr-1.5">{selectedEmoji}</span>
                    <input
                      type="text"
                      placeholder="e.g. 10 CGPA Loading or All-Night Hackathon"
                      value={customBadgeInput}
                      onChange={(e) => setCustomBadgeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomBadge()}
                      className="w-full py-2 text-xs bg-transparent text-gray-900 dark:text-white focus:outline-none font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomBadge}
                    className="px-4 py-2 bg-[#002147] text-[#D4AF37] font-black text-xs rounded-xl shadow-md hover:bg-[#001736] transition-all shrink-0"
                  >
                    Add & Select
                  </button>
                </div>
              </div>
            )}

            {/* Badges List */}
            <div className="flex flex-wrap gap-2">
              {badgesList.map((badge) => (
                <button
                  key={badge}
                  onClick={() => setSelectedBadge(badge)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedBadge === badge
                      ? "bg-[#002147] text-[#D4AF37] border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => setIsAvatarModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#002147] text-[#D4AF37] font-black text-xs shadow-lg hover:bg-[#001736] transition-all flex items-center gap-2"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Avatar Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{isSaving ? "Saving..." : "Equip Avatar"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
