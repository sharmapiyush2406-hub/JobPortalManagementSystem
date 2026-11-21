import React from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';

export default function SearchBar({
  title = '',
  location = '',
  jobType = 'All',
  onTitleChange,
  onLocationChange,
  onJobTypeChange,
  onSearch,
  onClear,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  const hasFilters = Boolean(title || location || (jobType && jobType !== 'All'));

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#ffffff',
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto auto',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* Title / Keyword */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Job title, company, or skill..."
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            style={{ paddingLeft: '38px', height: '44px' }}
          />
        </div>

        {/* Location */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            className="form-control"
            placeholder="City, state, or 'Remote'..."
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            style={{ paddingLeft: '38px', height: '44px' }}
          />
        </div>

        {/* Job Type Dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <select
            className="form-control"
            value={jobType}
            onChange={(e) => onJobTypeChange(e.target.value)}
            style={{ paddingLeft: '38px', height: '44px' }}
          >
            <option value="All">All Job Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Remote">Remote</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* Submit Search */}
        <button type="submit" className="btn btn-primary" style={{ height: '44px', padding: '0 24px' }}>
          <Search size={16} /> Search Jobs
        </button>

        {/* Clear Filters (shows when filters active) */}
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="btn btn-secondary"
            title="Clear filters"
            style={{ height: '44px', padding: '0 16px' }}
          >
            <X size={16} /> Clear
          </button>
        )}
      </div>
    </form>
  );
}
