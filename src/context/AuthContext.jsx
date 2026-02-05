import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Fetches the user's profile by checking both 'students' and 'staff' tables.
   * Since the schema is split, we must determine where the user exists.
   */
  async function fetchProfile(userId) {
    try {
      // Step A: Check 'students' table first
      let { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // Use maybeSingle to avoid errors if not found

      if (studentData) {
        // User is a Student
        setProfile({ ...studentData, role: "student" }); // Inject 'role' for frontend logic
      } else {
        // Step B: If not a student, check 'staff' table
        let { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        
        if (staffData) {
          // User is Staff
          setProfile({ ...staffData, role: "staff" }); // Inject 'role' for frontend logic
        } else {
          // User exists in Auth but has no profile in either table (New User)
          setProfile(null);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  // Check if critical fields exist. 
  // For the new schema, we assume if the record exists in the table, the profile is 'complete' enough for logic.
  const isProfileComplete = !!profile;
  
  // Strict check for approval (Default to false if undefined)
  const isApproved = profile?.is_approved === true; 

  const value = {
    session,
    profile,
    loading,
    // We injected 'role' during fetchProfile, so this check remains valid for the UI
    isStaff: profile?.role === 'staff',
    isProfileComplete,
    isApproved, 
    refreshProfile: () => fetchProfile(session?.user?.id)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);