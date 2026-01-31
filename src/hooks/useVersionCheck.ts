import { useEffect, useRef } from 'react';

const CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds
const CURRENT_VERSION = __BUILD_VERSION__;

export function useVersionCheck() {
  const hasReloaded = useRef(false);

  useEffect(() => {
    // Don't check in development
    if (import.meta.env.DEV) {
      return;
    }

    const checkVersion = async () => {
      try {
        // Add cache-busting query param
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const serverVersion = data.version;

        // If versions don't match and we haven't already triggered a reload
        if (serverVersion && serverVersion !== CURRENT_VERSION && !hasReloaded.current) {
          console.log(`New version detected: ${serverVersion} (current: ${CURRENT_VERSION})`);
          hasReloaded.current = true;

          // Small delay to allow any in-progress operations to complete
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        // Silently fail - version check is not critical
        console.debug('Version check failed:', error);
      }
    };

    // Initial check after a short delay
    const initialTimeout = setTimeout(checkVersion, 5000);

    // Periodic checks
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Also check when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return CURRENT_VERSION;
}
