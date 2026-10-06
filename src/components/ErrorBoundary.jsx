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
        <div style={{ backgroundColor: '#FAF6F0', color: '#3D2314' }} className="min-h-screen flex items-center justify-center p-6">
          <div style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3' }} className="max-w-md w-full border p-6 rounded-3xl text-center space-y-4">
            <div style={{ backgroundColor: '#EAE1D3', borderColor: '#D97706', color: '#D97706' }} className="w-12 h-12 mx-auto rounded-full border flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold font-serif">Aplikace narazila na neočekávanou chybu</h2>
            <p style={{ color: '#5C3A24' }} className="text-xs leading-relaxed">
              Došlo k chybě při vykreslování obrazovky. Zkuste aplikaci obnovit.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ backgroundColor: '#D97706', color: '#FFFDF9' }}
              className="w-full py-3 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 font-serif uppercase tracking-wider cursor-pointer"
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

export default ErrorBoundary;
