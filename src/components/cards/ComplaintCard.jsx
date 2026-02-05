import React, { useState } from "react";
import { 
  Check, CheckCheck, Download, 
  MessageCircle, Calendar, 
  Shield, Zap, Droplets, Wifi, HelpCircle, 
  Utensils, Wrench
} from "lucide-react";
import { generateComplaintPDF } from "../../utils/pdfGenerator";
import { useTheme } from "../../context/ThemeContext"; // ✅ FIXED: Import Theme Context

// --- 1. HELPERS & ICONS ---

const getCategoryIcon = (cat) => {
  const c = cat?.toLowerCase();
  if (c === 'hygiene') return <Droplets size={20} />;
  if (c === 'food') return <Utensils size={20} />;
  if (c === 'maintenance') return <Wrench size={20} />;
  if (c === 'discipline') return <Shield size={20} />;
  if (c === 'electric') return <Zap size={20} />;
  if (c === 'water') return <Droplets size={20} />;
  if (c === 'net') return <Wifi size={20} />;
  return <HelpCircle size={20} />;
};

const formatDateLocal = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// ✅ HELPER: Safely extract name from Object or Array (Supabase join fix)
const getSafeName = (data) => {
  if (!data) return null;
  if (Array.isArray(data)) return data[0]?.name; // Handle 1:1 join returning array
  return data.name; // Handle 1:1 join returning object
};

// --- 2. THEME CONFIGURATION ---

const COLORS = {
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate700: '#334155',
  slate900: '#0f172a',
  
  emerald500: '#10B981',
  emeraldTextLight: '#064e3b',
  emeraldTextDark: '#ecfdf5',
  emeraldBgLight: 'rgba(16, 185, 129, 0.1)',
  emeraldBgDark: 'rgba(16, 185, 129, 0.15)',
  
  red500: '#ef4444',
  indigo500: '#6366f1',
  sky400: '#38bdf8',
};

const LIGHT_THEME = {
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: `1px solid ${COLORS.slate300}`,
    boxShadow: '0 4px 12px rgba(148, 163, 184, 0.15)',
    textPrimary: COLORS.slate900,
    textSecondary: COLORS.slate500,
  },
  section: {
    background: COLORS.slate50,
    border: `1px solid ${COLORS.slate200}`,
    text: COLORS.slate700,
  },
  resolutionBox: {
    background: COLORS.emeraldBgLight,
    border: '1px solid rgba(16, 185, 129, 0.25)',
    text: COLORS.emeraldTextLight,
    iconColor: COLORS.emerald500,
  },
  chip: {
    background: COLORS.slate100,
    border: `1px solid ${COLORS.slate200}`,
    text: COLORS.slate700,
  },
  iconBox: {
    background: COLORS.slate100,
    color: COLORS.slate900,
  },
  input: {
    background: COLORS.slate50,
    border: `1px solid ${COLORS.slate300}`,
    color: COLORS.slate900,
  },
  footer: {
    borderTop: `1px solid ${COLORS.slate200}`,
  },
  button: {
    ackBg: 'rgba(99, 102, 241, 0.1)',
    ackColor: COLORS.indigo500,
    resolveBg: 'rgba(16, 185, 129, 0.1)',
    resolveColor: COLORS.emerald500,
    cancelBorder: '1px solid rgba(239, 68, 68, 0.3)',
    cancelColor: COLORS.red500,
    confirmBg: COLORS.emerald500,
    confirmColor: '#ffffff',
  }
};

const DARK_THEME = {
  card: {
    background: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    textPrimary: COLORS.slate50,
    textSecondary: COLORS.slate400,
  },
  section: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    text: COLORS.slate200,
  },
  resolutionBox: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    text: COLORS.emeraldTextDark,
    iconColor: COLORS.emerald500,
  },
  chip: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    text: COLORS.slate100,
  },
  iconBox: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
  },
  input: {
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  button: {
    ackBg: 'rgba(99, 102, 241, 0.2)',
    ackColor: '#818cf8',
    resolveBg: 'rgba(16, 185, 129, 0.2)',
    resolveColor: '#34d399',
    cancelBorder: '1px solid rgba(239, 68, 68, 0.5)',
    cancelColor: '#f87171',
    confirmBg: COLORS.emerald500,
    confirmColor: '#ffffff',
  }
};

// --- 3. STYLE ENGINE ---

