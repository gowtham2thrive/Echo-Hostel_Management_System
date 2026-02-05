import { useTheme } from "../../context/ThemeContext";
import animLight from "../../assets/echo_animation_light_mode.svg";
import animDark from "../../assets/echo_animation_dark_mode.svg";

export default function SplashScreen({ isExiting }) {
  const { isDarkMode } = useTheme();

  return (
    <div 
      className={`splash-wrapper ${isExiting ? 'splash-exit' : ''}`}
      style={{ 
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-deep)', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)', // Fast, professional ease-out
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: isExiting ? 'none' : 'all'
      }}
    >
      <div className="flex-col flex-center">
        {/* --- GLASS LOGO CONTAINER --- */}
        <div 
          style={{
            background: 'var(--glass-surface)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            padding: '40px',
            borderRadius: '32px',
            boxShadow: 'var(--glass-shadow)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            animation: 'fadeInUp 0.8s ease'
          }}
        >
          <img 
            src={isDarkMode ? animDark : animLight} 
            alt="Echo" 
            style={{ 
              width: 80, 
              height: 80,
              filter: isDarkMode ? 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.3))' : 'none'
            }} 
          />

          <div style={{ textAlign: 'center' }}>
            <h2 
              style={{ 
                color: 'var(--text-main)',
                fontSize: '1.5rem',
                fontWeight: '800',
                letterSpacing: '4px',
                margin: 0
              }}
            >
              ECHO
            </h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '500', letterSpacing: '1px' }}>
              HOSTEL OVERSIGHT
            </span>
          </div>

          {/* --- CLEAN PROGRESS PLACEHOLDER --- */}
          <div 
            style={{ 
              width: '120px', 
              height: '3px', 
              background: 'var(--glass-border)', 
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '40%',
                background: 'var(--primary)',
                boxShadow: '0 0 10px var(--primary)',
                borderRadius: '10px',
                animation: 'fastLoading 1.5s infinite ease-in-out'
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fastLoading {
          0% { left: -40%; width: 20%; }
          50% { width: 50%; }
          100% { left: 100%; width: 20%; }
        }
      `}</style>
    </div>
  );
}