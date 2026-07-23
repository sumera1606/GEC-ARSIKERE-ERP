import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { Bot, Send, Sparkles, User, RefreshCw, BookOpen, Clock, Calendar, Briefcase, CheckSquare } from "lucide-react";
import { ChatMessage } from "../../types";

export const AICampusAssistant: React.FC = () => {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "ai",
      text: `Hello ${userProfile?.name || "Student"}! I am your AI Campus Assistant for **Government Engineering College, Arsikere**. \n\nI have access to your real-time attendance, marks, class timetables, assignments, and campus notices. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextData, setContextData] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-fetch context data from Firestore for context injection
  useEffect(() => {
    async function loadUserContext() {
      if (!userProfile) return;
      try {
        const ctx: any = { userProfile };

        // 1. Attendance summary
        if (userProfile.usn || userProfile.uid) {
          const attSnap = await getDocs(collection(db, "attendance"));
          const logs: any[] = [];
          attSnap.forEach((doc) => {
            const data = doc.data();
            const record = data.records?.find((r: any) => r.usn === userProfile.usn || r.studentId === userProfile.uid);
            if (record) {
              logs.push({ subject: data.subjectName, code: data.subjectCode, date: data.date, status: record.status });
            }
          });
          ctx.attendanceLogs = logs;
        }

        // 2. Marks
        if (userProfile.usn) {
          const marksSnap = await getDocs(query(collection(db, "marks"), where("usn", "==", userProfile.usn)));
          const marksList: any[] = [];
          marksSnap.forEach((doc) => marksList.push(doc.data()));
          ctx.marks = marksList;
        }

        // 3. Timetable
        if (userProfile.branch && userProfile.semester) {
          const ttSnap = await getDocs(
            query(
              collection(db, "timetable"),
              where("branch", "==", userProfile.branch),
              where("semester", "==", userProfile.semester)
            )
          );
          const ttList: any[] = [];
          ttSnap.forEach((doc) => ttList.push(doc.data()));
          ctx.timetable = ttList;
        }

        // 4. Assignments
        const assignSnap = await getDocs(collection(db, "assignments"));
        const assignList: any[] = [];
        assignSnap.forEach((doc) => assignList.push(doc.data()));
        ctx.assignments = assignList.slice(0, 5);

        // 5. Announcements
        const annSnap = await getDocs(collection(db, "announcements"));
        const annList: any[] = [];
        annSnap.forEach((doc) => annList.push(doc.data()));
        ctx.announcements = annList.slice(0, 5);

        setContextData(ctx);
      } catch (err) {
        console.error("Error loading AI context:", err);
      }
    }
    loadUserContext();
  }, [userProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          contextData,
          userName: userProfile?.name || "Student",
          userRole: userProfile?.role || "student",
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || "I am unable to process your request at this moment.";

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          text: "Apologies, I encountered a connection issue reaching the AI Campus server. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: "My Attendance Summary", prompt: "What is my current subject-wise attendance percentage?", icon: CheckSquare },
    { label: "Internal Assessment Marks", prompt: "Summarize my latest Internal Assessment IA-1 marks", icon: BookOpen },
    { label: "Today's Timetable", prompt: "Show my timetable schedule for today", icon: Clock },
    { label: "Pending Assignments", prompt: "What assignments are currently pending and when are they due?", icon: Calendar },
    { label: "Placement Drives", prompt: "Which company placement drives are scheduled this month?", icon: Briefcase },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[650px] transition-colors duration-200">
      {/* AI Assistant Header */}
      <div className="bg-[#002147] text-white p-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 text-[#002147] font-bold shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              GEC Arsikere AI Assistant <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            </h3>
            <p className="text-[11px] text-amber-200">Powered by Gemini 3.6 Flash • Integrated with Firestore</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: "msg_init",
                sender: "ai",
                text: `Conversation reset. How else can I assist you with your GEC Arsikere ERP records?`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ])
          }
          className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Reset Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Chips */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        {quickPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              disabled={loading}
              className="flex items-center space-x-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-[#002147] hover:text-[#D4AF37] border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm transition-all flex-shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-gray-900/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${
                msg.sender === "user"
                  ? "bg-[#002147] text-white"
                  : "bg-[#D4AF37] text-[#002147]"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-[#002147] text-white rounded-tr-none"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <span
                className={`block text-[9px] mt-1 text-right ${
                  msg.sender === "user" ? "text-gray-300" : "text-gray-400"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
            <Bot className="w-4 h-4 text-[#D4AF37] animate-spin" />
            <span>Consulting GEC Arsikere records...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AI Campus Assistant anything (e.g., 'What is my attendance in Automata?')..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002147]"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputPrompt.trim()}
          className="p-2.5 rounded-xl bg-[#002147] hover:bg-[#001530] text-[#D4AF37] disabled:opacity-50 transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
