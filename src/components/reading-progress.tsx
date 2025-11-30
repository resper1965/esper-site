'use client';

import { useEffect, useState } from 'react';

/**
 * Reading Progress Bar
 * Shows a thin progress bar at the top of the page indicating scroll progress
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      // Calculate scroll percentage
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / scrollHeight) * 100;
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    // Update on scroll
    window.addEventListener('scroll', updateProgress, { passive: true });

    // Initial update
    updateProgress();

    // Cleanup
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
