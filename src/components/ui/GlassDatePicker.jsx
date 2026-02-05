import { useState, useRef, useEffect } from "react";
import * as Icon from "../Icons";

export default function GlassDatePicker({ value, onChange, placeholder = "Select Date", minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState("bottom"); // 'top' or 'bottom'
  
  // View Modes: 'days' | 'months' | 'years'
  const [viewMode, setViewMode] = useState('days'); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  
  const containerRef = useRef(null);

  // --- 🧠 SMART POSITIONING LOGIC ---
  const toggleOpen = () => {
    if (!isOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If less than 300px below AND more space above, flip it up.
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  // Safe Date Parsing
  const getLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const selectedDate = getLocalDate(value);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false); setViewMode('days'); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleClear = (e) => {
    e.stopPropagation();
    onChange(""); 
    setIsOpen(false);
  };

  const handleDayClick = (day) => {
    const dObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const y = dObj.getFullYear();
    const m = String(dObj.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleMonthSelect = (idx) => {
    const d = new Date(currentDate); d.setMonth(idx);
    setCurrentDate(d); setViewMode('days'); 
  };

  const handleYearSelect = (year) => {
    const d = new Date(currentDate); d.setFullYear(year);
    setCurrentDate(d); setViewMode('months'); 
  };

  const shift = (delta, type) => {
    const d = new Date(currentDate);
    if (type === 'month') d.setMonth(d.getMonth() + delta);
    else d.setFullYear(d.getFullYear() + (delta * 12));
    setCurrentDate(d);
  };

  // --- RENDERERS ---
  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const days = [];

    // Empty slots for days before the 1st
    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} />);

    // Day buttons
    for (let d = 1; d <= daysInMonth; d++) {
      const dateToCheck = new Date(year, month, d); dateToCheck.setHours(0,0,0,0);
      
      let isDisabled = false;
      if (minDate) {
        const [minY, minM, minD] = minDate.split('-').map(Number);
        const min = new Date(minY, minM - 1, minD); min.setHours(0,0,0,0);
        isDisabled = dateToCheck < min;
      }

      const isSelected = selectedDate && selectedDate.getTime() === dateToCheck.getTime();
      const isToday = new Date().setHours(0,0,0,0) === dateToCheck.getTime();

      days.push(
        <button key={d} onClick={(e) => { e.stopPropagation(); if(!isDisabled) handleDayClick(d); }}
          className={`calendar-cell day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${isDisabled ? "disabled" : ""}`} disabled={isDisabled}>
          {d}
        </button>
      );
    }
    
    const weekDays = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    return (
      <div className="calendar-grid-days">
        {weekDays.map(d => <span key={d} className="grid-header-item">{d}</span>)}
        {days}
      </div>
    );
  };

  const renderMonths = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (
      <div className="calendar-grid-months">
        {months.map((m, idx) => (
          <button key={m} onClick={(e) => { e.stopPropagation(); handleMonthSelect(idx); }} 
            className={`calendar-cell month ${currentDate.getMonth() === idx ? 'current' : ''}`}>
            {m}
          </button>
        ))}
      </div>
    );
  };

  const renderYears = () => {
    const startYear = currentDate.getFullYear() - 6;
    return (
      <div className="calendar-grid-years">
        {Array.from({length: 12}, (_, i) => startYear + i).map(y => (
          <button key={y} onClick={(e) => { e.stopPropagation(); handleYearSelect(y); }} 
            className={`calendar-cell year ${y === currentDate.getFullYear() ? 'current' : ''}`}>
            {y}
          </button>
        ))}
      </div>
    );
  };

  const displayValue = selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";

  return (
    <div className="glass-dropdown-container relative" ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      
      {/* TRIGGER */}
      <div 
        className={`glass-input glass-dropdown-trigger ${isOpen ? 'active' : ''}`} 
        onClick={toggleOpen} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}
      >
        <div className="flex-center gap-10">
          <Icon.Calendar size={18} className={displayValue ? "text-primary" : "text-muted"} />
          <span className={!displayValue ? "text-muted" : "text-main font-bold"}>{displayValue || placeholder}</span>
        </div>
        
        {/* Clear Button / Chevron */}
        <div className="flex-center">
          {value ? (
             <span onClick={handleClear} className="clear-icon-btn animate-fade"><Icon.X size={16} /></span>
          ) : (
             <Icon.ChevronDown size={16} className={`dropdown-arrow ${isOpen ? 'rotate' : ''}`} />
          )}
        </div>
      </div>

      {/* POPUP (Smart Positioned) */}
      {isOpen && (
        <div 
          className={`calendar-popup ${position === 'top' ? 'animate-slide-up' : 'animate-slide-down'}`}
          style={{
            /* Dynamic Top/Bottom based on screen space */
            top: position === 'bottom' ? 'calc(100% + 8px)' : 'auto',
            bottom: position === 'top' ? 'calc(100% + 8px)' : 'auto',
          }}
        >
          {/* Header */}
          <div className="calendar-header">
             <button onClick={(e) => { e.stopPropagation(); viewMode==='days'?shift(-1,'month'):shift(-1,'year'); }} className="calendar-nav-btn"><Icon.ChevronLeft size={16}/></button>
             <button onClick={() => setViewMode(viewMode==='days'?'months':viewMode==='months'?'years':'days')} className="calendar-title-btn">
                {viewMode==='days' ? currentDate.toLocaleDateString('en-US', {month:'long',year:'numeric'}) : viewMode==='months' ? currentDate.getFullYear() : 'Select Year'} 
                <Icon.ChevronDown size={12} style={{ opacity: 0.5, transform: viewMode === 'days' ? 'rotate(0deg)' : 'rotate(180deg)' }}/>
             </button>
             <button onClick={(e) => { e.stopPropagation(); viewMode==='days'?shift(1,'month'):shift(1,'year'); }} className="calendar-nav-btn"><Icon.ChevronRight size={16}/></button>
          </div>

          {/* Body */}
          <div className="calendar-body">
             {viewMode === 'days' && renderDays()}
             {viewMode === 'months' && renderMonths()}
             {viewMode === 'years' && renderYears()}
          </div>

          {/* Footer */}
          <div className="calendar-footer">
             <button className="today-btn" onClick={(e) => { e.stopPropagation(); const now=new Date(); setCurrentDate(now); setViewMode('days'); onChange(now.toISOString().split('T')[0]); setIsOpen(false); }}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
}