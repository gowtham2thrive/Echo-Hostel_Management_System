// src/utils/formatters.js

// 1. Standard Date Format (e.g., "16 Jan 2026")
export const formatDate = (input) => {
  if (!input) return 'N/A';
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// 2. Full Date & Time (e.g., "16 Jan 2026, 08:30 PM")
export const formatDateTime = (input) => {
  if (!input) return 'N/A';
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

// 3. Time Only (e.g., "08:30 PM")
// Handles: Date objects, ISO strings ("2023-01-01T14:30:00"), and Time strings ("14:30:00")
export const formatTime = (input) => {
  if (!input) return '';
  
  let date;
  
  // Case A: Input is already a Date Object
  if (input instanceof Date) {
    date = input;
  } 
  // Case B: Input is a String
  else if (typeof input === 'string') {
    // Check if it's a simple time string like "13:30" or "13:30:00" (no 'T', no '-')
    if (input.includes(':') && !input.includes('T') && !input.includes('-')) {
       date = new Date(`1970-01-01T${input}`);
    } else {
       // It's likely an ISO string
       date = new Date(input);
    }
  } 
  else {
    return '';
  }

  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};