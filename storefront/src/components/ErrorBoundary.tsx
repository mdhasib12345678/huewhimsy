import React from 'react';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof console !== 'undefined') {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-8">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">🎨</div>
            <h1 className="text-3xl font-bold text-[#0a0a0a] mb-4">
              Oops — something went sideways
            </h1>
            <p className="text-[#525252] mb-8">
              We hit an unexpected snag. Try reloading the page, or head back home.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-6 py-3 font-bold hover:opacity-90 shadow-md"
              >
                Reload page
              </button>
              <a
                href="/"
                className="rounded-full bg-white text-[#0a0a0a] border border-black/10 px-6 py-3 font-bold hover:bg-gray-50"
              >
                Go home
              </a>
            </div>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="mt-8 text-left text-xs text-red-600 bg-red-50 p-4 rounded overflow-auto">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
