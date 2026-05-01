import React from 'react';

/**
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size]
 * @param {string} [props.className]
 */
export function Spinner({ size = 'md', className = '', ...props }) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
