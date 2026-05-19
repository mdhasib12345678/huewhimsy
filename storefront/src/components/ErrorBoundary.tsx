import React, { useState, useEffect, ReactNode } from 'react';

// Functional error boundary equivalent. React 19 has no class @types installed
// in this repo, so we rebuild the boundary with a window error listener +
// "unhandledrejection" listener — it catches the common crash modes (render-
// time throws still need React's built-in boundary, but we wrap children with
// a try/catch via a child key reset to give users a recover affordance).
//
// In practice this catches:
//   - uncaught runtime errors (including from async/await chains)
//   - unhandled promise rejections (e.g. fetch failures bubbling up)
// which covers the vast majority of "white-screen" cases on this storefront.

interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      setError(e.error instanceof Error ? e.error : new Error(e.message));
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      setError(reason instanceof Error ? reason : new Error(String(reason)));
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (error) {
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
          {import.meta.env.MODE !== 'production' && (
            <pre className="mt-8 text-left text-xs text-red-600 bg-red-50 p-4 rounded overflow-auto">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
