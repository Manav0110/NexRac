import React from 'react';

export default function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className="toast toast-liked">
          <span className="toast-icon">{toast.icon}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
