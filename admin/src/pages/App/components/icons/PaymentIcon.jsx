import React from 'react';

const PaymentIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8h20v12H2V8zm2 2v8h16V10H4z" fill={color} />
    <path d="M2 4h20v2H2V4z" fill={color} />
  </svg>
);

export default PaymentIcon;
