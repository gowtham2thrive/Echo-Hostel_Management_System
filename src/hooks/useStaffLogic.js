import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext"; 
import { complaintService, outingService } from "../services/api"; 
import { GENDERS } from "../constants";

// ✅ CENTRALIZED DEMO PROFILES (Detailed Data for Previews)
const DEMO_STUDENTS = [
    { id: 'ds1', name: 'Rahul Sharma', roll_no: '21A0501', gender: 'Male', phone: '9876543210', room_number: '101', email: 'rahul.demo@college.edu', course: 'B.Tech', year: '3', parent_phone: '9988776611' },
    { id: 'ds2', name: 'Karthik Reddy', roll_no: '21A0502', gender: 'Male', phone: '9123456780', room_number: '102', email: 'karthik.demo@college.edu', course: 'M.Tech', year: '1', parent_phone: '9988776622' },
    { id: 'ds3', name: 'Priya Singh', roll_no: '21A0503', gender: 'Female', phone: '9988776655', room_number: '201', email: 'priya.demo@college.edu', course: 'Diploma', year: '2', parent_phone: '9988776633' },
    { id: 'ds4', name: 'Anjali Gupta', roll_no: '21A0504', gender: 'Female', phone: '8877665544', room_number: '202', email: 'anjali.demo@college.edu', course: 'MCA', year: '2', parent_phone: '9988776644' }
];

// ✅ CENTRALIZED STAFF PROFILE
const DEMO_STAFF_PROFILE = {
    id: 'demo-staff',
    name: 'Dr. A. Warden',
    designation: 'Chief Warden',
    phone: '9876500000',
    email: 'chief.warden@demo.edu',
    role: 'staff',
    gender: 'Male'
};

