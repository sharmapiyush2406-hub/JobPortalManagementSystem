import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { candidateAPI } from '../services/api';
import { User, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function CandidateProfile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim() || !email.trim()) {
      setFeedback({ type: 'error', message: 'Name and email cannot be empty.' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setFeedback({ type: 'error', message: 'New password confirmation does not match.' });
        return;
      }
      if (!currentPassword) {
        setFeedback({ type: 'error', message: 'Please enter your current password to authorize this password change.' });
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await candidateAPI.updateProfile(payload);
      if (res && res.user) {
        updateUser(res.user);
      }
      setFeedback({ type: 'success', message: 'Profile details updated successfully in MySQL!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '30px',
            fontWeight: '800',
            color: 'var(--text-main)'
          }}>
            Account Profile
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage your personal profile details and account security settings.
          </p>
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '24px' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Account Info Summary Card */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '800'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{user?.name}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Role: <strong style={{ color: 'var(--primary)' }}>{user?.role}</strong></span>
              <span>&bull;</span>
              <span>Joined: {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-main)' }}>
              Personal Information
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '38px', height: '42px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px', height: '42px' }}
                  required
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', margin: '28px 0 24px', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                Change Password
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Leave these fields blank if you do not wish to change your password.
              </p>

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter current password to verify"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ paddingLeft: '38px', height: '42px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password (min 6 chars)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ paddingLeft: '38px', height: '42px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    style={{ paddingLeft: '38px', height: '42px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: '150px' }}
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
