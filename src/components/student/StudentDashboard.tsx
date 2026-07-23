import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  Subject,
  AttendanceLog,
  MarkEntry,
  TimetableDay,
  Assignment,
  StudyMaterial,
  Announcement,
  CalendarEvent,
  LeaveApplication,
  PlacementDrive,
  LibraryBook,
} from "../../types";
import {
  CheckSquare,
  FileSpreadsheet,
  Clock,
  BookOpen,
  Calendar,
  Bell,
  Calculator,
  Send,
  Briefcase,
  Library,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Award,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PollsWidget } from "../common/PollsWidget";

interface StudentDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { userProfile, setIsAvatarModalOpen } = useAuth();

  // Firestore Realtime Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [marksLogs, setMarksLogs] = useState<MarkEntry[]>([]);
  const [timetables, setTimetables] = useState<TimetableDay[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [placements, setPlacements] = useState<PlacementDrive[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);

  // Selected Timetable Day Filter
  const [selectedDay, setSelectedDay] = useState<
    "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"
  >("Monday");

  // Leave Form State
  const [leaveReason, setLeaveReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // VTU Calculator State
  const [vtuCalcTab, setVtuCalcTab] = useState<"sgpa" | "cgpa">("sgpa");
  const [vtuScheme, setVtuScheme] = useState("2021 Scheme");
  const [calcSemester, setCalcSemester] = useState("5th");

  const [sgpaSubjects, setSgpaSubjects] = useState([
    { id: "1", code: "21CS51", name: "Automata Theory and Computability", credits: 4, gradePoint: 9 },
    { id: "2", code: "21CS52", name: "Computer Networks & Security", credits: 4, gradePoint: 10 },
    { id: "3", code: "21CS53", name: "Database Management Systems", credits: 3, gradePoint: 8 },
    { id: "4", code: "21CS54", name: "Web Application Development", credits: 3, gradePoint: 9 },
    { id: "5", code: "21CSL57", name: "DBMS Laboratory with Mini Project", credits: 1.5, gradePoint: 10 },
    { id: "6", code: "21CSL58", name: "Networks Laboratory", credits: 1.5, gradePoint: 9 },
  ]);

  // Multi-Semester CGPA Calculator State (8 Semesters)
  const [semestersData, setSemestersData] = useState([
    { sem: "1st Sem", sgpa: 8.5, credits: 20, active: true },
    { sem: "2nd Sem", sgpa: 8.8, credits: 20, active: true },
    { sem: "3rd Sem", sgpa: 8.4, credits: 24, active: true },
    { sem: "4th Sem", sgpa: 8.7, credits: 24, active: true },
    { sem: "5th Sem", sgpa: 9.1, credits: 22, active: true },
    { sem: "6th Sem", sgpa: 0, credits: 22, active: false },
    { sem: "7th Sem", sgpa: 0, credits: 20, active: false },
    { sem: "8th Sem", sgpa: 0, credits: 16, active: false },
  ]);

  // Load Realtime Data
  useEffect(() => {
    const unsubSub = onSnapshot(collection(db, "subjects"), (snap) => {
      const list: Subject[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Subject));
      setSubjects(list);
    });

    const unsubAtt = onSnapshot(collection(db, "attendance"), (snap) => {
      const list: AttendanceLog[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as AttendanceLog));
      setAttendanceLogs(list);
    });

    const unsubMarks = onSnapshot(collection(db, "marks"), (snap) => {
      const list: MarkEntry[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as MarkEntry));
      setMarksLogs(list);
    });

    const unsubTT = onSnapshot(collection(db, "timetable"), (snap) => {
      const list: TimetableDay[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as TimetableDay));
      setTimetables(list);
    });

    const unsubAssign = onSnapshot(collection(db, "assignments"), (snap) => {
      const list: Assignment[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Assignment));
      setAssignments(list);
    });

    const unsubMat = onSnapshot(collection(db, "studyMaterials"), (snap) => {
      const list: StudyMaterial[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as StudyMaterial));
      setMaterials(list);
    });

    const unsubAnn = onSnapshot(collection(db, "announcements"), (snap) => {
      const list: Announcement[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Announcement));
      setAnnouncements(list);
    });

    const unsubCal = onSnapshot(collection(db, "academicCalendar"), (snap) => {
      const list: CalendarEvent[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as CalendarEvent));
      setCalendarEvents(list);
    });

    const unsubLeave = onSnapshot(collection(db, "leaveApplications"), (snap) => {
      const list: LeaveApplication[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as LeaveApplication));
      setLeaves(list);
    });

    const unsubPlace = onSnapshot(collection(db, "placementDrives"), (snap) => {
      const list: PlacementDrive[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as PlacementDrive));
      setPlacements(list);
    });

    const unsubBooks = onSnapshot(collection(db, "libraryBooks"), (snap) => {
      const list: LibraryBook[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as LibraryBook));
      setBooks(list);
    });

    return () => {
      unsubSub();
      unsubAtt();
      unsubMarks();
      unsubTT();
      unsubAssign();
      unsubMat();
      unsubAnn();
      unsubCal();
      unsubLeave();
      unsubPlace();
      unsubBooks();
    };
  }, []);

  const studentUsn = userProfile?.usn || "4AL21CS001";
  const studentBranch = userProfile?.branch || "CSE";
  const studentSem = userProfile?.semester || "5th";
  const studentSec = userProfile?.section || "A";

  // Compute student-specific Attendance %
  const calculateAttendance = () => {
    let totalHeld = 0;
    let totalAttended = 0;
    const subjectBreakdown: { [code: string]: { name: string; held: number; present: number } } = {};

    attendanceLogs.forEach((log) => {
      const myRecord = log.records?.find((r) => r.usn === studentUsn || r.studentId === userProfile?.uid);
      if (myRecord) {
        totalHeld += 1;
        if (myRecord.status === "present") totalAttended += 1;

        if (!subjectBreakdown[log.subjectCode]) {
          subjectBreakdown[log.subjectCode] = { name: log.subjectName, held: 0, present: 0 };
        }
        subjectBreakdown[log.subjectCode].held += 1;
        if (myRecord.status === "present") {
          subjectBreakdown[log.subjectCode].present += 1;
        }
      }
    });

    const overallPct = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 88;
    return { overallPct, totalHeld, totalAttended, subjectBreakdown };
  };

  const attSummary = calculateAttendance();

  // Student Marks
  const myMarks = marksLogs.filter((m) => m.usn === studentUsn || m.studentId === userProfile?.uid);

  // Marks Chart Data
  const chartData = myMarks.map((m) => ({
    subject: m.subjectCode,
    marks: m.obtainedMarks,
    max: m.maxMarks,
  }));

  if (chartData.length === 0) {
    chartData.push(
      { subject: "21CS51", marks: 44, max: 50 },
      { subject: "21CS52", marks: 46, max: 50 },
      { subject: "21CS53", marks: 42, max: 50 },
      { subject: "21CS54", marks: 48, max: 50 }
    );
  }

  // Live Timetable Day for current student class
  const activeTtObj = timetables.find(
    (t) =>
      t.branch === studentBranch &&
      t.semester === studentSem &&
      t.section === studentSec &&
      t.day === selectedDay
  ) || {
    day: selectedDay,
    periods: [
      { periodNumber: 1, time: "09:00 AM - 10:00 AM", subjectCode: "21CS51", subjectName: "Automata Theory", facultyName: "Dr. Suresh Kumar N", roomNo: "LH-101" },
      { periodNumber: 2, time: "10:00 AM - 11:00 AM", subjectCode: "21CS52", subjectName: "Computer Networks", facultyName: "Dr. Suresh Kumar N", roomNo: "LH-101" },
      { periodNumber: 3, time: "11:15 AM - 12:15 PM", subjectCode: "21CS53", subjectName: "DBMS", facultyName: "Prof. Anitha B", roomNo: "LH-101" },
      { periodNumber: 4, time: "12:15 PM - 01:15 PM", subjectCode: "21CS54", subjectName: "Web Development", facultyName: "Dr. Suresh Kumar N", roomNo: "LH-101" },
      { periodNumber: 5, time: "02:00 PM - 04:00 PM", subjectCode: "21CSL57", subjectName: "DBMS Lab", facultyName: "Prof. Anitha B", roomNo: "Lab-3" },
    ],
  };

  // VTU SGPA Math
  const sgpaWeightedPoints = sgpaSubjects.reduce((acc, curr) => acc + curr.gradePoint * curr.credits, 0);
  const sgpaTotalCredits = sgpaSubjects.reduce((acc, curr) => acc + curr.credits, 0);
  const calculatedSGPA = sgpaTotalCredits > 0 ? (sgpaWeightedPoints / sgpaTotalCredits).toFixed(2) : "0.00";
  const sgpaPercentage = sgpaTotalCredits > 0 ? ((Number(calculatedSGPA) - 0.75) * 10).toFixed(1) : "0.0";

  // VTU Class Classification Helper
  const getVTUClass = (gpaVal: number) => {
    if (gpaVal >= 7.75) return { label: "First Class with Distinction", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950" };
    if (gpaVal >= 6.75) return { label: "First Class", color: "text-blue-600 bg-blue-50 dark:bg-blue-950" };
    if (gpaVal >= 5.75) return { label: "Second Class", color: "text-amber-600 bg-amber-50 dark:bg-amber-950" };
    if (gpaVal >= 5.0) return { label: "Pass Class", color: "text-gray-600 bg-gray-50 dark:bg-gray-800" };
    return { label: "Fail / Re-appear", color: "text-red-600 bg-red-50 dark:bg-red-950" };
  };

  const vtuSgpaClass = getVTUClass(Number(calculatedSGPA));

  // VTU Cumulative CGPA Math
  const activeSemesters = semestersData.filter((s) => s.active && s.sgpa > 0);
  const totalCgpaPoints = activeSemesters.reduce((acc, curr) => acc + curr.sgpa * curr.credits, 0);
  const totalCgpaCredits = activeSemesters.reduce((acc, curr) => acc + curr.credits, 0);
  const calculatedCGPA = totalCgpaCredits > 0 ? (totalCgpaPoints / totalCgpaCredits).toFixed(2) : "0.00";
  const cgpaPercentage = totalCgpaCredits > 0 ? ((Number(calculatedCGPA) - 0.75) * 10).toFixed(1) : "0.0";
  const vtuCgpaClass = getVTUClass(Number(calculatedCGPA));

  // Calculator Row Handlers
  const handleAddSubjectRow = () => {
    const newId = (sgpaSubjects.length + 1).toString();
    setSgpaSubjects([
      ...sgpaSubjects,
      { id: newId, code: `SUB0${newId}`, name: "Elective Subject", credits: 3, gradePoint: 9 },
    ]);
  };

  const handleDeleteSubjectRow = (id: string) => {
    setSgpaSubjects(sgpaSubjects.filter((s) => s.id !== id));
  };

  // Leave Submit
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason || !startDate || !endDate) return;

    await addDoc(collection(db, "leaveApplications"), {
      applicantId: userProfile?.uid || "demo_student_01",
      applicantName: userProfile?.name || "Ramesh Kumar M",
      applicantRole: "student",
      usnOrEmpId: studentUsn,
      branch: studentBranch,
      reason: leaveReason,
      startDate,
      endDate,
      status: "pending",
      appliedAt: new Date().toISOString(),
    });

    setLeaveReason("");
    setStartDate("");
    setEndDate("");
    setLeaveSubmitted(true);
    setTimeout(() => setLeaveSubmitted(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Student Workstation Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002147] via-[#001736] to-[#002147] p-6 text-white shadow-2xl border border-[#D4AF37]/40 glow-box-blue">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="relative group shrink-0"
              title="Click to customize avatar photo"
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Student Avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover ring-4 ring-[#D4AF37] shadow-xl group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#002147] flex items-center justify-center font-black text-2xl shadow-xl ring-4 ring-[#D4AF37]/50 group-hover:scale-105 transition-transform">
                  {userProfile?.name?.charAt(0) || "S"}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#002147] p-1.5 rounded-full text-[10px] font-black shadow-md">
                ✏️
              </span>
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-[#D4AF37] text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-[#D4AF37] animate-spin" style={{ animationDuration: "8s" }} />
                <span>Student Academic Hub • GEC Arsikere</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex flex-wrap items-center gap-2">
                {userProfile?.name || "Kavya S"}
                <span className="text-xs bg-[#D4AF37] text-[#002147] font-black px-2.5 py-1 rounded-full shadow-md">
                  VTU STUDENT
                </span>
                {userProfile?.moodBadge && (
                  <span className="text-xs bg-white/15 text-amber-200 border border-amber-300/40 font-extrabold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                    {userProfile.moodBadge}
                  </span>
                )}
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                USN: <span className="font-bold text-white font-mono">{studentUsn}</span> • Branch: <span className="font-bold text-white">{studentBranch}</span> ({studentSem} Sem - Sec {studentSec})
              </p>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs text-amber-300 hover:text-white font-bold transition-colors pt-1"
              >
                <span>✨ Equip Expressive Avatar</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-300 block uppercase font-bold tracking-wider">Attendance %</span>
              <span className={`text-2xl font-black ${attSummary.overallPct >= 75 ? "text-emerald-400" : "text-amber-400"}`}>
                {attSummary.overallPct}%
              </span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-300 block uppercase font-bold tracking-wider">VTU SGPA</span>
              <span className="text-2xl font-black text-[#D4AF37]">{calculatedSGPA}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Dashboard Overview */}
      {(activeTab === "dashboard" || activeTab === "attendance") && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#D4AF37]" /> Attendance Tracker
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  attSummary.overallPct >= 75
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                {attSummary.overallPct >= 75 ? "Eligible for VTU Exams" : "Attendance Shortage (<75%)"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(attSummary.subjectBreakdown).map((code) => {
                const sub = attSummary.subjectBreakdown[code];
                const pct = sub.held > 0 ? Math.round((sub.present / sub.held) * 100) : 85;
                return (
                  <div key={code} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-900 dark:text-white">{code} - {sub.name}</span>
                      <span className={pct >= 75 ? "text-emerald-600" : "text-red-600"}>{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${pct >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">Attended {sub.present} of {sub.held} sessions</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. My Marks & Performance Chart */}
      {activeTab === "marks" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" /> Internal Assessment & VTU Subject Credits Portal
              </h3>
              <p className="text-[11px] text-gray-500">
                Credits allotted by faculty for each course under VTU Choice Based Credit System (CBCS).
              </p>
            </div>
            <span className="text-xs text-[#002147] dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              Semester VTU Evaluation
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="subject" stroke="#888888" fontSize={11} />
                <YAxis domain={[0, 50]} stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="marks" fill="#002147" radius={[6, 6, 0, 0]} name="Obtained Marks" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002147] text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Subject Code</th>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3">Exam Type</th>
                  <th className="p-3">Allotted Credits</th>
                  <th className="p-3">Obtained Marks</th>
                  <th className="p-3">VTU Grade</th>
                  <th className="p-3 text-right">Credit Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {myMarks.map((m) => {
                  const matchingSub = subjects.find((s) => s.id === m.subjectId || s.code === m.subjectCode);
                  const credits = matchingSub?.credits ?? 4;
                  const pct = m.maxMarks > 0 ? (m.obtainedMarks / m.maxMarks) * 100 : 0;
                  
                  let gradeLetter = "F";
                  let gradePts = 0;
                  if (pct >= 90) { gradeLetter = "O (Outstanding)"; gradePts = 10; }
                  else if (pct >= 80) { gradeLetter = "A+ (Excellent)"; gradePts = 9; }
                  else if (pct >= 70) { gradeLetter = "A (Very Good)"; gradePts = 8; }
                  else if (pct >= 60) { gradeLetter = "B+ (Good)"; gradePts = 7; }
                  else if (pct >= 50) { gradeLetter = "B (Above Avg)"; gradePts = 6; }
                  else if (pct >= 45) { gradeLetter = "C (Average)"; gradePts = 5; }
                  else if (pct >= 40) { gradeLetter = "P (Pass)"; gradePts = 4; }

                  const totalSubjectPts = credits * gradePts;

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="p-3 font-bold text-[#002147] dark:text-amber-400">{m.subjectCode}</td>
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">{m.subjectName}</td>
                      <td className="p-3 font-medium">{m.examType}</td>
                      <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{credits} Credits</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {m.obtainedMarks} / {m.maxMarks}
                      </td>
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{gradeLetter}</td>
                      <td className="p-3 font-extrabold text-right text-gray-900 dark:text-white">
                        {totalSubjectPts} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Class Timetable */}
      {activeTab === "timetable" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" /> Class Timetable
            </h3>
            <span className="text-xs text-gray-500">{studentBranch} • {studentSem} Sem • Sec {studentSec}</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-700">
            {(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDay === day
                    ? "bg-[#002147] text-[#D4AF37] shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {activeTtObj.periods.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#002147] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                    P{p.periodNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{p.subjectCode} - {p.subjectName}</h4>
                    <p className="text-[11px] text-gray-500">{p.facultyName} • Room: {p.roomNo}</p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#002147] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                  {p.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Assignments & Study Materials */}
      {activeTab === "assignments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Active Assignments
            </h3>
            <div className="space-y-3">
              {assignments.map((ass) => (
                <div key={ass.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#002147] dark:text-amber-400">{ass.subjectCode}</span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">
                      Due: {ass.dueDate}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{ass.title}</h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">{ass.description}</p>
                  {ass.attachmentUrl && (
                    <a
                      href={ass.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-[#002147] dark:text-amber-400 font-bold hover:underline mt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Assignment Document / Drive Link</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-[#D4AF37]" /> Study Materials & Question Papers
            </h3>
            <div className="space-y-3">
              {materials.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      {m.category}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-1">{m.title}</h4>
                    <p className="text-[10px] text-gray-500">Shared by {m.uploadedBy}</p>
                  </div>

                  <a
                    href={m.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-[#002147] text-[#D4AF37] hover:bg-[#001530] transition-colors shadow"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. VTU SGPA & CGPA Calculator */}
      {activeTab === "cgpa" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#D4AF37]" /> Official VTU SGPA & CGPA Calculator
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Visvesvaraya Technological University (VTU) Grading System Formula & Class Designation
              </p>
            </div>

            {/* Switch Tabs: SGPA vs CGPA */}
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setVtuCalcTab("sgpa")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  vtuCalcTab === "sgpa"
                    ? "bg-[#002147] text-[#D4AF37] shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                Semester SGPA Calculator
              </button>
              <button
                onClick={() => setVtuCalcTab("cgpa")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  vtuCalcTab === "cgpa"
                    ? "bg-[#002147] text-[#D4AF37] shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                Overall CGPA Calculator (Sem 1-8)
              </button>
            </div>
          </div>

          {/* TAB 1: SGPA CALCULATOR */}
          {vtuCalcTab === "sgpa" && (
            <div className="space-y-5">
              {/* Scheme & Sem Selectors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">VTU Scheme</label>
                  <select
                    value={vtuScheme}
                    onChange={(e) => setVtuScheme(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 font-bold text-gray-900 dark:text-white"
                  >
                    <option value="2022 Scheme">2022 Scheme (Choice Based Credit System)</option>
                    <option value="2021 Scheme">2021 Scheme (CBCS System)</option>
                    <option value="2018 Scheme">2018 Scheme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Semester</label>
                  <select
                    value={calcSemester}
                    onChange={(e) => setCalcSemester(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 font-bold text-gray-900 dark:text-white"
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="3rd">3rd Semester</option>
                    <option value="4th">4th Semester</option>
                    <option value="5th">5th Semester</option>
                    <option value="6th">6th Semester</option>
                    <option value="7th">7th Semester</option>
                    <option value="8th">8th Semester</option>
                  </select>
                </div>

                {/* Live SGPA Result Display */}
                <div className="col-span-2 bg-[#002147] text-white p-3 rounded-xl border border-[#D4AF37]/40 flex items-center justify-around">
                  <div>
                    <span className="text-[10px] text-gray-300 uppercase block">Semester SGPA</span>
                    <span className="text-2xl font-extrabold text-[#D4AF37]">{calculatedSGPA}</span>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div>
                    <span className="text-[10px] text-gray-300 uppercase block">VTU Percentage</span>
                    <span className="text-2xl font-extrabold text-white">{sgpaPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* VTU Grade Award Banner */}
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${vtuSgpaClass.color}`}>
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4" /> VTU Class Award: {vtuSgpaClass.label}
                </span>
                <span className="font-mono text-[11px]">Formula: (SGPA - 0.75) × 10</span>
              </div>

              {/* Subject Rows Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#002147] text-white text-[11px] uppercase">
                    <tr>
                      <th className="p-3">Subject Code & Name</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3">VTU Grade Select</th>
                      <th className="p-3 text-right">Points</th>
                      <th className="p-3 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sgpaSubjects.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="p-3">
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => {
                              const updated = [...sgpaSubjects];
                              updated[idx].name = e.target.value;
                              setSgpaSubjects(updated);
                            }}
                            className="w-full p-1 text-xs rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-semibold text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={sub.credits}
                            onChange={(e) => {
                              const updated = [...sgpaSubjects];
                              updated[idx].credits = Number(e.target.value);
                              setSgpaSubjects(updated);
                            }}
                            className="p-1 text-xs rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-bold text-gray-900 dark:text-white"
                          >
                            <option value={1}>1.0 Credit</option>
                            <option value={1.5}>1.5 Credits</option>
                            <option value={2}>2.0 Credits</option>
                            <option value={3}>3.0 Credits</option>
                            <option value={4}>4.0 Credits</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={sub.gradePoint}
                            onChange={(e) => {
                              const updated = [...sgpaSubjects];
                              updated[idx].gradePoint = Number(e.target.value);
                              setSgpaSubjects(updated);
                            }}
                            className="p-1 text-xs rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-bold text-gray-900 dark:text-white"
                          >
                            <option value={10}>O / S Grade (10 Points • Outstanding 90-100%)</option>
                            <option value={9}>A+ Grade (9 Points • Excellent 80-89%)</option>
                            <option value={8}>A Grade (8 Points • Very Good 70-79%)</option>
                            <option value={7}>B+ Grade (7 Points • Good 60-69%)</option>
                            <option value={6}>B Grade (6 Points • Above Avg 55-59%)</option>
                            <option value={5}>C Grade (5 Points • Average 50-54%)</option>
                            <option value={4}>P Grade (4 Points • Pass 40-49%)</option>
                            <option value={0}>F Grade (0 Points • Fail &lt;40%)</option>
                          </select>
                        </td>
                        <td className="p-3 font-bold text-right text-[#002147] dark:text-amber-400">
                          {sub.gradePoint * sub.credits}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteSubjectRow(sub.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleAddSubjectRow}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Subject Row
              </button>
            </div>
          )}

          {/* TAB 2: OVERALL CUMULATIVE CGPA CALCULATOR */}
          {vtuCalcTab === "cgpa" && (
            <div className="space-y-5">
              {/* Overall CGPA Result Banner */}
              <div className="bg-[#002147] text-white p-5 rounded-2xl border border-[#D4AF37]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-amber-300 font-bold block uppercase">VTU Cumulative CGPA</span>
                  <span className="text-3xl font-extrabold text-[#D4AF37]">{calculatedCGPA}</span>
                  <p className="text-xs text-gray-300 mt-1">Total Credits Counted: {totalCgpaCredits}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-amber-300 font-bold block uppercase">Equivalent Percentage</span>
                  <span className="text-3xl font-extrabold text-white">{cgpaPercentage}%</span>
                  <p className="text-xs text-emerald-400 font-bold mt-1">{vtuCgpaClass.label}</p>
                </div>
              </div>

              {/* Semesters 1 to 8 Input Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#002147] text-white text-[11px] uppercase">
                    <tr>
                      <th className="p-3">Semester</th>
                      <th className="p-3">Include in CGPA</th>
                      <th className="p-3">Semester SGPA</th>
                      <th className="p-3">Earned Credits</th>
                      <th className="p-3 text-right">Weighted Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {semestersData.map((s, idx) => (
                      <tr key={s.sem} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{s.sem}</td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={s.active}
                            onChange={(e) => {
                              const updated = [...semestersData];
                              updated[idx].active = e.target.checked;
                              setSemestersData(updated);
                            }}
                            className="w-4 h-4 rounded text-[#002147]"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            max="10"
                            disabled={!s.active}
                            value={s.sgpa || ""}
                            onChange={(e) => {
                              const updated = [...semestersData];
                              updated[idx].sgpa = Number(e.target.value);
                              setSemestersData(updated);
                            }}
                            className="w-24 p-1.5 text-xs rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-900 font-bold text-gray-900 dark:text-white disabled:opacity-50"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            disabled={!s.active}
                            value={s.credits}
                            onChange={(e) => {
                              const updated = [...semestersData];
                              updated[idx].credits = Number(e.target.value);
                              setSemestersData(updated);
                            }}
                            className="w-20 p-1.5 text-xs rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-900 font-bold text-gray-900 dark:text-white disabled:opacity-50"
                          />
                        </td>
                        <td className="p-3 font-bold text-right text-[#002147] dark:text-amber-400">
                          {s.active ? (s.sgpa * s.credits).toFixed(1) : "0.0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Leave Application */}
      {activeTab === "leave" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-5">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-[#D4AF37]" /> Submit Leave Application
          </h3>

          {leaveSubmitted && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Leave application submitted to HOD & Class Counselor!
            </div>
          )}

          <form onSubmit={handleApplyLeave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Reason for Leave</label>
              <textarea
                placeholder="Medical leave, family event, VTU sports tournament..."
                rows={3}
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow"
            >
              Submit Leave Request
            </button>
          </form>
        </div>
      )}

      {/* 7. Placement Drives & Library */}
      {activeTab === "placement" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#D4AF37]" /> Training & Placement Cell Recruitment Drives
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placements.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#002147] dark:text-amber-400">{p.companyName}</h4>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {p.packageLPA} LPA
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{p.role}</p>
                <p className="text-[11px] text-gray-500">Min CGPA: {p.minCGPA} • Eligible: {p.eligibleBranches.join(", ")}</p>
                <button
                  onClick={() => alert(`Registered for ${p.companyName} campus drive!`)}
                  className="w-full py-1.5 rounded-lg bg-[#002147] text-[#D4AF37] font-bold text-xs shadow mt-2"
                >
                  Register for Drive
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 8. Campus Announcements & Opinion Polls */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D4AF37]" /> Official College Circulars & Notices
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                Real-time Sync
              </span>
            </h3>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ann.priority === "High"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {ann.priority} Priority
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{ann.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{ann.content}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Issued by: {ann.postedBy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Campus Opinion Polls Widget */}
          <PollsWidget allowCreate={false} />
        </div>
      )}
    </div>
  );
};
