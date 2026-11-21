import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function JobCard({ job, onApply, isApplied = false, showApply = true }) {
  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      padding: '24px',
      position: 'relative'
    }}>
      <div>
        {/* Top Header: Title & Job Type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-main)',
              lineHeight: '1.3'
            }}>
              <Link to={`/jobs/${job.jobId}`} style={{ color: 'inherit' }}>
                {job.title}
              </Link>
            </h3>
            <p style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--primary)',
              marginTop: '4px'
            }}>
              {job.company}
            </p>
          </div>
          <span className="tag-badge" style={{
            backgroundColor: job.jobType === 'Remote' ? '#ecfdf5' : '#f1f5f9',
            color: job.jobType === 'Remote' ? '#047857' : '#334155',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            {job.jobType || 'Full Time'}
          </span>
        </div>

        {/* Metadata: Location & Salary */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          margin: '12px 0 16px',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={15} color="var(--primary)" />
            <span>{job.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IndianRupee size={15} color="var(--success)" />
            <span style={{ fontWeight: '600', color: '#166534' }}>{job.salary}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={15} />
            <span>{formatDate(job.createdAt)}</span>
          </div>
        </div>

        {/* Description snippet */}
        <p style={{
          fontSize: '13.5px',
          color: '#475569',
          lineHeight: '1.5',
          marginBottom: '20px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {job.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)',
        gap: '12px'
      }}>
        <Link to={`/jobs/${job.jobId}`} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
          View Details
        </Link>

        {showApply && (
          isApplied ? (
            <span className="status-badge shortlisted" style={{ padding: '8px 14px' }}>
              <CheckCircle2 size={14} /> Applied
            </span>
          ) : (
            <button
              onClick={() => onApply && onApply(job)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              Apply Now
            </button>
          )
        )}
      </div>
    </div>
  );
}
