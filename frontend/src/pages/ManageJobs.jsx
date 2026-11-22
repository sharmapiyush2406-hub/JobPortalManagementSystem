import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { jobAPI } from '../services/api';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  MapPin, 
  AlertCircle, 
  CheckCircle2,
  X
} from 'lucide-react';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'Full Time',
    description: '',
    requirements: '',
  });

  // Delete modal state
  const [deletingJobId, setDeletingJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobAPI.getAll();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to retrieve jobs.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      company: '',
      location: '',
      salary: '',
      jobType: 'Full Time',
      description: '',
      requirements: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      salary: job.salary || '',
      jobType: job.jobType || 'Full Time',
      description: job.description || '',
      requirements: job.requirements || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.company.trim() || !formData.location.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields (Title, Company, Location, Description).');
      return;
    }

    try {
      if (editingJob) {
        await jobAPI.update(editingJob.jobId, formData);
        setFeedback({ type: 'success', message: `Job "${formData.title}" updated successfully!` });
      } else {
        await jobAPI.create(formData);
        setFeedback({ type: 'success', message: `Job "${formData.title}" created successfully and published!` });
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Operation failed.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingJobId) return;
    try {
      await jobAPI.delete(deletingJobId);
      setFeedback({ type: 'success', message: 'Job and associated applications deleted successfully from MySQL.' });
      setDeletingJobId(null);
      fetchJobs();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete job.' });
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      (j.jobType && j.jobType.toLowerCase().includes(q))
    );
  });

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
            marginBottom: '28px'
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '28px',
                fontWeight: '800',
                color: 'var(--text-main)'
              }}>
                Manage Job Postings
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Add new openings, edit active requirements, or delete outdated listings.
              </p>
            </div>

            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={18} /> Add New Job
            </button>
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

          {/* Search bar */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, company, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px', height: '40px' }}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <LoadingSpinner message="Loading jobs from database..." />
          ) : filteredJobs.length === 0 ? (
            <div className="card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No job postings match your search.</p>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Job Title &amp; Company</th>
                      <th>Location</th>
                      <th>Salary</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job.jobId}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
                          #{job.jobId}
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                            {job.title}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
                            {job.company}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} /> {job.location}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', fontWeight: '600', color: '#166534' }}>
                          {job.salary}
                        </td>
                        <td>
                          <span className="tag-badge" style={{ fontSize: '11px' }}>
                            {job.jobType || 'Full Time'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEdit(job)}
                              className="btn btn-secondary btn-sm"
                              title="Edit Job"
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => setDeletingJobId(job.jobId)}
                              className="btn btn-danger-outline btn-sm"
                              title="Delete Job"
                            >
                              <Trash2 size={14} />
                            </button>
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

      {/* Add / Edit Job Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingJob ? `Edit Job (#${editingJob.jobId})` : 'Post New Job'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close" style={{ background: 'none', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveJob}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Senior Java Developer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Infosys Ltd"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bangalore, India"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Salary *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ₹7,00,000 - ₹10,00,000"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select
                      className="form-control"
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Remote">Remote</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Provide overview of duties, project scope, and company mission..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills &amp; Requirements</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Core Java, Servlets, JDBC, REST APIs, Git, Bachelor's in CS..."
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingJob ? 'Update Job' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingJobId)}
        title="Delete Job Posting"
        message="Are you sure you want to delete this job? All candidate applications submitted for this job will also be removed via MySQL CASCADE. This action cannot be undone."
        confirmText="Delete Job"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingJobId(null)}
      />
    </div>
  );
}
