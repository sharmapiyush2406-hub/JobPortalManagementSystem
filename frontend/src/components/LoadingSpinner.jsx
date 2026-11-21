import React from 'react';

export default function LoadingSpinner({ message = 'Loading data...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}
