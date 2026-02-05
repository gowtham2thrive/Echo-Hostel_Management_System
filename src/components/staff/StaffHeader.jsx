import * as Icon from "../Icons";
import GlassDropdown from "../ui/GlassDropdown"; 
import staticLight from "../../assets/echo_static_light_mode.svg";
import staticDark from "../../assets/echo_static_dark_mode.svg";
import { GENDERS } from "../../constants";

export default function StaffHeader({ logic }) {
  const { 
    myProfile, gender, setGender, theme, setTheme, isDarkMode, 
    isMenuOpen, setIsMenuOpen, menuRef, setTab, setEditingProfile, 
    setViewedProfile, // ✅ Added: Needed to open profile modal
    handleLogout, pendingUsers, pendingUpdates
  } = logic;

  // Calculate badge count for the menu button
  const alertCount = (pendingUsers?.length || 0) + (pendingUpdates?.length || 0);

  return (
    <div className="glass-header">
      <div>
        <h2 className="app-title">Echo<span className="text-primary">.</span></h2>
        <span className="portal-badge">Staff Portal</span>
      </div>
      
      <div ref={menuRef} className="relative">
        <div className="profile-capsule" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className="user-info">
            <span className="user-name">{myProfile?.name?.split(" ")[0] || "Staff"}</span>
            <span className="user-roll">{gender === GENDERS.MALE ? 'Boys' : 'Girls'} View</span>
          </div>
          <div className="profile-avatar">
            <img src={isDarkMode ? staticDark : staticLight} alt="Staff" className="user-avatar-img" />
          </div>
        </div>

        {isMenuOpen && (
          <div className="dropdown-menu">
            {/* Theme Switcher */}
            <div className="theme-switcher-minimal">
              <button className={`theme-icon-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}><Icon.Sun /></button>
              <button className={`theme-icon-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}><Icon.Moon /></button>
              <button className={`theme-icon-btn ${theme === 'system' ? 'active' : ''}`} onClick={() => setTheme('system')}><Icon.Monitor /></button>
            </div>

            {/* Gender Switcher */}
            <div className="pb-2">
              <div className="view-switcher">
                <button onClick={() => { setGender(GENDERS.MALE); setIsMenuOpen(false); }} className={`view-btn ${gender === GENDERS.MALE ? 'active-male' : ''}`} style={{ flex: 1, display:'flex', justifyContent:'center', gap:6 }}><Icon.Male size={16}/> Boys</button>
                <button onClick={() => { setGender(GENDERS.FEMALE); setIsMenuOpen(false); }} className={`view-btn ${gender === GENDERS.FEMALE ? 'active-female' : ''}`} style={{ flex: 1, display:'flex', justifyContent:'center', gap:6 }}><Icon.Female size={16}/> Girls</button>
              </div>
            </div>

            <div className="menu-divider"></div>
            
            <button className="menu-item" onClick={() => { setTab("directory"); setIsMenuOpen(false); }}>
                <Icon.Users /> Student Directory
            </button>
            
            <button className="menu-item" onClick={() => { setTab("approvals"); setIsMenuOpen(false); }}>
                 <Icon.ClipboardCheck /> Approvals 
                 {alertCount > 0 && <span className="badge-count" style={{marginLeft:'auto', background:'var(--danger)', fontSize:'0.7em', padding:'2px 6px', borderRadius:'10px'}}>{alertCount}</span>}
            </button>
            
            <div className="menu-divider"></div>
            
            <button className="menu-item" onClick={() => { setEditingProfile(myProfile); setIsMenuOpen(false); }}>
                <Icon.UserCog /> Edit Details
            </button>
            
            <button className="menu-item danger" onClick={handleLogout}>
                <Icon.LogOut /> Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}