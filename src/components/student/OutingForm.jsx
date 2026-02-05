// ==============================
// Imports
// ==============================
import { useState, useMemo } from "react";
import * as Icon from "../Icons";
import GlassDatePicker from "../ui/GlassDatePicker";
import GlassTimePicker from "../ui/GlassTimePicker";
import { useToast } from "../../context/ToastContext";
import { OUTING_STATUS } from "../../constants";

// ==============================
// Outing Form Component
// ==============================
export default function OutingForm({ logic }) {
  // ------------------------------
  // Destructure Logic Props
  // ------------------------------
  const {
    newOuting,
    setNewOuting,
    handleCreateOuting,
    isSubmitting,
    myOutings,
  } = logic;

  // ------------------------------
  // Hooks & Helpers
  // ------------------------------
  const toast = useToast();
  const todayStr = new Date().toISOString().split("T")[0];

  // ------------------------------
  // Active Outing Check
  // ------------------------------
  // Finds any outing that is NOT completed or rejected
  const activeOuting = useMemo(() => {
    return (myOutings || []).find(
      (o) =>
        o.status !== OUTING_STATUS.COMPLETED &&
        o.status !== OUTING_STATUS.REJECTED
    );
  }, [myOutings]);

  // ------------------------------
  // Validation Wrapper
  // ------------------------------
  const validateAndSubmit = () => {
    if (!newOuting.purpose?.trim()) {
      return toast.error(
        "Missing Purpose",
        "Please specify where you are going."
      );
    }

    // Return date & time are optional
    handleCreateOuting();
  };

  // ==============================
  // Blocked State (Active Outing)
  // ==============================
  if (activeOuting) {
    return (
      <section className="glass-card form-card animate-slide-up p-4 flex-center flex-col text-center">
        <div className="mb-3 p-3 rounded-circle bg-warning-light text-warning">
          <Icon.AlertTriangle size={32} />
        </div>

        <h3 className="m-0">Active Outing Found</h3>

        <p className="text-muted mt-2">
          You cannot request a new outing because you already have one with
          status: <b>{activeOuting.status}</b>.
        </p>

        <div className="mt-3 text-sm text-muted">
          Please complete or cancel your current request first.
        </div>
      </section>
    );
  }

  // ==============================
  // Normal Render (Form)
  // ==============================
  return (
    <section
      className="glass-card form-card animate-slide-up"
      style={{ overflow: "visible", zIndex: 50, position: "relative" }}
    >
      {/* -------- Header -------- */}
      <div className="glass-header mb-3">
        <h3 className="m-0 text-main flex-center justify-start gap-10">
          <Icon.MapPin className="text-primary" />
          Log New Outing
        </h3>
      </div>

      {/* -------- Form Body -------- */}
      <div className="form-grid">
        {/* Date & Time (Optional) */}
        <div className="grid-2 gap-10" style={{ marginBottom: "1rem" }}>
          {/* Return Date */}
          <div style={{ position: "relative", zIndex: 50 }}>
            <label className="text-muted text-sm mb-1 block">
              Return Date{" "}
              
              <p></p>
            </label>
            <GlassDatePicker
              value={newOuting?.return_date || ""}
              onChange={(date) =>
                setNewOuting({ ...newOuting, return_date: date })
              }
              minDate={todayStr}
              placeholder="Select Date"
            />
          </div>

          {/* Return Time */}
          <div style={{ position: "relative", zIndex: 40 }}>
            <label className="text-muted text-sm mb-1 block">
              Return Time{" "}
             
            </label>
            <p></p>
            <GlassTimePicker
              value={newOuting?.return_time || ""}
              onChange={(time) =>
                setNewOuting({ ...newOuting, return_time: time })
              }
            />
          </div>
        </div>

        {/* Purpose / Destination */}
        <div className="description-wrapper">
          <label className="text-muted text-sm mb-1 block">
            Purpose / Destination
          </label>
          <p></p>
          <textarea
            className="glass-textarea w-100"
            rows="2"
            placeholder="e.g. home..."
            value={newOuting?.purpose || ""}
            onChange={(e) =>
              setNewOuting({ ...newOuting, purpose: e.target.value })
            }
            style={{ minHeight: "80px", resize: "vertical" }}
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <div className="flex-end mt-3">
          <button
            className="btn-slide"
            onClick={validateAndSubmit}
            disabled={isSubmitting}
            style={{ paddingLeft: "24px", paddingRight: "24px" }}
          >
            {isSubmitting ? "Submitting..." : "Request Gate Pass"}
            {!isSubmitting && (
              <Icon.Send size={16} style={{ marginLeft: 8 }} />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
