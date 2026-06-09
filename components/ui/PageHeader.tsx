import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export default function PageHeader({ title, description, className = '' }: PageHeaderProps) {
  return (
    <section className={`bg-white dark:bg-[#25293c] rounded-lg p-4 shadow-sm mb-4 ${className}`}>
      <h1 className="text-3xl font-bold text-black dark:text-white">{title}</h1>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 opacity-70 mt-2">
          {description}
        </p>
      )}
    </section>
  );
}
