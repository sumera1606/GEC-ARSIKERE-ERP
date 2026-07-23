import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserProfile, UserRole } from "../types";
import { seedGECArsikereData } from "../data/seedData";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  viewMode: "website" | "android";
  setViewMode: (mode: "website" | "android") => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  login: (email: string, pass: string) => Promise<UserProfile | null>;
  registerStudent: (data: {
    email: string;
    pass: string;
    name: string;
    usn: string;
    branch: string;
    semester: string;
    section: string;
    phone: string;
  }) => Promise<void>;
  registerFaculty: (data: {
    email: string;
    pass: string;
    name: string;
    employeeId: string;
    department: string;
    branch: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  approveStudent: (studentUid: string) => Promise<void>;
  rejectStudent: (studentUid: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  seedDatabase: () => Promise<boolean>;
  setDemoRole: (role: UserRole) => Promise<void>;
  updateAvatarUrl: (url: string, moodBadge?: string) => Promise<void>;
  isAvatarModalOpen: boolean;
  setIsAvatarModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"website" | "android">("website");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);

  const updateAvatarUrl = async (url: string, moodBadge?: string) => {
    if (userProfile) {
      const updated = {
        ...userProfile,
        avatarUrl: url,
        ...(moodBadge ? { moodBadge } : {}),
      };
      setUserProfile(updated);
      if (userProfile.uid) {
        try {
          const updateObj: Record<string, any> = { avatarUrl: url };
          if (moodBadge) updateObj.moodBadge = moodBadge;
          await updateDoc(doc(db, "users", userProfile.uid), updateObj);
        } catch (err) {
          console.warn("Updated local profile avatar, firestore sync note:", err);
        }
      }
    }
  };

  useEffect(() => {
    localStorage.setItem("gec_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const prof = userDoc.data() as UserProfile;
        setUserProfile(prof);
        return prof;
      } else {
        setUserProfile(null);
        return null;
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        // Default to a guest / mock admin view if not logged in initially so the user can immediately see the working system!
        const defaultDemoAdmin: UserProfile = {
          uid: "demo_admin_uid",
          email: "admin@gecarsikere.ac.in",
          name: "Principal / Admin Office",
          role: "admin",
          status: "approved",
          employeeId: "GEC-ADMIN-01",
          department: "Administration",
          phone: "+91 94800 12345",
          createdAt: new Date().toISOString(),
        };
        setUserProfile(defaultDemoAdmin);
      }
      setLoading(false);
    });

    // Auto-seed database once on first mount so all collections exist
    seedGECArsikereData();

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile | null> => {
    const creds = await signInWithEmailAndPassword(auth, email, pass);
    setCurrentUser(creds.user);
    const prof = await fetchProfile(creds.user.uid);
    return prof;
  };

  const registerStudent = async (data: {
    email: string;
    pass: string;
    name: string;
    usn: string;
    branch: string;
    semester: string;
    section: string;
    phone: string;
  }) => {
    const creds = await createUserWithEmailAndPassword(auth, data.email, data.pass);
    const newProfile: UserProfile = {
      uid: creds.user.uid,
      email: data.email,
      name: data.name,
      role: "student",
      status: "approved", // Students self-register and are immediately approved for portal login
      usn: data.usn.toUpperCase(),
      branch: data.branch,
      department: `${data.branch} Department`,
      semester: data.semester,
      section: data.section,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", creds.user.uid), newProfile);
    setUserProfile(newProfile);
    if (creds.user) {
      await sendEmailVerification(creds.user).catch(() => {});
    }
  };

  const registerFaculty = async (data: {
    email: string;
    pass: string;
    name: string;
    employeeId: string;
    department: string;
    branch: string;
    phone: string;
  }) => {
    const creds = await createUserWithEmailAndPassword(auth, data.email, data.pass);
    const newProfile: UserProfile = {
      uid: creds.user.uid,
      email: data.email,
      name: data.name,
      role: "faculty",
      status: "approved", // Faculty registered by Admin are pre-approved
      employeeId: data.employeeId.toUpperCase(),
      department: data.department,
      branch: data.branch,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", creds.user.uid), newProfile);
    setUserProfile(newProfile);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const approveStudent = async (studentUid: string) => {
    await updateDoc(doc(db, "users", studentUid), {
      status: "approved",
    });
  };

  const rejectStudent = async (studentUid: string) => {
    await updateDoc(doc(db, "users", studentUid), {
      status: "rejected",
    });
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser.uid);
    }
  };

  const seedDatabase = async () => {
    return await seedGECArsikereData();
  };

  // Quick Switcher helper for immediate role preview during demonstration
  const setDemoRole = async (role: UserRole) => {
    let mockProf: UserProfile;
    if (role === "admin") {
      mockProf = {
        uid: "demo_admin_uid",
        email: "admin@gecarsikere.ac.in",
        name: "Principal / Admin Office",
        role: "admin",
        status: "approved",
        employeeId: "GEC-ADMIN-01",
        department: "Administration",
        phone: "+91 94800 12345",
        createdAt: new Date().toISOString(),
      };
    } else if (role === "faculty") {
      mockProf = {
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
      };
    } else {
      mockProf = {
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
      };
    }
    setUserProfile(mockProf);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        viewMode,
        setViewMode,
        darkMode,
        setDarkMode,
        login,
        registerStudent,
        registerFaculty,
        logout,
        resetPassword,
        sendVerification,
        approveStudent,
        rejectStudent,
        refreshProfile,
        seedDatabase,
        setDemoRole,
        updateAvatarUrl,
        isAvatarModalOpen,
        setIsAvatarModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
