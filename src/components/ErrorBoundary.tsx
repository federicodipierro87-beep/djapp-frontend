import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * A render error anywhere below this point would otherwise unmount the whole
 * tree and leave a blank page, which during a live event looks identical to the
 * app being down.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-ink-900 border border-white/[0.08] rounded-lg p-5 sm:p-8">
          <div className="border-l-2 border-live pl-4 py-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] leading-none text-live">
              Errore
            </span>
            <h1 className="mt-2.5 font-display text-2xl font-bold leading-tight">
              Qualcosa è andato storto
            </h1>
            <p className="mt-2.5 text-sm text-bone-dim text-pretty">
              Ricarica la pagina per continuare. Se il problema si ripete, riprova tra qualche
              minuto.
            </p>
          </div>

          <button
            onClick={this.handleReload}
            className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-md
                       bg-bone text-ink-950 font-medium text-sm px-4 py-2.5 min-h-[44px]
                       hover:bg-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Ricarica
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
