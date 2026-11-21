import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isCandidate } = useAuth();

  const [title, setTitle] = useState(searchParams.get('title') || searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'All');

  // Confirmation modal state for applying
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  useEffect(() => {
    fetchJobs();
    if (user && isCandidate) {
      fetchUserApplications();
    }
  }, [searchParams, user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      const t = searchParams.get('title') || searchParams.get('search');
      const loc = searchParams.get('location');
      const type = searchParams.get('jobType');

      if (t) params.title = t;
      if (loc) params.location = loc;
      if (type && type !== 'All') params.jobType = type;

      const data = await jobAPI.getAll(params);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setFeedback({ type: 'error', message: err.message || 'Could not load jobs from MySQL database.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const myApps = await applicationAPI.getMyApplications();
      if (Array.isArray(myApps)) {
        const idSet = new Set(myApps.map((a) => a.jobId));
        setAppliedJobIds(idSet);
      }
    } catch (err) {
      // Ignore if unauthenticated
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (title.trim()) params.append('title', title.trim());
    if (location.trim()) params.append('location', location.trim());
    if (jobType && jobType !== 'All') params.append('jobType', jobType);
    setSearchParams(params);
  };

  const handleClear = () => {
    setTitle('');
    setLocation('');
    setJobType('All');
    setSearchParams(new URLSearchParams());
  };

  const handleApplyClick = (job) => {
    if (!user) {
      navigate('/login', {
        state: { message: `Please log in to apply for ${job.title} at ${job.company}.` },
      });
      return;
    }
    if (user.role === 'ADMIN') {
      setFeedback({ type: 'error', message: 'You are logged in as Admin. Admins cannot apply for jobs.' });
      return;
    }
    setSelectedJobToApply(job);
  };

  const confirmApply = async () => {
    if (!selectedJobToApply) return;
    try {
      await applicationAPI.apply(selectedJobToApply.jobId);
      setAppliedJobIds((prev) => new Set([...prev, selectedJobToApply.jobId]));
      setFeedback({
        type: 'success',
        message: `Application submitted successfully for ${selectedJobToApply.title} at ${selectedJobToApply.company}!`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit application.' });
    } finally {
      setSelectedJobToApply(null);
    }
  };

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container">
        {/* Page Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '32px',
            fontWeight: '800',
            color: 'var(--text-main)'
          }}>
            Browse Job Openings
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Discover and apply to top engineering and tech roles across verified companies.
          </p>
        </div>

        {/* Search & Filters */}
        <div style={{ marginBottom: '32px' }}>
          <SearchBar
            title={title}
            location={location}
            jobType={jobType}
            onTitleChange={setTitle}
            onLocationChange={setLocation}
            onJobTypeChange={setJobType}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '24px' }}>
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

        {/* Results Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>
            Showing {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <LoadingSpinner message="Searching jobs from MySQL database..." />
        ) : jobs.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Briefcase size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Jobs Matched Your Search</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
              Try searching with different keywords, relaxing location filters, or resetting filters.
            </p>
            <button onClick={handleClear} className="btn btn-secondary btn-sm">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {jobs.map((job) => (
              <JobCard
                key={job.jobId}
                job={job}
                isApplied={appliedJobIds.has(job.jobId)}
                onApply={handleApplyClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Applying */}
      <ConfirmationModal
        isOpen={Boolean(selectedJobToApply)}
        title="Confirm Job Application"
        message={`Are you sure you want to apply for "${selectedJobToApply?.title}" at ${selectedJobToApply?.company}? Your registered profile name and email will be forwarded to the recruiter.`}
        confirmText="Submit Application"
        onConfirm={confirmApply}
        onCancel={() => setSelectedJobToApply(null)}
      />
    </div>
  );
}
