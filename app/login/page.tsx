import React, { Suspense } from 'react';
import Link from 'next/link';
import { login, signup } from './actions';
import { AlertCircle, CheckCircle, ArrowLeft, Lock, Shield } from 'lucide-react';

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function LoginForm({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await searchParamsPromise;
  const error = searchParams.error;
  const checkEmail = searchParams['check-email'] === '1';

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to RoadmapXpress
        </Link>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome to RoadmapXpress
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in or create an account to track your progress & manage roadmaps
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Authentication Error</p>
            <p className="mt-0.5 opacity-90">{decodeURIComponent(error)}</p>
          </div>
        </div>
      )}

      {checkEmail && (
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Check your email</p>
            <p className="mt-0.5 opacity-90">
              We&apos;ve sent an activation link to your inbox. Click the link in your email to confirm your account and sign in.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <details className="group [&_summary::-webkit-details-marker]:hidden" open>
        <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Sign In with Email
        </summary>
        <form action={login} className="space-y-4">
          <div>
            <label
              htmlFor="signin-email"
              className="block text-xs font-medium text-foreground mb-1"
            >
              Email Address
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="signin-password"
              className="block text-xs font-medium text-foreground mb-1"
            >
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>
      </details>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or create a new account</span>
        </div>
      </div>

      <details className="group [&_summary::-webkit-details-marker]:hidden">
        <summary className="cursor-pointer list-none text-center text-xs font-medium text-primary hover:underline">
          Need an account? Click here to sign up
        </summary>
        <form action={signup} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="signup-name"
              className="block text-xs font-medium text-foreground mb-1"
            >
              Full Name
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-medium text-foreground mb-1"
            >
              Email Address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-medium text-foreground mb-1"
            >
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="•••••••• (min 6 characters)"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg border border-primary/30 bg-primary/10 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Create Account
          </button>
        </form>
      </details>
    </div>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="flex min-h-[85vh] w-full items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="flex h-64 w-full max-w-md items-center justify-center rounded-2xl border border-border bg-card">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <LoginForm searchParamsPromise={searchParams} />
      </Suspense>
    </main>
  );
}
