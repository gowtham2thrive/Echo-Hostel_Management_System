import { useEffect } from "react";
import ComplaintsSection from "./ComplaintsSection";
import OutingSection from "./OutingSection";
import EditProfileModal from "./EditProfileModal"; 
import ProfilePreviewModal from "./modals/ProfilePreviewModal"; 
import StaffHeader from "./staff/StaffHeader";
import StudentDirectory from "./staff/StudentDirectory";
import StaffApprovals from "./staff/StaffApprovals";
import { useStaffLogic } from "../hooks/useStaffLogic"; 

export default function StaffView({ demoProfile }) {
  const logic = useStaffLogic(demoProfile);

  useEffect(() => {
    const root = document.documentElement;
    if (logic.gender === "Female") {
      root.style.setProperty('--primary', '#ec4899'); 
      root.style.setProperty('--primary-rgb', '236, 72, 153');
    } else {
      root.style.setProperty('--primary', '#6366f1'); 
      root.style.setProperty('--primary-rgb', '99, 102, 241');
    }
  }, [logic.gender]);

  return (
    <div className="container">
      {/* RENDER PROFILE MODAL */}
      {logic.viewedProfile && (
        <ProfilePreviewModal 
            user={logic.viewedProfile} 
            onClose={() => logic.setViewedProfile(null)} 
        />
      )}

      {logic.editingProfile && (
        <EditProfileModal 
            profile={logic.editingProfile} 
            onClose={() => logic.setEditingProfile(null)} 
            onUpdate={logic.handleProfileUpdate} 
        />
      )}

      <StaffHeader logic={logic} />
      
      <div className="tab-container">
        <button 
            onClick={() => logic.setTab("complaints")} 
            className={`tab-btn ${logic.tab === 'complaints' ? 'active' : ''}`}
        >
            Complaints
        </button>
        <button 
            onClick={() => logic.setTab("outings")} 
            className={`tab-btn ${logic.tab === 'outings' ? 'active' : ''}`}
        >
            Outings
        </button>
        {/* Directory & Approvals removed from here. Accessed via Header Menu */}
      </div>
      
      <div className="content-wrapper">
        {logic.tab === "complaints" && (
            <div className="animate-fade">
                <ComplaintsSection logic={logic} />
            </div>
        )}
        
        {logic.tab === "outings" && (
            <div className="animate-fade">
                <OutingSection logic={logic} />
            </div>
        )}
        
        {logic.tab === "directory" && <StudentDirectory logic={logic} />}
        {logic.tab === "approvals" && <StaffApprovals logic={logic} />}
      </div>
    </div>
  );
}