import React, { useState, useMemo } from "react";
import GlassDropdown from "../ui/GlassDropdown";
import * as Icon from "../Icons";
import { COURSE_OPTIONS, YEAR_OPTIONS, OUTING_STATUS } from "../../constants";
import { generateActiveOutingsPDF } from "../../utils/generateActiveOutingsPDF";
// ✅ Added Toast Import
import { useToast } from "../../context/ToastContext";

export default function ActiveOutBlock({ outings, gender, onReturn, onViewProfile }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  
  // ✅ Initialize Toast Hook
  const toast = useToast();

  const formatOptions = (items, defaultLabel) => [
    { value: "All", label: defaultLabel },
    ...(items || []).map(item => (typeof item === 'object' ? item : { value: item, label: item }))
  ];

  const activeStudents = useMemo(() => {
    return (outings || []).filter(o => {
      // Robust status check
      const isApproved = o.status === OUTING_STATUS.APPROVED || o.status?.toLowerCase() === "approved"; 
      
      const matchesGender = gender === "All" || o.profile?.gender === gender;
      const matchesCourse = courseFilter === "All" || o.profile?.course === courseFilter;
      const matchesYear = yearFilter === "All" || String(o.profile?.year) === String(yearFilter);
      
      return isApproved && matchesGender && matchesCourse && matchesYear;
    });
  }, [outings, gender, courseFilter, yearFilter]);

  const handleDownload = (e) => {
    e.stopPropagation();
    if (activeStudents.length === 0) {
        // ✅ Replaced alert with Toast
        toast.error("Download Failed", "No active students to download.");
        return;
    }
    generateActiveOutingsPDF(activeStudents, gender);
    toast.success("Download Started", "Active students report generated.");
  };

  return (
    <div className={`active-block-container ${isExpanded ? 'is-expanded' : ''}`}>
      {/* --- HEADER --- */}
      <div className="active-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-left">
          <div className="live-indicator"><div className="pulse-dot"></div></div>
          <div className="title-group">
            <span className="label-tiny">LIVE MONITOR</span>
            <h3 className="main-count">
              <b>{activeStudents.length}</b> {gender === 'All' ? 'Total' : gender} Students Out
            </h3>
          </div>
        </div>
        <Icon.ChevronDown size={20} className={`chevron ${isExpanded ? 'rotated' : ''}`} />
      </div>

      {/* --- EXPANDABLE CONTENT --- */}
      <div className={`expandable-wrapper ${isExpanded ? 'open' : ''}`}>
        <div className="expandable-inner">
          
          <div className="filter-bar">
            <div className="filters-left">
                <div style={{ width: 135}}>
                  <GlassDropdown 
                      options={formatOptions(COURSE_OPTIONS, "All Courses")}
                      value={courseFilter} 
                      onChange={setCourseFilter} 
                  />
                </div>
                <div style={{ width: 135 }}>
                  <GlassDropdown 
                      options={formatOptions(YEAR_OPTIONS, "All Years")}
                      value={yearFilter} 
                      onChange={setYearFilter} 
                  />
                </div>
            </div>
            
            <button 
                className="pdf-download-btn" 
                onClick={handleDownload}
                title="Download PDF"
            >
                <Icon.Download size={16} />
            </button>
          </div>

          <div className="active-scroll-area">
            {activeStudents.length === 0 ? (
              <div className="empty-state-mini">
                <Icon.UserCheck size={32} opacity={0.3} />
                <p>No students match these filters.</p>
              </div>
            ) : (
              activeStudents.map(record => (
                <div key={record.id} className="student-active-row">
                  <div className="st-identity" onClick={() => onViewProfile(record.profile)}>
                    <div className="st-avatar">{record.profile?.name?.charAt(0)}</div>
                    <div className="st-info">
                      <div className="st-name-row">
                        <span className="st-name">{record.profile?.name}</span>
                        <span className="st-tag">{record.profile?.course}</span>
                      </div>
                      <span className="st-sub">Rm {record.profile?.room_number} • Year {record.profile?.year}</span>
                    </div>
                  </div>

                  <div className="st-actions">
                    <button 
                      className="glass-return-btn" 
                      onClick={(e) => { e.stopPropagation(); onReturn(record.id); }}
                    >
                      <Icon.CheckCircle size={14} /> 
                      <span className="btn-text">Return</span>
                    </button>

                    <button 
                      className="call-btn-fixed" 
                      onClick={(e) => { e.stopPropagation(); window.open(`tel:${record.profile?.phone}`); }}
                    >
                      <Icon.Phone size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- STYLES --- */}
      <style>{`
        .active-block-container {
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          border-radius: 20px; overflow: hidden; margin-bottom: 20px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease; 
          backdrop-filter: blur(12px);
        }
        .active-block-container.is-expanded { border-color: var(--primary); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        
        .active-header { 
           padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; 
           cursor: pointer; background: rgba(var(--primary-rgb), 0.03); 
        }
        .header-left { display: flex; align-items: center; gap: 15px; }
        .main-count { font-size: 1.1rem; margin: 0; color: var(--text-main); font-weight: 500; }
        .main-count b { color: var(--primary); font-weight: 800; }
        .chevron { transition: transform 0.3s ease; color: var(--text-muted); }
        .chevron.rotated { transform: rotate(180deg); color: var(--primary); }

        .pulse-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; animation: pulse-ring 2s infinite; }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

        .expandable-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .expandable-wrapper.open { grid-template-rows: 1fr; }
        .expandable-inner { overflow: hidden; }

        .filter-bar { 
            display: flex; justify-content: space-between; align-items: center;
            padding: 15px 20px; border-bottom: 1px solid var(--glass-border); 
            background: rgba(0,0,0,0.02); gap: 12px; flex-wrap: wrap;
        }
        .filters-left { display: flex; gap: 10px; flex: 1; flex-wrap: wrap; }

        .pdf-download-btn {
            display: flex; align-items: center; gap: 6px;
            background: rgba(var(--primary-rgb), 0.1); color: var(--primary);
            border: 1px solid rgba(var(--primary-rgb), 0.2);
            padding: 8px 16px; border-radius: 12px;
            font-size: 0.8rem; font-weight: 700; cursor: pointer;
            transition: all 0.2s ease;
        }
        .pdf-download-btn:hover { background: var(--primary); color: white; }

        .active-scroll-area { max-height: 380px; overflow-y: auto; }
        
        .student-active-row { 
            display: flex; align-items: center; justify-content: space-between; 
            padding: 14px 20px; border-bottom: 1px solid var(--glass-border); gap: 15px; 
        }
        .st-identity { display: flex; align-items: center; gap: 12px; flex: 1; cursor: pointer; }
        .st-avatar { 
            width: 40px; height: 40px; background: var(--primary); color: white; 
            border-radius: 12px; display: flex; align-items: center; justify-content: center; 
            font-weight: 800; flex-shrink: 0; 
        }
        .st-name { font-weight: 700; color: var(--text-main); font-size: 0.95rem; }
        .st-tag { font-size: 0.6rem; background: rgba(var(--primary-rgb), 0.1); color: var(--primary); padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 6px; }
        .st-sub { font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 2px; }

        .st-actions { display: flex; align-items: center; gap: 8px; }
        .glass-return-btn {
          background: rgba(16, 185, 129, 0.1); color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 6px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 700;
          display: flex; align-items: center; gap: 6px; cursor: pointer;
          transition: all 0.2s ease; backdrop-filter: blur(4px);
        }
        .glass-return-btn:hover { background: #10b981; color: white; }
        
        .call-btn-fixed {
          width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px;
          border: 1px solid var(--glass-border); background: var(--glass-bg);
          color: var(--primary); display: flex; align-items: center; justify-content: center;
          padding: 0; cursor: pointer; transition: all 0.2s ease;
        }
        .call-btn-fixed:hover { background: var(--primary); color: white; }

        .empty-state-mini { padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 10px; font-size: 0.9rem; }

        @media (max-width: 480px) {
            .btn-text { display: none; }
            .filters-left { width: 100%; }
        }
      `}</style>
    </div>
  );
}