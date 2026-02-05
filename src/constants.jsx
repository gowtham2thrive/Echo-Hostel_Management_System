import * as Icon from "./components/Icons"; 

export const ROLES = { STUDENT: "student", STAFF: "staff" };
export const GENDERS = { MALE: "Male", FEMALE: "Female" };
export const COURSES = [ "Diploma", "B.Tech", "M.Tech", "MBA", "MCA" ];
export const YEARS = [ "1st Year", "2nd Year", "3rd Year", "4th Year" ];

export const DESIGNATION_OPTIONS = [
  { value: "Principal", label: "Principal", icon: <Icon.Award size={16} /> },
  { value: "Faculty", label: "Faculty", icon: <Icon.BookOpen size={16} /> },
  { value: "Administrative Officer", label: "Administrative Officer", icon: <Icon.Briefcase size={16} /> },
  { value: "Warden", label: "Warden", icon: <Icon.Shield size={16} /> },
  { value: "Incharge", label: "Incharge", icon: <Icon.UserCheck size={16} /> }
];

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male", icon: <Icon.User size={16} /> },
  { value: "Female", label: "Female", icon: <Icon.User size={16} /> }
];

export const COURSE_OPTIONS = [
  { value: "Diploma", label: "Diploma" },
  { value: "B.Tech", label: "B.Tech" },
  { value: "M.Tech", label: "M.Tech" },
  { value: "MBA", label: "MBA" },
  { value: "MCA", label: "MCA" }
];

export const YEAR_OPTIONS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" }
];
// --- DROPDOWN OPTIONS (Using Valid Icons) ---
export const CATEGORY_OPTIONS = [
  { 
    value: "Hygiene", 
    label: "Hygiene", 
    icon: <Icon.Droplet size={18} className="text-info"/> 
  },
  { 
    value: "Food", 
    label: "Food Quality", 
    icon: <Icon.Utensils size={18} className="text-warning"/> 
  },
  { 
    value: "Maintenance", 
    label: "Maintenance", 
    icon: <Icon.Wrench size={18} /> // Neutral Color
  },
  { 
    value: "Discipline", 
    label: "Discipline", 
    icon: <Icon.ShieldAlert size={18} className="text-danger"/> 
  },
  { 
    value: "Other", 
    label: "Other", 
    icon: <Icon.MoreHorizontal size={18} className="text-muted"/> 
  }
];

export const SEVERITIES = { LOW: "Low", MEDIUM: "Medium", CRITICAL: "Critical" };

export const SEVERITY_OPTIONS = [
  { value: SEVERITIES.LOW, label: "Low Priority", icon: <Icon.Info size={18} className="text-success"/> },
  { value: SEVERITIES.MEDIUM, label: "Medium Priority", icon: <Icon.AlertTriangle size={18} className="text-warning"/> },
  { 
    value: SEVERITIES.CRITICAL, 
    label: "Critical Issue", 
    icon: <Icon.Zap size={18} className="text-danger animate-pulse"/> 
  }
];

export const TIME_FILTER_OPTIONS = [
  { value: "All", label: "All Time", icon: <Icon.History size={16} /> },
  { value: "Today", label: "Today", icon: <Icon.Clock size={16} /> },
  { value: "This Week", label: "This Week", icon: <Icon.Calendar size={16} /> },
  { value: "Month", label: "This Month", icon: <Icon.Calendar size={16} /> },
];

export const COMPLAINT_STATUS = { SUBMITTED: "submitted", ACKNOWLEDGED: "acknowledged", RESOLVED: "resolved", REJECTED: "rejected" };
export const OUTING_STATUS = { SUBMITTED: "submitted", APPROVED: "approved", REJECTED: "rejected", COMPLETED: "completed" };

export const STATUS_COLORS = {
  [COMPLAINT_STATUS.SUBMITTED]: "var(--primary)",
  [COMPLAINT_STATUS.ACKNOWLEDGED]: "var(--warning)",
  [COMPLAINT_STATUS.RESOLVED]: "var(--success)",
  [OUTING_STATUS.REJECTED]: "var(--danger)",
  [OUTING_STATUS.APPROVED]: "var(--info)", 
  [OUTING_STATUS.COMPLETED]: "var(--success)"
};

export const STATUS_LABELS = {
  [COMPLAINT_STATUS.SUBMITTED]: "Pending",
  [COMPLAINT_STATUS.ACKNOWLEDGED]: "In Progress",
  [COMPLAINT_STATUS.RESOLVED]: "Resolved",
  [OUTING_STATUS.REJECTED]: "Rejected",
  [OUTING_STATUS.APPROVED]: "Out / Active",
  [OUTING_STATUS.COMPLETED]: "Returned"
};

export const CATEGORIES = CATEGORY_OPTIONS.map(o => o.value);