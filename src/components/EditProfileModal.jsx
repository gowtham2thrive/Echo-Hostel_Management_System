// ==============================
// Imports
// ==============================
import { useState } from "react";
import { supabase } from "../supabaseClient";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

import GlassDropdown from "./ui/GlassDropdown";
import * as Icon from "./Icons";

import {
  GENDER_OPTIONS,
  YEAR_OPTIONS,
  COURSE_OPTIONS,
  DESIGNATION_OPTIONS,
} from "../constants";

import "../styles/5-components.css";

/**
 * EditProfileModal
 * - Students: REQUEST profile updates (approval flow)
 * - Staff: DIRECT profile updates
 */
export default function EditProfileModal({ profile, onClose, onUpdate }) {
  // ------------------------------
  // Context & Auth
  // ------------------------------
  const { isStaff: currentUserIsStaff } = useAuth();
  const toast = useToast();

  // ------------------------------
  // Identity Checks
  // ------------------------------
  // Determine if the PROFILE being edited is a student (not the logged-in user)
  const isStudent =
    profile.role === "student" || (!profile.role && !!profile.roll_no);

  const hasPendingRequest = !!profile.pending_update;

  // ------------------------------
  // State
  // ------------------------------
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: profile.name || "",
    phone: profile.phone || "",
    gender: profile.gender || "Male",

    // Student Fields
    roll_no: profile.roll_no || "",
    room_number: profile.room_number || "",
    parent_phone: profile.parent_phone || "",
    year: profile.year || "1",
    course: profile.course || "B.Tech",

    // Staff Fields
    designation: profile.designation || "Warden",
  });

  // ------------------------------
  // Handlers
  // ------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Constraint for Phone Numbers (Max 10 digits, numbers only)
    if (name === "phone" || name === "parent_phone") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleDropdown = (key, val) => {
    setFormData({ ...formData, [key]: val });
  };

  const handleSubmit = async () => {
    // 1. Validate Common Fields
    if (!formData.name || !formData.phone) {
      toast.error("Missing Fields", "Name and Phone are required.");
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error("Invalid Phone", "Phone number must be exactly 10 digits.");
      return;
    }

    // 2. Validate Student Fields
    if (isStudent) {
      if (!formData.roll_no || !formData.room_number) {
        toast.error("Missing Fields", "Roll No and Room Number are required.");
        return;
      }

      if (!formData.parent_phone || formData.parent_phone.length !== 10) {
        toast.error("Invalid Parent Phone", "Parent phone number must be exactly 10 digits.");
        return;
      }
    }

    setLoading(true);

    try {
      // 3. Prepare Payload (Clean Data)
      const commonData = {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
      };

      const studentPayload = {
        ...commonData,
        roll_no: formData.roll_no,
        room_number: formData.room_number,
        parent_phone: formData.parent_phone,
        year: formData.year,
        course: formData.course,
      };

      const staffPayload = {
        ...commonData,
        designation: formData.designation,
      };

      const finalPayload = isStudent ? studentPayload : staffPayload;

      // 4. Perform Update
      // If Staff is editing -> Direct Update
      if (currentUserIsStaff) {
        const table = isStudent ? "students" : "staff";
        
        const { error } = await supabase
          .from(table)
          .update(finalPayload)
          .eq("id", profile.id);

        if (error) throw error;

        toast.success("Profile Updated", "Changes saved successfully.");
        onUpdate(finalPayload);
        onClose();
      }
      // If Student is editing -> Create Request
      else {
        if (hasPendingRequest) {
          toast.error("Pending Request", "You already have a pending update.");
          setLoading(false);
          return;
        }

        const { error } = await supabase
          .from("students")
          .update({ pending_update: finalPayload })
          .eq("id", profile.id);

        if (error) throw error;

        toast.success("Request Sent", "Your profile update is pending approval.");
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Theme Logic
  // ------------------------------
  const isFemale = isStudent && formData.gender === "Female";
  
  const themeStyles = isFemale
    ? {
        "--primary": "#ec4899",         
        "--primary-rgb": "236, 72, 153",
        "--primary-light": "#f472b6",   
        "--glass-border": "rgba(236, 72, 153, 0.3)",
      }
    : {
        "--primary": "#6366f1",         
        "--primary-rgb": "99, 102, 241",
        "--primary-light": "#818cf8",   
        "--glass-border": "rgba(99, 102, 241, 0.3)",
      };

  // ==============================
  // Render
  // ==============================
  return (
    <div className="modal-overlay">
      <div
        className={`modal-content glass-card animate-slide-up theme-wrapper`}
        style={{ maxWidth: "500px", width: "90%", ...themeStyles }}
      >
        {/* Header */}
        <div className="glass-header flex justify-between items-center mb-4">
          <h3 className="m-0 flex items-center gap-2 text-main">
            <Icon.UserCog className="text-primary" />
            Edit Profile
          </h3>
          <button onClick={onClose} className="btn-icon">
            <Icon.X size={18} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="form-stack gap-4 flex flex-col">
          {/* Common Fields */}
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              className="glass-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid-2 gap-4">
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="text" 
                inputMode="numeric"
                maxLength={10}
                className="glass-input"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
              />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <GlassDropdown
                options={GENDER_OPTIONS}
                value={formData.gender}
                onChange={(val) => handleDropdown("gender", val)}
              />
            </div>
          </div>

          {/* Student Fields */}
          {isStudent && (
            <>
              <div className="grid-2 gap-4">
                <div className="input-group">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    className="glass-input"
                    name="roll_no"
                    value={formData.roll_no}
                    onChange={handleChange}
                    
                  />
                </div>
                <div className="input-group">
                  <label>Room Number</label>
                  <input
                    type="text"
                    className="glass-input"
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid-2 gap-4">
                <div className="input-group">
                  <label>Year</label>
                  <GlassDropdown
                    options={YEAR_OPTIONS}
                    value={formData.year}
                    onChange={(val) => handleDropdown("year", val)}
                  />
                </div>
                <div className="input-group">
                  <label>Course</label>
                  <GlassDropdown
                    options={COURSE_OPTIONS}
                    value={formData.course}
                    onChange={(val) => handleDropdown("course", val)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Parent Phone</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  className="glass-input"
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                />
              </div>
            </>
          )}

          {/* Staff Fields */}
          {!isStudent && (
            <div className="input-group">
              <label>Designation</label>
              <GlassDropdown
                options={DESIGNATION_OPTIONS}
                value={formData.designation}
                onChange={(val) =>
                  handleDropdown("designation", val)
                }
              />
            </div>
          )}

          {/* Actions */}
          <div className="modal-btn-group mt-4 flex gap-3 justify-end">
            <button 
              onClick={onClose} 
              className="btn-glass-theme"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              className="btn-glass-theme"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isStudent && !currentUserIsStaff
                ? "Send Request"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Scoped Styles */}
      <style>{`
        .modal-btn-group {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          transition: color 0.2s ease;
        }
        .btn-icon:hover {
          color: var(--text-main);
        }

        .btn-glass-theme {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          
          background: rgba(var(--primary-rgb), 0.1);
          border: 1px solid rgba(var(--primary-rgb), 0.25);
          color: var(--primary-light);
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.05);
        }
        
        .btn-glass-theme:hover:not(:disabled) {
          background: rgba(var(--primary-rgb), 0.2);
          border-color: rgba(var(--primary-rgb), 0.5);
          color: var(--primary-light);
          box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.2);
          transform: translateY(-2px);
        }
        
        .btn-glass-theme:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-glass-theme:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        .theme-wrapper .glass-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.15) !important;
        }

        .theme-wrapper .text-primary {
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}