import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminAPI } from '../services/api';
import { 
  Search, 
  Mail, 
  Calendar, 
  FileText, 
  X
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function ManageCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Candidate for History Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateApps, setCandidateApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [search]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getCandidates(search);
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (candidate) => {
    setSelectedCandidate(candidate);
    try {
      setLoadingApps(true);
      // Fetch all applications and filter by candidate userId
      const all = await adminAPI.getApplications();
      if (Array.isArray(all)) {
        const userApps = all.filter((a) => a.userId === candidate.userId);
        setCandidateApps(userApps);
      }
    } catch (err) {
      console.error('Failed to load candidate applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

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
              Registered Candidates
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Candidate directory and their historical application submissions. Passwords are never exposed.
            </p>
          </div>

          {/* Search bar */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search candidates by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px', height: '40px' }}
              />
            </div>
          </div>

          {/* Candidates Table */}
          {loading ? (
            <LoadingSpinner message="Searching registered candidates..." />
          ) : candidates.length === 0 ? (
            <div className="card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No candidates found matching your search.</p>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Candidate ID</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Role</th>
                      <th>Registered On</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c) => (
                      <tr key={c.userId}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
                          #{c.userId}
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '700'
                            }}>
                              {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Mail size={13} /> {c.email}
                          </div>
                        </td>
                        <td>
                          <span className="tag-badge" style={{ backgroundColor: '#eef2ff', color: '#4338ca', fontWeight: '600', fontSize: '11px' }}>
                            {c.role}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Calendar size={13} /> {formatDate(c.createdAt)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleViewHistory(c)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                          >
                            <FileText size={13} /> Application History
                          </button>
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

      {/* Candidate History Modal */}
      {selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Application History</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedCandidate.name} ({selectedCandidate.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="modal-close"
                style={{ background: 'none', border: 'none' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {loadingApps ? (
                <LoadingSpinner message="Loading candidate application history..." />
              ) : candidateApps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  This candidate has not submitted any job applications yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateApps.map((a) => (
                        <tr key={a.applicationId}>
                          <td style={{ fontWeight: '600' }}>{a.jobTitle}</td>
                          <td style={{ color: 'var(--primary)' }}>{a.company}</td>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {formatDate(a.applicationDate)}
                          </td>
                          <td>
                            <StatusBadge status={a.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
