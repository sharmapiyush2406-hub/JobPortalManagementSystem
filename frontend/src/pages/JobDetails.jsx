import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCandidate } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const data = await jobAPI.getById(id);
      setJob(data);

      // Check if user already applied
      if (user && isCandidate) {
        const myApps = await applicationAPI.getMyApplications();
        if (Array.isArray(myApps)) {
          const applied = myApps.some((a) => a.jobId === parseInt(id));
          setIsApplied(applied);
        }
      }
    } catch (err) {
      setError(err.message || 'Job not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login', {
        state: { message: `Please log in to apply for ${job?.title} at ${job?.company}.` },
      });
      return;
    }
    if (user.role === 'ADMIN') {
      setFeedback({ type: 'error', message: 'Admins cannot apply for jobs.' });
      return;
    }
    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    try {
      await applicationAPI.apply(job.jobId);
      setIsApplied(true);
      setFeedback({
        type: 'success',
        message: `Congratulations! Your application for "${job.title}" has been submitted successfully.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Application failed.' });
    } finally {
      setShowApplyModal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 140px)' }}>
        <LoadingSpinner message="Retrieving job details from Java Servlet backend..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
          <AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '16px' }} />
          <h3>Job Not Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '20px' }}>
            {error || 'The requested job posting may have been removed or does not exist.'}
          </p>
          <Link to="/jobs" className="btn btn-primary btn-sm">
            <ArrowLeft size={16} /> Back to Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', padding: '40px 0 80px', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <ArrowLeft size={16} /> Back to Browse Jobs
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '24px' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Main Job Header Card */}
        <div className="card" style={{ padding: '36px', marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <span className="tag-badge" style={{
                backgroundColor: job.jobType === 'Remote' ? '#ecfdf5' : '#e0f2fe',
                color: job.jobType === 'Remote' ? '#047857' : '#0369a1',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                {job.jobType || 'Full Time'}
              </span>

              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '30px',
                fontWeight: '800',
                color: 'var(--text-main)',
                lineHeight: '1.2',
                marginBottom: '8px'
              }}>
                {job.title}
              </h1>

              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Building2 size={20} />
                <span>{job.company}</span>
              </div>
            </div>

            {/* Apply Action Header */}
            <div>
              {isApplied ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '700',
                  fontSize: '15px'
                }}>
                  <CheckCircle2 size={18} /> Application Submitted
                </div>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: '180px' }}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)'
          }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Location</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '15px' }}>
                <MapPin size={17} color="var(--primary)" />
                <span>{job.location}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Offered Salary</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '15px', color: 'var(--success)' }}>
                <IndianRupee size={17} />
                <span>{job.salary}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Employment Type</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '15px' }}>
                <Briefcase size={17} color="var(--primary)" />
                <span>{job.jobType || 'Full Time'}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Posted On</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '15px' }}>
                <Clock size={17} color="var(--text-muted)" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Description */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '19px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>
              Job Description
            </h3>
            <div style={{
              fontSize: '15px',
              color: '#334155',
              lineHeight: '1.8',
              whiteSpace: 'pre-line'
            }}>
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '19px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>
              Skills &amp; Requirements
            </h3>
            <div style={{
              fontSize: '15px',
              color: '#334155',
              lineHeight: '1.8',
              whiteSpace: 'pre-line'
            }}>
              {job.requirements || 'No specific technical prerequisites listed for this posting.'}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="card" style={{
            padding: '28px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px' }}>Interested in joining {job.company}?</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Submit your candidate profile directly into MySQL database.</p>
            </div>

            {isApplied ? (
              <span className="status-badge shortlisted" style={{ padding: '10px 18px', fontSize: '14px' }}>
                <CheckCircle2 size={16} /> Applied
              </span>
            ) : (
              <button onClick={handleApplyClick} className="btn btn-primary">
                Apply for this Position
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showApplyModal}
        title="Submit Application"
        message={`Are you sure you want to apply for ${job.title} at ${job.company}?`}
        confirmText="Confirm Application"
        onConfirm={confirmApply}
        onCancel={() => setShowApplyModal(false)}
      />
    </div>
  );
}
