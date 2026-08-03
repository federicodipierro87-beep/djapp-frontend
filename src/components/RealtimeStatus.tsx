import { useEffect, useState } from 'react';

const OFFLINE_GRACE_MS = 3000;

interface RealtimeStatusProps {
  connected: boolean;
}

/**
 * Says whether live updates are actually arriving. Without it a refused
 * handshake or a dropped connection looks exactly like a quiet night.
 */
export default function RealtimeStatus({ connected }: RealtimeStatusProps) {
  // Every page load starts disconnected and every reconnection dips through the
  // same state, so warning straight away would just be a red flash on a panel
  // that is about to work fine.
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (connected) {
      setShowOffline(false);
      return;
    }
    const timer = setTimeout(() => setShowOffline(true), OFFLINE_GRACE_MS);
    return () => clearTimeout(timer);
  }, [connected]);

  if (connected) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700"
        title="Le nuove richieste arrivano in tempo reale"
      >
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Live
      </span>
    );
  }

  if (!showOffline) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700"
      title="Le richieste arrivano comunque, ma con qualche secondo di ritardo finché il collegamento non torna"
    >
      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      Riconnessione…
    </span>
  );
}
