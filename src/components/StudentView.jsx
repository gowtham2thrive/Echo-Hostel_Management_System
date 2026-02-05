import { useEffect } from "react";
// Contexts
import { useAuth } from "../context/AuthContext"; 
import { useTheme } from "../context/ThemeContext"; 

// Hooks & Utils
import { useStudentLogic } from "../hooks/useStudentLogic"; 

// Components
import StudentHeader from "./student/StudentHeader";
import ComplaintsTab from "./student/ComplaintsTab";
import OutingsTab from "./student/OutingsTab";
import EditProfileModal from "./EditProfileModal";
import ProfilePreviewModal from "./modals/ProfilePreviewModal"; 
import { formatTime, formatDateTime } from "../utils/formatters";

export default function StudentView({ demoProfile }) {
  const { profile: authProfile, refreshProfile } = useAuth();
  
  // Use Demo profile if provided, otherwise real profile
  const profile = demoProfile || authProfile;
  
  const { theme } = useTheme(); 
  const logic = useStudentLogic(profile);

  // 🎨 Theme Effect: Change primary color based on Gender
  useEffect(() => {
    const root = document.documentElement;
    if (profile?.gender === "Female") {
      root.style.setProperty('--primary', '#ec4899'); 
      root.style.setProperty('--primary-rgb', '236, 72, 153');
    } else {
      root.style.setProperty('--primary', '#6366f1'); 
      root.style.setProperty('--primary-rgb', '99, 102, 241');
    }
  }, [profile?.gender]);

  return (
    <div className="container">
      {/* --- TOAST NOTIFICATION --- */}
      {logic.toast && (
        <div className="toast-container animate-fade-in-up">
          <div className={`toast toast-${logic.toast.type}`}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{logic.toast.title}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{logic.toast.msg}</div>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <StudentHeader profile={profile} logic={logic} />

      {/* --- MODALS --- */}
      {/* Renders the fetched profile (e.g., the Staff who approved the outing) */}
      {logic.viewedProfile && (
        <ProfilePreviewModal 
          user={logic.viewedProfile} 
          onClose={() => logic.setViewedProfile(null)} 
        />
      )}

      {logic.showProfileModal && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => logic.setShowProfileModal(false)} 
          onUpdate={refreshProfile} 
        />
      )}
      
      {/* --- TABS --- */}
      <div className="tab-container">
        <button 
          onClick={() => { logic.setActiveTab("complaints"); localStorage.setItem("student_tab", "complaints"); }} 
          className={`tab-btn ${logic.activeTab === 'complaints' ? 'active' : ''}`}
        >
          Complaints
        </button>
        <button 
          onClick={() => { logic.setActiveTab("outings"); localStorage.setItem("student_tab", "outings"); }} 
          className={`tab-btn ${logic.activeTab === 'outings' ? 'active' : ''}`}
        >
          Outings
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="content-wrapper">
         {logic.activeTab === "complaints" && (
            <ComplaintsTab logic={logic} formatDateTime={formatDateTime} />
         )}
          
         {logic.activeTab === "outings" && (
            <OutingsTab logic={logic} formatTime={formatTime} formatDateTime={formatDateTime} />
         )}
      </div>
    </div>
  );
}