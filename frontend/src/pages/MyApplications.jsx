import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Briefcase, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationAPI.getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '30px',
              fontWeight: '800',
              color: 'var(--text-main)'
            }}>
              My Job Applications
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Track the hiring stages and status for all your submitted positions.
            </p>
          </div>

          <Link to="/jobs" className="btn btn-primary">
            <Briefcase size={16} /> Explore More Jobs
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            {/* Status Tabs */}
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

            {/* Keyword Search */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Filter by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <LoadingSpinner message="Fetching your application history..." />
        ) : filteredApplications.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              No Applications Found
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {applications.length === 0
                ? "You haven't submitted any job applications yet."
                : 'No applications match your selected filter criteria.'}
            </p>
            <Link to="/jobs" className="btn btn-primary btn-sm">
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Title &amp; Company</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Job Type</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.applicationId}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px' }}>
                          <Link to={`/jobs/${app.jobId}`}>
                            {app.jobTitle}
                          </Link>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', marginTop: '2px' }}>
                          {app.company}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          <MapPin size={14} /> {app.location}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534', fontWeight: '600', fontSize: '13px' }}>
                          <IndianRupee size={14} /> {app.salary}
                        </div>
                      </td>
                      <td>
                        <span className="tag-badge" style={{ fontSize: '11px' }}>
                          {app.jobType || 'Full Time'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {formatDate(app.applicationDate)}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>
                        <Link
                          to={`/jobs/${app.jobId}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          <ExternalLink size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
