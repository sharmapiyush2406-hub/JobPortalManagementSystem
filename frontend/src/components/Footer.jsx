import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      paddingTop: '60px',
      paddingBottom: '30px',
      marginTop: 'auto',
      borderTop: '1px solid #1e293b'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--primary)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Briefcase size={20} />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: '800',
                color: '#ffffff'
              }}>
                Job<span style={{ color: '#38bdf8' }}>Portal</span>
              </span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
              Connecting aspiring talent with top tech companies. A complete Core Java, Servlets, JDBC, and MySQL web application designed for B.Tech CSE students.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#1e293b', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>Core Java</span>
              <span style={{ background: '#1e293b', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>Servlets</span>
              <span style={{ background: '#1e293b', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>JDBC</span>
              <span style={{ background: '#1e293b', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>MySQL</span>
              <span style={{ background: '#1e293b', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>React</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Home</Link></li>
              <li><Link to="/jobs" style={{ color: '#94a3b8' }}>Browse All Jobs</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Candidate Login</Link></li>
              <li><Link to="/register" style={{ color: '#94a3b8' }}>Create Candidate Account</Link></li>
              <li><Link to="/admin/login" style={{ color: '#94a3b8' }}>Admin Portal</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
              Popular Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li><Link to="/jobs?title=Java" style={{ color: '#94a3b8' }}>Java Developer Jobs</Link></li>
              <li><Link to="/jobs?title=Frontend" style={{ color: '#94a3b8' }}>Frontend (React) Jobs</Link></li>
              <li><Link to="/jobs?title=Full+Stack" style={{ color: '#94a3b8' }}>Full Stack Engineer Jobs</Link></li>
              <li><Link to="/jobs?title=Data" style={{ color: '#94a3b8' }}>Data Analyst Opportunities</Link></li>
              <li><Link to="/jobs?jobType=Remote" style={{ color: '#94a3b8' }}>Remote Tech Positions</Link></li>
            </ul>
          </div>

          {/* Academic Project Spec */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
              Project Architecture
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
              Built strictly without Spring Boot or Hibernate. Features actual <code>HttpServlet</code> endpoints, <code>PreparedStatement</code> JDBC operations, and BCrypt security.
            </p>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Default Admin Demo: <strong style={{ color: '#cbd5e1' }}>admin@jobportal.com</strong> / <strong style={{ color: '#cbd5e1' }}>admin123</strong>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px'
        }}>
          <div>
            &copy; {new Date().getFullYear()} Job Portal Management System &bull; B.Tech CSE Capstone Project
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Powered by Apache Tomcat &amp; MySQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
