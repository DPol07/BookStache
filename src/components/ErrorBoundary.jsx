import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BookStache ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-3xl border border-rose-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Aplikace narazila na problém</h2>
          <p className="text-xs text-slate-400 max-w-xs mb-6">
            Při zpracování došlo k chybě. Klikněte na tlačítko níže pro obnovení aplikace.
          </p>
          <button
            onClick={this.handleReset}
            className="py-3 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Obnovit aplikaci
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
