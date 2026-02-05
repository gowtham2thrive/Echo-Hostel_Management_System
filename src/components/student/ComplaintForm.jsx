// ==============================
// Imports
// ==============================
import React from "react";
import * as Icon from "../Icons";
import GlassDropdown from "../ui/GlassDropdown";
import { CATEGORY_OPTIONS, SEVERITY_OPTIONS } from "../../constants";
import { useToast } from "../../context/ToastContext";

// ==============================
// Complaint Form Component
// ==============================
export default function ComplaintForm({ logic }) {
  // ------------------------------
  // Destructure Logic Props
  // ------------------------------
  const {
    complaint,
    setComplaint,
    handleCreateComplaint,
    isSubmitting,
    handleAiRewrite,
    isRewriting,
  } = logic;

  // ------------------------------
  // Hooks
  // ------------------------------
  const toast = useToast();

  // ------------------------------
  // Validation Wrapper
  // ------------------------------
  const validateAndSubmit = () => {
    if (!complaint.category) {
      return toast.error("Missing Field", "Please select a category.");
    }

    if (!complaint.description?.trim()) {
      return toast.error("Missing Field", "Please describe the issue.");
    }

    handleCreateComplaint();
  };

  // ==============================
  // Render
  // ==============================
  return (
    <section className="glass-card form-card animate-slide-up">
      {/* -------- Header -------- */}
      <div className="glass-header mb-3">
        <h3 className="m-0 text-main flex-center justify-start gap-10">
          <Icon.Megaphone className="text-primary" />
          File New Complaint
        </h3>
      </div>

      {/* -------- Form Body -------- */}
      <div className="form-grid">
        {/* Category & Severity */}
        <div className="grid-2 gap-10">
          {/* Category */}
          <div>
            <label className="text-muted text-sm mb-1 block">Category</label>
            <p></p>
            <GlassDropdown
              options={CATEGORY_OPTIONS}
              value={complaint.category}
              onChange={(val) =>
                setComplaint({ ...complaint, category: val })
              }
              placeholder="Select Category"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="text-muted text-sm mb-1 block">Severity</label>
            <p></p>
            <GlassDropdown
              options={SEVERITY_OPTIONS}
              value={complaint.severity}
              onChange={(val) =>
                setComplaint({ ...complaint, severity: val })
              }
              placeholder="Select Severity"
            />
          </div>
        </div>

        {/* -------- Description -------- */}
        <div className="description-wrapper mt-3">
          <label className="text-muted text-sm mb-1 block">Description</label>
          <p></p>

          {/* Textarea + AI Action */}
          <div className="relative-wrapper">
            <textarea
              className="glass-textarea w-100 textarea-with-btn"
              rows="4"
              placeholder="Describe the issue in detail..."
              value={complaint.description}
              onChange={(e) =>
                setComplaint({
                  ...complaint,
                  description: e.target.value,
                })
              }
              disabled={isSubmitting}
            />

            {/* AI Grammar Fix */}
            <div className="ai-floating-wrapper">
              <button
                className="ai-fix-btn"
                onClick={handleAiRewrite}
                disabled={isRewriting || !complaint.description}
              >
                {isRewriting ? (
                  <span className="animate-pulse">Fixing...</span>
                ) : (
                  <>
                    <Icon.Sparkles size={14} /> Fix Grammar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* -------- Submit Button -------- */}
        <div className="flex-end mt-3">
          <button
            className="btn-slide btn-wide"
            onClick={validateAndSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
            {!isSubmitting && (
              <Icon.Send size={16} style={{ marginLeft: 8 }} />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