export function useStaffLogic(overrideProfile = null) {
  const { profile: authProfile, refreshProfile } = useAuth();
  const myProfile = overrideProfile || authProfile;
  const { theme, setTheme, isDarkMode } = useTheme();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [tab, setTab] = useState(() => localStorage.getItem("staff_tab") || "complaints");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [gender, setGender] = useState(GENDERS.MALE);
  const [editingProfile, setEditingProfile] = useState(null);
  const [viewedProfile, setViewedProfile] = useState(null);
  
  // Data State
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [outings, setOutings] = useState([]);
  const [activeOutings, setActiveOutings] = useState([]); 

  const [processingId, setProcessingId] = useState(null);
  const [dirCourse, setDirCourse] = useState("All");
  const [dirYear, setDirYear] = useState("All");
  const [approvalRole, setApprovalRole] = useState("All"); 

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  useEffect(() => {
    localStorage.setItem("staff_tab", tab);
    if (tab === "approvals") fetchPending();
    if (tab === "directory") {
        fetchDirectory();
        fetchActiveOutings();
    }
    if (tab === "complaints") fetchComplaints();
    if (tab === "outings") {
        fetchOutings();
        fetchActiveOutings();
    }
  }, [tab, gender]);

  const fetchComplaints = async () => {
    setLoading(true);
    if (myProfile?.isDemo) {
        setComplaints([
            { 
                id: 'dc1', 
                category: 'Maintenance', 
                severity: 'High', 
                description: 'Window broken in Room 101 due to wind.', 
                status: 'submitted', 
                submitted_at: new Date().toISOString(), 
                profile: DEMO_STUDENTS[0] 
            },
            // ✅ FIX: Added EXTRA Maintenance Complaints to trigger RED ALERT (>4)
            { 
                id: 'dc_m1', category: 'Maintenance', severity: 'Medium', 
                description: 'Fan regulator not working in Room 104.', 
                status: 'submitted', submitted_at: new Date().toISOString(), profile: DEMO_STUDENTS[1] 
            },
            { 
                id: 'dc_m2', category: 'Maintenance', severity: 'Low', 
                description: 'Tube light flickering in corridor.', 
                status: 'submitted', submitted_at: new Date().toISOString(), profile: DEMO_STUDENTS[2] 
            },
            { 
                id: 'dc_m3', category: 'Maintenance', severity: 'High', 
                description: 'Door lock jammed in Room 202.', 
                status: 'submitted', submitted_at: new Date().toISOString(), profile: DEMO_STUDENTS[3] 
            },
            { 
                id: 'dc_m4', category: 'Maintenance', severity: 'Medium', 
                description: 'Table leg broken in study hall.', 
                status: 'submitted', submitted_at: new Date().toISOString(), profile: DEMO_STUDENTS[0] 
            },
            // ---------------------------------------------------------
            { 
                id: 'dc3', 
                category: 'Hygiene', 
                severity: 'Medium', 
                description: 'Washrooms on 2nd floor need cleaning.', 
                status: 'submitted', 
                submitted_at: new Date().toISOString(), 
                profile: DEMO_STUDENTS[2] 
            },
            { 
                id: 'dc2', 
                category: 'Water', 
                severity: 'Low', 
                description: 'Drinking water is warm on 2nd floor.', 
                status: 'acknowledged', 
                submitted_at: new Date(Date.now() - 3600000).toISOString(), 
                profile: DEMO_STUDENTS[1], 
                acknowledged_by_id: 'demo-staff',
                ack_staff: { ...DEMO_STAFF_PROFILE }
            }
        ]);
        setLoading(false);
        return;
    }
    try {
        const { data } = await complaintService.fetchAll(null); 
        const filtered = (data || []).filter(c => gender === "All" || c.profile?.gender === gender);
        setComplaints(filtered);
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchOutings = async () => {
    setLoading(true);
    if (myProfile?.isDemo) {
        const now = new Date();
        const demoOutings = [];
        const purposes = ['Shopping', 'Home', 'Medical', 'Movie'];
        
        // 1. Pending Request (Current)
        demoOutings.push({ 
            id: 'do1', 
            purpose: 'Movie', 
            status: 'Submitted', 
            return_time: new Date(Date.now() + 10000000).toISOString(), 
            submitted_at: new Date().toISOString(),
            profile: DEMO_STUDENTS[0] // Rahul
        });

        // 2. Generate 4 Historical Outings
        for (let i = 0; i < 4; i++) {
             const pastDate = new Date();
             pastDate.setDate(now.getDate() - (i + 1)); 
             
             // Rotate Students
             const student = i % 2 === 0 ? DEMO_STUDENTS[3] : DEMO_STUDENTS[0];

             demoOutings.push({
                 id: `hist_${i}`,
                 purpose: purposes[i % purposes.length],
                 status: 'Approved',
                 submitted_at: pastDate.toISOString(),
                 return_time: pastDate.toISOString(),
                 profile: student,
                 // ✅ FIX: Ensure 'approved_by_staff' has the ID that links to 'DEMO_STAFF_PROFILE'
                 approved_by: 'demo-staff',
                 approved_by_staff: { ...DEMO_STAFF_PROFILE } 
             });
        }

        setOutings(demoOutings);
        setLoading(false);
        return;
    }
    try {
        const { data } = await outingService.fetchAll(null);
        const filtered = (data || []).filter(o => gender === "All" || o.profile?.gender === gender);
        setOutings(filtered);
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchActiveOutings = async () => {
    if (myProfile?.isDemo) {
        // ✅ FIX: Distinct Profiles for Active Outings (Priya & Anjali)
        setActiveOutings([
            { 
                 user_id: 'ds3', 
                 status: 'Approved', 
                 return_time: new Date(Date.now() + 7200000).toISOString(),
                 profile: DEMO_STUDENTS[2] // Priya (Diploma)
            },
            {
                 user_id: 'ds4', 
                 status: 'Approved', 
                 return_time: new Date(Date.now() + 3600000).toISOString(),
                 profile: DEMO_STUDENTS[3] // Anjali (MCA)
            }
        ]);
        return;
    }
    try {
        const data = await outingService.fetchActive();
        setActiveOutings(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchDirectory = async () => {
    setLoading(true);
    if (myProfile?.isDemo) {
        setAllStudents(DEMO_STUDENTS.map(s => ({ ...s, is_approved: true })));
        setLoading(false);
        return;
    }
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("is_approved", true) 
        .eq("is_deleted", false)
        .order("name", { ascending: true });
      if (error) throw error;
      setAllStudents(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchPending = async () => {
    setLoading(true);
    if (myProfile?.isDemo) {
        setPendingUsers([
            { id: 'dp1', name: 'New Student Demo', email: 'student.pending@demo.com', role: 'student', gender: 'Male', roll_no: '21A0599', created_at: new Date().toISOString() },
            { id: 'dp2', name: 'New Warden Demo', email: 'warden.pending@demo.com', role: 'staff', gender: 'Female', designation: 'Warden', created_at: new Date().toISOString() }
        ]);
        setLoading(false);
        return;
    }
    try {
      const { data: newStudents } = await supabase.from("students").select("*").eq("is_approved", false).is("pending_update", null); 
      const { data: newStaff } = await supabase.from("staff").select("*").eq("is_approved", false);
      const { data: updates } = await supabase.from("students").select("*").not("pending_update", "is", null);

      const combinedNewUsers = [
        ...(newStudents || []).map(u => ({ ...u, role: 'student' })),
        ...(newStaff || []).map(u => ({ ...u, role: 'staff' }))
      ];
      setPendingUsers(combinedNewUsers);
      setPendingUpdates(updates || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchUserProfile = async (userId, role) => {
    if (!userId) return;
    if (myProfile?.isDemo) {
        const demoDb = {};
        DEMO_STUDENTS.forEach(s => demoDb[s.id] = { ...s, role: 'student' });
        
        // Pending Users
        demoDb['dp1'] = { id: 'dp1', name: 'New Student Demo', email: 'student.pending@demo.com', role: 'student', phone: '1111111111' };
        demoDb['dp2'] = { id: 'dp2', name: 'New Warden Demo', email: 'warden.pending@demo.com', role: 'staff', phone: '2222222222' };
        
        // ✅ FIX: Staff Profile Entry for "Approved By" lookup
        demoDb['demo-staff'] = DEMO_STAFF_PROFILE;

        const profile = demoDb[userId] || { name: 'Demo User', email: 'demo@user.com', role: role || 'student' };
        setViewedProfile(profile);
        return;
    }
    try {
      const table = role === 'staff' ? 'staff' : 'students';
      const { data, error } = await supabase.from(table).select("*").eq("id", userId).single();
      if (error) throw error;
      if (data) setViewedProfile({ ...data, role });
    } catch (err) { console.error("Error fetching user profile:", err); }
  };

  const handleComplaintStatus = async (id, status, note = null) => {
    if (myProfile?.isDemo) {
        toast.success("Demo Mode", `Complaint marked as ${status}`);
        setComplaints(prev => prev.map(c => {
            if (c.id !== id) return c;
            const updated = { 
                ...c, 
                status,
                ...(status === 'resolved' ? { closing_note: note, resolved_at: new Date().toISOString() } : {})
            };
            if (status === 'resolved') {
                updated.resolved_by_id = myProfile.id;
                updated.resolved_staff = { name: myProfile.name, id: myProfile.id };
            } else if (status === 'acknowledged') {
                updated.acknowledged_by_id = myProfile.id;
                updated.ack_staff = { name: myProfile.name, id: myProfile.id };
            }
            return updated;
        }));
        return;
    }
    if (!myProfile?.id) return;
    try {
        await complaintService.updateStatus(id, status, myProfile.id, note);
        fetchComplaints(); 
    } catch (err) { alert(err.message); }
  };

  const handleOutingStatus = async (id, status) => {
    if (myProfile?.isDemo) {
        toast.success("Demo Mode", `Outing ${status}`);
        setOutings(prev => prev.map(o => {
            if (o.id !== id) return o;
            const updated = { ...o, status };
            if (status === 'Approved') {
                updated.approved_by = myProfile.id;
                updated.approved_by_staff = { name: myProfile.name, id: myProfile.id };
            }
            return updated;
        }));
        return;
    }
    if (!myProfile?.id) return;
    try {
        await outingService.updateStatus(id, status, myProfile.id);
        fetchOutings(); 
        fetchActiveOutings();
    } catch (err) { alert(err.message); }
  };

  const approveUser = async (user) => {
    if (myProfile?.isDemo) {
        setPendingUsers(prev => prev.filter(u => u.id !== user.id));
        toast.success("Demo Mode", "User Approved");
        return;
    }
    setProcessingId(user.id);
    try {
      const table = user.role === 'staff' ? 'staff' : 'students';
      const { error } = await supabase.from(table).update({ is_approved: true }).eq("id", user.id);
      if (error) throw error;
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) { console.error(err); alert("Failed to approve user."); } finally { setProcessingId(null); }
  };

  const rejectUser = async (user) => {
    if (myProfile?.isDemo) {
        setPendingUsers(prev => prev.filter(u => u.id !== user.id));
        toast.error("Demo Mode", "User Rejected");
        return;
    }
    setProcessingId(user.id);
    try {
      const table = user.role === 'staff' ? 'staff' : 'students';
      const { error } = await supabase.from(table).delete().eq("id", user.id);
      if (error) throw error;
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) { console.error(err); } finally { setProcessingId(null); }
  };

  const approveUpdate = async (user) => {
    if (!user.pending_update) return;
    setProcessingId(user.id);
    try {
      const { error } = await supabase.from("students").update({ ...user.pending_update, pending_update: null }).eq("id", user.id);
      if (error) throw error;
      setPendingUpdates(prev => prev.filter(u => u.id !== user.id));
    } catch (err) { console.error(err); } finally { setProcessingId(null); }
  };

  const rejectUpdate = async (id) => {
    setProcessingId(id);
    try {
      const { error } = await supabase.from("students").update({ pending_update: null }).eq("id", id);
      if (error) throw error;
      setPendingUpdates(prev => prev.filter(u => u.id !== id));
    } catch (err) { console.error(err); } finally { setProcessingId(null); }
  };

  const softDeleteUser = async (id) => {
    if (myProfile?.isDemo) {
        setAllStudents(prev => prev.filter(s => s.id !== id));
        return;
    }
    setProcessingId(id);
    try {
      const { error } = await supabase.from("students").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
      setAllStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) { console.error("Soft delete failed:", err); } finally { setProcessingId(null); }
  };

  const handleProfileUpdate = async () => {
    if (myProfile?.isDemo) return;
    await refreshProfile();
    if (tab === 'directory') fetchDirectory();
  };

  const handleLogout = async () => { 
      if (myProfile?.isDemo) {
          window.location.reload();
          return;
      }
      try { await supabase.auth.signOut(); } catch (err) { alert("Logout failed."); } 
  };

  return {
    loading, myProfile, theme, setTheme, isDarkMode,
    tab, setTab, isMenuOpen, setIsMenuOpen, menuRef,
    gender, setGender, editingProfile, setEditingProfile,
    viewedProfile, setViewedProfile, fetchUserProfile, 
    processingId, pendingUsers, pendingUpdates, allStudents,
    dirCourse, setDirCourse, dirYear, setDirYear, approvalRole, setApprovalRole,
    complaints, outings, activeOutings,
    handleComplaintStatus, handleOutingStatus,
    approveUser, rejectUser, approveUpdate, rejectUpdate,
    softDeleteUser, handleProfileUpdate, handleLogout
  };
}