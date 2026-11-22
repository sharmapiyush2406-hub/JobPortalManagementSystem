import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminAPI, applicationAPI } from '../services/api';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Building2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function ManageApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getApplications(statusFilter);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to retrieve applications.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await applicationAPI.updateStatus(appId, newStatus);
      setFeedback({
        type: 'success',
        message: `Application #${appId} status updated to "${newStatus}" in MySQL!`,
      });
      // Locally update application status for instant reactivity
      setApplications((prev) =>
        prev.map((app) => (app.applicationId === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const q = searchTerm.toLowerCase();
    return (
      (app.candidateName && app.candidateName.toLowerCase().includes(q)) ||
      (app.candidateEmail && app.candidateEmail.toLowerCase().includes(q)) ||
      (app.jobTitle && app.jobTitle.toLowerCase().includes(q)) ||
      (app.company && app.company.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '36px', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--text-main)'
            }}>
              Candidate Applications
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Review submitted candidacies, shortlist qualifying talent, or update application decisions.
            </p>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px' }}>
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
              <button
                onClick={() => setFeedback(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                &times;
              </button>
            </div>
          )}

          {/* Filters & Search */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Applied', 'Shortlisted', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: '1px solid',
                      borderColor: statusFilter === status ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: statusFilter === status ? 'var(--primary-light)' : '#ffffff',
                      color: statusFilter === status ? 'var(--primary)' : 'var(--secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search candidate name, email, or job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '38px', height: '38px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Applications Table */}
          {loading ? (
            <LoadingSpinner message="Retrieving applications from MySQL database..." />
          ) : filteredApplications.length === 0 ? (
            <div className="card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No applications found matching the selected filter.</p>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Candidate Details</th>
                      <th>Applied Position</th>
                      <th>Applied Date</th>
                      <th>Current Status</th>
                      <th style={{ textAlign: 'right' }}>Admin Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => (
                      <tr key={app.applicationId}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
                          #{app.applicationId}
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                            {app.candidateName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            <Mail size={12} /> {app.candidateEmail}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                            {app.jobTitle}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            <Building2 size={12} /> {app.company} &bull; {app.location}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {formatDate(app.applicationDate)}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            {app.status !== 'Shortlisted' && (
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId, 'Shortlisted')}
                                className="btn btn-sm btn-success"
                                disabled={updatingId === app.applicationId}
                                style={{ padding: '4px 12px', fontSize: '12px' }}
                              >
                                <CheckCircle2 size={13} /> Shortlist
                              </button>
                            )}

                            {app.status !== 'Rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(app.applicationId, 'Rejected')}
                                className="btn btn-sm btn-danger-outline"
                                disabled={updatingId === app.applicationId}
                                style={{ padding: '4px 12px', fontSize: '12px' }}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
