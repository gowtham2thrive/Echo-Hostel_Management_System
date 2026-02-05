import React from "react";
import * as Icon from "../Icons";
import "../../styles/5-components.css"; 

/**
 * ProfilePreviewModal
 * * A polished, glass-morphic modal that displays detailed user information.
 * It adapts its layout dynamically based on whether the user is a Student or Staff.
 * * @param {Object} user - The user object containing profile details (name, phone, role, etc.)
 * @param {Function} onClose - Callback to close the modal
 */
export default function ProfilePreviewModal({ user, onClose }) {
  // Safety check: Prevent rendering if no user data is provided
  if (!user) return null;

  // --- LOGIC: Role & Avatar Detection ---
  // Determine if the user is a student based on role or existence of a roll number
  const isStudent = user.role === 'student' || (!user.role && !!user.roll_no);
  
  // Get the first letter of the name for the avatar placeholder
  const avatarLetter = user.name ? user.name[0].toUpperCase() : 'U';

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal Content Container
        - Stops propagation to prevent closing when clicking inside
        - Uses flexbox for layout (Fixed Header + Scrollable Body)
      */}
      <div 
        className="modal-content glass-card modal-anim" 
        style={{ 
            maxWidth: 360, 
            width: '100%', 
            maxHeight: '90vh', // Prevents modal from overflowing on small screens
            display: 'flex',
            flexDirection: 'column',
            padding: 0, 
            borderRadius: 24,
            border: '1px solid var(--glass-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden' // Ensures rounded corners clip content
        }} 
        onClick={e => e.stopPropagation()}
      >
        
        {/* ================= HEADER SECTION (Fixed) ================= */}
        <div style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            padding: '24px 20px 30px 20px', 
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            color: 'white', position: 'relative',
            flexShrink: 0 // Ensures header stays fixed size
        }}>
            
            {/* CLOSE BUTTON */}
            {/* Uses an inline SVG to guarantee visibility without external icon dependencies */}
            <button onClick={onClose} style={{ 
                position: 'absolute', top: 16, right: 16, zIndex: 50,
                background: 'rgba(255, 255, 255, 0.25)', 
                border: '1px solid rgba(255, 255, 255, 0.4)', 
                borderRadius: '50%', 
                width: 36, height: 36, 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                padding: 0
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            {/* AVATAR CIRCLE */}
            <div style={{ 
                width: 72, height: 72, 
                background: 'rgba(255,255,255,0.95)', color: 'var(--primary)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: '800', marginBottom: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
                {avatarLetter}
            </div>
            
            {/* NAME & ROLE BADGE */}
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{user.name}</h2>
            <span style={{ 
                opacity: 0.9, fontSize: '0.75rem', marginTop: 4, letterSpacing: '0.5px', textTransform: 'uppercase',
                background: 'rgba(0,0,0,0.15)', padding: '2px 10px', borderRadius: 20 
            }}>
                {isStudent ? "Student Profile" : "Staff Member"}
            </span>
        </div>

        {/* ================= BODY SECTION (Scrollable) ================= */}
        <div style={{ 
            padding: '20px 20px',
            overflowY: 'auto', // Enables scrolling for long content
            flex: 1 
        }}>
            
            {/* --- 1. CONTACT ACTIONS --- */}
            <div className="flex flex-col gap-3 mb-4">
                
                {/* Phone Action */}
                {user.phone ? (
                    <a href={`tel:${user.phone}`} className="action-row">
                        <div className="icon-circle bg-primary"><Icon.Phone size={18} color="white"/></div>
                        <div className="flex-1">
                            <div className="text-xs text-muted uppercase tracking-wide">Mobile</div>
                            <div className="font-bold text-main text-lg">{user.phone}</div>
                        </div>
                    </a>
                ) : (
                    <div className="action-row opacity-50">
                        <div className="icon-circle bg-gray"><Icon.Phone size={18} color="white"/></div>
                        <div className="text-xs text-muted">No phone</div>
                    </div>
                )}
                
                {/* Email Action */}
                {user.email && (
                    <a href={`mailto:${user.email}`} className="action-row">
                        <div className="icon-circle bg-info">
                            {/* Inline SVG for Mail as a fallback */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-muted uppercase tracking-wide">Email</div>
                            {/* break-all ensures long emails wrap correctly */}
                            <div className="font-bold text-main" style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
                                {user.email}
                            </div>
                        </div>
                    </a>
                )}
            </div>

            {/* --- 2. DETAILS GRID (Academic / Work) --- */}
            <div className="details-card mb-4">
                <h4 className="card-label">{isStudent ? "Academic Info" : "Work Details"}</h4>
                
                {isStudent ? (
                    // Student View: Grid Layout for Roll, Room, Course, Year
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Roll Number</label>
                            <span>{user.roll_no || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Room No</label>
                            <span>{user.room_number || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Course</label>
                            <span>{user.course || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Year</label>
                            <span>{user.year || 'N/A'} Year</span>
                        </div>
                    </div>
                ) : (
                    // Staff View: Single Full-Width Row
                    <div className="info-grid">
                        <div className="info-item full-width">
                            <label>Designation</label>
                            <span className="flex-center gap-2">
                                <Icon.Briefcase size={14} className="text-muted"/>
                                {user.designation || 'Staff'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- 3. EMERGENCY CONTACT (Student Only) --- */}
            {isStudent && user.parent_phone && (
                <a href={`tel:${user.parent_phone}`} className="action-row emergency-row">
                    <div className="icon-circle bg-danger"><Icon.Phone size={18} color="white"/></div>
                    <div className="flex-1">
                        <div className="text-xs text-danger uppercase font-bold tracking-wide">Emergency (Parent)</div>
                        <div className="font-bold text-main text-lg">{user.parent_phone}</div>
                    </div>
                </a>
            )}

        </div>
      </div>

      {/* ================= COMPONENT STYLES ================= */}
      <style>{`
        /* Close Button Hover Effect */
        button:active { transform: scale(0.95); }
        
        /* Action Row (Phone/Email Cards) */
        .action-row {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px 16px;
            background: var(--glass-surface);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            text-decoration: none;
            color: inherit;
            transition: transform 0.2s, background 0.2s;
        }
        .action-row:hover {
            transform: translateY(-2px);
            background: rgba(0,0,0,0.03);
            border-color: rgba(0,0,0,0.1);
        }

        /* Emergency Row specific styling (Red Tint) */
        .emergency-row {
            border-color: rgba(239, 68, 68, 0.3);
            background: rgba(239, 68, 68, 0.04);
        }
        .emergency-row:hover {
            background: rgba(239, 68, 68, 0.08);
        }

        /* Icon Circles (Left side of cards) */
        .icon-circle {
            width: 40px; height: 40px;
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        /* Color Utilities */
        .bg-primary { background: var(--primary); }
        .bg-info { background: #3b82f6; }
        .bg-danger { background: #ef4444; }
        .bg-gray { background: #9ca3af; }
        
        /* Typography */
        .text-lg { font-size: 1rem; }

        /* Details Card Container */
        .details-card {
            background: rgba(0,0,0,0.02);
            border-radius: 16px;
            padding: 16px;
            border: 1px solid var(--glass-border);
        }
        .card-label {
            margin: 0 0 12px 0;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
            color: var(--text-muted);
            opacity: 0.8;
        }

        /* Info Grid Layout */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 16px;
        }
        .info-item label {
            display: block;
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-bottom: 4px;
        }
        .info-item span {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-main);
        }
        .info-item.full-width {
            grid-column: span 2;
        }
        
        /* Custom Scrollbar for the modal body */
        .modal-content ::-webkit-scrollbar {
          width: 6px;
        }
        .modal-content ::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}