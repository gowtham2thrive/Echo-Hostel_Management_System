import React from "react";
import { 
  Calendar, Clock, CheckCircle, XCircle, 
  AlertCircle, ArrowRight, DoorOpen, Check, X
} from "lucide-react"; 
import { useTheme } from "../../context/ThemeContext";

// --- THEME CONFIGURATION ---
const COLORS = {
  emerald500: '#10B981',     
  red500: '#ef4444',         
  yellow500: '#eab308',      
  blue500: '#3b82f6',        
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
};

const LIGHT_THEME = {
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: `1px solid ${COLORS.slate300}`,
    boxShadow: '0 4px 12px rgba(148, 163, 184, 0.15)',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
  },
  section: {
    background: '#f8fafc',
    border: `1px solid ${COLORS.slate200}`,
    text: '#334155',
  },
  chip: {
    background: '#f1f5f9',
    border: `1px solid ${COLORS.slate200}`,
    text: '#334155',
  },
  iconBox: { background: '#f1f5f9', color: '#0f172a' },
  button: {
    approveBg: 'rgba(16, 185, 129, 0.1)',
    approveColor: COLORS.emerald500,
    rejectBg: 'rgba(239, 68, 68, 0.1)',
    rejectColor: COLORS.red500,
  }
};

const DARK_THEME = {
  card: {
    background: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
  },
  section: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    text: '#e2e8f0',
  },
  chip: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    text: '#f1f5f9',
  },
  iconBox: { background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' },
  button: {
    approveBg: 'rgba(16, 185, 129, 0.2)',
    approveColor: '#34d399',
    rejectBg: 'rgba(239, 68, 68, 0.2)',
    rejectColor: '#f87171',
  }
};

