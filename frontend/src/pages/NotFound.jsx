import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div className="card" style={{ maxWidth: '480px', padding: '40px 30px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <Briefcase size={32} />
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
          404
        </h1>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
          Page Not Found
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
