export type UserRole = 'admin' | 'faculty' | 'student';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  usn?: string;          // For students (e.g. 4AL21CS001)
  employeeId?: string;   // For faculty (e.g. GECF042)
  department?: string;   // E.g. Computer Science & Engineering
  branch?: string;       // E.g. CSE, ECE, ME, CV
  semester?: string;     // E.g. 1st, 2nd, ... 8th
  section?: string;      // E.g. A, B, C
  phone?: string;
  avatarUrl?: string;
  moodBadge?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  code: string;         // E.g. CSE
  name: string;         // E.g. Computer Science & Engineering
  hodName: string;
  totalFaculty: number;
  totalStudents: number;
}

export interface Subject {
  id: string;
  code: string;         // E.g. 21CS51
  name: string;         // E.g. Automata Theory and Computability
  branch: string;       // E.g. CSE
  semester: string;     // E.g. 5th
  credits: number;
  facultyId?: string;
  facultyName?: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  usn: string;
  status: 'present' | 'absent';
}

export interface AttendanceLog {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  branch: string;
  semester: string;
  section: string;
  date: string;
  facultyId: string;
  facultyName: string;
  records: AttendanceRecord[];
  createdAt?: string;
}

export interface MarkEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  studentId: string;
  studentName: string;
  usn: string;
  branch: string;
  semester: string;
  section: string;
  examType: 'IA-1' | 'IA-2' | 'IA-3' | 'Assignment' | 'Semester';
  obtainedMarks: number;
  maxMarks: number;
  facultyId: string;
  updatedAt: string;
}

export interface PeriodSlot {
  periodNumber: number;
  time: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomNo: string;
}

export interface TimetableDay {
  id: string;
  branch: string;
  semester: string;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: PeriodSlot[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  branch: string;
  semester: string;
  section: string;
  facultyId: string;
  facultyName: string;
  dueDate: string;
  attachmentUrl?: string;
  totalMarks: number;
  createdAt: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  branch: string;
  semester: string;
  category: 'Notes' | 'Question Paper' | 'Lab Manual' | 'Syllabus';
  driveUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'All' | 'Students' | 'Faculty' | 'CSE' | 'ECE' | 'ME' | 'CV';
  postedBy: string;
  priority: 'High' | 'Normal';
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds?: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  targetAudience: 'All' | 'Students' | 'Faculty' | 'CSE' | 'ECE' | 'ME' | 'CV';
  createdBy: string;
  createdAt: string;
  totalVotes: number;
  votedUserIds?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'Exam' | 'Event' | 'Holiday' | 'Instructional';
  description: string;
}

export interface LeaveApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantRole: 'student' | 'faculty';
  usnOrEmpId: string;
  branch: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  appliedAt: string;
}

export interface PlacementDrive {
  id: string;
  companyName: string;
  role: string;
  packageLPA: number;
  driveDate: string;
  eligibleBranches: string[];
  minCGPA: number;
  applicationDeadline: string;
  status: 'Upcoming' | 'Active' | 'Completed';
  description: string;
  registeredStudentIds: string[];
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  rackNo: string;
}

export interface BorrowedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  usn: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Issued' | 'Returned' | 'Overdue';
  fineAmount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
