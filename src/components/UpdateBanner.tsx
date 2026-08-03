import { RefreshCw } from 'lucide-react';
import { useUpdateAvailable } from '../hooks/useUpdateAvailable';

/**
 * Offers the reload rather than forcing it: the DJ may be in the middle of
 * handling a request, and nothing here is urgent enough to interrupt that.
 */
export default function UpdateBanner() {
  const updateAvailable = useUpdateAvailable();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-gray-900 text-white px-4 py-3 shadow-lg">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm">È disponibile una nuova versione dell'app.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 shrink-0 bg-white text-gray-900 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Ricarica
        </button>
      </div>
    </div>
  );
}
