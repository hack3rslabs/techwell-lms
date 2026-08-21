import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-6">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md text-center">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
