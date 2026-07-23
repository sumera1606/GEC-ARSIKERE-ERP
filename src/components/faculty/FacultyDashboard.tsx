import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  UserProfile,
  Subject,
  Department,
  AttendanceRecord,
  AttendanceLog,
  MarkEntry,
  Assignment,
  StudyMaterial,
  Announcement,
  TimetableDay,
  PeriodSlot,
} from "../../types";
import {
  CheckSquare,
  FileSpreadsheet,
  FileText,
  Clock,
  Users,
  Plus,
  Save,
  CheckCircle,
  XCircle,
  BookOpen,
  Calendar,
  Send,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Trash2,
  Building2,
  Bell,
} from "lucide-react";
import { PollsWidget } from "../common/PollsWidget";

interface FacultyDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { userProfile, setIsAvatarModalOpen } = useAuth();

  // Firestore Lists
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [timetables, setTimetables] = useState<TimetableDay[]>([]);

  // Attendance Form State
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attDate, setAttDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [attBranch, setAttBranch] = useState("CSE");
  const [attSemester, setAttSemester] = useState("5th");
  const [attSection, setAttSection] = useState("A");
  const [attendanceRecords, setAttendanceRecords] = useState<{ [usn: string]: "present" | "absent" }>({});
  const [attSaved, setAttSaved] = useState(false);

  // Marks Form State (Allow switching subjects & inline subject creation)
  const [markSubjectId, setMarkSubjectId] = useState("");
  const [customSubjectCode, setCustomSubjectCode] = useState("");
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [isAddingNewSubjectInline, setIsAddingNewSubjectInline] = useState(false);
  const [examType, setExamType] = useState<"IA-1" | "IA-2" | "IA-3" | "Assignment" | "Semester">("IA-1");
  const [studentMarks, setStudentMarks] = useState<{ [usn: string]: number }>({});
  const [maxMarks, setMaxMarks] = useState<number>(50);
  const [marksSaved, setMarksSaved] = useState(false);

  // Timetable Form State
  const [ttBranch, setTtBranch] = useState("CSE");
  const [ttSem, setTtSem] = useState("5th");
  const [ttSec, setTtSec] = useState("A");
  const [ttDay, setTtDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday">("Monday");
  const [slotPeriodNum, setSlotPeriodNum] = useState<number>(1);
  const [slotTime, setSlotTime] = useState("09:00 AM - 10:00 AM");
  const [slotSubCode, setSlotSubCode] = useState("");
  const [slotSubName, setSlotSubName] = useState("");
  const [slotFaculty, setSlotFaculty] = useState(userProfile?.name || "Dr. Suresh Kumar N");
  const [slotRoom, setSlotRoom] = useState("LH-101");
  const [ttSaved, setTtSaved] = useState(false);

  // New Assignment & Study Material Form State
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    totalMarks: 10,
    attachmentUrl: "",
  });
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    category: "Notes" as const,
    driveUrl: "",
  });

  // Branch Creation State
  const [newBranchCode, setNewBranchCode] = useState("");
  const [newBranchName, setNewBranchName] = useState("");

  // Form states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [facultyNotice, setFacultyNotice] = useState({
    title: "",
    content: "",
    targetAudience: "All" as const,
    priority: "Normal" as const,
  });
  const [subjectCredits, setSubjectCredits] = useState<number>(4);

  // Load Firestore data
  useEffect(() => {
    const unsubSub = onSnapshot(collection(db, "subjects"), (snap) => {
      const list: Subject[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Subject));
      setSubjects(list);
      if (list.length > 0 && !selectedSubject) {
        setSelectedSubject(list[0].id);
        setMarkSubjectId(list[0].id);
      }
    });

    const unsubDepts = onSnapshot(collection(db, "departments"), (snap) => {
      const list: Department[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Department));
      setDepartments(list);
    });

    const unsubStudents = onSnapshot(
      query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("status", "==", "approved")
      ),
      (snap) => {
        const list: UserProfile[] = [];
        snap.forEach((doc) => list.push(doc.data() as UserProfile));
        setStudents(list);

        const initAtt: { [usn: string]: "present" | "absent" } = {};
        const initMarks: { [usn: string]: number } = {};
        list.forEach((st) => {
          if (st.usn) {
            initAtt[st.usn] = "present";
            initMarks[st.usn] = 42;
          }
        });
        setAttendanceRecords(initAtt);
        setStudentMarks(initMarks);
      }
    );

    const unsubAssign = onSnapshot(collection(db, "assignments"), (snap) => {
      const list: Assignment[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Assignment));
      setAssignments(list);
    });

    const unsubTT = onSnapshot(collection(db, "timetable"), (snap) => {
      const list: TimetableDay[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as TimetableDay));
      setTimetables(list);
    });

    const unsubAnn = onSnapshot(collection(db, "announcements"), (snap) => {
      const list: Announcement[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(list);
    });

    return () => {
      unsubSub();
      unsubDepts();
      unsubStudents();
      unsubAssign();
      unsubTT();
      unsubAnn();
    };
  }, []);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyNotice.title || !facultyNotice.content) return;
    await addDoc(collection(db, "announcements"), {
      ...facultyNotice,
      postedBy: userProfile?.name || "Faculty Office",
      createdAt: new Date().toISOString(),
    });
    setFacultyNotice({
      title: "",
      content: "",
      targetAudience: "All",
      priority: "Normal",
    });
    alert("Notice published successfully to students!");
  };

  // Filter students for attendance / marks
  const filteredStudentsForClass = students.filter(
    (st) =>
      (!attBranch || st.branch === attBranch) &&
      (!attSemester || st.semester === attSemester) &&
      (!attSection || st.section === attSection)
  );

  const toggleAttendance = (usn: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [usn]: prev[usn] === "present" ? "absent" : "present",
    }));
  };

  const handleSaveAttendance = async () => {
    if (filteredStudentsForClass.length === 0) {
      alert("No approved students found in this section.");
      return;
    }

    const subObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];
    const recordsList: AttendanceRecord[] = filteredStudentsForClass.map((st) => ({
      studentId: st.uid,
      studentName: st.name,
      usn: st.usn || "N/A",
      status: attendanceRecords[st.usn || ""] || "present",
    }));

    const attId = `att_${selectedSubject || "sub"}_${attDate}_${attSection}`;
    await setDoc(doc(db, "attendance", attId), {
      id: attId,
      subjectId: subObj?.id || selectedSubject,
      subjectName: subObj?.name || "Subject Class",
      subjectCode: subObj?.code || "SUB101",
      branch: attBranch,
      semester: attSemester,
      section: attSection,
      date: attDate,
      facultyId: userProfile?.uid || "demo_faculty_cse",
      facultyName: userProfile?.name || "Dr. Suresh Kumar N",
      records: recordsList,
      createdAt: new Date().toISOString(),
    });

    setAttSaved(true);
    setTimeout(() => setAttSaved(false), 2000);
  };

  // Save Marks handler with subject creation support
  const handleSaveMarks = async () => {
    if (filteredStudentsForClass.length === 0) {
      alert("No students found in the selected branch, semester, and section.");
      return;
    }

    let activeSubCode = "";
    let activeSubName = "";
    let activeSubId = markSubjectId;

    if (isAddingNewSubjectInline && customSubjectCode && customSubjectName) {
      activeSubCode = customSubjectCode.toUpperCase();
      activeSubName = customSubjectName;
      const newSubRef = await addDoc(collection(db, "subjects"), {
        code: activeSubCode,
        name: activeSubName,
        branch: attBranch,
        semester: attSemester,
        credits: subjectCredits || 4,
        facultyName: userProfile?.name || "Dr. Suresh Kumar N",
      });
      activeSubId = newSubRef.id;
    } else {
      const selectedSubObj = subjects.find((s) => s.id === markSubjectId);
      if (selectedSubObj) {
        activeSubCode = selectedSubObj.code;
        activeSubName = selectedSubObj.name;
        // Allot/update credits for existing subject in Firestore
        await setDoc(
          doc(db, "subjects", selectedSubObj.id),
          { ...selectedSubObj, credits: subjectCredits || 4 },
          { merge: true }
        );
      } else {
        activeSubCode = "21CS51";
        activeSubName = "Automata Theory";
      }
    }

    for (const st of filteredStudentsForClass) {
      if (!st.usn) continue;
      const markId = `mark_${activeSubId}_${st.usn}_${examType}`;
      await setDoc(doc(db, "marks", markId), {
        id: markId,
        subjectId: activeSubId,
        subjectName: activeSubName,
        subjectCode: activeSubCode,
        studentId: st.uid,
        studentName: st.name,
        usn: st.usn,
        branch: attBranch,
        semester: attSemester,
        section: attSection,
        examType,
        obtainedMarks: studentMarks[st.usn] ?? 40,
        maxMarks,
        facultyId: userProfile?.uid || "demo_faculty_cse",
        updatedAt: new Date().toISOString(),
      });
    }

    setMarksSaved(true);
    setIsAddingNewSubjectInline(false);
    setTimeout(() => setMarksSaved(false), 2000);
  };

  // Timetable Handlers for Faculty
  const activeTtDocId = `tt_${ttBranch.toLowerCase()}_${ttSem.toLowerCase()}_${ttSec.toLowerCase()}_${ttDay.toLowerCase()}`;
  const currentTimetableObj = timetables.find(
    (t) =>
      t.branch === ttBranch &&
      t.semester === ttSem &&
      t.section === ttSec &&
      t.day === ttDay
  );

  const handleAddOrUpdateTtSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotSubCode || !slotSubName) {
      alert("Please enter subject code and title.");
      return;
    }

    const existingPeriods = currentTimetableObj?.periods ? [...currentTimetableObj.periods] : [];
    const newSlot: PeriodSlot = {
      periodNumber: Number(slotPeriodNum),
      time: slotTime,
      subjectCode: slotSubCode.toUpperCase(),
      subjectName: slotSubName,
      facultyName: slotFaculty || userProfile?.name || "Dr. Suresh Kumar N",
      roomNo: slotRoom || "LH-101",
    };

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

    setTtSaved(true);
    setTimeout(() => setTtSaved(false), 2000);
    setSlotSubCode("");
    setSlotSubName("");
  };

  const handleDeleteTtSlot = async (periodNum: number) => {
    if (!currentTimetableObj) return;
    const updatedPeriods = currentTimetableObj.periods.filter((p) => p.periodNumber !== periodNum);
    await setDoc(doc(db, "timetable", activeTtDocId), {
      ...currentTimetableObj,
      periods: updatedPeriods,
    });
  };

  // Branch Handlers
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchCode || !newBranchName) return;
    const deptId = `dept_${newBranchCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    await setDoc(doc(db, "departments", deptId), {
      id: deptId,
      code: newBranchCode.toUpperCase(),
      name: newBranchName,
      hodName: userProfile?.name || "Department Head",
      totalFaculty: 8,
      totalStudents: 120,
    });
    setNewBranchCode("");
    setNewBranchName("");
    alert("New Branch added to college database!");
  };

  const handleDeleteBranch = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete the ${code} branch?`)) {
      await deleteDoc(doc(db, "departments", id));
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title) return;

    const subObj = subjects[0] || { name: "Database Management Systems", code: "21CS53", id: "sub_21cs53" };
    await addDoc(collection(db, "assignments"), {
      ...newAssignment,
      subjectId: subObj.id,
      subjectName: subObj.name,
      subjectCode: subObj.code,
      branch: attBranch,
      semester: attSemester,
      section: attSection,
      facultyId: userProfile?.uid || "demo_faculty_cse",
      facultyName: userProfile?.name || "Dr. Suresh Kumar N",
      createdAt: new Date().toISOString(),
    });

    setNewAssignment({ title: "", description: "", dueDate: "", totalMarks: 10, attachmentUrl: "" });
    alert("Assignment published to students!");
  };

  const handleAddStudyMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title || !newMaterial.driveUrl) return;

    const subObj = subjects[0] || { name: "Computer Networks", code: "21CS52", id: "sub_21cs52" };
    await addDoc(collection(db, "studyMaterials"), {
      ...newMaterial,
      subjectId: subObj.id,
      subjectName: subObj.name,
      subjectCode: subObj.code,
      branch: attBranch,
      semester: attSemester,
      uploadedBy: userProfile?.name || "Faculty Member",
      createdAt: new Date().toISOString(),
    });

    setNewMaterial({ title: "", category: "Notes", driveUrl: "" });
    alert("Study material link published!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Ultra High Vibe Workstation */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002147] via-[#001736] to-[#002147] p-6 text-white shadow-2xl border border-[#D4AF37]/40 glow-box-blue">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="relative group shrink-0"
              title="Click to customize faculty avatar"
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Faculty Avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover ring-4 ring-[#D4AF37] shadow-xl group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#002147] flex items-center justify-center font-black text-2xl shadow-xl ring-4 ring-[#D4AF37]/50 group-hover:scale-105 transition-transform">
                  {userProfile?.name?.charAt(0) || "F"}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#002147] p-1.5 rounded-full text-[10px] font-black shadow-md">
                ✏️
              </span>
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-[#D4AF37] text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-[#D4AF37] animate-spin" style={{ animationDuration: "8s" }} />
                <span>GEC Arsikere • Faculty Command Center</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex flex-wrap items-center gap-2">
                Prof. {userProfile?.name || "Dr. Suresh Kumar N"}
                <span className="text-xs bg-[#D4AF37] text-[#002147] font-black px-2.5 py-1 rounded-full shadow-md">
                  VERIFIED FACULTY
                </span>
                {userProfile?.moodBadge && (
                  <span className="text-xs bg-white/15 text-amber-200 border border-amber-300/40 font-extrabold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                    {userProfile.moodBadge}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-300 font-medium max-w-xl">
                Department of {userProfile?.department || "Computer Science & Engineering"} • VTU Affiliated Grade A Faculty Workstation
              </p>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs text-amber-300 hover:text-white font-bold transition-colors pt-1"
              >
                <span>✨ Personalize Avatar & Vibe</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center transition-transform hover:scale-105">
              <p className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">Active Branches</p>
              <p className="text-xl font-black text-white mt-0.5">{departments.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center transition-transform hover:scale-105">
              <p className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">Enrolled Students</p>
              <p className="text-xl font-black text-white mt-0.5">{students.length || 142}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center col-span-2 sm:col-span-1 transition-transform hover:scale-105">
              <p className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">Assigned Courses</p>
              <p className="text-xl font-black text-white mt-0.5">{subjects.length || 6}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Take Attendance Section */}
      {(activeTab === "dashboard" || activeTab === "attendance") && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#D4AF37]" /> Daily Student Attendance Entry
            </h3>
            {attSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Saved to Firestore!
              </span>
            )}
          </div>

          {/* Section Selector Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Branch</label>
              <select
                value={attBranch}
                onChange={(e) => setAttBranch(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.code}>{d.code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Semester (1st - 8th)</label>
              <select
                value={attSemester}
                onChange={(e) => setAttSemester(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
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
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Section</label>
              <select
                value={attSection}
                onChange={(e) => setAttSection(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="A">Sec A</option>
                <option value="B">Sec B</option>
                <option value="C">Sec C</option>
              </select>
            </div>
          </div>

          {/* Student Rollcall Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002147] text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">USN</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3 text-center">Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredStudentsForClass.map((st) => {
                  const isPresent = (attendanceRecords[st.usn || ""] || "present") === "present";
                  return (
                    <tr key={st.uid} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <td className="p-3 font-bold text-[#002147] dark:text-amber-400">{st.usn}</td>
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">{st.name}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleAttendance(st.usn || "")}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                            isPresent
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          {isPresent ? "PRESENT" : "ABSENT"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSaveAttendance}
            className="w-full py-2.5 rounded-xl bg-[#002147] hover:bg-[#001530] text-[#D4AF37] font-bold text-xs shadow-md border border-[#D4AF37]/30 flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Class Attendance to Firestore</span>
          </button>
        </div>
      )}

      {/* 2. Enter Marks Section (Subject Switcher & Subject Creation) */}
      {activeTab === "marks" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" /> Faculty Marks Management Portal
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Select any subject or add a new subject to record student marks.
              </p>
            </div>
            {marksSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Marks Recorded!
              </span>
            )}
          </div>

          {/* Subject Switcher Bar */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" /> Active Subject in Marks Portal
              </label>

              <button
                type="button"
                onClick={() => setIsAddingNewSubjectInline(!isAddingNewSubjectInline)}
                className="text-xs text-[#002147] dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAddingNewSubjectInline ? "Select Existing Subject" : "Add / Change New Subject"}
              </button>
            </div>

            {!isAddingNewSubjectInline ? (
              <select
                value={markSubjectId}
                onChange={(e) => setMarkSubjectId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} ({s.branch} {s.semester} Sem)
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Subject Code (e.g. 21CS54)"
                  value={customSubjectCode}
                  onChange={(e) => setCustomSubjectCode(e.target.value)}
                  className="p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                />
                <input
                  type="text"
                  placeholder="Subject Title (e.g. Web Development)"
                  value={customSubjectName}
                  onChange={(e) => setCustomSubjectName(e.target.value)}
                  className="p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Branch</label>
              <select
                value={attBranch}
                onChange={(e) => setAttBranch(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.code}>{d.code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Semester (1st to 8th)</label>
              <select
                value={attSemester}
                onChange={(e) => setAttSemester(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
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
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Section</label>
              <select
                value={attSection}
                onChange={(e) => setAttSection(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="A">Sec A</option>
                <option value="B">Sec B</option>
                <option value="C">Sec C</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1">VTU Subject Credits</label>
              <select
                value={subjectCredits}
                onChange={(e) => setSubjectCredits(Number(e.target.value))}
                className="w-full p-2 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/40 text-gray-900 dark:text-white"
              >
                <option value={4}>4 Credits (Core Heavy)</option>
                <option value={3}>3 Credits (Core Theory)</option>
                <option value={2}>2 Credits (Elective/Lab)</option>
                <option value={1.5}>1.5 Credits (Practical Lab)</option>
                <option value={1}>1 Credit (Seminar/Mini Project)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Evaluation Type</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="IA-1">Internal Assessment 1</option>
                <option value="IA-2">Internal Assessment 2</option>
                <option value="IA-3">Internal Assessment 3</option>
                <option value="Assignment">Assignment / Quiz</option>
                <option value="Semester">Semester End Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Max Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#002147] text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">USN</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Obtained Marks (out of {maxMarks})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredStudentsForClass.map((st) => (
                  <tr key={st.uid} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-3 font-bold text-[#002147] dark:text-amber-400">{st.usn}</td>
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">{st.name}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        max={maxMarks}
                        value={studentMarks[st.usn || ""] ?? 40}
                        onChange={(e) =>
                          setStudentMarks({
                            ...studentMarks,
                            [st.usn || ""]: Number(e.target.value),
                          })
                        }
                        className="w-24 p-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 font-bold text-gray-900 dark:text-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSaveMarks}
            className="w-full py-2.5 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow-md border border-[#D4AF37]/30 flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Publish Marks to Firestore</span>
          </button>
        </div>
      )}

      {/* 3. Timetable & Branch Portal */}
      {activeTab === "timetable" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" /> Manage Class Timetable Schedule
              </h3>
              {ttSaved && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Timetable updated!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Branch</label>
                <select
                  value={ttBranch}
                  onChange={(e) => setTtBranch(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.code}>{d.code}</option>
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
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Day</label>
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

            {/* Timetable Period Table */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002147] text-white text-[11px] uppercase">
                  <tr>
                    <th className="p-3">Period</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Faculty</th>
                    <th className="p-3">Room</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {currentTimetableObj?.periods && currentTimetableObj.periods.length > 0 ? (
                    currentTimetableObj.periods.map((p) => (
                      <tr key={p.periodNumber} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-[#002147] dark:text-amber-400">P{p.periodNumber}</td>
                        <td className="p-3 font-semibold text-gray-700 dark:text-gray-300">{p.time}</td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">{p.subjectCode} - {p.subjectName}</td>
                        <td className="p-3">{p.facultyName}</td>
                        <td className="p-3 font-mono text-gray-500">{p.roomNo}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteTtSlot(p.periodNumber)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">
                        No periods added for {ttDay}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Period Form */}
            <form onSubmit={handleAddOrUpdateTtSlot} className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-gray-50/70 dark:bg-gray-900/70 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
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
                  placeholder="21CS51"
                  value={slotSubCode}
                  onChange={(e) => setSlotSubCode(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Subject Title</label>
                <input
                  type="text"
                  placeholder="Automata Theory"
                  value={slotSubName}
                  onChange={(e) => setSlotSubName(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Faculty / Room</label>
                <input
                  type="text"
                  placeholder="LH-101"
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow"
                >
                  Save Timetable Slot
                </button>
              </div>
            </form>
          </div>

          {/* Branch Add / Remove Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D4AF37]" /> Add or Remove College Branch
            </h3>
            <form onSubmit={handleAddBranch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Branch Code (e.g. AI&DS)"
                value={newBranchCode}
                onChange={(e) => setNewBranchCode(e.target.value)}
                className="p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Full Branch Name"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
              <button
                type="submit"
                className="py-2 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch</span>
              </button>
            </form>

            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-500 mb-2">Active College Branches (Click Delete to remove):</p>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <span
                    key={dept.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                  >
                    <span className="text-[#002147] dark:text-amber-400 font-black">{dept.code}</span>
                    <span className="text-gray-500 text-[11px] font-normal hidden sm:inline">({dept.name})</span>
                    <button
                      onClick={() => handleDeleteBranch(dept.id, dept.code)}
                      className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Departments & Branches Management Portal */}
      {activeTab === "departments" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#002147] via-[#001836] to-[#002147] text-white p-6 rounded-3xl shadow-lg border border-[#D4AF37]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37] text-[#002147] uppercase tracking-wider">
                  VTU Academic Affiliation
                </span>
                <span className="text-xs text-amber-200/80 font-medium">GEC Arsikere Portal</span>
              </div>
              <h2 className="text-2xl font-black mt-2 tracking-tight text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#D4AF37]" /> College Branches & Departments Directory
              </h2>
              <p className="text-xs text-gray-300 mt-1 max-w-xl">
                Faculty can register new academic disciplines, manage department seats, and configure branch structures across GEC Arsikere.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Active Branches</p>
                <p className="text-xl font-black text-white mt-0.5">{departments.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Total Faculty</p>
                <p className="text-xl font-black text-white mt-0.5">38</p>
              </div>
            </div>
          </div>

          {/* Add New Branch Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Register & Establish New College Branch
            </h3>
            <form onSubmit={handleAddBranch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Branch Code (Short)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI&DS, CSD, CY"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002147] uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Full Department Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002147]"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#002147] text-[#D4AF37] hover:bg-[#001530] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Establish Branch</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Departments Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#D4AF37]" /> Active Departments ({departments.length})
              </h3>
              <span className="text-[11px] text-gray-400 font-medium">Click Delete to remove branch instantly</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/70 space-y-3 relative hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#002147] text-[#D4AF37] tracking-wider inline-block">
                        {dept.code}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-2">
                        {dept.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteBranch(dept.id, dept.code)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-xl transition-colors"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-gray-200/80 dark:border-gray-800 text-[11px] space-y-1 text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="font-bold text-gray-500">HOD:</span> {dept.hodName || "Dr. Department Head"}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                      <span>Faculty: {dept.totalFaculty || 8}</span>
                      <span>Enrolled Students: {dept.totalStudents || 120}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Post Notice & Polls Portal */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Post Notice Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D4AF37]" /> Post Notice / Circular to Class
              </h3>
              <form onSubmit={handlePostNotice} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notice Heading</label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule for Lab Test 2"
                    value={facultyNotice.title}
                    onChange={(e) => setFacultyNotice({ ...facultyNotice, title: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notice Description / Instructions</label>
                  <textarea
                    rows={4}
                    placeholder="Write details for your students..."
                    value={facultyNotice.content}
                    onChange={(e) => setFacultyNotice({ ...facultyNotice, content: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Class / Branch</label>
                    <select
                      value={facultyNotice.targetAudience}
                      onChange={(e) => setFacultyNotice({ ...facultyNotice, targetAudience: e.target.value as any })}
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="All">All Students & Faculty</option>
                      <option value="Students">All Students</option>
                      <option value="CSE">CSE Department</option>
                      <option value="ECE">ECE Department</option>
                      <option value="ME">ME Department</option>
                      <option value="CV">CV Department</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Priority Level</label>
                    <select
                      value={facultyNotice.priority}
                      onChange={(e) => setFacultyNotice({ ...facultyNotice, priority: e.target.value as any })}
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
                  <Send className="w-4 h-4" /> Post Notice
                </button>
              </form>
            </div>

            {/* Existing Posted Notices */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between">
                <span>Published Class Notices ({announcements.length})</span>
                <span className="text-[10px] text-gray-400">Live Sync</span>
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

                      {ann.postedBy === (userProfile?.name || "Faculty") && (
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
                      )}
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

          {/* Polls Widget */}
          <PollsWidget allowCreate={true} />
        </div>
      )}

      {/* 5. Assignments & Study Materials */}
      {activeTab === "assignments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D4AF37]" /> Create Class Assignment
            </h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <input
                type="text"
                placeholder="Assignment Title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
              <textarea
                placeholder="Assignment Instructions..."
                rows={3}
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
                <input
                  type="url"
                  placeholder="Drive/PDF Link (Optional)"
                  value={newAssignment.attachmentUrl}
                  onChange={(e) => setNewAssignment({ ...newAssignment, attachmentUrl: e.target.value })}
                  className="p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow"
              >
                Publish Assignment
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#D4AF37]" /> Upload Study Material / Google Drive Link
            </h3>
            <form onSubmit={handleAddStudyMaterial} className="space-y-3">
              <input
                type="text"
                placeholder="Title (e.g. Automata Module 1 Notes)"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
              <select
                value={newMaterial.category}
                onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value as any })}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="Notes">Lecture Notes</option>
                <option value="Question Paper">Question Paper</option>
                <option value="Lab Manual">Lab Manual</option>
              </select>
              <input
                type="url"
                placeholder="Google Drive / PDF URL"
                value={newMaterial.driveUrl}
                onChange={(e) => setNewMaterial({ ...newMaterial, driveUrl: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#002147] text-[#D4AF37] font-bold text-xs shadow"
              >
                Share Study Material Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
