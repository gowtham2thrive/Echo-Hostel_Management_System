import { useState, useMemo } from "react";
import { OUTING_STATUS } from "../constants";
import ActiveOutBlock from "./staff/ActiveOutBlock"; 
import OutingChart from "./OutingChart"; 
import OutingsGrid from "./common/OutingsGrid"; 
import GlassDropdown from "./ui/GlassDropdown"; 
import * as Icon from "./Icons";
import { useToast } from "../context/ToastContext";
import { generateOutingHistoryPDF } from "../utils/OutingHistoryPDF";

export default function OutingSection({ logic }) {
  const { outings, handleOutingStatus, gender, loading, setViewedProfile, fetchUserProfile } = logic;
  const toast = useToast();

  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [timeFilter, setTimeFilter] = useState("All"); 
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = useMemo(() => {
    const now = new Date();
    const queryLower = searchQuery.toLowerCase();
    return outings.filter(o => {
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      let matchTime = true;
      if (timeFilter !== "All") {
        const outDate = new Date(o.submitted_at);
        const diffHours = (now - outDate) / (1000 * 60 * 60);
        if (timeFilter === "24h") matchTime = diffHours <= 24;
        else if (timeFilter === "7d") matchTime = diffHours <= 24 * 7;
        else if (timeFilter === "30d") matchTime = diffHours <= 24 * 30;
      }
      const matchSearch = !searchQuery || 
        o.profile?.name?.toLowerCase().includes(queryLower) || 
        o.profile?.roll_no?.toLowerCase().includes(queryLower);
      return matchStatus && matchTime && matchSearch;
    });
  }, [outings, statusFilter, timeFilter, searchQuery]);

  const handleMarkReturned = (id) => handleOutingStatus(id, OUTING_STATUS.COMPLETED);
  
  const handleDecision = (id, status) => {
    handleOutingStatus(id, status);
    setSelectedIds(prev => prev.filter(selId => selId !== id));
  };

  const handleBulkAction = async (status) => {
    const count = selectedIds.length;
    try {
        await Promise.all(selectedIds.map(id => handleOutingStatus(id, status)));
        setSelectedIds([]); 
        toast.success("Batch Update", `Successfully marked ${count} requests as ${status}.`);
    } catch (err) {
        console.error(err);
        toast.error("Batch Failed", "Could not complete all updates.");
    }
  };

  const handleDownloadHistory = () => {
    if (filteredRequests.length === 0) {
        toast.error("Export Failed", "No records found to download.");
        return;
    }
    generateOutingHistoryPDF(filteredRequests, gender);
    toast.success("Download Started", "History report generated successfully.");
  };

  const handleViewProfile = (data, role) => {
    if (typeof data === 'object' && data !== null) {
       logic.setViewedProfile({ ...data, role });
    } else if (typeof data === 'string') {
       if (logic.fetchUserProfile) logic.fetchUserProfile(data, role);
    }
  };

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: OUTING_STATUS.SUBMITTED, label: "Pending" },
    { value: OUTING_STATUS.APPROVED, label: "Approved" },
    { value: OUTING_STATUS.REJECTED, label: "Rejected" },
    { value: OUTING_STATUS.COMPLETED, label: "Completed" }
  ];

  const timeOptions = [
    { value: "All", label: "All Time" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" }
  ];

  return (
    <div className="outing-section-wrapper animate-fade">
      
      <ActiveOutBlock 
        outings={outings} 
        gender={gender} 
        onReturn={handleMarkReturned}
        onViewProfile={(p) => handleViewProfile(p, 'student')}
      />

      <div className="chart-clean-container">
         <OutingChart gender={gender} outings={outings} />
      </div>

      <div className="history-panel glass-panel">
         <div className="history-header">
            <div className="title-section">
                <div className="icon-box"><Icon.History size={20} /></div>
                <div><h3>Requests</h3><span className="subtitle">{filteredRequests.length} records found</span></div>
            </div>
            <div className="controls-wrapper">
                <div className="search-bar">
                    <div className="search-icon-wrapper"><Icon.Search size={16} /></div>
                    <input type="text" placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoComplete="off"/>
                </div>
                <div className="filters-group">
                   <div className="dropdown-wrapper"><GlassDropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} /></div>
                   <div className="dropdown-wrapper"><GlassDropdown options={timeOptions} value={timeFilter} onChange={setTimeFilter} /></div>
                   <button onClick={handleDownloadHistory} className="icon-btn-square" title="Download History PDF"><Icon.Download size={18} /></button>
                </div>
            </div>
         </div>

         <div className="grid-wrapper">
            <OutingsGrid 
                outings={filteredRequests}
                loading={loading}
                isStaffView={true}
                selectedIds={selectedIds}
                onSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                onApprove={handleDecision}
                onReject={handleDecision}
                onViewProfile={(data) => {
                    const role = data.roll_no ? 'student' : 'staff';
                    handleViewProfile(data, role);
                }}
            />
         </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="floating-dock-container">
          <div className="glass-dock animate-slide-up">
            <div className="dock-info"><div className="count-circle">{selectedIds.length}</div><span>Selected</span></div>
            <div className="dock-actions">
               <button onClick={() => setSelectedIds([])} className="dock-btn ghost">Cancel</button>
               <div className="divider-vertical"></div>
               <button onClick={() => handleBulkAction(OUTING_STATUS.REJECTED)} className="dock-btn danger">Reject</button>
               <button onClick={() => handleBulkAction(OUTING_STATUS.APPROVED)} className="dock-btn success">Approve</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Styles preserved as provided */
        .outing-section-wrapper { display: flex; flex-direction: column; gap: 40px; padding-bottom: 80px; }
        .chart-clean-container { padding: 0; }
        .grid-wrapper { margin-top: 32px; }
        .history-panel { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .history-header { display: flex; flex-direction: column; gap: 16px; border-bottom: 1px solid var(--glass-border); padding-bottom: 24px; }
        @media (min-width: 1024px) { .history-header { flex-direction: row; justify-content: space-between; align-items: center; } }
        .title-section { display: flex; align-items: center; gap: 12px; }
        .icon-box { width: 42px; height: 42px; border-radius: 12px; background: rgba(var(--primary-rgb), 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; }
        .title-section h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
        .subtitle { font-size: 0.8rem; color: var(--text-muted); display: block; margin-top: 2px; }
        .controls-wrapper { display: flex; flex-direction: column; gap: 12px; width: 100%; }
        .search-bar { display: flex; align-items: center; gap: 10px; background: var(--glass-field-bg, rgba(255,255,255,0.05)); border: 1px solid var(--glass-border); border-radius: 12px; padding: 0 14px; height: 45px; width: 100%; color: var(--text-muted); overflow: hidden; box-sizing: border-box; }
        .search-bar:focus-within { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1); color: var(--primary); }
        .search-icon-wrapper { display: flex; align-items: center; justify-content: center; flex-shrink: 0; opacity: 0.7; }
        .search-bar input { background: transparent !important; border: none !important; outline: none !important; box-shadow: none !important; color: var(--text-main); font-size: 0.9rem; flex: 1; width: auto; height: auto; padding: 0; margin: 0; }
        .filters-group { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .dropdown-wrapper { min-width: 130px; flex: 1; }
        .icon-btn-square { width: 45px; height: 45px; min-width: 45px; border-radius: 12px; background: rgba(var(--primary-rgb), 0.1); border: 1px solid rgba(var(--primary-rgb), 0.2); color: var(--primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; flex-shrink: 0; padding: 0; margin: 0; box-sizing: border-box; }
        .icon-btn-square:hover { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3); transform: translateY(-1px); }
        .floating-dock-container { position: fixed; bottom: 24px; left: 0; right: 0; display: flex; justify-content: center; z-index: 100; pointer-events: none; }
        .glass-dock { pointer-events: auto; display: flex; align-items: center; gap: 16px; padding: 8px 8px 8px 20px; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .dock-info { display: flex; align-items: center; gap: 10px; color: white; font-weight: 600; font-size: 0.9rem; }
        .count-circle { background: var(--primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
        .dock-actions { display: flex; align-items: center; gap: 8px; }
        .dock-btn { padding: 10px 20px; border-radius: 30px; border: none; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
        .dock-btn.ghost { background: transparent; color: #94a3b8; padding: 10px 14px; }
        .dock-btn.danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .dock-btn.success { background: #10b981; color: white; }
        .divider-vertical { width: 1px; height: 24px; background: rgba(255,255,255,0.1); margin: 0 4px; }
        @media (min-width: 768px) { .controls-wrapper { flex-direction: row; align-items: center; width: auto; flex-wrap: wrap; } .search-bar { width: auto; flex: 1; } }
      `}</style>
    </div>
  );
}