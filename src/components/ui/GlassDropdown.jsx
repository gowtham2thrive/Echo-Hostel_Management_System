import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

export default function GlassDropdown({
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  disabled = false,
  icon: TriggerIcon // Optional icon for the main trigger button
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);

  // 🧠 Helper: Find the selected object (if options are objects)
  // This allows us to display the correct label/icon even if 'value' is just a string like "electrical"
  const selectedOption = useMemo(() => {
    return options.find(opt => {
      // If option is object, compare opt.value. If string, compare opt.
      return (opt?.value || opt) === value;
    });
  }, [options, value]);

  // 🧠 Smart Positioning (Same as before)
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let isUpwards = false;
      let maxHeight = 300;

      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        isUpwards = true;
        maxHeight = Math.min(spaceAbove - 20, 300);
      } else {
        maxHeight = Math.min(spaceBelow - 20, 300);
      }

      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        maxHeight: `${maxHeight}px`,
        top: isUpwards ? "auto" : rect.bottom + 8,
        bottom: isUpwards ? (viewportHeight - rect.top + 8) : "auto",
        transformOrigin: isUpwards ? "bottom center" : "top center",
        zIndex: 99999
      });
    }
  }, [isOpen]);

  // Close handlers (Scroll/Resize/Click Outside)
  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    if (isOpen) {
      window.addEventListener("scroll", handleClose, true);
      window.addEventListener("resize", handleClose);
    }
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      const menu = document.getElementById("active-glass-menu");
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target) && 
        (!menu || !menu.contains(event.target))
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (option) => {
    if (!disabled) {
      // If object, return the 'value' property. If string, return the string.
      onChange(typeof option === 'object' ? option.value : option);
      setIsOpen(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderLabel = (opt) => (typeof opt === 'object' ? opt.label : opt);
  const renderIcon = (opt) => (typeof opt === 'object' ? opt.icon : null);

  return (
    <>
      {/* TRIGGER */}
      <div 
        ref={triggerRef}
        className={`glass-dropdown-trigger ${disabled ? "disabled" : ""} ${isOpen ? "active" : ""}`} 
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-center justify-start gap-10" style={{ overflow: "hidden" }}>
          {/* Priority: 1. Option Icon, 2. Prop Icon, 3. None */}
          {selectedOption && renderIcon(selectedOption) ? (
            <span className="text-primary">{renderIcon(selectedOption)}</span>
          ) : (
            TriggerIcon && <TriggerIcon size={16} className="text-muted" />
          )}
          
          <span className={value ? "text-main" : "text-muted"} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
            {selectedOption ? renderLabel(selectedOption) : placeholder}
          </span>
        </div>
        
        <svg 
          className={`dropdown-arrow ${isOpen ? "rotate" : ""}`} 
          width="16" height="16" viewBox="0 0 24 24" 
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {/* MENU PORTAL */}
      {isOpen && createPortal(
        <div id="active-glass-menu" className="glass-dropdown-menu" style={menuStyle}>
          {options && options.length > 0 ? (
            options.map((option, idx) => {
              const isSelected = (option?.value || option) === value;
              return (
                <div 
                  key={idx} 
                  className={`dropdown-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  {/* Render Icon if exists */}
                  {renderIcon(option) && (
                    <span style={{ marginRight: 10, display: 'flex', alignItems: 'center', opacity: isSelected ? 1 : 0.7 }}>
                      {renderIcon(option)}
                    </span>
                  )}
                  {renderLabel(option)}
                </div>
              );
            })
          ) : (
            <div className="dropdown-item text-muted" style={{ cursor: 'default', justifyContent: 'center' }}>
              No options
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}