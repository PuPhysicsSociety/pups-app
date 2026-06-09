import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export default function HeroSection({ 
  title = "Presidency University Physics Society",
  subtitle = "PUPS",
  description = "Fostering scientific dialogue, outreach, and community engagement"
}: HeroSectionProps) {
  return (
    <section 
      className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center text-center px-5 py-10 relative -mt-5 -mx-12 mb-12"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-lg font-medium tracking-[3px] uppercase opacity-90 mb-4">
          {title}
        </div>
        
        <div className="my-8 flex justify-center">
          {/* Light mode image */}
          <img 
            src="/placeholders/pups_image_light.png" 
            alt="PUPS Image" 
            className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl h-auto object-contain block dark:hidden"
          />
          {/* Dark mode image */}
          <img 
            src="/placeholders/pups_image_dark.png" 
            alt="PUPS Image" 
            className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl h-auto object-contain hidden dark:block"
          />
        </div>
        
        <p className="text-xl opacity-85 max-w-2xl mx-auto my-6 mb-10 leading-relaxed px-4 sm:px-6 md:px-0">
          {description}
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link 
            href="/events" 
            className="px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black no-underline rounded-md font-semibold text-base transition-all duration-200 shadow-lg hover:scale-105 hover:shadow-xl"
          >
            Explore Events
          </Link>
          <Link 
            href="/about" 
            className="px-8 py-3.5 bg-transparent no-underline rounded-md font-semibold text-base border-2 border-black dark:border-white transition-all duration-200 hover:scale-105"
          >
            Learn More
          </Link>
        </div>

        <div className="mt-8 text-sm opacity-60 animate-bounce">
          ↓ Scroll to discover more
        </div>
      </div>
    </section>
  );
}
