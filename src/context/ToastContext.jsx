import { createContext, useContext, useState, useCallback } from "react";
import * as Icon from "../components/Icons"; // Ensure you have your icons imported
import "../styles/6-widgets.css"; // We will ensure CSS exists below

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Helper to add a toast
  const showToast = useCallback((type, title, msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, msg }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Shortcut functions
  const toast = {
    success: (title, msg) => showToast("success", title, msg),
    error: (title, msg) => showToast("danger", title, msg), // "danger" matches your CSS class likely
    info: (title, msg) => showToast("info", title, msg),
    warning: (title, msg) => showToast("warning", title, msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* --- GLOBAL TOAST CONTAINER --- */}
      <div className="toast-stack-container">
        {toasts.map((t) => (
          <div key={t.id} className={`glass-toast toast-${t.type} animate-slide-in`}>
            <div className="toast-icon">
               {t.type === 'success' && <Icon.CheckCircle size={20} />}
               {t.type === 'danger' && <Icon.AlertTriangle size={20} />}
               {t.type === 'info' && <Icon.Info size={20} />}
               {t.type === 'warning' && <Icon.AlertTriangle size={20} />}
            </div>
            <div className="toast-content">
              <strong>{t.title}</strong>
              <p>{t.msg}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="toast-close">
              <Icon.X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);