import Link from 'next/link';
import { Compass, ArrowLeft, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-6">
        <Compass className="w-3.5 h-3.5" />
        <span>404 - Page Not Found</span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-xl">
        Looks like you've gone off the roadmap.
      </h1>

      <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-md">
        The page or roadmap you are looking for doesn't exist or has been moved to a new path.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-950 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/roadmap/backend"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all"
        >
          <span>Backend Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
