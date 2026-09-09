import React from 'react';
import { AuditSeverity, RiskLevel } from '../../core/types';

interface BadgeProps {
  variant?: AuditSeverity | RiskLevel | 'default';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  let badgeClass = 'badge badge-medium';

  switch (variant) {
    case 'critical':
      badgeClass = 'badge badge-critical';
      break;
    case 'high':
      badgeClass = 'badge badge-high';
      break;
    case 'medium':
      badgeClass = 'badge badge-medium';
      break;
    case 'low':
    case 'safe':
      badgeClass = 'badge badge-safe';
      break;
    default:
      badgeClass = 'badge badge-medium';
  }

  return <span className={badgeClass}>{children}</span>;
};