const getStyles = (isDark) => {
  const t = isDark ? DARK_THEME : LIGHT_THEME;

  return {
    wrapper: {
      position: 'relative',
      background: t.card.background,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: t.card.border,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: t.card.boxShadow,
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    },
    ribbon: (color) => ({
      position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', backgroundColor: color, zIndex: 2
    }),
    header: {
      padding: '16px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      userSelect: 'none'
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 },
    iconBox: {
      width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: t.iconBox.background, color: t.iconBox.color
    },
    titleGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 },
    title: {
      fontSize: '1rem', fontWeight: '700', textTransform: 'capitalize', letterSpacing: '0.3px', 
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: t.card.textPrimary
    },
    date: {
      fontSize: '0.75rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', color: t.card.textSecondary
    },
    body: { 
      padding: '0 16px 16px 16px',
    },
    section: {
      marginTop: '6px',
      padding: '14px', borderRadius: '12px',
      background: t.section.background, border: t.section.border
    },
    resolutionBox: {
      marginTop: '12px', padding: '14px', borderRadius: '12px',
      background: t.resolutionBox.background, border: t.resolutionBox.border,
    },
    description: {
      fontSize: '0.92rem', lineHeight: '1.6', 
      whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere',
      color: t.section.text
    },
    resolutionText: {
      fontSize: '0.92rem', lineHeight: '1.6',
      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      color: t.resolutionBox.text
    },
    metaGrid: { display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' },
    
    // ✅ FIXED: Better Chip Layout for Stability
    chip: {
      display: 'inline-flex', alignItems: 'center', gap: '10px', 
      padding: '6px 12px 6px 6px', borderRadius: '30px', 
      cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'background 0.2s', 
      maxWidth: '100%', 
      background: t.chip.background, border: t.chip.border, color: t.chip.text,
      flexShrink: 0
    },
    avatar: (bgColor) => ({
      width: '28px', height: '28px', borderRadius: '50%', 
      backgroundColor: bgColor, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8rem', fontWeight: '700', flexShrink: 0
    }),
    footer: {
      marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px',
      borderTop: t.footer.borderTop
    },
    downloadBtn: {
      display: 'flex', alignItems: 'center', gap:'8px', background: 'transparent', 
      border: t.section.border, color: t.card.textSecondary, 
      padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
    },
    actionBtn: (type) => ({
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: 'none', 
      cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', outline: 'none', whiteSpace: 'nowrap',
      backgroundColor: type === 'ack' ? t.button.ackBg : t.button.resolveBg,
      color: type === 'ack' ? t.button.ackColor : t.button.resolveColor,
    }),
    cancelBtn: {
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', 
      cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', outline: 'none', whiteSpace: 'nowrap',
      backgroundColor: 'transparent',
      border: t.button.cancelBorder,
      color: t.button.cancelColor,
    },
    confirmBtn: {
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: 'none',
      cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', outline: 'none', whiteSpace: 'nowrap',
      backgroundColor: t.button.confirmBg,
      color: t.button.confirmColor,
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    input: {
      width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.95rem', minHeight: '80px', 
      outline: 'none', fontFamily: 'inherit', resize: 'vertical',
      background: t.input.background, border: t.input.border, color: t.input.color
    },
    resHeader: {
      display:'flex', justifyContent:'space-between', 
      color: t.resolutionBox.iconColor, 
      fontWeight: 700, fontSize:'0.8rem', marginBottom:'8px'
    }
  };
};

// --- 4. COMPONENT ---

const Avatar = ({ name, color, style }) => (
  <div style={{ ...style, backgroundColor: color }}>
    {name ? name[0].toUpperCase() : '?'}
  </div>
);

export default function ComplaintCard({ 
  c, 
  complaint, 
  onViewStudent, 
  onViewStaff, 
  isStaffView, 
  onUpdateStatus 
}) {
  const item = c || complaint;
  if (!item) return null;

  const [isResolving, setIsResolving] = useState(false);
  const [closingNote, setClosingNote] = useState("");
  
  // ✅ FIXED: Use React Context for Theme instead of manual DOM observation
  const { isDarkMode } = useTheme(); 
  const s = getStyles(isDarkMode);

  const isResolved = item.status === 'resolved';

  // --- DATA MAPPING (ROBUST) ---
  // Handle both array (if 1:many query) and object (if 1:1 query)
  
  const studentData = Array.isArray(item.profile) ? item.profile[0] : (item.profile || item.students);
  const studentName = getSafeName(studentData) || "Student";
  // ✅ FIXED: Ensure we have a fallback for ID if the profile object is partial
  const studentId = studentData?.id || item.user_id;

  let staffName = null;
  let staffId = null;

  if (item.status === 'resolved') {
      // ✅ FIXED: Try multiple paths for staff name and use safe extractor
      staffName = getSafeName(item.resolved_staff) || getSafeName(item.resolved_by_staff);
      staffId = item.resolved_by_id; 
  } else if (item.status === 'acknowledged') {
      staffName = getSafeName(item.ack_staff) || getSafeName(item.acknowledged_by_staff);
      staffId = item.acknowledged_by_id; 
  }

  // --- HANDLERS ---
  const handleAck = (e) => { 
    e.stopPropagation(); 
    onUpdateStatus && onUpdateStatus(item.id, 'acknowledged'); 
  };
  
  const handleResolveClick = (e) => { 
    e.stopPropagation(); 
    setIsResolving(true); 
  };
  
  const submitResolve = (e) => { 
    e.stopPropagation(); 
    if(closingNote.trim() && onUpdateStatus) {
      onUpdateStatus(item.id, 'resolved', closingNote); 
      setIsResolving(false); 
    }
  };

  const openStudentProfile = (e) => {
    e.stopPropagation();
    if (onViewStudent) {
      // ✅ FIXED: Pass full object if available, otherwise reconstruct minimal object to prevent crash
      const profileObj = studentData || { id: studentId, name: studentName };
      onViewStudent(profileObj); 
    }
  };

  const openStaffProfile = (e) => {
    e.stopPropagation();
    if (onViewStaff && staffId) {
      onViewStaff(staffId); 
    }
  };

  // Ribbon Logic
  const getRibbonColor = () => {
    if (isResolved) return COLORS.emerald500;
    const sev = item.severity?.toLowerCase();
    if (sev === 'critical' || sev === 'high') return COLORS.red500;
    if (sev === 'medium') return '#facc15';
    return COLORS.sky400;
  };

  return (
    <div style={s.wrapper}>
      <div style={s.ribbon(getRibbonColor())} />

      {/* HEADER (Always Visible) */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.iconBox}>{getCategoryIcon(item.category)}</div>
          <div style={s.titleGroup}>
            <span style={s.title}>{item.category}</span>
            <span style={s.date}>
              <Calendar size={12} /> {formatDateLocal(item.submitted_at)}
            </span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={s.body}>
        
        <div style={s.section}>
          <div style={{...s.date, marginBottom: '6px', fontWeight:'700', letterSpacing:'0.5px'}}>
             <MessageCircle size={14} /> DESCRIPTION
          </div>
          <p style={s.description}>{item.description}</p>
        </div>

        {isResolved && (
          <div style={s.resolutionBox}>
            <div style={s.resHeader}>
               <span style={{display:'flex', gap:'6px'}}><CheckCheck size={16}/> RESOLUTION NOTE</span>
               <span style={{fontWeight:500, fontSize:'0.7rem'}}>{formatDateLocal(item.resolved_at)}</span>
            </div>
            <p style={s.resolutionText}>
              {item.closing_note || "No remarks provided."}
            </p>
          </div>
        )}

        <div style={s.metaGrid}>
          {/* STUDENT CHIP WITH AVATAR */}
          <div style={s.chip} onClick={openStudentProfile} title="View Student Profile">
            <Avatar name={studentName} color={COLORS.sky400} style={s.avatar(COLORS.sky400)} />
            <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {studentName}
            </span>
          </div>

          {/* STAFF CHIP WITH AVATAR - FIXED VISIBILITY */}
          {staffName && (
             <div style={s.chip} onClick={openStaffProfile} title="View Staff Profile">
               <Avatar name={staffName} color={COLORS.emerald500} style={s.avatar(COLORS.emerald500)} />
               <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {staffName}
               </span>
             </div>
          )}
        </div>

        <div style={s.footer}>
          <button 
            style={s.downloadBtn}
            onClick={() => generateComplaintPDF(item)}
          >
            <Download size={16} />
          </button>

          {isStaffView && !isResolved && !isResolving && (
            <div style={{display:'flex', gap:'12px'}}>
              {item.status === 'submitted' && (
                <button style={s.actionBtn('ack')} onClick={handleAck} title="Acknowledge">
                  <Check size={18} />
                </button>
              )}
              <button style={s.actionBtn('resolve')} onClick={handleResolveClick} title="Resolve">
                <CheckCheck size={18} />
              </button>
            </div>
          )}
        </div>

        {isResolving && (
           <div style={{marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <textarea
                style={s.input}
                placeholder="Enter resolution details..."
                value={closingNote}
                onChange={(e) => setClosingNote(e.target.value)}
                autoFocus
              />
              <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                 <button 
                   style={s.cancelBtn} 
                   onClick={(e) => { e.stopPropagation(); setIsResolving(false); }}
                 >
                   Cancel
                 </button>
                 <button 
                   style={s.confirmBtn} 
                   onClick={submitResolve}
                 >
                   Confirm
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}