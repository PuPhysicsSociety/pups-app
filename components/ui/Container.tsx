import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'default' | 'small';
  className?: string;
}

export default function Container({ children, size = 'default', className = '' }: ContainerProps) {
  const containerClass = size === 'small' ? 'container small-muted' : 'container';
  
  return (
    <div className={`${containerClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
