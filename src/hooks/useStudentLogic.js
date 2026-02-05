import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { complaintService, outingService, aiService } from "../services/api";

export function useStudentLogic(overrideProfile = null) {
  const { profile: authProfile } = useAuth();
  const profile = overrideProfile || authProfile;
  
  const toast = useToast();
  
  // Data State
  const [myComplaints, setMyComplaints] = useState([]);
  const [myOutings, setMyOutings] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("student_tab") || "complaints");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Profile Preview (Lazy Loading)
  const [viewedProfile, setViewedProfile] = useState(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  
  // AI Modal State
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [aiError, setAiError] = useState(null); 
  const [rewriteResult, setRewriteResult] = useState(null);
  
  // Forms
  const [complaint, setComplaint] = useState({ category: "", severity: "", description: "" });
  const [newOuting, setNewOuting] = useState({ purpose: "", return_date: "", return_time: "" });
  const [filterCategory, setFilterCategory] = useState("All");

  const menuRef = useRef(null);

  const loadMyData = useCallback(async (uid) => {
    setLoading(true);
    
    // --- DEMO MODE DATA INITIALIZATION ---
    if (profile?.isDemo) {
        setTimeout(() => {
            const demoStudentProfile = {
                id: 'demo-student',
                name: 'Rahul (Demo)',
                roll_no: '21A0501'
            };

            setMyComplaints([
                { 
                    id: 'd1', 
                    user_id: 'demo-student',
                    category: 'Maintenance', 
                    severity: 'High', 
                    description: 'Ceiling fan making loud noise.', 
                    status: 'resolved', 
                    submitted_at: new Date(Date.now() - 86400000).toISOString(), 
                    resolved_at: new Date().toISOString(),
                    closing_note: 'Fan capacitor replaced.',
                    
                    // ✅ FIX 1: Add Student Profile so Card renders "Rahul (Demo)"
                    profile: demoStudentProfile,

                    // ✅ FIX 2: Add Resolved Staff ID & Object so Card renders "Dr. A. Warden"
                    resolved_by_id: 'demo-warden',
                    resolved_staff: {
                        id: 'demo-warden',
                        name: 'Dr. A. Warden',
                        designation: 'Chief Warden',
                        email: 'warden@demo.edu',
                        phone: '9876543210'
                    }
                },
                { 
                    id: 'd2', 
                    user_id: 'demo-student',
                    category: 'Food', 
                    severity: 'Medium', 
                    description: 'Lunch quality was poor today.', 
                    status: 'submitted', 
                    submitted_at: new Date().toISOString(),
                    profile: demoStudentProfile
                }
            ]);
            setMyOutings([]); // Start empty
            setLoading(false);
        }, 800);
        return;
    }
    // -------------------------------------

    try {
      const [cRes, oRes] = await Promise.all([
        complaintService.fetchAll(uid),
        outingService.fetchAll(uid)
      ]);
      setMyComplaints(cRes.data || []);
      setMyOutings(oRes.data || []);
    } catch (error) {
      toast.error("Load Error", error.message);
    } finally {
      setLoading(false);
    }
  }, [toast, profile]);

  useEffect(() => {
    if (profile?.id) {
      loadMyData(profile.id);
    }
  }, [profile, loadMyData]);

  useEffect(() => {
    localStorage.setItem("student_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProfile = async (id, type = 'student') => {
    if (!id) return;
    
    // --- DEMO MODE HANDLER ---
    if (profile?.isDemo) {
        if (type === 'staff') {
            setViewedProfile({ 
                id: 'demo-warden',
                name: 'Dr. A. Warden', 
                designation: 'Chief Warden', 
                phone: '9876500000', 
                email: 'chief.warden@demo.edu', 
                role: 'staff',
                gender: 'Male'
            });
        } else {
            setViewedProfile({
                ...profile, 
                name: 'Rahul (Demo)',
                email: 'rahul.demo@college.edu',
                phone: '9876543210',
                course: 'Computer Science',
                year: '3rd Year',
                room_number: '101-A',
                parent_phone: '9988776655',
                role: 'student',
                gender: 'Male'
            });
        }
        return;
    }

    setIsFetchingProfile(true);
    try {
      const table = type === 'staff' ? 'staff' : 'students';
      let { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data && type === 'staff') {
         data.role = 'staff'; 
      }
      setViewedProfile(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error("Error", "Could not fetch profile details.");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const submitComplaint = async (e) => {
    if (e) e.preventDefault();
    if (!complaint.description.trim()) {
      toast.error("Error", "Description is required");
      return;
    }
    
    setIsSubmitting(true);

    if (profile?.isDemo) {
        setTimeout(() => {
            toast.success("Demo Success", "Complaint added to demo list!");
            setMyComplaints(prev => [{ 
                id: Date.now(), 
                ...complaint, 
                status: 'submitted', 
                submitted_at: new Date().toISOString(),
                // ✅ FIX: Ensure newly added demo complaints also have profile data
                profile: { id: 'demo-student', name: 'Rahul (Demo)', roll_no: '21A0501' }
            }, ...prev]);
            setComplaint({ category: "", severity: "", description: "" });
            setActiveTab("complaints");
            setIsSubmitting(false);
        }, 1000);
        return;
    }

    try {
      await complaintService.create(complaint, profile.id);
      toast.success("Success", "Complaint submitted successfully");
      setComplaint({ category: "", severity: "", description: "" });
      await loadMyData(profile.id);
      setActiveTab("complaints");
    } catch (err) {
      toast.error("Submission Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOuting = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    if (profile?.isDemo) {
        setTimeout(() => {
            toast.success("Demo Success", "Outing requested in demo!");
            setMyOutings(prev => [{ 
                id: Date.now(), 
                purpose: newOuting.purpose, 
                status: 'Submitted', 
                return_time: new Date().toISOString(), 
                submitted_at: new Date().toISOString(),
                profile: { id: 'demo-student', name: 'Rahul (Demo)' }
            }, ...prev]);
            setNewOuting({ purpose: "", return_date: "", return_time: "" });
            setIsSubmitting(false);
        }, 1000);
        return;
    }

    try {
      await outingService.create(newOuting, profile.id);
      toast.success("Request Sent", "Outing request submitted successfully.");
      setNewOuting({ purpose: "", return_date: "", return_time: "" });
      await loadMyData(profile.id);
    } catch (err) {
      toast.error("Submission Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiRewrite = async () => {
     setIsRewriting(true);
     setAiError(null);
     setRewriteResult(null);
     
     if (profile?.isDemo) {
         setTimeout(() => {
             setRewriteResult("This is a polished version of your complaint generated by AI in Demo Mode. It looks much more professional now.");
             setShowRewriteModal(true);
             setIsRewriting(false);
         }, 1500);
         return;
     }

     try {
       const res = await aiService.rewriteComplaint(complaint.description);
       setRewriteResult(res);
       setShowRewriteModal(true);
     } catch (err) { 
       setAiError("AI Error"); 
       setShowRewriteModal(true); 
     } finally { 
       setIsRewriting(false); 
     }
  };

  const applyRewrite = () => {
    setComplaint({ ...complaint, description: rewriteResult });
    setShowRewriteModal(false);
  };

  const handleLogout = async () => {
    if (profile?.isDemo) {
        window.location.reload(); 
        return;
    }
    await supabase.auth.signOut();
  };

  return {
    loading,
    activeTab, setActiveTab,
    isMenuOpen, setIsMenuOpen, menuRef,
    showProfileModal, setShowProfileModal,
    viewedProfile, setViewedProfile,
    isFetchingProfile, fetchProfile, 
    showRewriteModal, setShowRewriteModal,
    isSubmitting, isRewriting, aiError, rewriteResult,
    complaint, setComplaint, myComplaints,
    newOuting, setNewOuting, myOutings,
    filterCategory, setFilterCategory,
    handleAiRewrite, applyRewrite, handleLogout,
    handleCreateComplaint: submitComplaint,
    handleCreateOuting: submitOuting
  };
}