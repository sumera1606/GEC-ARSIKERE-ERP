import { doc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

export async function seedGECArsikereData() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    // If users already exist, don't re-seed completely or just update essential missing collections
    const isAlreadySeeded = !usersSnap.empty;

    const batch = writeBatch(db);

    // 1. Departments
    const departments = [
      { id: "dept_cse", code: "CSE", name: "Computer Science & Engineering", hodName: "Dr. Suresh Kumar N", totalFaculty: 12, totalStudents: 240 },
      { id: "dept_ece", code: "ECE", name: "Electronics & Communication Engg", hodName: "Dr. Kavitha S", totalFaculty: 10, totalStudents: 210 },
      { id: "dept_me", code: "ME", name: "Mechanical Engineering", hodName: "Prof. Manjunath B", totalFaculty: 8, totalStudents: 160 },
      { id: "dept_cv", code: "CV", name: "Civil Engineering", hodName: "Dr. Basavarajappa K", totalFaculty: 8, totalStudents: 150 },
    ];
    for (const d of departments) {
      batch.set(doc(db, "departments", d.id), d);
    }

    // 2. Demo Users (Default Admin, Faculty, Students)
    const demoUsers = [
      {
        uid: "demo_admin_uid",
        email: "admin@gecarsikere.ac.in",
        name: "Principal / Admin Office",
        role: "admin",
        status: "approved",
        employeeId: "GEC-ADMIN-01",
        department: "Administration",
        phone: "+91 94800 12345",
        createdAt: new Date().toISOString(),
      },
      {
        uid: "demo_faculty_cse",
        email: "suresh.cse@gecarsikere.ac.in",
        name: "Dr. Suresh Kumar N",
        role: "faculty",
        status: "approved",
        employeeId: "GEC-F-CSE01",
        department: "Computer Science & Engineering",
        branch: "CSE",
        phone: "+91 98450 67890",
        createdAt: new Date().toISOString(),
      },
      {
        uid: "demo_faculty_ece",
        email: "kavitha.ece@gecarsikere.ac.in",
        name: "Prof. Kavitha S",
        role: "faculty",
        status: "approved",
        employeeId: "GEC-F-ECE02",
        department: "Electronics & Communication Engg",
        branch: "ECE",
        phone: "+91 97310 11223",
        createdAt: new Date().toISOString(),
      },
      {
        uid: "demo_student_01",
        email: "4al21cs001@gecarsikere.ac.in",
        name: "Ramesh Kumar M",
        role: "student",
        status: "approved",
        usn: "4AL21CS001",
        department: "Computer Science & Engineering",
        branch: "CSE",
        semester: "5th",
        section: "A",
        phone: "+91 88920 33445",
        createdAt: new Date().toISOString(),
      },
      {
        uid: "demo_student_02",
        email: "4al21cs002@gecarsikere.ac.in",
        name: "Ananya Hegde",
        role: "student",
        status: "approved",
        usn: "4AL21CS002",
        department: "Computer Science & Engineering",
        branch: "CSE",
        semester: "5th",
        section: "A",
        phone: "+91 91102 55667",
        createdAt: new Date().toISOString(),
      },
      {
        uid: "demo_student_03_pending",
        email: "4al21cs045@gecarsikere.ac.in",
        name: "Praveen Gowda H S",
        role: "student",
        status: "pending",
        usn: "4AL21CS045",
        department: "Computer Science & Engineering",
        branch: "CSE",
        semester: "5th",
        section: "B",
        phone: "+91 99001 77889",
        createdAt: new Date().toISOString(),
      }
    ];

    for (const u of demoUsers) {
      batch.set(doc(db, "users", u.uid), u);
    }

    // 3. Subjects (CSE 5th Sem)
    const subjects = [
      { id: "sub_21cs51", code: "21CS51", name: "Automata Theory and Computability", branch: "CSE", semester: "5th", credits: 4, facultyId: "demo_faculty_cse", facultyName: "Dr. Suresh Kumar N" },
      { id: "sub_21cs52", code: "21CS52", name: "Computer Networks & Security", branch: "CSE", semester: "5th", credits: 4, facultyId: "demo_faculty_cse", facultyName: "Dr. Suresh Kumar N" },
      { id: "sub_21cs53", code: "21CS53", name: "Database Management Systems", branch: "CSE", semester: "5th", credits: 3, facultyId: "demo_faculty_cse", facultyName: "Prof. Anitha B" },
      { id: "sub_21cs54", code: "21CS54", name: "Web Application Development", branch: "CSE", semester: "5th", credits: 3, facultyId: "demo_faculty_cse", facultyName: "Dr. Suresh Kumar N" },
      { id: "sub_21csl57", code: "21CSL57", name: "DBMS Laboratory with Mini Project", branch: "CSE", semester: "5th", credits: 1.5, facultyId: "demo_faculty_cse", facultyName: "Prof. Anitha B" }
    ];
    for (const s of subjects) {
      batch.set(doc(db, "subjects", s.id), s);
    }

    // 4. Sample Attendance Records
    const attendanceLogs = [
      {
        id: "att_01",
        subjectId: "sub_21cs51",
        subjectName: "Automata Theory and Computability",
        subjectCode: "21CS51",
        branch: "CSE",
        semester: "5th",
        section: "A",
        date: "2026-07-20",
        facultyId: "demo_faculty_cse",
        facultyName: "Dr. Suresh Kumar N",
        records: [
          { studentId: "demo_student_01", studentName: "Ramesh Kumar M", usn: "4AL21CS001", status: "present" },
          { studentId: "demo_student_02", studentName: "Ananya Hegde", usn: "4AL21CS002", status: "present" }
        ]
      },
      {
        id: "att_02",
        subjectId: "sub_21cs52",
        subjectName: "Computer Networks & Security",
        subjectCode: "21CS52",
        branch: "CSE",
        semester: "5th",
        section: "A",
        date: "2026-07-21",
        facultyId: "demo_faculty_cse",
        facultyName: "Dr. Suresh Kumar N",
        records: [
          { studentId: "demo_student_01", studentName: "Ramesh Kumar M", usn: "4AL21CS001", status: "present" },
          { studentId: "demo_student_02", studentName: "Ananya Hegde", usn: "4AL21CS002", status: "absent" }
        ]
      },
      {
        id: "att_03",
        subjectId: "sub_21cs53",
        subjectName: "Database Management Systems",
        subjectCode: "21CS53",
        branch: "CSE",
        semester: "5th",
        section: "A",
        date: "2026-07-22",
        facultyId: "demo_faculty_cse",
        facultyName: "Dr. Suresh Kumar N",
        records: [
          { studentId: "demo_student_01", studentName: "Ramesh Kumar M", usn: "4AL21CS001", status: "present" },
          { studentId: "demo_student_02", studentName: "Ananya Hegde", usn: "4AL21CS002", status: "present" }
        ]
      }
    ];
    for (const a of attendanceLogs) {
      batch.set(doc(db, "attendance", a.id), a);
    }

    // 5. Sample Marks
    const marksData = [
      {
        id: "mark_01",
        subjectId: "sub_21cs51",
        subjectName: "Automata Theory and Computability",
        subjectCode: "21CS51",
        studentId: "demo_student_01",
        studentName: "Ramesh Kumar M",
        usn: "4AL21CS001",
        branch: "CSE",
        semester: "5th",
        section: "A",
        examType: "IA-1",
        obtainedMarks: 44,
        maxMarks: 50,
        facultyId: "demo_faculty_cse",
        updatedAt: new Date().toISOString()
      },
      {
        id: "mark_02",
        subjectId: "sub_21cs52",
        subjectName: "Computer Networks & Security",
        subjectCode: "21CS52",
        studentId: "demo_student_01",
        studentName: "Ramesh Kumar M",
        usn: "4AL21CS001",
        branch: "CSE",
        semester: "5th",
        section: "A",
        examType: "IA-1",
        obtainedMarks: 46,
        maxMarks: 50,
        facultyId: "demo_faculty_cse",
        updatedAt: new Date().toISOString()
      },
      {
        id: "mark_03",
        subjectId: "sub_21cs53",
        subjectName: "Database Management Systems",
        subjectCode: "21CS53",
        studentId: "demo_student_01",
        studentName: "Ramesh Kumar M",
        usn: "4AL21CS001",
        branch: "CSE",
        semester: "5th",
        section: "A",
        examType: "IA-1",
        obtainedMarks: 42,
        maxMarks: 50,
        facultyId: "demo_faculty_cse",
        updatedAt: new Date().toISOString()
      }
    ];
    for (const m of marksData) {
      batch.set(doc(db, "marks", m.id), m);
    }

    // 6. Timetable for CSE 5th Sem
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
    days.forEach((day, idx) => {
      batch.set(doc(db, "timetable", `tt_cse_5a_${day.toLowerCase()}`), {
        id: `tt_cse_5a_${day.toLowerCase()}`,
        branch: "CSE",
        semester: "5th",
        section: "A",
        day,
        periods: [
          { periodNumber: 1, time: "09:00 AM - 10:00 AM", subjectCode: "21CS51", subjectName: "Automata Theory", facultyName: "Dr. Suresh Kumar N", roomNo: "LH-101" },
          { periodNumber: 2, time: "10:00 AM - 11:00 AM", subjectCode: "21CS52", subjectName: "Computer Networks", facultyName: "Dr. Suresh Kumar N", roomNo: "LH-101" },
          { periodNumber: 3, time: "11:15 AM - 12:15 PM", subjectCode: "21CS53", subjectName: "DBMS", facultyName: "Prof. Anitha B", roomNo: "LH-101" },
          { periodNumber: 4, time: "12:15 PM - 01:15 PM", subjectCode: "21CS54", subjectName: "Web Development", facultyName: "Dr. Suresh Kumar N", roomNo: "LH-101" },
          { periodNumber: 5, time: "02:00 PM - 04:00 PM", subjectCode: "21CSL57", subjectName: "DBMS Lab", facultyName: "Prof. Anitha B", roomNo: "Lab-3" },
        ]
      });
    });

    // 7. Assignments
    const assignments = [
      {
        id: "assign_01",
        title: "DBMS ER Diagram & Schema Design",
        description: "Design an ER Diagram for a College ERP system with primary keys, foreign keys, and 3NF normalization constraints.",
        subjectId: "sub_21cs53",
        subjectName: "Database Management Systems",
        subjectCode: "21CS53",
        branch: "CSE",
        semester: "5th",
        section: "A",
        facultyId: "demo_faculty_cse",
        facultyName: "Dr. Suresh Kumar N",
        dueDate: "2026-07-28",
        attachmentUrl: "https://drive.google.com/file/d/example_assignment_1/view",
        totalMarks: 10,
        createdAt: new Date().toISOString()
      },
      {
        id: "assign_02",
        title: "Computer Networks Socket Programming",
        description: "Implement a Client-Server TCP Socket application in C / Python that calculates CRC-32 checksums.",
        subjectId: "sub_21cs52",
        subjectName: "Computer Networks & Security",
        subjectCode: "21CS52",
        branch: "CSE",
        semester: "5th",
        section: "A",
        facultyId: "demo_faculty_cse",
        facultyName: "Dr. Suresh Kumar N",
        dueDate: "2026-08-02",
        attachmentUrl: "https://drive.google.com/file/d/example_assignment_2/view",
        totalMarks: 10,
        createdAt: new Date().toISOString()
      }
    ];
    for (const ass of assignments) {
      batch.set(doc(db, "assignments", ass.id), ass);
    }

    // 8. Study Materials
    const studyMaterials = [
      {
        id: "mat_01",
        title: "VTU 5th Sem CSE - Automata Theory Lecture Notes",
        description: "Module 1 to 5 comprehensive lecture notes prepared by GEC Arsikere CSE Dept.",
        subjectId: "sub_21cs51",
        subjectName: "Automata Theory and Computability",
        subjectCode: "21CS51",
        branch: "CSE",
        semester: "5th",
        category: "Notes",
        driveUrl: "https://drive.google.com/file/d/gec_arsikere_automata_notes/view",
        uploadedBy: "Dr. Suresh Kumar N",
        createdAt: new Date().toISOString()
      },
      {
        id: "mat_02",
        title: "DBMS Solved VTU Question Papers (2021-2025)",
        description: "Collection of solved VTU main examination question papers with model answer keys.",
        subjectId: "sub_21cs53",
        subjectName: "Database Management Systems",
        subjectCode: "21CS53",
        branch: "CSE",
        semester: "5th",
        category: "Question Paper",
        driveUrl: "https://drive.google.com/file/d/gec_arsikere_dbms_papers/view",
        uploadedBy: "Prof. Anitha B",
        createdAt: new Date().toISOString()
      }
    ];
    for (const sm of studyMaterials) {
      batch.set(doc(db, "studyMaterials", sm.id), sm);
    }

    // 9. Announcements
    const announcements = [
      {
        id: "ann_01",
        title: "Internal Assessment - II Schedule Announced",
        content: "The 2nd Internal Assessment Test for 3rd, 5th and 7th Semester Students will commence from August 10, 2026. Detailed timetable is published on notice board.",
        targetAudience: "All",
        postedBy: "Principal Office",
        priority: "High",
        createdAt: new Date().toISOString()
      },
      {
        id: "ann_02",
        title: "TCS Campus Recruitment Drive 2026",
        content: "Training and Placement Cell announces TCS Ninja & Digital recruitment drive for final year B.E. students. Registration deadline is July 30, 2026.",
        targetAudience: "Students",
        postedBy: "Placement Officer",
        priority: "High",
        createdAt: new Date().toISOString()
      }
    ];
    for (const ann of announcements) {
      batch.set(doc(db, "announcements", ann.id), ann);
    }

    // 10. Academic Calendar
    const calendarEvents = [
      {
        id: "cal_01",
        title: "Internal Assessment Test - I",
        date: "2026-07-15",
        type: "Exam",
        description: "First internal evaluation for odd semester."
      },
      {
        id: "cal_02",
        title: "Internal Assessment Test - II",
        date: "2026-08-10",
        type: "Exam",
        description: "Second internal evaluation for all branches."
      },
      {
        id: "cal_03",
        title: "College Annual TechFest 'GENESIS 2026'",
        date: "2026-08-25",
        type: "Event",
        description: "State-level technical project exhibition and hackathon."
      },
      {
        id: "cal_04",
        title: "Independence Day Celebration",
        date: "2026-08-15",
        type: "Holiday",
        description: "National Holiday - Flag hoisting at 08:30 AM in College Campus."
      }
    ];
    for (const ev of calendarEvents) {
      batch.set(doc(db, "academicCalendar", ev.id), ev);
    }

    // 11. Placement Drives
    const placements = [
      {
        id: "place_01",
        companyName: "TCS (Tata Consultancy Services)",
        role: "Systems Engineer / Digital Developer",
        packageLPA: 7.5,
        driveDate: "2026-08-12",
        eligibleBranches: ["CSE", "ECE"],
        minCGPA: 6.5,
        applicationDeadline: "2026-07-30",
        status: "Active",
        description: "Pan-India campus hiring for B.E graduates in Computer Science and Electronics disciplines.",
        registeredStudentIds: ["demo_student_01", "demo_student_02"]
      },
      {
        id: "place_02",
        companyName: "Infosys Limited",
        role: "Specialist Programmer",
        packageLPA: 9.5,
        driveDate: "2026-08-20",
        eligibleBranches: ["CSE", "ECE", "ME", "CV"],
        minCGPA: 7.0,
        applicationDeadline: "2026-08-05",
        status: "Upcoming",
        description: "High-tier algorithmic and full-stack software development roles.",
        registeredStudentIds: ["demo_student_01"]
      }
    ];
    for (const p of placements) {
      batch.set(doc(db, "placementDrives", p.id), p);
    }

    // 12. Library Books
    const libraryBooks = [
      {
        id: "book_01",
        title: "Database System Concepts (7th Edition)",
        author: "Silberschatz, Korth, Sudarshan",
        isbn: "978-0078026911",
        category: "Computer Science",
        totalCopies: 15,
        availableCopies: 12,
        rackNo: "CS-Rack-04"
      },
      {
        id: "book_02",
        title: "Computer Networking: A Top-Down Approach",
        author: "Kurose & Ross",
        isbn: "978-0133594140",
        category: "Computer Science",
        totalCopies: 20,
        availableCopies: 16,
        rackNo: "CS-Rack-02"
      }
    ];
    for (const b of libraryBooks) {
      batch.set(doc(db, "libraryBooks", b.id), b);
    }

    await batch.commit();
    console.log("GEC Arsikere ERP Data Seeded Successfully into Firestore!");
    return true;
  } catch (err) {
    console.error("Error seeding GEC Arsikere Data:", err);
    return false;
  }
}
