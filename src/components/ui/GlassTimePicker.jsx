import { useState, useRef, useEffect } from "react";
import * as Icon from "../Icons";

export default function GlassTimePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState("bottom");
  const containerRef = useRef(null);

  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: 12, minute: 0, period: 'AM' };
    let [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; 
    return { hour: h, minute: m, period };
  };

  const { hour, minute, period } = parseTime(value);

  const handleChange = (newH, newM, newP) => {
    let h24 = newH;
    if (newP === 'PM' && h24 !== 12) h24 += 12;
    if (newP === 'AM' && h24 === 12) h24 = 0;
    const hStr = String(h24).padStart(2, '0');
    const mStr = String(newM).padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(""); 
    setIsOpen(false);
  };

  // --- 🧠 SMART POSITIONING ---
  const toggleOpen = () => {
    if (!isOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Time picker is approx 220px high
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); 

  const displayValue = value ? `${hour}:${String(minute).padStart(2,'0')} ${period}` : "-- : -- --";

  return (
    <div className="glass-dropdown-container relative" ref={containerRef}>
      
      <div 
        className={`glass-input glass-dropdown-trigger ${isOpen ? 'active' : ''}`} 
        onClick={toggleOpen} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}
      >
        <div className="flex-center gap-10">
          <Icon.Clock size={18} className={value ? "text-primary" : "text-muted"} />
          <span className={!value ? "text-muted" : "text-main font-bold"}>{displayValue}</span>
        </div>
        
        <div className="flex-center">
          {value ? (
             <span onClick={handleClear} className="clear-icon-btn animate-fade"><Icon.X size={16} /></span>
          ) : (
             <Icon.ChevronDown size={16} className={`dropdown-arrow ${isOpen ? 'rotate' : ''}`} />
          )}
        </div>
      </div>

      {isOpen && (
        <div 
          className={`time-popup ${position === 'top' ? 'animate-slide-up' : 'animate-slide-down'}`}
          style={{
             /* ✅ DYNAMIC POSITIONING */
            top: position === 'bottom' ? 'calc(100% + 8px)' : 'auto',
            bottom: position === 'top' ? 'calc(100% + 8px)' : 'auto',
          }}
        >
          <div className="time-column">
            <span className="col-label">Hr</span>
            {hours.map(h => (
              <button key={h} className={`time-cell ${h === hour ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleChange(h, minute, period); }}>{h}</button>
            ))}
          </div>
          <div className="time-divider">:</div>
          <div className="time-column">
            <span className="col-label">Min</span>
            {minutes.map(m => (
              <button key={m} className={`time-cell ${m === minute ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleChange(hour, m, period); }}>{String(m).padStart(2, '0')}</button>
            ))}
          </div>
          <div className="time-divider"></div>
          <div className="time-column">
            <span className="col-label">--</span>
            {['AM', 'PM'].map(p => (
              <button key={p} className={`time-cell ${p === period ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleChange(hour, minute, p); }}>{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}