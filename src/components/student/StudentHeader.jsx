import { useTheme } from "../../context/ThemeContext";
import * as Icon from "../Icons";
import staticLight from "../../assets/echo_static_light_mode.svg";
import staticDark from "../../assets/echo_static_dark_mode.svg";
import { OUTING_STATUS } from "../../constants";

export default function StudentHeader({ profile, logic }) {
  const { theme, setTheme } = useTheme();

  // Logic: Check if student is currently "On Outing"
  const activeOuting = (logic.myOutings || []).find(o => o.status === OUTING_STATUS.APPROVED);
  const isAbsent = !!activeOuting;

  return (
    <div className="glass-header student-header">
      <div>
        <h2 className="app-title">Echo<span className="text-primary">.</span></h2>
        
        {/* Status Badge */}
        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: isAbsent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: `1px solid ${isAbsent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
            {isAbsent ? <Icon.Compass size={14} className="text-danger"/> : <Icon.Building size={14} className="text-success"/>}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isAbsent ? 'var(--danger)' : 'var(--success)' }}>
              {isAbsent ? "ON OUTING" : "ON CAMPUS"}
            </span>
         </div>
      </div>
      
      {/* User Menu */}
      <div ref={logic.menuRef} className="relative">
        <div className="profile-capsule" onClick={() => logic.setIsMenuOpen(!logic.isMenuOpen)}>
          <div className="user-info">
            <span className="user-name">{profile?.name?.split(" ")[0]}</span>
            <span className="user-roll">{profile?.roll_no}</span>
          </div>
          <div className="profile-avatar">
            <img src={theme === 'dark' ? staticDark : staticLight} alt="User" className="user-avatar-img" />
          </div>
        </div>

        {logic.isMenuOpen && (
          <div className="dropdown-menu">
            <div className="theme-switcher-minimal">
              <button className={`theme-icon-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}><Icon.Sun /></button>
              <button className={`theme-icon-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}><Icon.Moon /></button>
              <button className={`theme-icon-btn ${theme === 'system' ? 'active' : ''}`} onClick={() => setTheme('system')}><Icon.Monitor /></button>
            </div>
            <button className="menu-item" onClick={() => { logic.setShowProfileModal(true); logic.setIsMenuOpen(false); }}><Icon.UserCog /> Edit Profile</button>
            <div className="menu-divider"></div>
            <button className="menu-item danger" onClick={logic.handleLogout}><Icon.LogOut /> Log Out</button>
          </div>
        )}
      </div>
    </div>
  );
}