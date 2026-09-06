'use client';

import React from 'react';
import { Bell, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Workspace Selector */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Demo Butik & Mağaza</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Meta Graph API v21.0 Bağlantısı Aktif</span>
        </div>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 px-2.5 py-1 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Gemini 1.5 Flash Devrede</span>
        </div>

        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
        </button>
      </div>
    </header>
  );
}
