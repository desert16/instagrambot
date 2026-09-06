'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Instagram,
  Bot,
  Zap,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

const navigation = [
  { name: 'Genel Bakış', href: '/', icon: LayoutDashboard },
  { name: 'Canlı Gelen Kutusu', href: '/inbox', icon: MessageSquare, badge: 'Canlı' },
  { name: 'Instagram Hesapları', href: '/settings/instagram', icon: Instagram },
  { name: 'AI Bot Asistanı', href: '/ai', icon: Bot },
  { name: 'Otomasyon Kuralları', href: '/automations', icon: Zap },
  { name: 'Bilgi Bankası (FAQ)', href: '/knowledge-base', icon: BookOpen },
  { name: 'Analitik & Raporlar', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <Instagram className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            InstaAI SaaS
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Pro
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Meta Resmi API</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-semibold animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* v2 Gemini Live Ready Banner */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20">
        <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Gemini Live v2 Ready</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Gerçek zamanlı sesli DM ve multimodal asistan desteği aktif edilebilir.
        </p>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
            Y
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-slate-200">Yönetici</p>
            <p className="text-[10px] text-slate-400">admin@demo.local</p>
          </div>
        </div>
        <button
          title="Çıkış Yap"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
