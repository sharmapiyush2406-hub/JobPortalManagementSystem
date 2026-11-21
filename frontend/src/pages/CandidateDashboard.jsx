import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Clock, 
  User, 
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const successMessage = location.state?.message;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await candidateAPI.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load candidate stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container">
        {/* Welcome Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary)',
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              <User size={15} /> Candidate Dashboard
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--text-main)'
            }}>
              Welcome back, {user?.name}!
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Here is a summary of your job search progress and application statuses.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/jobs" className="btn btn-primary">
              <Briefcase size={16} /> Browse New Jobs
            </Link>
            <Link to="/candidate/profile" className="btn btn-secondary">
              Edit Profile
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: '24px' }}>
            {successMessage}
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Calculating real-time candidate statistics from MySQL..." />
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '36px'
            }}>
              <DashboardCard
                title="Available Jobs"
                value={stats?.totalJobs || 0}
                icon={Briefcase}
                color="#0a66c2"
                bg="#e8f3fc"
                subtitle="Active positions in portal"
              />

              <DashboardCard
                title="Submitted Applications"
                value={stats?.candidateTotalApplications || 0}
                icon={FileText}
                color="#6366f1"
                bg="#eef2ff"
                subtitle="Total applied positions"
              />

              <DashboardCard
                title="Shortlisted"
                value={stats?.candidateShortlistedCount || 0}
                icon={CheckCircle2}
                color="#057642"
                bg="#e6f4ea"
                subtitle="Approved by recruiters"
              />

              <DashboardCard
                title="Under Review"
                value={stats?.candidatePendingCount || 0}
                icon={Clock}
                color="#b25e00"
                bg="#fef3c7"
                subtitle="Pending recruiter decision"
              />
            </div>

            {/* Recent Applications Section */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
                    Recent Applications
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Live status updates managed by the Administrator.
                  </p>
                </div>
                <Link to="/candidate/applications" className="btn btn-outline btn-sm">
                  View All ({stats?.candidateTotalApplications || 0}) <ArrowRight size={14} />
                </Link>
              </div>

              {!stats?.recentApplications || stats.recentApplications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ marginBottom: '16px' }}>You haven't submitted any job applications yet.</p>
                  <Link to="/jobs" className="btn btn-primary btn-sm">
                    Find and Apply for Jobs
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Location</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentApplications.slice(0, 5).map((app) => (
                        <tr key={app.applicationId}>
                          <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                            <Link to={`/jobs/${app.jobId}`}>
                              {app.jobTitle}
                            </Link>
                          </td>
                          <td style={{ color: 'var(--primary)', fontWeight: '500' }}>
                            {app.company}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '13px' }}>
                              <MapPin size={14} /> {app.location}
                            </div>
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
                            <Link to={`/jobs/${app.jobId}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '12px' }}>
                              View Job
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