const getStyles = (isDark, isSelected) => {
  const t = isDark ? DARK_THEME : LIGHT_THEME;
  return {
    wrapper: {
      position: 'relative',
      background: isSelected ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.05)') : t.card.background,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: isSelected ? `1px solid ${COLORS.blue500}` : t.card.border,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: t.card.boxShadow,
      display: 'flex', flexDirection: 'column', width: '100%',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      cursor: 'default'
    },
    ribbon: (color) => ({
      position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', backgroundColor: color, zIndex: 2
    }),
    header: { padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 },
    iconBox: {
      width: '44px', height: '44px', borderRadius: '12px', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: t.iconBox.background, color: t.iconBox.color
    },
    titleGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 },
    title: { fontSize: '1rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: t.card.textPrimary },
    date: { fontSize: '0.75rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', color: t.card.textSecondary },
    body: { padding: '0 16px 16px 16px' },
    section: {
      marginTop: '6px', padding: '14px', borderRadius: '12px',
      background: t.section.background, border: t.section.border,
      display: 'flex', flexDirection: 'column', gap: '8px'
    },
    infoRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: t.section.text },
    noteBox: {
      marginTop: '10px', padding: '10px', borderRadius: '8px',
      background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
      color: isDark ? '#f87171' : '#ef4444', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'start'
    },
    metaGrid: { display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' },
    chip: {
      display: 'inline-flex', alignItems: 'center', gap: '10px', 
      padding: '6px 12px 6px 6px', borderRadius: '30px', 
      cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'background 0.2s', 
      background: t.chip.background, border: t.chip.border, color: t.chip.text,
      maxWidth: '100%'
    },
    avatar: (bgColor) => ({
      width: '28px', height: '28px', borderRadius: '50%', 
      backgroundColor: bgColor, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8rem', fontWeight: '700', flexShrink: 0
    }),
    footer: {
      marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px',
      borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${COLORS.slate200}`
    },
    actionBtn: (type) => ({
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: 'none', 
      cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', outline: 'none',
      backgroundColor: type === 'approve' ? t.button.approveBg : t.button.rejectBg,
      color: type === 'approve' ? t.button.approveColor : t.button.rejectColor,
    }),
    selectionRing: {
      width: '20px', height: '20px', borderRadius: '6px', 
      border: isSelected ? `2px solid ${COLORS.blue500}` : `2px solid ${t.card.textSecondary}`,
      background: isSelected ? COLORS.blue500 : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
      cursor: 'pointer', marginLeft: '10px'
    }
  };
};

const Avatar = ({ name, color, style }) => (
  <div style={{ ...style, backgroundColor: color }}>
    {name ? name[0].toUpperCase() : '?'}
  </div>
);

const getStatusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case 'completed': return COLORS.emerald500;
    case 'rejected': return COLORS.red500;
    case 'approved': return COLORS.yellow500;
    default: return COLORS.blue500;
  }
};

const getStatusIcon = (status) => {
  const s = (status || "").toLowerCase();
  if (s === 'approved') return <CheckCircle size={20} />;
  if (s === 'rejected') return <XCircle size={20} />;
  if (s === 'completed') return <CheckCircle size={20} />;
  return <Clock size={20} />;
};

// --- MAIN COMPONENT ---
export default function OutingCard({ 
  outing, 
  formatTime,
  formatDateTime,
  isStaffView = false,
  isSelected = false,
  onSelect,
  onApprove,
  onReject,
  onViewStudent, 
  onViewApprover 
}) {
  if (!outing) return null;

  const { isDarkMode } = useTheme();
  const s = getStyles(isDarkMode, isSelected);

  const status = outing.status || 'Submitted';
  const statusColor = getStatusColor(status);
  const isPending = status.toLowerCase() === 'submitted' || status.toLowerCase() === 'pending';
  const isRejected = status.toLowerCase() === 'rejected';

  const submittedDate = formatDateTime 
    ? formatDateTime(outing.submitted_at) 
    : new Date(outing.submitted_at).toLocaleDateString();

  const returnDate = outing.return_date 
     ? new Date(outing.return_date).toLocaleDateString() 
     : "N/A";
  
  const returnTime = outing.return_time 
     ? (formatTime ? formatTime(outing.return_time) : outing.return_time) 
     : "N/A";

  // --- DATA EXTRACTION ---
  
  const studentData = Array.isArray(outing.profile) ? outing.profile[0] : outing.profile;
  const studentName = studentData?.name || "Student";

  const rawApprover = outing.approver || outing.approved_by_staff;
  const approverData = Array.isArray(rawApprover) ? rawApprover[0] : rawApprover;
  const approverName = approverData?.name;

  const handleCardClick = (e) => {
    if (isStaffView && isPending && onSelect) {
        onSelect(outing.id);
    }
  };

  return (
    <div style={s.wrapper} onClick={handleCardClick}>
      <div style={s.ribbon(statusColor)} />

      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={{ ...s.iconBox, color: statusColor }}>
             {getStatusIcon(status)}
          </div>
          <div style={s.titleGroup}>
            <span style={s.title}>{outing.purpose}</span>
            <span style={s.date}>
              <Calendar size={12} /> {submittedDate}
            </span>
          </div>
        </div>

        {isStaffView && isPending && (
            <div style={s.selectionRing}>
               {isSelected && <Check size={14} strokeWidth={3} />}
            </div>
        )}
      </div>

      <div style={s.body}>
        <div style={s.section}>
           <div style={s.infoRow}>
              <DoorOpen size={16} color={s.date.color}/> 
              <span style={{fontWeight: 600}}>Return:</span> 
              <span>{returnDate} at {returnTime}</span>
           </div>
        </div>

        {isRejected && outing.rejection_reason && (
           <div style={s.noteBox}>
              <AlertCircle size={16} style={{marginTop: 2}} />
              <span>{outing.rejection_reason}</span>
           </div>
        )}

        <div style={s.metaGrid}>
           {/* STUDENT CHIP (Staff View only) */}
           {isStaffView && (
              <div 
                style={s.chip} 
                onClick={(e) => { e.stopPropagation(); onViewStudent && onViewStudent(studentData); }}
                title="View Student Profile"
              >
                <Avatar name={studentName} color={COLORS.blue500} style={s.avatar(COLORS.blue500)} />
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {studentName}
                </span>
              </div>
           )}

           {/* APPROVER CHIP (When approved) */}
           {!isPending && approverName && (
              <div 
                 style={s.chip}
                 title="Approved By"
                 onClick={(e) => {
                     e.stopPropagation();
                     // ✅ FIX: Pass ONLY the ID for the profile fetcher logic
                     if (onViewApprover && approverData?.id) {
                         onViewApprover(approverData.id);
                     }
                 }}
              >
                <Avatar name={approverName} color={COLORS.emerald500} style={s.avatar(COLORS.emerald500)} />
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {approverName}
                </span>
              </div>
           )}
        </div>

        {isStaffView && isPending && !isSelected && (
           <div style={s.footer}>
              <button 
                style={s.actionBtn('reject')}
                onClick={(e) => { e.stopPropagation(); onReject && onReject(outing.id); }}
                title="Reject Request"
              >
                <X size={16} /> Reject
              </button>
              <button 
                style={s.actionBtn('approve')}
                onClick={(e) => { e.stopPropagation(); onApprove && onApprove(outing.id); }}
                title="Approve Request"
              >
                 Approve <ArrowRight size={16} />
              </button>
           </div>
        )}
      </div>
    </div>
  );
}