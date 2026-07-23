import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { X, GraduationCap, Lock, Mail, User, Phone, BookOpen, ShieldCheck, KeyRound, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, registerStudent, registerFaculty, resetPassword } = useAuth();

  const [mode, setMode] = useState<"login" | "student_reg" | "faculty_reg" | "forgot">("login");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [semester, setSemester] = useState("5th");
  const [section, setSection] = useState("A");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
        setSuccessMsg("Logged in successfully!");
        setTimeout(() => onClose(), 800);
      } else if (mode === "student_reg") {
        if (!usn.trim()) throw new Error("USN is required for student registration.");
        await registerStudent({
          email,
          pass: password,
          name,
          usn,
          branch,
          semester,
          section,
          phone,
        });
        setSuccessMsg("Student registered successfully! You can now log in immediately with your account.");
        setTimeout(() => onClose(), 1200);
      } else if (mode === "faculty_reg") {
        if (!employeeId.trim()) throw new Error("Employee ID is required for faculty registration.");
        await registerFaculty({
          email,
          pass: password,
          name,
          employeeId,
          department: `${branch} Department`,
          branch,
          phone,
        });
        setSuccessMsg("Faculty account created successfully!");
        setTimeout(() => onClose(), 1000);
      } else if (mode === "forgot") {
        if (!email.trim()) throw new Error("Email address is required.");
        await resetPassword(email);
        setSuccessMsg("Password reset email sent! Check your inbox.");
      }
    } catch (err: any) {
      setError(err?.message || "Authentication operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative text-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="bg-[#002147] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 text-[#002147] shadow-md font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">GEC Arsikere ERP</h3>
              <p className="text-xs text-amber-300">Unified Portal Authentication</p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4 text-xs font-medium border border-white/10">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                mode === "login" ? "bg-[#D4AF37] text-[#002147] font-bold" : "text-gray-300 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode("student_reg"); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                mode === "student_reg" ? "bg-[#D4AF37] text-[#002147] font-bold" : "text-gray-300 hover:text-white"
              }`}
            >
              Student Reg
            </button>
            <button
              type="button"
              onClick={() => { setMode("faculty_reg"); setError(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                mode === "faculty_reg" ? "bg-[#D4AF37] text-[#002147] font-bold" : "text-gray-300 hover:text-white"
              }`}
            >
              Faculty Reg
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full Name for Registrations */}
          {(mode === "student_reg" || mode === "faculty_reg") && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar M"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002147]"
                />
              </div>
            </div>
          )}

          {/* Student Specific Fields */}
          {mode === "student_reg" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  VTU USN Number
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4AL21CS001"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002147]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CV">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
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
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Section
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Faculty Specific Fields */}
          {mode === "faculty_reg" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Employee ID
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. GEC-F-CSE01"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002147]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="ECE">Electronics & Communication Engg</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CV">Civil Engineering</option>
                </select>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@gecarsikere.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002147]"
              />
            </div>
          </div>

          {/* Phone */}
          {(mode === "student_reg" || mode === "faculty_reg") && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002147]"
                />
              </div>
            </div>
          )}

          {/* Password */}
          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-[#002147] dark:text-amber-400 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002147]"
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-[#002147] hover:bg-[#001530] text-[#D4AF37] font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 border border-[#D4AF37]/30"
          >
            {submitting ? (
              <span>Processing...</span>
            ) : mode === "login" ? (
              <span>Sign In to ERP</span>
            ) : mode === "forgot" ? (
              <span>Send Password Reset Link</span>
            ) : (
              <span>Submit Registration</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 text-center">
          Government Engineering College, Arsikere • VTU Portal
        </div>
      </div>
    </div>
  );
};
