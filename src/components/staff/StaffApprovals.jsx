import { useState } from "react";
// ✅ 5. Import icons from file
import * as Icon from "../Icons";

export default function StaffApprovals({ logic }) {
  const { 
    pendingUsers, pendingUpdates, approveUser, rejectUser, 
    approveUpdate, rejectUpdate, processingId, gender 
  } = logic;

  const [activeTab, setActiveTab] = useState("accounts");
  
  // Custom Modal State
  const [modal, setModal] = useState({ show: false, title: "", message: "", action: null, type: "danger" });

  const filteredAccounts = pendingUsers.filter(u => u.gender === gender);
  const filteredUpdates = pendingUpdates.filter(u => u.gender === gender);

  // --- ACTIONS ---
  const triggerRejectUser = (user) => {
    setModal({
      show: true,
      title: "Reject & Delete User?",
      message: `Are you sure you want to permanently delete the account for ${user.name}? This action cannot be undone.`,
      action: () => rejectUser(user),
      type: "danger"
    });
  };

  const triggerRejectUpdate = (id) => {
    setModal({
      show: true,
      title: "Reject Update?",
      message: "This will discard the profile changes requested by the student.",
      action: () => rejectUpdate(id),
      type: "warning"
    });
  };

  const confirmAction = () => {
    if (modal.action) modal.action();
    setModal({ ...modal, show: false });
  };

  // --- ✅ 1. EMPTY STATE PLACEHOLDER ---
  if (filteredAccounts.length === 0 && filteredUpdates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-fade">
        <div className="empty-state-icon">
          <Icon.Inbox size={48} className="text-muted" />
        </div>
        <h3 className="text-xl font-bold text-main mb-2 mt-4">All Caught Up!</h3>
        <p className="text-muted text-m max-w-xs mx-auto">
          There are no pending approvals or updates for {gender} students at the moment.
        </p>
        
        <style>{`
          .empty-state-icon {
            width: auto; height: auto;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade relative">
      
      {/* TABS */}
      <div className="tab-container">
        <button onClick={() => setActiveTab("accounts")} className={`tab-btn ${activeTab === "accounts" ? "active" : ""}`}>
          <Icon.UserPlus size={16} /> New Signups
          {filteredAccounts.length > 0 && <span className="tab-count">{filteredAccounts.length}</span>}
        </button>
        <button onClick={() => setActiveTab("updates")} className={`tab-btn ${activeTab === "updates" ? "active" : ""}`}>
          <Icon.Edit size={16} /> Profile Updates
          {filteredUpdates.length > 0 && <span className="tab-count">{filteredUpdates.length}</span>}
        </button>
      </div>

      {/* GRID LAYOUT */}
      <div className="approvals-grid">
        
        {/* === NEW ACCOUNTS === */}
        {activeTab === "accounts" && filteredAccounts.map((user) => (
          <div key={user.id} className="approval-card border-l-4 border-indigo-500">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="avatar-placeholder">
                  {user.name?.[0] || <Icon.User size={20} />}
                </div>
                <div className="flex flex-col">
                  <h3 className="user-name">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                    {/* ✅ 3. CLICK TO CALL LINK */}
                    <a href={`tel:${user.phone}`} className="contact-link" title="Call Now">
                      <Icon.Phone size={10} /> {user.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="details-box">
              {user.role === 'student' ? (
                // ✅ 2. FIXED LAYOUT: 2x2 Grid ensures Year aligns correctly
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div className="detail-item">
                    <span className="label">Roll No</span>
                    <span className="value font-mono">{user.roll_no}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Room</span>
                    <span className="value">{user.room_number || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Course</span>
                    <span className="value">{user.course}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Year</span>
                    <span className="value">{user.year}</span>
                  </div>
                </div>
              ) : (
                <div className="detail-item">
                  <span className="label">Designation</span>
                  <span className="value">{user.designation}</span>
                </div>
              )}
            </div>

            <div className="actions-row">
              <button 
                onClick={() => triggerRejectUser(user)} 
                disabled={processingId === user.id} 
                className="btn-glass reject"
              >
                <Icon.X size={16} /> Reject
              </button>
              <button 
                onClick={() => approveUser(user)} 
                disabled={processingId === user.id} 
                className="btn-glass approve"
              >
                {processingId === user.id ? <Icon.Loader size={16} className="animate-spin" /> : <><Icon.Check size={16} /> Approve</>}
              </button>
            </div>
          </div>
        ))}

        {/* === UPDATES === */}
        {activeTab === "updates" && filteredUpdates.map((req) => {
          const changes = req.pending_update || {};
          const fields = [
            { key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' },
            { key: 'roll_no', label: 'Roll No' }, { key: 'room_number', label: 'Room' },
            { key: 'course', label: 'Course' }, { key: 'year', label: 'Year' }
          ];

          return (
            <div key={req.id} className="approval-card border-l-4 border-amber-500">
              <div className="card-header justify-between">
                <div><h3 className="user-name">{req.name}</h3><div className="update-badge">Profile Update Request</div></div>
                <div className="icon-circle amber"><Icon.Edit size={16} /></div>
              </div>

              <div className="diff-container">
                {fields.map(field => {
                  const oldVal = req[field.key];
                  const newVal = changes[field.key];
                  if (newVal && newVal !== oldVal) {
                    return (
                      <div key={field.key} className="diff-row">
                        <div className="diff-label">{field.label}</div>
                        <div className="diff-values">
                          <span className="val-old">{oldVal || '-'}</span>
                          <Icon.ArrowRight size={12} className="opacity-30" />
                          <span className="val-new">{newVal}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <div className="actions-row">
                <button 
                  onClick={() => triggerRejectUpdate(req.id)} 
                  disabled={processingId === req.id} 
                  className="btn-glass reject"
                >
                  <Icon.X size={16} /> Reject
                </button>
                <button 
                  onClick={() => approveUpdate(req)} 
                  disabled={processingId === req.id} 
                  className="btn-glass approve"
                >
                  {processingId === req.id ? <Icon.Loader size={16} className="animate-spin" /> : <><Icon.Check size={16} /> Approve</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ 4. CUSTOM CONFIRMATION MODAL */}
      {modal.show && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className={`modal-icon-wrapper ${modal.type}`}>
              <Icon.AlertTriangle size={32} />
            </div>
            <h3 className="modal-title">{modal.title}</h3>
            <p className="modal-message">{modal.message}</p>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel" 
                onClick={() => setModal({ ...modal, show: false })}
              >
                Cancel
              </button>
              <button 
                className={`modal-btn confirm ${modal.type}`} 
                onClick={confirmAction}
              >
                {modal.type === 'danger' ? 'Yes, Delete' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STYLES --- */}
      <style>{`
        /* --- MODAL --- */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          background: #1a1a2e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px; width: 90%; max-width: 360px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-icon-wrapper {
          width: 60px; height: 60px; margin: 0 auto 16px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
        }
        .modal-icon-wrapper.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .modal-icon-wrapper.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
        
        .modal-title { font-size: 1.25rem; font-weight: 800; color: white; margin-bottom: 8px; }
        .modal-message { font-size: 0.9rem; color: rgba(255,255,255,0.6); margin-bottom: 24px; line-height: 1.5; }
        
        .modal-actions { display: flex; gap: 12px; }
        .modal-btn { flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; border: none; }
        .modal-btn.cancel { background: rgba(255,255,255,0.05); color: white; }
        .modal-btn.cancel:hover { background: rgba(255,255,255,0.1); }
        
        .modal-btn.confirm.danger { background: #ef4444; color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
        .modal-btn.confirm.danger:hover { background: #dc2626; }
        
        .modal-btn.confirm.warning { background: #f59e0b; color: white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
        .modal-btn.confirm.warning:hover { background: #d97706; }

        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* --- EXISTING LAYOUT --- */
        .tab-container { display: flex; gap: 8px; margin-bottom: 24px; background: rgba(255,255,255,0.02); padding: 4px; border-radius: 12px; border: 1px solid var(--glass-border); width: fit-content; }
        .tab-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: none; background: transparent; color: var(--text-muted); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
        .tab-btn.active { background: rgba(255,255,255,0.1); color: var(--text-main); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .tab-count { background: var(--primary); color: white; padding: 2px 6px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; }
        
        .approvals-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 1024px) { .approvals-grid { grid-template-columns: repeat(2, 1fr); } }
        
        .approval-card { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; transition: transform 0.2s; }
        .approval-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.15); }
        
        .card-header { display: flex; align-items: center; margin-bottom: 16px; }
        .avatar-placeholder { width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,0.05); color: var(--text-main); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }
        .user-name { font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 0; line-height: 1.2; }
        
        .contact-info { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted); opacity: 0.8; }
        .contact-link { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted); opacity: 0.8; text-decoration: none; transition: 0.2s; }
        .contact-link:hover { color: var(--primary); opacity: 1; text-decoration: underline; }

        .role-badge { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px; }
        .role-badge.staff { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
        .role-badge.student { background: rgba(99, 102, 241, 0.1); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.2); }
        
        .update-badge { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #f59e0b; margin-top: 4px; }
        .icon-circle.amber { width: 32px; height: 32px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center; }
        
        .details-box { background: rgba(255,255,255,0.02); border-radius: 12px; padding: 12px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 16px; flex: 1; }
        .detail-item { display: flex; flex-direction: column; }
        .label { font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 2px; }
        .value { font-size: 0.9rem; font-weight: 500; color: var(--text-main); }
        
        .diff-container { background: rgba(0,0,0,0.2); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 16px; flex: 1; }
        .diff-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .diff-row:last-child { border-bottom: none; }
        .diff-label { background: rgba(255,255,255,0.03); padding: 10px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: flex; align-items: center; justify-content: flex-end; text-align: right; }
        .diff-values { padding: 10px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
        .val-old { text-decoration: line-through; color: #ef4444; opacity: 0.6; font-size: 0.8rem; }
        .val-new { color: #10b981; font-weight: 700; }
        
        .actions-row { display: flex; gap: 10px; }
        .btn-glass { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
        .btn-glass.reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .btn-glass.reject:hover:not(:disabled) { background: rgba(239, 68, 68, 0.2); }
        .btn-glass.approve { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .btn-glass.approve:hover:not(:disabled) { background: rgba(16, 185, 129, 0.2); }
        .btn-glass:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}