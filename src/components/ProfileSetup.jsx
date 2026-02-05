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
  DESIGNATION_OPTIONS 
} from "../constants"; 

// ==============================
// VALIDATION LOGIC
// ==============================
const validateForm = (data, role) => {
  const errors = {};

  if (!data.name.trim()) errors.name = "Full Name is required.";
  if (data.phone.length !== 10) errors.phone = "Phone must be exactly 10 digits.";
  
  if (role === "student") {
    if (!data.roll_no.trim()) errors.roll_no = "Roll Number is required.";
    if (!data.room_number.trim()) errors.room_number = "Room Number is required.";
    if (data.parent_phone.length !== 10) errors.parent_phone = "Parent Phone must be exactly 10 digits.";
    if (data.phone === data.parent_phone) errors.parent_phone = "Parent phone cannot be same as student phone.";
  }

  if (role === "staff") {
    if (!data.designation) errors.designation = "Please select a designation.";
  }

  return errors;
};

export default function ProfileSetup({ session }) { 
  // FIX: Removed 'signOut' from destructuring since AuthContext doesn't provide it
  const { user: authUser, refreshProfile } = useAuth(); 
  const toast = useToast();
  
  const initialUser = session?.user || authUser;
  const [role, setRole] = useState("student"); 
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); 

  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    phone: "",
    roll_no: "",
    room_number: "",
    parent_phone: "",
    year: "1",
    course: "B.Tech",
    designation: "Warden" 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanedValue = value;

    // Constraint: Numbers only for phone
    if (name === "phone" || name === "parent_phone") {
      cleanedValue = value.replace(/\D/g, "").slice(0, 10);
    }
    // Constraint: Text only for name
    if (name === "name") {
      cleanedValue = value.replace(/[^a-zA-Z\s]/g, "");
    }
    // Constraint: Alphanumeric uppercase for Roll No
    if (name === "roll_no") {
      cleanedValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleDropdown = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation
    const validationErrors = validateForm(formData, role);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Validation Failed", "Please check the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      // 2. Prepare Base Payload (Matches DB Schema)
      const commonData = {
        id: initialUser.id,
        email: initialUser.email,
        name: formData.name.trim(),
        gender: formData.gender,
        phone: formData.phone,
        // Note: 'is_approved' is left to DB default (False)
        // Note: 'updated_at' removed as it is not in your schema
      };

      const table = role === "student" ? "students" : "staff";
      
      // 3. Prepare Role-Specific Payload
      let payload = {};

      if (role === "student") {
        payload = {
          ...commonData,
          roll_no: formData.roll_no.trim(),
          room_number: formData.room_number.trim(),
          parent_phone: formData.parent_phone,
          year: formData.year,
          course: formData.course
        };
      } else {
        payload = {
          ...commonData,
          designation: formData.designation
        };
      }

      // 4. Insert into Database
      const { error } = await supabase.from(table).upsert(payload);
      if (error) throw error;

      // 5. Refresh App State
      // This will trigger the app to re-check 'is_approved' status
      await refreshProfile(); 
      toast.success("Profile Created", `Welcome to Echo, ${formData.name}!`);

    } catch (err) {
      console.error("Profile Setup Error:", err);
      toast.error("Error", err.message || "Failed to save profile.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- THEME ENGINE ---
  const isFemale = role === 'student' && formData.gender === "Female";
  
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
  // RENDER
  // ==============================
  return (
    <div className="flex-center min-h-screen p-4" style={{ background: "var(--bg-main)" }}>
      
      <div 
        className="glass-card animate-slide-up w-full p-8 theme-wrapper"
        style={{ maxWidth: "550px", width: "100%", ...themeStyles }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex-center justify-center mb-3">
             <div 
               className="p-3 rounded-full flex items-center justify-center"
               style={{ 
                 color: "var(--primary)" 
               }}
             >
               <Icon.UserPlus size={32} />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-main">Complete Your Profile</h2>
        </div>

        {/* --- CHANGED: Segmented Control Style --- */}
        <div className="flex-center justify-center mb-8">
          <div className="toggle-container">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`btn-toggle ${role === "student" ? "active" : "inactive"}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("staff")}
              className={`btn-toggle ${role === "staff" ? "active" : "inactive"}`}
            >
              Staff
            </button>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="input-group">
            <label>Full Name</label>
            <input 
              name="name" 
              type="text" 
              className={`glass-input ${errors.name ? "border-red-500" : ""}`}
              placeholder="e.g. John Doe" 
              value={formData.name} 
              onChange={handleChange} 
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          <div className="grid-row">
            <div className="input-group">
              <label>Phone Number</label>
              <input 
                name="phone" 
                type="text" 
                inputMode="numeric"
                className={`glass-input ${errors.phone ? "border-red-500" : ""}`}
                placeholder="10 Digits" 
                value={formData.phone} 
                onChange={handleChange} 
              />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
            </div>
            
            <div className="input-group">
              <label>Gender</label>
              <GlassDropdown 
                options={GENDER_OPTIONS} 
                value={formData.gender} 
                onChange={(val) => handleDropdown('gender', val)} 
              />
            </div>
          </div>

          {/* Student Fields */}
          {role === "student" && (
            <>
              <div className="grid-row">
                <div className="input-group">
                  <label>Roll Number</label>
                  <input 
                    name="roll_no" 
                    type="text" 
                    className={`glass-input ${errors.roll_no ? "border-red-500" : ""}`}
                    placeholder="e.g. 22A91A..." 
                    value={formData.roll_no} 
                    onChange={handleChange} 
                  />
                  {errors.roll_no && <span className="text-xs text-red-500">{errors.roll_no}</span>}
                </div>
                <div className="input-group">
                  <label>Room No</label>
                  <input 
                    name="room_number" 
                    type="text" 
                    className={`glass-input ${errors.room_number ? "border-red-500" : ""}`}
                    placeholder="e.g. 101-A" 
                    value={formData.room_number} 
                    onChange={handleChange} 
                  />
                  {errors.room_number && <span className="text-xs text-red-500">{errors.room_number}</span>}
                </div>
              </div>

              <div className="grid-row">
                <div className="input-group">
                  <label>Course</label>
                  <GlassDropdown 
                    options={COURSE_OPTIONS} 
                    value={formData.course} 
                    onChange={(val) => handleDropdown('course', val)} 
                  />
                </div>
                <div className="input-group">
                  <label>Year</label>
                  <GlassDropdown 
                    options={YEAR_OPTIONS} 
                    value={formData.year} 
                    onChange={(val) => handleDropdown('year', val)} 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Parent's Phone</label>
                <input 
                  name="parent_phone" 
                  type="text" 
                  inputMode="numeric"
                  className={`glass-input ${errors.parent_phone ? "border-red-500" : ""}`}
                  placeholder="Emergency Contact" 
                  value={formData.parent_phone} 
                  onChange={handleChange} 
                />
                {errors.parent_phone && <span className="text-xs text-red-500">{errors.parent_phone}</span>}
              </div>
            </>
          )}

          {/* Staff Fields */}
          {role === "staff" && (
            <div className="input-group">
               <label>Designation</label>
               <GlassDropdown 
                 options={DESIGNATION_OPTIONS} 
                 value={formData.designation} 
                 onChange={(val) => handleDropdown('designation', val)} 
               />
               {errors.designation && <span className="text-xs text-red-500">{errors.designation}</span>}
            </div>
          )}

          <div><p></p></div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-4">
            <button 
              className="btn-glass-theme w-full" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Save Profile"}
            </button>

            {/* FIX: Direct supabase sign out with reload */}
            <button 
              type="button" 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }} 
              className="btn-text-muted self-center"
            >
              Sign Out & Try Later
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .text-main-primary { color: var(--primary); }
        
        .grid-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 480px) {
          .grid-row { grid-template-columns: 1fr; }
        }

        /* --- UPDATED: Segmented Control Container --- */
        .toggle-container {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          padding: 4px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* --- UPDATED: Button Style to match Tabs --- */
        .btn-toggle {
          padding: 8px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .btn-toggle.active {
          background: rgba(var(--primary-rgb), 0.2);
          border-color: rgba(var(--primary-rgb), 0.3);
          color: var(--primary-light);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .btn-toggle.inactive {
          background: transparent;
          color: var(--text-muted);
          opacity: 0.7;
        }
        .btn-toggle.inactive:hover {
          color: var(--text-main);
          opacity: 1;
        }

        .theme-wrapper .glass-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.15) !important;
        }

        .btn-glass-theme {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
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

        .btn-text-muted {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          text-decoration: underline;
          opacity: 0.8;
          transition: all 0.2s;
        }
        .btn-text-muted:hover {
          color: var(--text-main);
          opacity: 1;
        }
      `}</style>
    </div>
  );
}