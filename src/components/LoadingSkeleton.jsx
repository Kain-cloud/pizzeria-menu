import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex bg-white rounded-xl border border-warm-200 overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="w-[88px] shrink-0 skeleton" style={{ minHeight: 88 }} />
          <div className="flex-1 p-3 flex flex-col gap-2">
            <div className="skeleton h-4 w-3/5 rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
            <div className="flex gap-2 mt-auto pt-1">
              <div className="skeleton h-6 w-16 rounded-md" />
              <div className="skeleton h-6 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
