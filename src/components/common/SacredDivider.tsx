import React from 'react';

export const SacredDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-3 py-2 opacity-60 ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#B89A5A]/30 to-transparent" />
      <span className="text-[#B89A5A] text-xs select-none">❖</span>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#B89A5A]/30 to-transparent" />
    </div>
  );
};
