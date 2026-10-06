import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BookStache Uncaught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-amber-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-stone-950 border border-amber-800 p-6 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-amber-900-30 text-amber-400 rounded-full border border-amber-600-40 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-amber-100 font-serif">Aplikace narazila na neočekávanou chybu</h2>
            <p className="text-xs text-amber-300-70 leading-relaxed">
              Došlo k chybě při vykreslování obrazovky. Zkuste aplikaci obnovit.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-serif uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              Obnovit aplikaci
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
