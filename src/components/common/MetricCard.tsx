import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  iconBg = 'rgba(99, 102, 241, 0.15)',
  trend,
}) => {
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-label">{label}</span>
        <div className="metric-icon-box" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      <div className="metric-val">{value}</div>
      {(subtext || trend) && (
        <div className="metric-footer">
          {trend && (
            <span style={{ color: trend.isPositive ? '#10B981' : '#EF4444', fontWeight: 600 }}>
              {trend.value}
            </span>
          )}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  );
};
