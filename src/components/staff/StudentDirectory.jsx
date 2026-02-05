import { useState, useMemo } from "react";
import * as Icon from "../Icons";
import GlassDropdown from "../ui/GlassDropdown";
import { COURSES, YEARS, OUTING_STATUS } from "../../constants"; 
import ProfilePreviewModal from "../modals/ProfilePreviewModal"; 

export default function StudentDirectory({ logic }) {
  const { 
    allStudents, 
    activeOutings, // ✅ Use activeOutings (Complete list) instead of outings (Paginated)
    dirCourse, setDirCourse, dirYear, setDirYear, 
    setEditingProfile, softDeleteUser, processingId,
    isDarkMode, 
    gender 
  } = logic;

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, student: null });
  const [viewProfile, setViewProfile] = useState(null);

  // --- FILTER LOGIC ---
  const filteredDirectory = useMemo(() => {
    const normalizeYear = (val) => String(val || "").replace(/\D/g, ""); 
    return allStudents.filter(s => {
      const sCourse = s.course || "N/A";
      const sYearRaw = s.year || "";
      const sName = (s.name || "").toLowerCase();
      const sRoll = (s.roll_no || "").toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesGender = s.gender === gender;
      const matchesCourse = dirCourse === "All" || sCourse === dirCourse;
      const matchesYear = dirYear === "All" || normalizeYear(sYearRaw) === normalizeYear(dirYear);
      const matchesSearch = !term || sName.includes(term) || sRoll.includes(term);

      return matchesGender && matchesCourse && matchesYear && matchesSearch;
    });
  }, [allStudents, dirCourse, dirYear, searchTerm, gender]);

  // --- STATUS CHECKER ---
  const getStudentStatus = (studentId) => {
    // ✅ Check against the COMPLETE active list, using 'user_id'
    const activeOuting = activeOutings?.find(o => 
      o.user_id === studentId && 
      (o.status === OUTING_STATUS.APPROVED || o.status === 'Approved')
    );
    
    return activeOuting 
      ? { label: "On Outing", color: "orange", icon: <Icon.Compass size={10} /> } 
      : { label: "On Campus", color: "emerald", icon: <Icon.MapPin size={10} /> };
  };

  // --- ACTIONS ---
  const handleDeleteClick = (e, student) => {
    e.stopPropagation(); 
    setDeleteModal({ show: true, student });
  };

  const confirmDelete = () => {
    if (deleteModal.student) softDeleteUser(deleteModal.student.id);
    setDeleteModal({ show: false, student: null });
  };

  const handleEditClick = (e, student) => {
    e.stopPropagation();
    setEditingProfile(student);
  };

  const handleCardClick = (student) => {
    setViewProfile(student);
  };

  // --- THEME ENGINE ---
  const themeStyles = {
    "--bg-glass": isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.7)",
    "--bg-card": isDarkMode ? "rgba(255, 255, 255, 0.02)" : "#ffffff",
    "--bg-hover": isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
    "--border-color": isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    "--text-main": isDarkMode ? "#ffffff" : "#1e293b",
    "--text-muted": isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#64748b",
    "--input-bg": isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.6)",
    "--input-border": isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    "--shadow-color": isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.05)",
    "--avatar-bg": isDarkMode ? "rgba(255,255,255,0.1)" : "#f1f5f9",
    "--avatar-text": isDarkMode ? "#ffffff" : "#475569",
    "--bg-info": isDarkMode ? "rgba(0,0,0,0.2)" : "#f1f5f9",
  };

  return (
    <div className="animate-fade relative w-full" style={themeStyles}>
      
      {/* TOOLBAR */}
      <div className="directory-toolbar">
         <div className="toolbar-header">
           <div className="icon-badge">
             <Icon.Users size={20} />
           </div>
           <div>
             <h3 className="toolbar-heading">Student Directory</h3>
             <p className="toolbar-sub">
               {filteredDirectory.length} {gender} students
             </p>
           </div>
         </div>

         <div className="toolbar-controls">
            <div className="search-wrapper">
              <div className="search-icon"><Icon.Search size={16} /></div>
              <input 
                type="text" 
                placeholder="Search name or roll no..." 
                className="search-input-glass"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <div style={{ width: 140 }}>
                <GlassDropdown 
                  options={["All", ...COURSES]} 
                  value={dirCourse} 
                  onChange={setDirCourse}
                  placeholder="Course"
                />
              </div>
              <div style={{ width: 110 }}>
                <GlassDropdown 
                  options={["All", ...YEARS]} 
                  value={dirYear} 
                  onChange={setDirYear}
                  placeholder="Year"
                />
              </div>
            </div>
         </div>
      </div>

      {/* GRID */}
      {filteredDirectory.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon"><Icon.Search size={40} /></div>
          <h3 className="empty-title">No students found</h3>
          <p className="empty-desc">Try adjusting your filters or checking the other gender tab.</p>
        </div>
      ) : (
        <div className="directory-grid">
          {filteredDirectory.map(s => {
            const status = getStudentStatus(s.id);
            return (
              <div 
                key={s.id} 
                className="id-card group" 
                onClick={() => handleCardClick(s)}
              >
                <div className="card-top">
                  <div className="flex items-center gap-4">
                     <div className="avatar-box">
                        {s.name?.[0] || <Icon.User size={20} />}
                     </div>
                     <div className="flex flex-col justify-center">
                        <h4 className="student-name">{s.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="student-roll">{s.roll_no || 'No Roll'}</span>
                          <span className={`status-pill ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                     </div>
                  </div>
                  
                  <button 
                    className="edit-btn" 
                    title="Edit Profile"
                    onClick={(e) => handleEditClick(e, s)}
                  >
                    <Icon.Edit size={16} />
                  </button>
                </div>

                <div className="card-info-grid">
                   <div className="info-item">
                      <span className="info-label">Course</span>
                      <span className="info-val">{s.course || '-'}</span>
                   </div>
                   <div className="info-item text-right">
                      <span className="info-label">Year</span>
                      <span className="info-val">{s.year || '-'}</span>
                   </div>
                   <div className="info-item">
                      <span className="info-label">Room</span>
                      <span className="info-val">{s.room_number || 'N/A'}</span>
                   </div>
                   <div className="info-item text-right">
                      <span className="info-label">Contact</span>
                      {s.phone ? (
                        <a href={`tel:${s.phone}`} className="phone-link" onClick={(e) => e.stopPropagation()}>
                           <Icon.Phone size={10} className="inline mr-1"/>{s.phone}
                        </a>
                      ) : <span className="text-muted text-xs">-</span>}
                   </div>
                </div>

                <div className="card-footer">
                   <button 
                     onClick={(e) => handleDeleteClick(e, s)} 
                     className="delete-action"
                     disabled={processingId === s.id}
                   >
                      {processingId === s.id ? <Icon.Loader size={14} className="animate-spin"/> : <Icon.Trash2 size={14} />}
                      <span>Remove Profile</span>
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteModal.show && (
        <div className="dir-modal-backdrop" onClick={() => setDeleteModal({ show: false, student: null })}>
          <div className="dir-modal-content" onClick={e => e.stopPropagation()}>
            <div className="dir-modal-icon-wrapper danger"><Icon.AlertTriangle size={28} /></div>
            <h3 className="dir-modal-title">Remove Student?</h3>
            <p className="dir-modal-desc">
              Are you sure you want to remove <strong>{deleteModal.student?.name}</strong>? They will be hidden from the directory.
            </p>
            <div className="dir-modal-actions">
              <button onClick={() => setDeleteModal({ show: false, student: null })} className="dir-modal-btn cancel">Cancel</button>
              <button onClick={confirmDelete} className="dir-modal-btn confirm">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {viewProfile && (
        <ProfilePreviewModal 
          user={viewProfile} 
          onClose={() => setViewProfile(null)} 
        />
      )}

      <style>{`
        /* PRESERVED STYLES */
        .directory-toolbar {
            display: flex; flex-direction: column; gap: 16px;
            background: var(--bg-glass);
            border: 1px solid var(--border-color);
            border-radius: 16px; padding: 16px; margin-bottom: 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01);
            backdrop-filter: blur(12px);
        }
        @media (min-width: 768px) { .directory-toolbar { flex-direction: row; align-items: center; justify-content: space-between; } }
        
        .toolbar-header { display: flex; align-items: center; gap: 12px; }
        .icon-badge { padding: 10px; background: rgba(99, 102, 241, 0.1); border-radius: 10px; color: #818cf8; }
        .toolbar-heading { margin: 0; font-weight: 700; color: var(--text-main); font-size: 1.1rem; }
        .toolbar-sub { margin: 0; font-size: 0.8rem; color: var(--text-muted); }

        .toolbar-controls { display: flex; flex-direction: column; gap: 12px; width: 100%; }
        @media (min-width: 768px) { .toolbar-controls { flex-direction: row; width: auto; } }

        .search-wrapper { position: relative; width: 100%; }
        @media (min-width: 768px) { .search-wrapper { width: 240px; } }
        
        .search-icon { 
            position: absolute; left: 16px; top: 0; bottom: 0;
            display: flex; align-items: center; color: var(--text-muted);
            pointer-events: none; z-index: 10;
        }
        
        .search-input-glass {
            width: 100%; height: 48px; background: var(--input-bg);
            border: 1px solid var(--input-border); border-radius: 12px; 
            padding: 0 16px 0 44px; color: var(--text-main); font-size: 0.9rem; 
            font-weight: 500; outline: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 5px rgba(0,0,0,0.02); backdrop-filter: blur(10px);
        }
        
        .search-input-glass:focus { 
            border-color: #818cf8; background: var(--bg-hover);
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.15); transform: translateY(-1px);
        }
        
        .search-input-glass::placeholder { color: var(--text-muted); opacity: 0.7; }

        .filter-group { display: flex; gap: 8px; }

        .directory-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) { .directory-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1280px) { .directory-grid { grid-template-columns: repeat(3, 1fr); } }

        .id-card {
            background: var(--bg-card); border: 1px solid var(--border-color);
            border-radius: 16px; padding: 20px; display: flex; flex-direction: column;
            transition: all 0.2s ease; cursor: pointer; box-shadow: 0 4px 6px -1px var(--shadow-color);
        }
        .id-card:hover { 
            transform: translateY(-4px); background: var(--bg-hover);
            border-color: #818cf8; box-shadow: 0 10px 40px -10px var(--shadow-color);
        }

        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

        .avatar-box {
            width: 48px; height: 48px; border-radius: 99px;
            background: var(--avatar-bg); border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 1.2rem; color: var(--avatar-text); flex-shrink: 0;
        }
        .student-name { font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 0 0 6px 8px; line-height: 1.1; }
        .student-roll { font-family: monospace; font-size: 0.75rem; color: var(--text-muted); background: var(--border-color); padding: 2px 6px; border-radius: 8px; display: inline-block; }

        .status-pill {
            font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
            padding: 2px 6px; border-radius: 8px; display: flex; align-items: center; gap: 4px;
        }
        .status-pill.emerald { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-pill.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.2); }

        .empty-container { padding: 60px 20px; text-align: center; opacity: 0.7; }
        .empty-icon { 
            width: 60px; height: 60px; background: var(--bg-glass); border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--text-muted);
        }
        .empty-title { color: var(--text-main); font-weight: 600; margin-bottom: 4px; }
        .empty-desc { color: var(--text-muted); font-size: 0.9rem; }

        .edit-btn {
            background: transparent; border: none; color: var(--text-muted);
            cursor: pointer; transition: 0.2s; padding: 6px; border-radius: 8px;
        }
        .edit-btn:hover { color: #818cf8; background: var(--border-color); }

        .card-info-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
            background: var(--bg-info); border-radius: 12px; padding: 12px; border: 1px solid var(--border-color);
        }
        .info-item { display: flex; flex-direction: column; }
        .info-label { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 2px; }
        .info-val { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
        .phone-link { font-size: 0.85rem; color: #818cf8; text-decoration: none; font-weight: 600; transition: 0.2s; }
        .phone-link:hover { text-decoration: underline; }

        .card-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); text-align: right; }
        .delete-action {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(239, 68, 68, 0.1); color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.2);
            padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;
            cursor: pointer; transition: 0.2s;
        }
        .delete-action:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); }

        .dir-modal-backdrop {
            position: fixed; inset: 0; z-index: 50;
            background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.2s ease-out;
        }
        .dir-modal-content {
            background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px; padding: 24px; width: 90%; max-width: 340px;
            text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .dir-modal-icon-wrapper.danger {
            width: 50px; height: 50px; margin: 0 auto 16px; border-radius: 50%;
            background: rgba(239, 68, 68, 0.1); color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.2);
            display: flex; align-items: center; justify-content: center;
        }
        .dir-modal-title { font-size: 1.2rem; font-weight: 700; color: white; margin-bottom: 8px; }
        .dir-modal-desc { font-size: 0.9rem; color: rgba(255,255,255,0.6); margin-bottom: 24px; line-height: 1.5; }
        .dir-modal-actions { display: flex; gap: 10px; }
        .dir-modal-btn { flex: 1; padding: 10px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; font-size: 0.9rem; }
        .dir-modal-btn.cancel { background: rgba(255,255,255,0.05); color: white; }
        .dir-modal-btn.confirm { background: #ef4444; color: white; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}