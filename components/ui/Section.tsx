import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Section({ children, title, className = '', style }: SectionProps) {
  return (
    <section className={`mb-6 ${className}`} style={style}>
      {title && <h2 className="mb-3 text-2xl font-bold text-inherit">{title}</h2>}
      {children}
    </section>
  );
}
