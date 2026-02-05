import { useState, useRef, useEffect } from "react";
import * as Icon from "../Icons"; 

const CATEGORIES = [
  { label: "Hygiene", icon: Icon.Hygiene },
  { label: "Food", icon: Icon.Food },
  { label: "Maintenance", icon: Icon.Maintenance },
  { label: "Discipline", icon: Icon.Discipline },
  { label: "Other", icon: Icon.Other },
];

export default function CategorySelect({ value, onChange, placeholder = "Select Category" }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find the icon for the currently selected value
  const selectedCat = CATEGORIES.find(c => c.label === value);
  const SelectedIcon = selectedCat ? selectedCat.icon : Icon.Folder; // ✅ Default to Folder Icon

  return (
    <div className="relative" ref={ref} style={{ width: '100%' }}>
      {/* --- Trigger Button --- */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="glass-input pointer flex-between align-center"
        style={{ 
          padding: '10px 14px', 
          minHeight: '44px',
          cursor: 'pointer',
          border: isOpen ? '1px solid var(--primary)' : '1px solid var(--glass-border)' 
        }}
      >
        <div className="flex-center gap-8">
           {/* ✅ Icon is always an SVG now */}
           <SelectedIcon size={18} className={value ? "text-primary" : "text-muted"} />
           
           <span className={!value ? "text-muted" : "text-main font-bold"}>
             {value || placeholder}
           </span>
        </div>
        
        <Icon.ChevronDown 
          size={16} 
          className="text-muted" 
          style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} 
        />
      </div>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div className="glass-card animate-fade" style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            width: '100%',
            zIndex: 50,
            padding: '6px',
            borderRadius: '12px',
            maxHeight: '250px',
            overflowY: 'auto'
        }}>
           {CATEGORIES.map((cat) => (
             <div 
               key={cat.label}
               onClick={() => { onChange(cat.label); setIsOpen(false); }}
               className="flex-center gap-10"
               style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: value === cat.label ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                  color: value === cat.label ? 'var(--primary)' : 'var(--text-main)',
                  marginBottom: '2px',
                  transition: 'background 0.2s'
               }}
               onMouseEnter={(e) => { if(value !== cat.label) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
               onMouseLeave={(e) => { if(value !== cat.label) e.currentTarget.style.background = 'transparent' }}
             >
                <cat.icon size={18} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{cat.label}</span>
                
                {value === cat.label && <Icon.Check size={16} style={{ marginLeft: 'auto' }} />}
             </div>
           ))}
        </div>
      )}
    </div>
  );
}