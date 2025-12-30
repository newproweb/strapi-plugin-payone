import React from 'react';

const BankIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} />
    <path d="M12 6l-1.5 3L7 8.5l2.5 2.5L8 14l4-2.5L16 14l-1.5-3L18 8.5l-3.5.5L12 6z" fill={color} />
  </svg>
);

export default BankIcon;
