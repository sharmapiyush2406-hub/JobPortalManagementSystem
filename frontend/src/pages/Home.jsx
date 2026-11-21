import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle, 
  ArrowRight,
  Award
} from 'lucide-react';
import { jobAPI } from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      setLoading(true);
      const data = await jobAPI.getAll();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTitle.trim()) query.append('title', searchTitle.trim());
    if (searchLocation.trim()) query.append('location', searchLocation.trim());
    navigate(`/jobs?${query.toString()}`);
  };

  const featuredJobs = jobs.slice(0, 6);

  return (
    <div>
      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
        padding: '70px 0 80px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '860px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            <Award size={16} /> Verified Tech Careers &bull; Core Java &amp; MySQL Platform
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: '800',
            color: 'var(--text-main)',
            lineHeight: '1.15',
            letterSpacing: '-1px',
            marginBottom: '18px'
          }}>
            Find Your Dream Job. <br />
            <span style={{ color: 'var(--primary)' }}>Build Your Future.</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            marginBottom: '36px',
            maxWidth: '680px',
            margin: '0 auto 36px'
          }}>
            Explore opportunities, connect with companies and take the next step in your career.
          </p>

          {/* Hero Search Box */}
          <form onSubmit={handleHeroSearch} style={{
            background: '#ffffff',
            padding: '12px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <Search size={20} color="var(--primary)" style={{ marginRight: '10px' }} />
              <input
                type="text"
                placeholder="Job title, skill, e.g. 'Java Developer'"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px'
                }}
              />
            </div>

            <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }} />

            <div style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <MapPin size={20} color="var(--primary)" style={{ marginRight: '10px' }} />
              <input
                type="text"
                placeholder="Location e.g. 'Bangalore'"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px'
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              Search Jobs
            </button>
          </form>

          {/* Sub CTA Buttons */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>New to JobPortal?</span>
            <Link to="/register" className="btn btn-outline btn-sm">
              Register Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================
          STATISTICS SECTION
          ==================================================== */}
      <section style={{
        backgroundColor: '#ffffff',
        padding: '40px 0',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>500+</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Active IT Openings</p>
            </div>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>120+</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Partner Companies</p>
            </div>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>10,000+</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Registered Candidates</p>
            </div>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>95%</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Shortlisting Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          FEATURED & LATEST JOBS (REAL MYSQL DATA)
          ==================================================== */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Opportunities
              </div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '28px',
                fontWeight: '800',
                color: 'var(--text-main)',
                marginTop: '4px'
              }}>
                Featured Job Openings
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Directly retrieved from MySQL database via Java Servlets &amp; JDBC.
              </p>
            </div>

            <Link to="/jobs" className="btn btn-outline btn-sm">
              View All Jobs ({jobs.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching latest jobs from Java Servlet backend..." />
          ) : featuredJobs.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No jobs currently available. Check back soon or log in as Admin to post jobs.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px'
            }}>
              {featuredJobs.map((job) => (
                <JobCard 
                  key={job.jobId} 
                  job={job} 
                  onApply={() => navigate(`/jobs/${job.jobId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================
          HOW IT WORKS SECTION
          ==================================================== */}
      <section className="section-padding" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--text-main)'
            }}>
              How JobPortal Works
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Four simple steps to find, apply, and land your next role.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '30px'
          }}>
            {/* Step 1 */}
            <div className="card" style={{ padding: '30px', textAlign: 'center', background: '#f8fafc' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontWeight: '800',
                fontSize: '20px'
              }}>
                1
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px' }}>Create Account</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Register as a Candidate with your name and email. Passwords are encrypted with BCrypt.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '30px', textAlign: 'center', background: '#f8fafc' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontWeight: '800',
                fontSize: '20px'
              }}>
                2
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px' }}>Search Openings</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Filter across diverse tech stacks: Java, Frontend React, Full Stack, Python, and Data Analysis.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '30px', textAlign: 'center', background: '#f8fafc' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontWeight: '800',
                fontSize: '20px'
              }}>
                3
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px' }}>One-Click Apply</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Submit applications instantly. Duplicate check prevents submitting twice for the same role.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ padding: '30px', textAlign: 'center', background: '#f8fafc' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontWeight: '800',
                fontSize: '20px'
              }}>
                4
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px' }}>Track Status</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Monitor status in your candidate dashboard: <strong>Applied</strong>, <strong>Shortlisted</strong>, or <strong>Rejected</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          WHY CHOOSE JOBPORTAL?
          ==================================================== */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div>
              <span style={{
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Platform Strengths
              </span>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '32px',
                fontWeight: '800',
                color: 'var(--text-main)',
                marginTop: '6px',
                marginBottom: '20px'
              }}>
                Why Choose JobPortal?
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '24px' }}>
                Unlike generic mock demos, this application features full end-to-end integration: real JDBC queries with PreparedStatements, Tomcat session-based authentication, and a responsive React UI.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Strict Core Java Architecture</h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Built using pure Java Servlets and JDBC — perfect for B.Tech project presentation.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>BCrypt Password Security</h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>All passwords are salt-hashed before persistence to MySQL.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Comprehensive Admin Controls</h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Complete job management (Add/Edit/Delete) and application review workflow.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="card" style={{ padding: '36px', borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
                Ready to take the next step?
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                Join thousands of candidates finding rewarding software engineering and tech roles today.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary">
                  Create Candidate Account
                </Link>
                <Link to="/jobs" className="btn btn-secondary">
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
