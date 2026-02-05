import React from 'react';

export default function Pagination({ page, hasMore, onNext, onPrev }) {
  return (
    <div className="pagination-wrapper">
      <button 
        disabled={page === 1}
        onClick={onPrev}
        className="btn-mini"
      >
        &larr; Previous
      </button>
      
      <span className="text-muted text-sm font-bold">Page {page}</span>
      
      <button 
        disabled={!hasMore}
        onClick={onNext}
        className="btn-mini"
      >
        Next &rarr;
      </button>
    </div>
  );
}