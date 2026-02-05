import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { useToast } from "./context/ToastContext"; 
import { supabase } from "./supabaseClient";

// Views
import StudentView from "./components/StudentView";
import StaffView from "./components/StaffView";
import ProfileSetup from "./components/ProfileSetup";
import SplashScreen from "./components/ui/SplashScreen";

// Assets & Icons
import * as Icon from "./components/Icons";
import animLight from "./assets/echo_animation_light_mode.svg";
import animDark from "./assets/echo_animation_dark_mode.svg";

function App() {
  const { 
    session, 
    loading: authLoading, 
    isProfileComplete, 
    isStaff, 
    isApproved, 
    refreshProfile 
  } = useAuth();
  
  const { isDarkMode } = useTheme(); 
  const toast = useToast(); 
  
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [minSplashTimeElapsed, setMinSplashTimeElapsed] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // New State for Demo Mode
  const [demoRole, setDemoRole] = useState(null);

  // Clear demo mode on mount
  useEffect(() => {
    sessionStorage.removeItem('demo_mode');
  }, []);

  useEffect(() => {
    const splashDuration = session ? 500 : 2500; 
    const timer = setTimeout(() => {
      setMinSplashTimeElapsed(true);
    }, splashDuration);
    return () => clearTimeout(timer);
  }, [session]); 

  const isAppReady = !authLoading && minSplashTimeElapsed;

  useEffect(() => {
    if (isAppReady) {
      const timer = setTimeout(() => setShowSplash(false), 550);
      return () => clearTimeout(timer);
    }
  }, [isAppReady]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoginLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Login Failed", error.message || "Could not connect to Google.");
      setIsLoginLoading(false);
    }
  };

  const enterDemo = (role) => {
      sessionStorage.setItem('demo_mode', 'true');
      setDemoRole(role);
  };

  if (showSplash) {
    return <SplashScreen isExiting={isAppReady} />;
  }

  // --- DEMO MODE INTERCEPTION ---
  if (demoRole === 'student') {
    const demoStudent = {
        id: 'demo-student',
        role: 'student',
        name: 'Rahul (Demo)',
        gender: 'Male',
        roll_no: '21001A0599',
        is_approved: true,
        isDemo: true
    };
    return <StudentView demoProfile={demoStudent} />;
  }

  if (demoRole === 'staff') {
    const demoStaff = {
        id: 'demo-staff',
        role: 'staff',
        name: 'Warden (Demo)',
        designation: 'Chief Warden',
        gender: 'Male',
        is_approved: true,
        isDemo: true
    };
    return <StaffView demoProfile={demoStaff} />;
  }
  // -----------------------------

  if (!session) {
    return (
      <div className="flex-center flex-col" style={{ minHeight: "100vh", padding: 20, background: 'var(--bg-main)' }}>
        <style>{`
            .glass-btn-modern {
                position: relative;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                border-radius: 12px;
                padding: 14px;
                font-weight: 600;
                color: var(--text-main);
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            .glass-btn-modern:hover {
                transform: translateY(-3px);
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
            }
            .glass-btn-modern:active {
                transform: scale(0.98);
            }
            .glass-shimmer {
                position: absolute;
                top: 0; left: -100%;
                width: 50%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transform: skewX(-20deg);
                transition: 0.5s;
            }
            .glass-btn-modern:hover .glass-shimmer {
                left: 150%;
                transition: 0.7s;
            }
        `}</style>

        <div className="glass-card animate-fade-in-up" style={{ maxWidth: 400, width: '100%', padding: 40, textAlign: 'center' }}>
          <img 
            src={isDarkMode ? animDark : animLight} 
            alt="Echo Logo" 
            style={{ width: 80, height: 80, marginBottom: 20 }} 
          />
          <h2 className="mb-2">Welcome to Echo</h2>
          <p className="text-muted mb-4">Evidence-based Complaint & Hostel Oversight</p>

          <div className="flex-col gap-3">
             <button 
                onClick={handleGoogleLogin} 
                className="btn-solid w-100 flex-center justify-center gap-3"
                disabled={isLoginLoading}
                style={{ 
                  backgroundColor: isDarkMode ? '#fff' : '#4285F4', 
                  color: isDarkMode ? '#000' : '#fff' 
                }}
             >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" style={{ fill: isDarkMode ? '#4285F4' : '#fff' }}/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {isLoginLoading ? "Connecting..." : "Sign in with Google"}
             </button>
            <p></p>
             {/* MODERN GLASS DEMO BUTTONS */}
             <div className="grid-2 gap-3 mt-2">
                <button onClick={() => enterDemo('student')} className="glass-btn-modern">
                  <div className="glass-shimmer"></div>
                  <Icon.User size={18} />
                  Student Demo
                </button>
                <button onClick={() => enterDemo('staff')} className="glass-btn-modern">
                  <div className="glass-shimmer"></div>
                  <Icon.Shield size={18} />
                  Staff Demo
                </button>
             </div>

          </div>
          <div className="mt-4 pt-4 border-top">
            <p className="text-xs text-muted">Secure access for Students & Staff only.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isProfileComplete) return <ProfileSetup session={session} onComplete={refreshProfile} />;

  // PENDING APPROVAL SCREEN
  if (!isApproved) {
    return (
      <div className="flex-center flex-col" style={{ minHeight: "100vh", padding: 20, background: 'var(--bg-main)' }}>
        <div 
          className="glass-card animate-fade" 
          style={{ 
            maxWidth: 480, 
            width: '100%',
            padding: '48px 32px', 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex-center justify-center mb-6">
            <div style={{ position: 'relative', width: 80, height: 80, borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308', boxShadow: '0 0 0 1px rgba(234, 179, 8, 0.2)' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'inherit', animation: 'pulse-ring 2s infinite', opacity: 0.4 }} />
              <Icon.Clock size={40} />
            </div>
          </div>
          <h2 className="mb-3" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Approval Pending</h2>
          <p className="text-muted mb-8" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
            Your account is awaiting administrative approval. 
          </p>
          <div className="grid-2 gap-4">
             <button onClick={() => window.location.reload()} className="btn-glass-action">
                <Icon.RefreshCw size={18} /> <span>Check Status</span>
             </button>
             <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="btn-glass-danger">
                <Icon.LogOut size={18} /> <span>Sign Out</span>
             </button>
          </div>
        </div>
        <style>{`
          @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.15); opacity: 0.3; } 100% { transform: scale(0.95); opacity: 0.5; } }
          .btn-glass-action, .btn-glass-danger { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.2s ease; }
          .btn-glass-action { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--text-main); }
          .btn-glass-action:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-2px); }
          .btn-glass-danger { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; }
          .btn-glass-danger:hover { background: rgba(239, 68, 68, 0.15); transform: translateY(-2px); }
        `}</style>
      </div>
    );
  }

  return isStaff ? <StaffView /> : <StudentView />;
}

export default App;