import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, Key } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setEmail('admin@jobportal.com');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide admin credentials.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      if (user.role !== 'ADMIN') {
        setError('Access denied: Ordinary candidate accounts cannot access the admin panel.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: '#0f172a'
    }}>
      <div className="card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        boxShadow: 'var(--shadow-lg)',
        color: '#f8fafc'
      }}>
        {/* Admin Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#0a66c2',
            color: '#ffffff',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 4px 14px rgba(10, 102, 194, 0.4)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '24px',
            fontWeight: '800',
            color: '#ffffff'
          }}>
            Admin Portal Login
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Restricted access for Job Portal Administrators.
          </p>
        </div>

        {/* Demo Credentials Pill */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px dashed #38bdf8',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            <div>Demo: <strong style={{ color: '#38bdf8' }}>admin@jobportal.com</strong></div>
            <div>Password: <strong style={{ color: '#38bdf8' }}>admin123</strong></div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-sm"
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '11px',
              padding: '4px 10px'
            }}
          >
            <Key size={12} /> Auto-fill
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: '13px', backgroundColor: '#450a0a', borderColor: '#991b1b', color: '#fca5a5' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#cbd5e1' }}>Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                className="form-control"
                placeholder="admin@jobportal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  paddingLeft: '38px',
                  height: '42px',
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#ffffff'
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#cbd5e1' }}>Admin Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                className="form-control"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  paddingLeft: '38px',
                  height: '42px',
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#ffffff'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', marginTop: '12px', backgroundColor: '#0284c7' }}
            disabled={loading}
          >
            {loading ? 'Verifying Admin Session...' : 'Authorize & Enter Admin Panel'}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #334155',
          textAlign: 'center',
          fontSize: '13px'
        }}>
          <Link to="/login" style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Back to Candidate Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
