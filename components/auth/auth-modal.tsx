'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './auth-provider';
import { X, Lock, Mail, ShieldAlert, Settings, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    user,
    isAdmin,
    isConfigured,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onClose();
        }
      } else {
        const res = await signUpWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.message) {
          setSuccessMsg(res.message);
          setMode('signin');
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              {user ? 'Account Settings' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {user ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Logged in as
                  </span>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Settings className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900">{user.email}</div>
                <p className="text-xs text-slate-500">
                  {isAdmin
                    ? 'You have administrative permissions to access the Studio Editor and update database roadmaps.'
                    : 'Standard learner account.'}
                </p>
              </div>

              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className={
                    'py-1.5 rounded-lg transition-all ' +
                    (mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900')
                  }
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={
                    'py-1.5 rounded-lg transition-all ' +
                    (mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900')
                  }
                >
                  Create Account
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
                  <UserCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="admin@roadmapxpress.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 shadow-xs transition-colors"
                >
                  {loading
                    ? 'Processing...'
                    : mode === 'signin'
                      ? 'Sign In with Supabase'
                      : 'Create Supabase Account'}
                </button>
              </form>

              {/* Link to dedicated login page */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-muted-foreground">
                <span>Prefer a dedicated page?</span>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="font-medium text-primary hover:underline"
                >
                  Open Full Page &rarr;
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
