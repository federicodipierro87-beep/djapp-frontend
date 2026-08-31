import { RefreshCw } from 'lucide-react';
import { useUpdateAvailable } from '../hooks/useUpdateAvailable';
import Button from './ui/Button';

/**
 * Offers the reload rather than forcing it: the DJ may be in the middle of
 * handling a request, and nothing here is urgent enough to interrupt that.
 */
export default function UpdateBanner() {
  const updateAvailable = useUpdateAvailable();

  if (!updateAvailable) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 bg-ink-800 border-t border-white/[0.10]
                 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="status"
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-bone-dim">È disponibile una nuova versione dell'app.</p>
        <Button size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" />
          Ricarica
        </Button>
      </div>
    </div>
  );
}
