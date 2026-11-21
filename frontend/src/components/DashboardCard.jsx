import React from 'react';

export default function DashboardCard({ title, value, icon: Icon, color = 'var(--primary)', bg = 'var(--primary-light)', subtitle }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </p>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px', lineHeight: '1.1' }}>
            {value}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '12px',
          backgroundColor: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {Icon && <Icon size={26} />}
        </div>
      </div>
    </div>
  );
}
