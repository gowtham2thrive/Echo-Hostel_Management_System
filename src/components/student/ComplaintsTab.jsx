import ComplaintForm from "./ComplaintForm";
import ComplaintsGrid from "../common/ComplaintsGrid"; // ✅ Imported New Grid
import GlassDropdown from "../ui/GlassDropdown";
import ProfilePreviewModal from "../modals/ProfilePreviewModal"; 
import AiRewriteModal from "../modals/AiRewriteModal"; 
import * as Icon from "../Icons";
import { CATEGORY_OPTIONS } from "../../constants";

export default function ComplaintsTab({ logic }) {
  
  const handleViewStaff = (id) => logic.fetchProfile(id, 'staff'); // Ensure this fetches by ID
  const handleViewStudent = (profile) => logic.setViewedProfile(profile);

  const historyFilterOptions = [
    { value: "All", label: "All Categories", icon: <Icon.Filter size={16}/> },
    ...CATEGORY_OPTIONS
  ];

  const filteredComplaints = logic.filterCategory === "All" 
    ? (logic.myComplaints || []) 
    : (logic.myComplaints || []).filter(c => c.category === logic.filterCategory);

  return (
    <div className="animate-fade">
      
      {/* MODALS */}
      {logic.viewedProfile && (
        <ProfilePreviewModal 
          user={logic.viewedProfile} 
          isLoading={logic.isFetchingProfile}
          onClose={() => logic.setViewedProfile(null)} 
        />
      )}

      {/* ✅ FIX: Passed missing props (suggestedText, error, loading) to the modal */}
      {logic.showRewriteModal && (
        <AiRewriteModal 
          originalText={logic.complaint.description}
          suggestedText={logic.rewriteResult}      // <--- Added this
          isLoading={logic.isRewriting}            // <--- Added this
          error={logic.aiError}                    // <--- Added this
          onRegenerate={logic.handleAiRewrite}     // <--- Added this
          onAccept={(newText) => {
             // If the modal passes back text, use it. Otherwise use the stored result.
             const textToUse = typeof newText === 'string' ? newText : logic.rewriteResult;
             logic.setComplaint({ ...logic.complaint, description: textToUse });
             logic.setShowRewriteModal(false);
          }}
          onClose={() => logic.setShowRewriteModal(false)}
        />
      )}

      <ComplaintForm logic={logic} />
      
      <div className="glass-toolbar mb-4">
        <h3 className="toolbar-title"><Icon.History size={18}/> Your History</h3>
        <div className="toolbar-actions">
          <div style={{ width: 170 }}>
            <GlassDropdown 
              options={historyFilterOptions} 
              value={logic.filterCategory} 
              onChange={logic.setFilterCategory}
              placeholder="Filter Category"
            />
          </div>
        </div>
      </div>

      {/* ✅ USING NEW COMMON GRID */}
      <ComplaintsGrid 
        complaints={filteredComplaints}
        loading={logic.loading}
        onViewStudent={handleViewStudent}
        onViewStaff={handleViewStaff}
        isStaffView={false} // Student View
      />
      
    </div>
  );
}