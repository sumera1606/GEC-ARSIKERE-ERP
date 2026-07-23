import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { clearAllSampleData, restoreDefaultSampleData } from "../../data/seedData";
import {
  UserProfile,
  Department,
  Subject,
  Announcement,
  CalendarEvent,
  PlacementDrive,
  LibraryBook,
  AttendanceLog,
  MarkEntry,
  TimetableDay,
  PeriodSlot,
} from "../../types";
import {
  Users,
  UserCheck,
  Building2,
  BookOpen,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  Bell,
  Briefcase,
  Library,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ShieldAlert,
  Save,
} from "lucide-react";
import { ExportModal } from "../common/ExportModal";
import { PollsWidget } from "../common/PollsWidget";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, setActiveTab }) => {
  const { approveStudent, rejectStudent } = useAuth();

  // Firestore Live State
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [placements, setPlacements] = useState<PlacementDrive[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [marksLogs, setMarksLogs] = useState<MarkEntry[]>([]);
  const [timetables, setTimetables] = useState<TimetableDay[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  // Timetable State
  const [ttBranch, setTtBranch] = useState("CSE");
  const [ttSem, setTtSem] = useState("5th");
  const [ttSec, setTtSec] = useState("A");
  const [ttDay, setTtDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday">("Monday");

  // New Timetable Slot Form State
  const [slotPeriodNum, setSlotPeriodNum] = useState<number>(1);
  const [slotTime, setSlotTime] = useState("09:00 AM - 10:00 AM");
  const [slotSubCode, setSlotSubCode] = useState("");
  const [slotSubName, setSlotSubName] = useState("");
  const [slotFaculty, setSlotFaculty] = useState("");
  const [slotRoom, setSlotRoom] = useState("LH-101");
  const [ttSavedMsg, setTtSavedMsg] = useState(false);

  // Modals & New Item Forms
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportTitle, setExportTitle] = useState("");
  const [exportData, setExportData] = useState<any[]>([]);
  const [exportCols, setExportCols] = useState<{ key: string; label: string }[]>([]);

  // Form states
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [showAddFacultyForm, setShowAddFacultyForm] = useState(false);
  const [facultySearchQuery, setFacultySearchQuery] = useState("");
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    employeeId: "",
    email: "",
    department: "Computer Science & Engineering",
    branch: "CSE",
    phone: "",
  });
  const [newStudent, setNewStudent] = useState({
    name: "",
    usn: "",
    email: "",
    branch: "CSE",
    semester: "5th",
    section: "A",
  });
  const [newNotice, setNewNotice] = useState({ title: "", content: "", target: "All", priority: "Normal" });
  const [newPlacement, setNewPlacement] = useState({ companyName: "", role: "", packageLPA: 6, minCGPA: 6.5, driveDate: "" });
  const [newBook, setNewBook] = useState({ title: "", author: "", isbn: "", category: "Computer Science", totalCopies: 10 });
  const [newSubject, setNewSubject] = useState({ code: "", name: "", branch: "CSE", semester: "5th", credits: 3 });
  const [newBranch, setNewBranch] = useState({ code: "", name: "", hodName: "" });

  // Subscribe to real-time Firestore collections
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((doc) => list.push(doc.data() as UserProfile));
      setAllUsers(list);
    });

    const unsubDepts = onSnapshot(collection(db, "departments"), (snap) => {
      const list: Department[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Department));
      setDepartments(list);
    });

    const unsubSubjects = onSnapshot(collection(db, "subjects"), (snap) => {
      const list: Subject[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Subject));
      setSubjects(list);
    });

    const unsubAnn = onSnapshot(collection(db, "announcements"), (snap) => {
      const list: Announcement[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(list);
    });

    const unsubPlace = onSnapshot(collection(db, "placementDrives"), (snap) => {
      const list: PlacementDrive[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as PlacementDrive));
      setPlacements(list);
    });

    const unsubBooks = onSnapshot(collection(db, "libraryBooks"), (snap) => {
      const list: LibraryBook[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as LibraryBook));
      setBooks(list);
    });

    const unsubAtt = onSnapshot(collection(db, "attendance"), (snap) => {
      const list: AttendanceLog[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as AttendanceLog));
      setAttendanceLogs(list);
    });

    const unsubMarks = onSnapshot(collection(db, "marks"), (snap) => {
      const list: MarkEntry[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as MarkEntry));
      setMarksLogs(list);
    });

    const unsubTT = onSnapshot(collection(db, "timetable"), (snap) => {
      const list: TimetableDay[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as TimetableDay));
      setTimetables(list);
    });

    return () => {
      unsubUsers();
      unsubDepts();
      unsubSubjects();
      unsubAnn();
      unsubPlace();
      unsubBooks();
      unsubAtt();
      unsubMarks();
      unsubTT();
    };
  }, []);

  // Filtered student lists
  const pendingStudents = allUsers.filter(
    (u) => u.role === "student" && u.status === "pending"
  );
  const approvedStudents = allUsers.filter(
    (u) => u.role === "student" && u.status === "approved"
  );
  const facultyList = allUsers.filter((u) => u.role === "faculty");

  const filteredStudents = approvedStudents.filter(
    (s) =>
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (branchFilter === "All" || s.branch === branchFilter)
  );

  // Active Timetable Document for selected class & day
  const activeTtDocId = `tt_${ttBranch.toLowerCase()}_${ttSem.toLowerCase()}_${ttSec.toLowerCase()}_${ttDay.toLowerCase()}`;
  const currentTimetableObj = timetables.find(
    (t) =>
      t.branch === ttBranch &&
      t.semester === ttSem &&
      t.section === ttSec &&
      t.day === ttDay
  );

  // Timetable Handlers
  const handleAddOrUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotSubCode || !slotSubName) {
      alert("Please enter subject code and subject name.");
      return;
    }

    const existingPeriods = currentTimetableObj?.periods ? [...currentTimetableObj.periods] : [];
    const newSlot: PeriodSlot = {
      periodNumber: Number(slotPeriodNum),
      time: slotTime,
      subjectCode: slotSubCode.toUpperCase(),
      subjectName: slotSubName,
      facultyName: slotFaculty || "Assigned Faculty",
      roomNo: slotRoom || "LH-101",
    };

    // Replace if period exists or add
    const updatedPeriods = existingPeriods.filter((p) => p.periodNumber !== Number(slotPeriodNum));
    updatedPeriods.push(newSlot);
    updatedPeriods.sort((a, b) => a.periodNumber - b.periodNumber);

    await setDoc(doc(db, "timetable", activeTtDocId), {
      id: activeTtDocId,
      branch: ttBranch,
      semester: ttSem,
      section: ttSec,
      day: ttDay,
      periods: updatedPeriods,
    });

    setTtSavedMsg(true);
    setTimeout(() => setTtSavedMsg(false), 2000);
    setSlotSubCode("");
    setSlotSubName("");
  };

  const handleDeleteSlot = async (periodNum: number) => {
    if (!currentTimetableObj) return;
    const updatedPeriods = currentTimetableObj.periods.filter((p) => p.periodNumber !== periodNum);
    await setDoc(doc(db, "timetable", activeTtDocId), {
      ...currentTimetableObj,
      periods: updatedPeriods,
    });
  };

  const handleClearDaySchedule = async () => {
    if (confirm(`Clear all timetable slots for ${ttBranch} - ${ttSem} Sem - Sec ${ttSec} on ${ttDay}?`)) {
      await deleteDoc(doc(db, "timetable", activeTtDocId));
    }
  };

  // Student Management Handlers
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.usn || !newStudent.email) {
      alert("Please fill in Student Name, USN, and Email.");
      return;
    }
    const newUid = `st_${newStudent.usn.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now()}`;
    await setDoc(doc(db, "users", newUid), {
      uid: newUid,
      name: newStudent.name,
      usn: newStudent.usn.toUpperCase(),
      email: newStudent.email,
      branch: newStudent.branch,
      semester: newStudent.semester,
      section: newStudent.section,
      role: "student",
      status: "approved",
      createdAt: new Date().toISOString(),
    });
    setNewStudent({ name: "", usn: "", email: "", branch: "CSE", semester: "5th", section: "A" });
    setShowAddStudentForm(false);
    alert(`Student ${newStudent.name} (${newStudent.usn.toUpperCase()}) registered & approved!`);
  };

  const handleDeleteStudent = async (uid: string, usn: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete student ${name} (${usn})?`)) {
      await deleteDoc(doc(db, "users", uid));
      alert(`Student ${name} removed from database.`);
    }
  };

  // Faculty Handlers
  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.employeeId || !newFaculty.email) {
      alert("Please fill in Faculty Name, Employee ID, and Email.");
      return;
    }
    const newUid = `fac_${newFaculty.employeeId.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now()}`;
    await setDoc(doc(db, "users", newUid), {
      uid: newUid,
      name: newFaculty.name,
      employeeId: newFaculty.employeeId.toUpperCase(),
      email: newFaculty.email,
      department: newFaculty.department,
      branch: newFaculty.branch,
      phone: newFaculty.phone || "+91 98450 00000",
      role: "faculty",
      status: "approved",
      createdAt: new Date().toISOString(),
    });
    setNewFaculty({
      name: "",
      employeeId: "",
      email: "",
      department: "Computer Science & Engineering",
      branch: "CSE",
      phone: "",
    });
    setShowAddFacultyForm(false);
    alert(`Faculty member ${newFaculty.name} (${newFaculty.employeeId.toUpperCase()}) added successfully!`);
  };

  const handleDeleteFaculty = async (uid: string, employeeId: string, name: string) => {
    if (confirm(`Are you sure you want to delete Faculty member ${name} (${employeeId || "Emp ID"})?`)) {
      await deleteDoc(doc(db, "users", uid));
      alert(`Faculty member ${name} removed from college directory.`);
    }
  };

  // System Data Reset Handler
  const handleClearAllSampleData = async () => {
    if (
      confirm(
        "⚠️ DANGER: ARE YOU SURE YOU WANT TO DELETE ALL SAMPLE DETAILS?\n\nThis will remove sample students, sample faculty, timetable slots, notices, attendance logs, marks, and library books so you can build a fresh college portal from scratch!\n\nYour Admin account will be preserved."
      )
    ) {
      const ok = await clearAllSampleData();
      if (ok) {
        alert("All sample details have been deleted! You can now enter your official college data.");
      } else {
        alert("Failed to clear sample data. Check console logs.");
      }
    }
  };

  const handleRestoreSampleData = async () => {
    if (confirm("Restore default sample data for demonstration?")) {
      await restoreDefaultSampleData();
      alert("Sample data restored successfully!");
    }
  };

  // Branch Handlers
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.code || !newBranch.name) return;
    const deptId = `dept_${newBranch.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    await setDoc(doc(db, "departments", deptId), {
      id: deptId,
      code: newBranch.code.toUpperCase(),
      name: newBranch.name,
      hodName: newBranch.hodName || "Department Head",
      totalFaculty: 8,
      totalStudents: 120,
    });
    setNewBranch({ code: "", name: "", hodName: "" });
    alert("New Branch / Department added successfully!");
  };

  const handleDeleteBranch = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to remove the ${code} department?`)) {
      await deleteDoc(doc(db, "departments", id));
    }
  };

  // Form Handlers
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    await addDoc(collection(db, "announcements"), {
      ...newNotice,
      targetAudience: newNotice.target,
      postedBy: "Principal Office",
      createdAt: new Date().toISOString(),
    });
    setNewNotice({ title: "", content: "", target: "All", priority: "Normal" });
    alert("Notice published to all students and faculty!");
  };

  const handleAddPlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlacement.companyName) return;
    await addDoc(collection(db, "placementDrives"), {
      ...newPlacement,
      eligibleBranches: ["CSE", "ECE", "ME", "CV", "AI&DS"],
      applicationDeadline: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
      status: "Active",
      description: `Campus recruitment drive for ${newPlacement.companyName}`,
      registeredStudentIds: [],
    });
    setNewPlacement({ companyName: "", role: "", packageLPA: 6, minCGPA: 6.5, driveDate: "" });
    alert("Placement recruitment drive announced!");
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title) return;
    await addDoc(collection(db, "libraryBooks"), {
      ...newBook,
      availableCopies: newBook.totalCopies,
      rackNo: `${newBook.category.substring(0, 2).toUpperCase()}-Rack-01`,
    });
    setNewBook({ title: "", author: "", isbn: "", category: "Computer Science", totalCopies: 10 });
    alert("Book added to college library catalogue!");
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.code || !newSubject.name) return;
    await addDoc(collection(db, "subjects"), {
      ...newSubject,
      facultyName: "Assigned Faculty",
    });
    setNewSubject({ code: "", name: "", branch: "CSE", semester: "5th", credits: 3 });
    alert("Subject added to academic curriculum!");
  };

  const triggerExport = (title: string, data: any[], cols: { key: string; label: string }[]) => {
    setExportTitle(title);
    setExportData(data);
    setExportCols(cols);
    setExportModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#002147] via-[#003366] to-[#1E3E62] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-[#D4AF37]/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#D4AF37] text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Administrative Control Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Government Engineering College, Arsikere
            </h2>
            <p className="text-xs text-gray-200 mt-1">
              Manage students, faculty, branches, timetables, academic reports, and campus operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleClearAllSampleData}
              className="px-3 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
              title="Wipe all demo sample data to start fresh for your college"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Sample Details</span>
            </button>

            <button
              onClick={() =>
                triggerExport(
                  "Student Directory Report",
                  approvedStudents,
                  [
                    { key: "usn", label: "USN" },
                    { key: "name", label: "Student Name" },
                    { key: "branch", label: "Branch" },
                    { key: "semester", label: "Semester" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                  ]
                )
              }
              className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#b8952b] text-[#002147] text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Approved Students</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{approvedStudents.length}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-[#D4AF37]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Faculty Members</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{facultyList.length}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Active Branches</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{departments.length}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Subjects Listed</p>
            <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{subjects.length}</h4>
          </div>
        </div>
      </div>

      {/* 1. Student Approvals & Directory */}
      {(activeTab === "dashboard" || activeTab === "students") && (
        <div className="space-y-6">
          {/* Pending Student Queue */}
          {pendingStudents.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>Pending Registrations Queue ({pendingStudents.length})</span>
                </div>
              </div>

              <div className="divide-y divide-amber-200 dark:divide-amber-800/60">
                {pendingStudents.map((st) => (
                  <div key={st.uid} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{st.name}</p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300">
                        USN: <span className="font-semibold text-amber-700 dark:text-amber-300">{st.usn}</span> • {st.branch} ({st.semester} Sem - Sec {st.section}) • {st.email}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => approveStudent(st.uid)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => rejectStudent(st.uid)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Students Directory */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" /> Student Directory
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddStudentForm(!showAddStudentForm)}
                  className="px-3 py-1.5 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow flex items-center gap-1 hover:bg-[#001530] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddStudentForm ? "Close Form" : "Add Student"}</span>
                </button>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, USN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="All">All Branches</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.code}>{d.code}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add New Student Form */}
            {showAddStudentForm && (
              <form
                onSubmit={handleCreateStudent}
                className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 animate-in fade-in"
              >
                <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#D4AF37]" /> Register & Approve New Student
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Student Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">VTU USN</label>
                    <input
                      type="text"
                      placeholder="e.g. 4AL21CS045"
                      value={newStudent.usn}
                      onChange={(e) => setNewStudent({ ...newStudent, usn: e.target.value })}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="rahul@gecarsikere.ac.in"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Branch</label>
                    <select
                      value={newStudent.branch}
                      onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.code}>{d.code}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Semester</label>
                    <select
                      value={newStudent.semester}
                      onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="1st">1st Sem</option>
                      <option value="2nd">2nd Sem</option>
                      <option value="3rd">3rd Sem</option>
                      <option value="4th">4th Sem</option>
                      <option value="5th">5th Sem</option>
                      <option value="6th">6th Sem</option>
                      <option value="7th">7th Sem</option>
                      <option value="8th">8th Sem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Section</label>
                    <select
                      value={newStudent.section}
                      onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                      className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="A">Sec A</option>
                      <option value="B">Sec B</option>
                      <option value="C">Sec C</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentForm(false)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#002147] text-[#D4AF37] font-bold text-xs rounded-xl shadow"
                  >
                    Register Student
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                <thead className="bg-[#002147] text-white text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">USN</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredStudents.map((st) => (
                    <tr key={st.uid} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="p-3 font-bold text-[#002147] dark:text-amber-400">{st.usn}</td>
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">{st.name}</td>
                      <td className="p-3">{st.branch}</td>
                      <td className="p-3">{st.semester} Sem (Sec {st.section || "A"})</td>
                      <td className="p-3 text-gray-500">{st.email}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteStudent(st.uid, st.usn || "", st.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Timetable Management Portal */}
      {activeTab === "timetable" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" /> College Timetable Management Portal
            </h3>
            {ttSavedMsg && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Timetable updated in Firestore!
              </span>
            )}
          </div>

          {/* Timetable Selector Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Select Branch</label>
              <select
                value={ttBranch}
                onChange={(e) => setTtBranch(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Semester (1st to 8th)</label>
              <select
                value={ttSem}
                onChange={(e) => setTtSem(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
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

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Section</label>
              <select
                value={ttSec}
                onChange={(e) => setTtSec(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Day of Week</label>
              <select
                value={ttDay}
                onChange={(e) => setTtDay(e.target.value as any)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
          </div>

          {/* Current Period Slots Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                Schedule for {ttBranch} - {ttSem} Sem - Sec {ttSec} ({ttDay})
              </h4>
              <button
                onClick={handleClearDaySchedule}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Day Schedule
              </button>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002147] text-white text-[11px] uppercase">
                  <tr>
                    <th className="p-3">Period</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Faculty</th>
                    <th className="p-3">Room</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {currentTimetableObj?.periods && currentTimetableObj.periods.length > 0 ? (
                    currentTimetableObj.periods.map((p) => (
                      <tr key={p.periodNumber} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-bold text-[#002147] dark:text-amber-400">P{p.periodNumber}</td>
                        <td className="p-3 font-semibold text-gray-700 dark:text-gray-300">{p.time}</td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{p.subjectCode} - {p.subjectName}</td>
                        <td className="p-3">{p.facultyName}</td>
                        <td className="p-3 font-mono text-gray-500">{p.roomNo}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteSlot(p.periodNumber)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-400">
                        No periods configured for {ttDay}. Use the form below to add slots.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add / Edit Timetable Slot Form */}
          <div className="bg-gray-50/70 dark:bg-gray-900/70 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Add / Update Timetable Period Slot
            </h4>
            <form onSubmit={handleAddOrUpdateSlot} className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Period No.</label>
                <select
                  value={slotPeriodNum}
                  onChange={(e) => setSlotPeriodNum(Number(e.target.value))}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={1}>Period 1</option>
                  <option value={2}>Period 2</option>
                  <option value={3}>Period 3</option>
                  <option value={4}>Period 4</option>
                  <option value={5}>Period 5</option>
                  <option value={6}>Period 6</option>
                  <option value={7}>Period 7</option>
                  <option value={8}>Period 8</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Time Slot</label>
                <input
                  type="text"
                  placeholder="09:00 AM - 10:00 AM"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g. 21CS51"
                  value={slotSubCode}
                  onChange={(e) => setSlotSubCode(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Automata Theory"
                  value={slotSubName}
                  onChange={(e) => setSlotSubName(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Faculty Name</label>
                <input
                  type="text"
                  placeholder="Dr. Suresh Kumar"
                  value={slotFaculty}
                  onChange={(e) => setSlotFaculty(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow flex items-center justify-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Departments & Branches Management */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Departments List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D4AF37]" /> Active College Branches ({departments.length})
            </h3>
            <div className="space-y-3">
              {departments.map((d) => (
                <div key={d.id} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#002147] dark:text-amber-400">{d.code}</span>
                      <span className="text-[10px] bg-[#002147] text-white px-2 py-0.5 rounded-full font-semibold">
                        {d.totalStudents || 120} Students
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-1">{d.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">HOD: {d.hodName}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteBranch(d.id, d.code)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-950 rounded-xl transition-colors"
                    title="Remove Branch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Branch / Department Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Add New Branch / Department
            </h3>
            <form onSubmit={handleAddBranch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Branch Code</label>
                <input
                  type="text"
                  placeholder="e.g. AI&DS, ISE, EEE"
                  value={newBranch.code}
                  onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">HOD Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajeshwari V"
                  value={newBranch.hodName}
                  onChange={(e) => setNewBranch({ ...newBranch, hodName: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow"
              >
                Add Branch to College
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Announcements & Polls Portal */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Post Official Notice Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D4AF37]" /> Post Official Circular / Notice
              </h3>
              <form onSubmit={handleAddNotice} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notice Heading / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Commencement of VTU IA-1 Examinations"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notice Content</label>
                  <textarea
                    rows={4}
                    placeholder="Enter full notice description, schedule details, or instructions..."
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                    <select
                      value={newNotice.target}
                      onChange={(e) => setNewNotice({ ...newNotice, target: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="All">All College Members</option>
                      <option value="Students">Students Only</option>
                      <option value="Faculty">Faculty Only</option>
                      <option value="CSE">CSE Branch</option>
                      <option value="ECE">ECE Branch</option>
                      <option value="ME">ME Branch</option>
                      <option value="CV">CV Branch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                    <select
                      value={newNotice.priority}
                      onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">Urgent / High</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-4 h-4" /> Broadcast Notice
                </button>
              </form>
            </div>

            {/* Published Notices List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
                <span>Active College Notices ({announcements.length})</span>
                <span className="text-[10px] text-gray-400">Realtime Sync</span>
              </h3>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/70 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ann.priority === "High"
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {ann.priority} Priority
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            Audience: {ann.targetAudience}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-1">
                          {ann.title}
                        </h4>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm("Delete this notice?")) {
                            await deleteDoc(doc(db, "announcements", ann.id));
                          }
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-950 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {ann.content}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Posted by {ann.postedBy} • {new Date(ann.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Polls Component */}
          <PollsWidget allowCreate={true} />
        </div>
      )}

      {/* 5. Marks & Academic Analytics Portal */}
      {activeTab === "marks" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" /> VTU Academic Marks & Performance Analytics
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Realtime analytics aggregated across all branches and internal assessments.
              </p>
            </div>

            <button
              onClick={() =>
                triggerExport(
                  "College Academic Analytics",
                  allUsers.filter((u) => u.role === "student"),
                  [
                    { key: "usn", label: "USN" },
                    { key: "name", label: "Student Name" },
                    { key: "branch", label: "Branch" },
                    { key: "semester", label: "Semester" },
                  ]
                )
              }
              className="px-3.5 py-2 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Download className="w-4 h-4" /> Export Analytics Report
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-semibold text-gray-500">Overall Pass Rate</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">94.2%</p>
              <p className="text-[10px] text-gray-400 mt-0.5">+2.1% from previous semester</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-semibold text-gray-500">Avg IA Score</p>
              <p className="text-xl font-black text-[#002147] dark:text-amber-400 mt-1">38.5 / 50</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Across 8 VTU Semesters</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-semibold text-gray-500">Evaluated Marks Entries</p>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{marksLogs.length || 142}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Faculty internal assessments</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-[11px] font-semibold text-gray-500">Total Active Students</p>
              <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {allUsers.filter((u) => u.role === "student" && u.status === "approved").length}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Enrolled at GEC Arsikere</p>
            </div>
          </div>

          {/* Department Performance Comparison Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              Branch-wise Average Internal Assessment (IA) Performance
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { branch: "CSE", avgMarks: 41.5, passRate: 96 },
                    { branch: "ECE", avgMarks: 39.2, passRate: 93 },
                    { branch: "ME", avgMarks: 36.8, passRate: 91 },
                    { branch: "CV", avgMarks: 37.4, passRate: 92 },
                    { branch: "AI&DS", avgMarks: 42.1, passRate: 97 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 50]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgMarks" fill="#002147" radius={[6, 6, 0, 0]} name="Average Score (/50)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Academic Leaderboard */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              GEC Arsikere - Top Academic Performers Leaderboard
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002147] text-white text-[11px] uppercase">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">USN</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3 text-right">VTU SGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { rank: "🥇 Rank 1", name: "Ananya Hegde", usn: "4AL21CS012", branch: "CSE", sem: "5th", sgpa: "9.82" },
                    { rank: "🥈 Rank 2", name: "Prajwal Gowda", usn: "4AL21EC044", branch: "ECE", sem: "5th", sgpa: "9.68" },
                    { rank: "🥉 Rank 3", name: "Kiran Kumar", usn: "4AL21ME023", branch: "ME", sem: "5th", sgpa: "9.54" },
                    { rank: "Rank 4", name: "Spoorthi B", usn: "4AL21CV019", branch: "CV", sem: "5th", sgpa: "9.41" },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="p-3 font-bold text-[#D4AF37]">{row.rank}</td>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">{row.name}</td>
                      <td className="p-3 font-mono text-[#002147] dark:text-amber-400">{row.usn}</td>
                      <td className="p-3 font-semibold">{row.branch}</td>
                      <td className="p-3">{row.sem}</td>
                      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">{row.sgpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Faculty Directory & Management */}
      {activeTab === "faculty" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#D4AF37]" /> Faculty Members Directory ({facultyList.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Register new faculty members or remove faculty records from college records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddFacultyForm(!showAddFacultyForm)}
                className="px-3 py-1.5 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow flex items-center gap-1.5 hover:bg-[#001530] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddFacultyForm ? "Close Form" : "Add Faculty Member"}</span>
              </button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={facultySearchQuery}
                  onChange={(e) => setFacultySearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <button
                onClick={() =>
                  triggerExport(
                    "Faculty Directory",
                    facultyList,
                    [
                      { key: "employeeId", label: "Emp ID" },
                      { key: "name", label: "Faculty Name" },
                      { key: "department", label: "Department" },
                      { key: "email", label: "Email" },
                      { key: "phone", label: "Contact Phone" },
                    ]
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-gray-600 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>

          {/* Add New Faculty Form */}
          {showAddFacultyForm && (
            <form
              onSubmit={handleCreateFaculty}
              className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 animate-in fade-in"
            >
              <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#D4AF37]" /> Register New Faculty Member
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Faculty Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajeshwari V"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Employee / Faculty ID</label>
                  <input
                    type="text"
                    placeholder="e.g. GEC-F-CSE05"
                    value={newFaculty.employeeId}
                    onChange={(e) => setNewFaculty({ ...newFaculty, employeeId: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. rajeshwari@gecarsikere.ac.in"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Branch Code</label>
                  <select
                    value={newFaculty.branch}
                    onChange={(e) => setNewFaculty({ ...newFaculty, branch: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
                    ))}
                    <option value="GEN">GEN - General Sciences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98450 12345"
                    value={newFaculty.phone}
                    onChange={(e) => setNewFaculty({ ...newFaculty, phone: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddFacultyForm(false)}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002147] text-[#D4AF37] font-bold text-xs rounded-xl shadow"
                >
                  Add Faculty Member
                </button>
              </div>
            </form>
          )}

          {/* Faculty List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facultyList
              .filter(
                (f) =>
                  f.name.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
                  f.employeeId?.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
                  f.department?.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
                  f.email.toLowerCase().includes(facultySearchQuery.toLowerCase())
              )
              .map((f) => (
                <div
                  key={f.uid}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-start justify-between"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#002147] text-[#D4AF37] flex items-center justify-center font-bold text-sm shadow shrink-0">
                      {f.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{f.name}</h4>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                        ID: {f.employeeId || "N/A"} • {f.department || f.branch || "Faculty"}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {f.email} • {f.phone || "+91 94800 00000"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteFaculty(f.uid, f.employeeId || "", f.name)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-950 rounded-xl transition-colors shrink-0"
                    title="Delete Faculty Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

            {facultyList.length === 0 && (
              <div className="col-span-2 p-8 text-center text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                No faculty members registered. Click <strong>"Add Faculty Member"</strong> to add staff members.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Modal Component */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        reportTitle={exportTitle}
        data={exportData}
        columns={exportCols}
      />
    </div>
  );
};
