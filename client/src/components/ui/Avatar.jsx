import React from 'react';

/**
 * @param {Object} props
 * @param {string} [props.src]
 * @param {string} [props.alt]
 * @param {'sm' | 'md' | 'lg'} [props.size]
 * @param {string} [props.className]
 */
export function Avatar({
  src,
  alt = '',
  size = 'md',
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const initials = alt
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium overflow-hidden ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  );
}
