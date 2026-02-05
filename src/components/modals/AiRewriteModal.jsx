// ==============================
// Imports
// ==============================
import React from "react";
import * as Icon from "../Icons";
import { useToast } from "../../context/ToastContext";
import "../../styles/5-components.css";

// ==============================
// AI Rewrite Modal Component
// ==============================
export default function AiRewriteModal({
  originalText,
  suggestedText,
  isLoading,
  error,
  onClose,
  onRegenerate,
  onAccept,
}) {
  // ------------------------------
  // Hooks
  // ------------------------------
  const toast = useToast();

  // ------------------------------
  // Handlers
  // ------------------------------
  const handleAccept = () => {
    if (error) {
      toast.error(
        "Cannot Apply",
        "The AI suggestion failed. Please try regenerating."
      );
      return;
    }

    if (!suggestedText && !isLoading) {
      toast.error("Empty", "No suggestion available to apply.");
      return;
    }

    onAccept();
  };

  // ==============================
  // Render
  // ==============================
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card modal-anim"
        style={{ maxWidth: 420, width: "90%", padding: "24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* -------- Header -------- */}
        <div className="flex items-center gap-3 mb-4 border-b border-glass pb-3">
          <div className="icon-box-glow">
            <Icon.Sparkles size={20} className="text-primary-light" />
          </div>
          <h3 className="m-0 text-main text-lg font-bold">
            AI Suggestion
          </h3>
        </div>

        {/* -------- Body -------- */}
        <div className="mb-4">
          {/* Original Text Preview */}
          <div className="mb-3">
            <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
              Original
            </label>
            <div className="text-sm text-muted italic truncate-2-lines p-2 rounded bg-dark-50 border border-glass-subtle">
              "{originalText || "..."}"
            </div>
          </div>

          {/* AI Result */}
          <div
            className={`result-box ${
              error ? "error" : ""
            } ${isLoading ? "loading" : ""}`}
          >
            {isLoading ? (
              <div className="flex-center gap-2 text-muted py-4">
                <Icon.Loader size={18} className="animate-spin" />
                <span className="animate-pulse">
                  Polishing your text...
                </span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 text-danger">
                <Icon.AlertTriangle
                  size={18}
                  className="mt-1 flex-shrink-0"
                />
                <div>
                  <div className="font-bold text-sm">
                    Generation Failed
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    {error || "Input unclear or server error."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-main font-medium leading-relaxed">
                {suggestedText || "No suggestion generated."}
              </div>
            )}
          </div>
        </div>

        {/* -------- Footer Actions -------- */}
        <div className="grid-buttons">
          {/* Cancel */}
          <button onClick={onClose} className="btn-ghost">
            <Icon.X size={16} />
            <span>Cancel</span>
          </button>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="btn-secondary"
          >
            <Icon.RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : ""}
            />
            <span>Retry</span>
          </button>

          {/* Accept */}
          <button
            onClick={handleAccept}
            disabled={isLoading || error}
            className="btn-primary-gradient"
          >
            <Icon.Check size={16} />
            <span>Use This</span>
          </button>
        </div>
      </div>

      {/* ==============================
          Inline Styles (Scoped)
         ============================== */}
      <style>{`
        .icon-box-glow {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .text-primary-light {
          color: #818cf8;
        }

        .bg-dark-50 {
          background: rgba(0, 0, 0, 0.2);
        }

        .border-glass-subtle {
          border-color: rgba(255, 255, 255, 0.05);
        }

        .result-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          min-height: 80px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        /* Success State */
        .result-box:not(.error):not(.loading) {
          border-color: rgba(99, 102, 241, 0.4);
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.05),
            transparent
          );
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        /* Error State */
        .result-box.error {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }

        /* Button Grid */
        .grid-buttons {
          display: grid;
          grid-template-columns: auto auto 1fr;
          gap: 10px;
        }

        .btn-ghost,
        .btn-secondary,
        .btn-primary-gradient {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          white-space: nowrap;
        }

        .btn-ghost {
          background: transparent;
          color: var(--text-muted);
          border: 1px solid transparent;
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
          border: 1px solid var(--glass-border);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-primary-gradient {
          background: linear-gradient(
            135deg,
            var(--primary),
            var(--secondary)
          );
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-primary-gradient:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }

        .btn-primary-gradient:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .truncate-2-lines {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
