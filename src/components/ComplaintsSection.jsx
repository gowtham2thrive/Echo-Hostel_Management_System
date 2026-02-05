import { useState, useMemo } from "react";
import { COMPLAINT_STATUS } from "../constants";
import * as Icon from "./Icons"; 
import ComplaintsChart from "./ComplaintsChart";
import AISummaryPanel from "./AISummaryPanel";
import ComplaintsGrid from "./common/ComplaintsGrid"; 
import GlassDropdown from "./ui/GlassDropdown"; 
import { useToast } from "../context/ToastContext"; 

export default function ComplaintsSection({ logic }) {
  const { complaints, handleComplaintStatus, gender, loading } = logic;
  const toast = useToast(); 

  // --- LOCAL STATE ---
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Resolution Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [closingNote, setClosingNote] = useState(""); 

  // --- DERIVE CATEGORIES ---
  const categoryOptions = useMemo(() => {
    const uniqueCats = [...new Set(complaints.map(c => c.category))].filter(Boolean);
    return [{ value: "All", label: "All Categories" }, ...uniqueCats.map(c => ({ value: c, label: c }))];
  }, [complaints]);

  // --- FILTER LOGIC ---
  const filteredComplaints = useMemo(() => {
    const queryLower = searchQuery.toLowerCase();
    return complaints.filter(c => {
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchCategory = categoryFilter === "All" || c.category === categoryFilter;
      const matchSearch = !searchQuery || 
        c.title?.toLowerCase().includes(queryLower) ||
        c.description?.toLowerCase().includes(queryLower) ||
        c.profile?.name?.toLowerCase().includes(queryLower) ||
        c.profile?.roll_no?.toLowerCase().includes(queryLower);
      return matchStatus && matchCategory && matchSearch;
    });
  }, [complaints, statusFilter, categoryFilter, searchQuery]);

  // --- ACTIONS ---
  
  const handleGridUpdate = async (id, status, note) => {
    try {
        await handleComplaintStatus(id, status, note);
        if(toast) {
           if(status === COMPLAINT_STATUS.ACKNOWLEDGED) toast.success("Updated", "Complaint acknowledged.");
           else if(status === COMPLAINT_STATUS.RESOLVED) toast.success("Resolved", "Issue resolved.");
        }
    } catch(e) {
        console.error(e);
        if(toast) toast.error("Error", "Failed to update status.");
    }
  };

  const handleViewProfile = (data, role) => {
     if (typeof data === 'object' && data !== null) {
        logic.setViewedProfile({ ...data, role });
     } else if (typeof data === 'string') {
        logic.fetchUserProfile(data, role); 
     }
  };

  const handleBatchAction = async (ids, status) => {
    if (!ids || ids.length === 0) return;
    if (status === "BATCH_RESOLVE_INTENT") {
        setPendingAction({ type: 'batch', ids: ids });
        setClosingNote("");
        setModalOpen(true);
        return;
    }
    try {
      await Promise.all(ids.map(id => handleComplaintStatus(id, status)));
      if(toast) toast.success("Batch Update", `Updated ${ids.length} complaints.`);
    } catch (err) {
      console.error(err);
      if(toast) toast.error("Error", "Failed to update some complaints.");
    }
  };

  const confirmResolve = async () => {
    if (!pendingAction) return;
    const ids = pendingAction.ids;
    const note = closingNote.trim() ? closingNote : "Resolved by staff.";
    try {
      await Promise.all(ids.map(id => handleComplaintStatus(id, COMPLAINT_STATUS.RESOLVED, note)));
      if(toast) toast.success("Resolved", `Marked ${ids.length} issue(s) as resolved.`);
    } catch (err) {
      console.error(err);
      if(toast) toast.error("Error", "Failed to resolve issues.");
    } finally {
      setModalOpen(false);
      setPendingAction(null);
      setClosingNote("");
    }
  };

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: COMPLAINT_STATUS.SUBMITTED, label: "New / Pending" },
    { value: COMPLAINT_STATUS.ACKNOWLEDGED, label: "In Progress" },
    { value: COMPLAINT_STATUS.RESOLVED, label: "Resolved" }
  ];

  return (
    <div className="complaint-section-wrapper">
      
      {/* RESOLUTION MODAL (Batch Only) */}
      {modalOpen && (
        <div className="cs-modal-overlay">
          <div className="cs-modal-card animate-scale-up">
             <div className="cs-modal-icon-header">
                <div className="icon-circle success"><Icon.Check size={28} strokeWidth={3} /></div>
             </div>
             <h3 className="cs-modal-title">
                Resolve {pendingAction?.ids?.length > 1 ? `${pendingAction.ids.length} Issues` : 'Issue'}
             </h3>
             <p className="cs-modal-subtitle">Add a closing note. This will be visible to the student.</p>
             <div className="cs-input-group">
                <textarea 
                    className="glass-textarea"
                    placeholder="e.g. Technician visited and fixed the router..."
                    value={closingNote}
                    onChange={(e) => setClosingNote(e.target.value)}
                    rows={3}
                    autoFocus
                />
             </div>
             <div className="cs-modal-actions-row">
               <button onClick={() => setModalOpen(false)} className="glass-btn-sm ghost">Cancel</button>
               <button onClick={confirmResolve} className="glass-btn-sm success">Confirm</button>
             </div>
          </div>
        </div>
      )}

      {/* AI SUMMARY */}
      <div className="ai-block-wrapper">
         <AISummaryPanel complaints={complaints} onBatchAction={handleBatchAction} />
      </div>

      {/* CHARTS */}
      <div className="chart-clean-container">
         <ComplaintsChart gender={gender} />
      </div>

      {/* MANAGEMENT PANEL */}
      <div className="history-panel glass-panel">
         <div className="history-header">
            <div className="title-section">
                <div className="icon-box"><Icon.AlertTriangle size={20} /></div>
                <div><h3>Complaints</h3><span className="subtitle">{filteredComplaints.length} issues found</span></div>
            </div>
            <div className="controls-wrapper">
                <div className="search-bar">
                    <div className="search-icon-wrapper"><Icon.Search size={16} /></div>
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="filters-group">
                   <div className="dropdown-wrapper"><GlassDropdown options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} /></div>
                   <div className="dropdown-wrapper"><GlassDropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} /></div>
                </div>
            </div>
         </div>
         
         <div className="grid-wrapper">
            <ComplaintsGrid 
               complaints={filteredComplaints} 
               loading={loading}
               isStaffView={true} 
               onViewStudent={(data) => handleViewProfile(data, 'student')}
               onViewStaff={(id) => handleViewProfile(id, 'staff')}
               onUpdateStatus={handleGridUpdate}
            />
         </div>
      </div>

      <style>{`
        /* Styles preserved as provided */
        .complaint-section-wrapper { display: flex; flex-direction: column; gap: 40px; padding-bottom: 80px; }
        .ai-block-wrapper { width: 100%; }
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
        .filters-group { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .dropdown-wrapper { min-width: 140px; flex: 1; }
        @media (min-width: 768px) { .controls-wrapper { flex-direction: row; align-items: center; width: auto; flex-wrap: wrap; } .search-bar { width: auto; flex: 1; } }
        .search-bar { display: flex; align-items: center; gap: 10px; background: var(--glass-field-bg, rgba(255,255,255,0.05)); border: 1px solid var(--glass-border); border-radius: 12px; padding: 0 14px; height: 45px; width: 100%; min-width: 220px; color: var(--text-muted); overflow: hidden; box-sizing: border-box; }
        .search-bar:focus-within { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1); color: var(--primary); }
        .search-icon-wrapper { display: flex; align-items: center; justify-content: center; flex-shrink: 0; opacity: 0.7; }
        .search-bar input { background: transparent; border: none; outline: none; box-shadow: none; color: var(--text-main); font-size: 0.9rem; flex: 1; width: auto; height: auto; padding: 0; margin: 0; }
        .cs-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease; padding: 20px; }
        .cs-modal-card { width: 100%; max-width: 400px; background: #1e293b; border: 1px solid var(--glass-border); border-radius: 24px; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; align-items: center; text-align: center; }
        @media (prefers-color-scheme: light) { .cs-modal-card { background: #ffffff !important; border-color: #e2e8f0; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15); } .cs-modal-title { color: #0f172a !important; } .cs-modal-subtitle { color: #64748b !important; } }
        .cs-modal-icon-header { margin-bottom: 16px; }
        .icon-circle { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
        .icon-circle.success { background: rgba(16, 185, 129, 0.15); color: #10b981; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.05); }
        .cs-modal-title { font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin: 0 0 6px 0; }
        .cs-modal-subtitle { font-size: 0.9rem; color: var(--text-muted); margin: 0 0 20px 0; }
        .cs-input-group { width: 100%; margin-bottom: 24px; }
        .glass-textarea { width: 100%; padding: 14px; border-radius: 12px; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; font-family: inherit; font-size: 0.95rem; resize: none; outline: none; transition: all 0.2s ease; box-sizing: border-box; }
        .glass-textarea:focus { background: #1e293b; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15); }
        .glass-textarea::placeholder { color: rgba(255, 255, 255, 0.4); }
        @media (prefers-color-scheme: light) { .glass-textarea { background: #0f172a !important; border-color: #334155 !important; color: #ffffff !important; } }
        .cs-modal-actions-row { display: flex; gap: 12px; width: 100%; }
        .glass-btn-sm { flex: 1; padding: 12px; border-radius: 10px; border: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .glass-btn-sm.ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--glass-border); }
        .glass-btn-sm.ghost:hover { background: rgba(255,255,255,0.05); color: var(--text-main); }
        .glass-btn-sm.success { background: #10b981; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .glass-btn-sm.success:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}