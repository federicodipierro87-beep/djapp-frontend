import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-green-900/30 border border-green-400/40 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-green-300 mb-2">Qualcosa è andato storto</h1>
          <p className="text-green-200/70 mb-6">
            Ricarica la pagina per continuare. Se il problema si ripete, riprova tra qualche minuto.
          </p>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-400 text-black font-medium px-5 py-3 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Ricarica
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
