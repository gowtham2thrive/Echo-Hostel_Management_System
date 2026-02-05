import React, { useState, useEffect } from "react";
import ComplaintCard from "../cards/ComplaintCard";
import Skeleton from "../ui/Skeleton"; 

export default function ComplaintsGrid({ 
  complaints = [], 
  loading = false, 
  onViewStudent, 
  onViewStaff, 
  isStaffView = false,
  onUpdateStatus 
}) {
  
  // Accordion State
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Masonry Layout State
  const [numCols, setNumCols] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) setNumCols(3);
      else if (window.innerWidth >= 768) setNumCols(2);
      else setNumCols(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = Array.from({ length: numCols }, () => []);
  const itemsToRender = loading ? [1,2,3,4,5,6] : complaints;

  itemsToRender.forEach((item, index) => {
    columns[index % numCols].push(item);
  });

  const gridStyle = {
    display: 'flex', gap: '1.5rem', alignItems: 'flex-start', width: '100%',
  };
  const colStyle = {
    flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0,
  };

  if (!loading && complaints.length === 0) {
    return <div className="empty-state">No complaints found.</div>;
  }

  return (
    <div style={gridStyle}>
      {columns.map((colItems, colIndex) => (
        <div key={colIndex} style={colStyle}>
          {colItems.map((item, i) => (
            loading ? (
              <div key={i} className="glass-card p-4 flex flex-col gap-3">
                <div className="flex justify-between">
                  <Skeleton width="100px" height="1.2em" />
                  <Skeleton width="60px" height="1em" />
                </div>
                <Skeleton width="100%" height="40px" />
                <div className="flex justify-between mt-2">
                  <Skeleton width="80px" height="24px" style={{borderRadius: 20}} />
                  <Skeleton width="40px" height="20px" />
                </div>
              </div>
            ) : (
              <ComplaintCard 
                key={item.id} 
                c={item} 
                onViewStaff={onViewStaff} 
                onViewStudent={onViewStudent}
                isStaffView={isStaffView}
                onUpdateStatus={onUpdateStatus}
                isExpanded={expandedCardId === item.id}
                onToggle={() => setExpandedCardId(prev => prev === item.id ? null : item.id)}
              />
            )
          ))}
        </div>
      ))}
    </div>
  );
}