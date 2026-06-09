import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border-2 border-[#dddddd] bg-white dark:bg-[#25293c] text-black dark:text-white text-center p-8 rounded-lg shadow-sm transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg cursor-default">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      <p className="opacity-80 leading-relaxed">{description}</p>
    </div>
  );
}

export default function WhatWeDoSection() {
  const features = [
    {
      icon: '🎓',
      title: 'Weekly Colloquiums',
      description: 'Engage with cutting-edge physics research through our weekly colloquium series featuring renowned speakers.'
    },
    {
      icon: '🔬',
      title: 'Research & Innovation',
      description: 'Foster scientific curiosity and promote research initiatives among students and faculty members.'
    },
    {
      icon: '🌍',
      title: 'Community Outreach',
      description: 'Bridge the gap between academia and society through public lectures and science outreach programs.'
    },
    {
      icon: '🤝',
      title: 'Collaborative Learning',
      description: 'Create a vibrant community where students collaborate, learn, and grow together in physics.'
    }
  ];

  return (
    <section className="mb-20 py-15">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold mb-4">What We Do</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto">
          PUPS is dedicated to fostering a culture of scientific excellence and community engagement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}
