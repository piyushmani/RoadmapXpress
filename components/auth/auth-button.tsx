'use client';

import React, { useState } from 'react';
import { useAuth } from './auth-provider';
import { AuthModal } from './auth-modal';
import { User, Settings } from 'lucide-react';

export function AuthButton() {
  const { user, isAdmin, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" />
    );
  }

  return (
    <>
      {user ? (
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
        >
          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold uppercase">
            {user.email.charAt(0)}
          </div>
          <span className="truncate max-w-[110px] hidden sm:inline">{user.email}</span>
          {isAdmin && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Admin
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors"
        >
          <User className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
      )}

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
