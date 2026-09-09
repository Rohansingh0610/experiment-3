import React from 'react';

/**
 * RoleBadge: Displays role name with dedicated styling
 */
export default function RoleBadge({ role, size = 'medium' }) {
  if (!role) return null;

  const roleNormalized = role.toLowerCase();

  const getRoleIcon = () => {
    switch (roleNormalized) {
      case 'admin':
        return '🛡️';
      case 'editor':
        return '✏️';
      case 'viewer':
        return '👁️';
      default:
        return '👤';
    }
  };

  return (
    <span className={`role-badge role-${roleNormalized} badge-${size}`}>
      <span className="role-icon">{getRoleIcon()}</span>
      <span className="role-label">{role}</span>
    </span>
  );
}
