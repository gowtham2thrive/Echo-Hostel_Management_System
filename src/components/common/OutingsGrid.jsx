import React, { useState, useEffect } from "react";
import OutingCard from "../cards/OutingCard";
import Skeleton from "../ui/Skeleton";
import { OUTING_STATUS } from "../../constants";

export default function OutingsGrid({
  outings = [],
  loading = false,
  isStaffView = false,
  formatTime,
  formatDateTime,
  selectedIds = [],
  onSelect,
  onApprove,
  onReject,
  onViewProfile, 
}) {
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
  const itemsToRender = loading ? [1, 2, 3, 4, 5, 6] : outings;

  itemsToRender.forEach((item, index) => {
    columns[index % numCols].push(item);
  });

  const gridStyle = {
    display: 'flex', gap: '1.5rem', alignItems: 'flex-start', width: '100%',
  };
  const colStyle = {
    flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0,
  };

  if (!loading && outings.length === 0) {
    return (
      <div className="empty-state-glass" style={{ width: '100%', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
         <div style={{ opacity: 0.7 }}>No records found.</div>
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {columns.map((colItems, colIndex) => (
        <div key={colIndex} style={colStyle}>
          {colItems.map((item, i) => (
            loading ? (
              <div key={i} className="glass-card p-4 flex flex-col gap-3">
                 <div className="flex justify-between items-center">
                   <Skeleton width="120px" height="1.4em" />
                   <Skeleton width="80px" height="1em" />
                 </div>
                 <Skeleton width="100%" height="20px" />
                 <div className="flex justify-between mt-2">
                   <Skeleton width="90px" height="26px" style={{borderRadius: 20}} />
                   <Skeleton width="120px" height="1em" />
                 </div>
              </div>
            ) : (
              <OutingCard
                key={item.id}
                outing={item}
                isStaffView={isStaffView}
                formatTime={formatTime}
                formatDateTime={formatDateTime}
                isSelected={selectedIds.includes(item.id)}
                onSelect={onSelect ? () => onSelect(item.id) : undefined}
                onApprove={() => onApprove && onApprove(item.id, OUTING_STATUS.APPROVED)}
                onReject={() => onReject && onReject(item.id, OUTING_STATUS.REJECTED)}
                // ✅ FIX: Ensure both student and approver chips trigger the profile fetcher
                onViewStudent={onViewProfile}
                onViewApprover={onViewProfile}
              />
            )
          ))}
        </div>
      ))}
    </div>
  );
}