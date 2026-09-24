import React, { useState } from 'react';

export const Tooltip: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}> = ({ content, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-3 py-1.5 text-xs font-medium text-text bg-surface-2 border border-border rounded-lg shadow-xl whitespace-nowrap pointer-events-none transition-opacity duration-150 ${
            position === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
              : 'top-full left-1/2 -translate-x-1/2 mt-2'
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
