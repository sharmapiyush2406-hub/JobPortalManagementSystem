import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminAPI } from '../services/api';
import { 
  Briefcase, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  ArrowRight,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalApps = stats?.totalApplications || 0;
  const pending = stats?.pendingApplications || 0;
  const shortlisted = stats?.shortlistedApplications || 0;
  const rejected = stats?.rejectedApplications || 0;

  const pendingPct = totalApps > 0 ? Math.round((pending / totalApps) * 100) : 0;
  const shortlistedPct = totalApps > 0 ? Math.round((shortlisted / totalApps) * 100) : 0;
  const rejectedPct = totalApps > 0 ? Math.round((rejected / totalApps) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '36px', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#b25e00',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                marginBottom: '4px'
              }}>
                <ShieldCheck size={16} /> Portal Administration
              </div>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '28px',
                fontWeight: '800',
                color: 'var(--text-main)'
              }}>
                Administrator Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Overview of jobs, candidate registrations, and hiring status workflows.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/admin/jobs" className="btn btn-primary">
                <PlusCircle size={16} /> Post New Job
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Querying live metrics from MySQL database..." />
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
              }}>
                <DashboardCard
                  title="Total Job Listings"
                  value={stats?.totalJobs || 0}
                  icon={Briefcase}
                  color="#0a66c2"
                  bg="#e8f3fc"
                  subtitle="Openings available to candidates"
                />

                <DashboardCard
                  title="Registered Candidates"
                  value={stats?.totalCandidates || 0}
                  icon={Users}
                  color="#6366f1"
                  bg="#eef2ff"
                  subtitle="Active job seekers"
                />

                <DashboardCard
                  title="Total Applications"
                  value={stats?.totalApplications || 0}
                  icon={FileText}
                  color="#0f172a"
                  bg="#f1f5f9"
                  subtitle="All submitted candidacies"
                />

                <DashboardCard
                  title="Under Review"
                  value={stats?.pendingApplications || 0}
                  icon={Clock}
                  color="#b25e00"
                  bg="#fef3c7"
                  subtitle="Awaiting admin action"
                />

                <DashboardCard
                  title="Shortlisted"
                  value={stats?.shortlistedApplications || 0}
                  icon={CheckCircle2}
                  color="#057642"
                  bg="#e6f4ea"
                  subtitle="Selected candidates"
                />

                <DashboardCard
                  title="Rejected"
                  value={stats?.rejectedApplications || 0}
                  icon={XCircle}
                  color="#cc1016"
                  bg="#fde8e8"
                  subtitle="Declined applications"
                />
              </div>

              {/* Status Distribution & Analytics Section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                {/* Application Funnel Chart / Breakdown */}
                <div className="card" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <BarChart3 size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '17px', fontWeight: '700' }}>
                      Application Status Distribution
                    </h3>
                  </div>

                  {totalApps === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No applications recorded yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {/* Shortlisted */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--success)' }}>Shortlisted ({shortlisted})</span>
                          <span style={{ color: 'var(--text-muted)' }}>{shortlistedPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${shortlistedPct}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '999px', transition: 'width 0.5s' }} />
                        </div>
                      </div>

                      {/* Pending / Applied */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--warning)' }}>Applied / Under Review ({pending})</span>
                          <span style={{ color: 'var(--text-muted)' }}>{pendingPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pendingPct}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '999px', transition: 'width 0.5s' }} />
                        </div>
                      </div>

                      {/* Rejected */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--danger)' }}>Rejected ({rejected})</span>
                          <span style={{ color: 'var(--text-muted)' }}>{rejectedPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${rejectedPct}%`, height: '100%', backgroundColor: 'var(--danger)', borderRadius: '999px', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Management Shortcuts */}
                <div className="card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px' }}>
                    Quick Management Actions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link
                      to="/admin/jobs"
                      className="card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: 'none',
                        color: 'var(--text-main)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>Manage Job Postings</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Create, edit, search and delete listings</div>
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </Link>

                    <Link
                      to="/admin/applications"
                      className="card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: 'none',
                        color: 'var(--text-main)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#e6f4ea', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>Review Applications</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Shortlist or reject candidate profiles</div>
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </Link>

                    <Link
                      to="/admin/candidates"
                      className="card"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: 'none',
                        color: 'var(--text-main)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>Candidate Directory</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>View registered job seekers and history</div>
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
