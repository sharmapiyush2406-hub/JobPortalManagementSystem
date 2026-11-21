import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'Applied').toLowerCase();

  if (normalized === 'shortlisted') {
    return (
      <span className="status-badge shortlisted">
        <CheckCircle2 size={13} /> Shortlisted
      </span>
    );
  }

  if (normalized === 'rejected') {
    return (
      <span className="status-badge rejected">
        <XCircle size={13} /> Rejected
      </span>
    );
  }

  return (
    <span className="status-badge applied">
      <Clock size={13} /> Applied
    </span>
  );
}
