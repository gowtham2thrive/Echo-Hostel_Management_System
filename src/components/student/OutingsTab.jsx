import { useState } from "react"; 
import OutingForm from "./OutingForm";
import OutingsGrid from "../common/OutingsGrid";
import GlassDropdown from "../ui/GlassDropdown";
import * as Icon from "../Icons";
import { TIME_FILTER_OPTIONS } from "../../constants";

export default function OutingsTab({ logic, formatTime, formatDateTime }) {
  // ✅ FIX: Use local state for filtering to ensure it works correctly
  const [timeFilter, setTimeFilter] = useState("All");

  const getFilteredOutings = () => {
    const now = new Date();
    let cutoff = null;
    
    if (timeFilter === "Today") {
        cutoff = new Date();
        cutoff.setHours(0,0,0,0);
    }
    else if (timeFilter === "This Week") { 
      const day = now.getDay(); 
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
      cutoff = new Date(now.setDate(diff)); 
      cutoff.setHours(0,0,0,0); 
    } 
    else if (timeFilter === "Month") {
        cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const safeOutings = logic.myOutings || [];
    if (!cutoff) return safeOutings;
    
    return safeOutings.filter(o => new Date(o.submitted_at) >= cutoff);
  };

  const filteredOutings = getFilteredOutings();

  return (
    <div className="animate-fade">
      <OutingForm logic={logic} formatTime={formatTime} />

      <div className="glass-toolbar mb-4">
        <h3 className="toolbar-title"><Icon.History size={18}/> History</h3>
        <div className="toolbar-actions">
          <div style={{ width: 160 }}>
            <GlassDropdown 
              options={TIME_FILTER_OPTIONS} 
              value={timeFilter}      
              onChange={setTimeFilter} 
              placeholder="Time Period"
              icon={Icon.Calendar}
            />
          </div>
        </div>
      </div>

      <OutingsGrid 
        outings={filteredOutings}
        loading={logic.loading}
        isStaffView={false}
        // ✅ FIX: Connect fetchProfile for Staff previews when clicking approver chips
        onViewProfile={(id) => logic.fetchProfile(id, 'staff')}
        formatTime={formatTime}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}