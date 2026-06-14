'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getEvents, getColloquium, getImageUrl } from '@/lib/api';

interface SliderItem {
  id: string;
  title: string;
  image: string;
  typeLabel: string;
  meta: string;
  link: string;
  createdAt: string;
}

export default function EventImageMarquee() {
  const [items, setItems] = useState<SliderItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setItems((currentItems) => {
        if (currentItems.length > 0) {
          setCurrentIndex((prev) => (prev + 1) % currentItems.length);
        }
        return currentItems;
      });
    }, 5500);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const [eventsRes, colloquiaRes] = await Promise.all([
          getEvents().catch(() => ({ data: [] })),
          getColloquium().catch(() => ({ data: [] })),
        ]);

        if (!active) return;

        const events = eventsRes.data || [];
        const colloquia = colloquiaRes.data || [];

        const formattedEvents = events
          .filter((e: any) => e.thumbnail)
          .map((e: any) => {
            const speaker = e.lecturerDetails?.[0]?.name || '';
            const typeLabels: Record<string, string> = {
              lecture_series: 'Lecture Series',
              workshop: 'Workshop',
              conference: 'Conference',
            };
            return {
              id: e.id || e._id?.toString() || '',
              title: e.title,
              image: e.thumbnail,
              typeLabel: typeLabels[e.type] || 'Event',
              meta: speaker ? `With ${speaker}` : '',
              link: e.type === 'lecture_series' ? `/lecture-series/${e.id}` : `/events/${e.id}`,
              createdAt: e.createdAt || '',
            };
          });

        const formattedColloquia = colloquia
          .filter((c: any) => c.poster)
          .map((c: any) => ({
            id: c.id || c._id?.toString() || '',
            title: c.name || c.title || '',
            image: c.poster,
            typeLabel: 'Colloquium',
            meta: c.speaker ? `Speaker: ${c.speaker}` : '',
            link: `/colloquium/${c.id}`,
            createdAt: c.createdAt || '',
          }));

        const merged = [...formattedEvents, ...formattedColloquia].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Limit to 4 slides
        const latest = merged.slice(0, 4);
        setItems(latest);
      } catch (err) {
        console.error('Error fetching slider items:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
      stopTimer();
    };
  }, []);

  useEffect(() => {
    if (items.length > 1) {
      startTimer();
    }
    return () => stopTimer();
  }, [items, currentIndex]);

  if (loading) {
    return (
      <div className="max-w-[1024px] w-full aspect-[2/1] mx-auto mt-10 mb-14 bg-[var(--s1)] border border-[var(--rule)] rounded-lg flex items-center justify-center font-mono text-xs uppercase tracking-wider text-[var(--tx4)]">
        Loading Banner Slider...
      </div>
    );
  }

  const defaultItems: SliderItem[] = [
    {
      id: 'default-legacy',
      title: 'Presidency University Physics Society',
      image: '/placeholders/default.jpg',
      typeLabel: 'Legacy',
      meta: 'Established 2025 · Continuing a legacy since 1817',
      link: '/about',
      createdAt: '',
    }
  ];

  const activeItems = items.length > 0 ? items : defaultItems;
  const currentItem = activeItems[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeItems.length);
  };

  const handleTabClick = (idx: number) => {
    setCurrentIndex(idx);
  };

  return (
    <div 
      className="max-w-[1024px] w-full mx-auto mt-10 mb-14 px-4 md:px-0"
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      {/* Slider Viewport */}
      <div className="relative w-full aspect-[2/1] overflow-hidden border border-[var(--rule)] bg-[var(--s2)] rounded-t-lg group shadow-sm">
        {/* Active Slide */}
        <Link href={currentItem.link} className="block w-full h-full relative">
          <img
            src={getImageUrl(currentItem.image)}
            alt={currentItem.title}
            className="w-full h-full object-cover transition-all duration-700 ease-in-out filter grayscale-[10%] contrast-[1.05] sepia-[15%]"
            onError={(e) => {
              e.currentTarget.src = '/placeholders/default.jpg';
            }}
          />
          
          {/* Bottom Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
          
          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-left z-10">
            <span className="inline-block font-mono text-[9px] md:text-[10px] uppercase tracking-wider text-[var(--cr)] bg-black/45 border border-[var(--cr)]/35 px-3 py-1 mb-2 rounded-sm select-none">
              {currentItem.typeLabel}
            </span>
            <h2 className="font-serif text-xl md:text-3xl lg:text-4xl text-white leading-tight font-light max-w-[85%] truncate drop-shadow-md">
              {currentItem.title}
            </h2>
            {currentItem.meta && (
              <p className="font-mono text-[10px] md:text-[11px] text-white/80 mt-2 tracking-wide drop-shadow-sm truncate">
                {currentItem.meta}
              </p>
            )}
            <span className="inline-block font-mono text-[9px] uppercase tracking-widest text-white/95 border-b border-white/50 pb-0.5 mt-4 group-hover:border-[var(--cr)] group-hover:text-[var(--cr)] transition-all">
              Learn More →
            </span>
          </div>
        </Link>

        {/* Navigation Arrows */}
        {activeItems.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/75 border border-white/10 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
            >
              <span className="font-serif text-lg leading-none select-none">←</span>
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/75 border border-white/10 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
            >
              <span className="font-serif text-lg leading-none select-none">→</span>
            </button>
          </>
        )}
      </div>

      {/* Tabs selectors below the viewport */}
      {activeItems.length > 1 && (
        <div 
          className="grid border-x border-b border-[var(--rule)] rounded-b-lg overflow-hidden bg-[var(--s1)]"
          style={{ gridTemplateColumns: `repeat(${activeItems.length}, minmax(0, 1fr))` }}
        >
          {activeItems.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(idx)}
                className={`text-left p-3 md:p-4 transition-all duration-200 outline-none border-t-2 relative cursor-pointer ${
                  isActive 
                    ? 'bg-[var(--s2)] border-[var(--cr)] text-[var(--tx)] shadow-inner font-semibold' 
                    : 'border-transparent text-[var(--tx4)] hover:bg-[var(--s2)]/40 hover:text-[var(--tx3)]'
                }`}
              >
                <span className="block font-mono text-[8px] md:text-[9.5px] uppercase tracking-wider mb-1">
                  {`0${idx + 1} · ${item.typeLabel}`}
                </span>
                <span className="block font-serif text-[11px] md:text-[14px] leading-tight truncate">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
