import React from 'react';

export default function ParaliPayBrandLogo({ size = 26, fontSize = '22px', onClick }) {
  return (
    <div 
      onClick={onClick} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '9px', 
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      {/* Precision 2-tone leaf logo icon matching the ParaliPay brand mark */}
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M6 26C6 26 8 15 16.5 9.5C24.5 4.5 28 6 28 6C28 6 26.5 15.5 19.5 22.5C13 29 6 26 6 26Z" 
          fill="#15803d" 
        />
        <path 
          d="M12.5 24.5C12.5 24.5 16.5 18.5 22.5 14.5C28 10.5 28 6 28 6C28 6 24 14 18 20.5C12.5 26.5 12.5 24.5 12.5 24.5Z" 
          fill="#4ade80" 
          opacity="0.85" 
        />
        <path 
          d="M6 26C11 20.5 17 14.5 27 7" 
          stroke="#0f382c" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
        />
      </svg>
      <span style={{ 
        fontWeight: 800, 
        fontSize, 
        color: '#0f382c', 
        letterSpacing: '-0.4px', 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        ParaliPay
      </span>
    </div>
  );
}
