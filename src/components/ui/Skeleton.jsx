import React from 'react';

export default function Skeleton({ 
  type = "text",   // 'text' | 'avatar' | 'rect'
  width, 
  height, 
  className = "" 
}) {
  const styles = {
    width: width || (type === "text" ? "100%" : ""),
    height: height || (type === "text" ? "1em" : ""),
    borderRadius: type === "avatar" ? "50%" : "8px",
  };

  return (
    <div 
      className={`skeleton ${className}`} 
      style={styles} 
      role="status" 
      aria-label="Loading..."
    />
  );
}