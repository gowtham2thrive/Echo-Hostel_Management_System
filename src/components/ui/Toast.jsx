import React from 'react';
import * as Icon from "../Icons";

export default function Toast({ toast }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="toast-container">
      <div className={`glass-toast ${isSuccess ? 'success' : 'error'}`}>
        <div className={`icon-box ${isSuccess ? 'text-success' : 'text-danger'}`}>
          {isSuccess ? <Icon.CheckCircle size={24} /> : <Icon.AlertTriangle size={24} />}
        </div>
        <div className="toast-text-wrapper">
          <div className="toast-title">{toast.title}</div>
          <div className="toast-message">{toast.msg}</div>
        </div>
      </div>
    </div>
  );
}