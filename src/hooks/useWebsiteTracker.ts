import { useEffect, useRef } from 'react';
import { tracker } from '../lib/tracker';

export function useWebsiteTracker(activePage: string, currentPath: string) {
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // Initialize tracking on mount
    tracker.init();
  }, []);

  useEffect(() => {
    // Whenever currentPath or activePage changes, ensure pageview is tracked
    const resolvedPath = currentPath || window.location.pathname || `/${activePage}`;
    if (resolvedPath !== lastTrackedPath.current) {
      lastTrackedPath.current = resolvedPath;
      tracker.trackPageView(resolvedPath, document.title);
    }
  }, [activePage, currentPath]);
}
