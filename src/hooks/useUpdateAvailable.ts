import { useEffect, useState } from 'react';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

/**
 * True once the server is serving a build newer than the one running here.
 *
 * A DJ keeps the panel open for a whole night, so a deploy would otherwise
 * leave them on the old bundle until they happened to reload.
 */
export function useUpdateAvailable(): boolean {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Nothing changes once a new build has been seen, so stop asking.
    if (updateAvailable) return;

    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        // The dev server answers unknown paths with index.html, so this parse
        // fails there and the check simply stays inert.
        const { buildId } = await res.json();
        if (!cancelled && buildId && buildId !== __BUILD_ID__) {
          setUpdateAvailable(true);
        }
      } catch {
        // Offline or a stale CDN edge: try again on the next tick.
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    // Coming back to the tab is the moment a stale bundle is most likely.
    window.addEventListener('focus', check);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('focus', check);
    };
  }, [updateAvailable]);

  return updateAvailable;
}
