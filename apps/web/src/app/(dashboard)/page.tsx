'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Bot,
  UserCheck,
  TrendingUp,
  Instagram,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Toplam Konuşmalar',
      value: '1,428',
      change: '+14% bu hafta',
      icon: MessageSquare,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'AI Bot Çözüm Oranı',
      value: '%92.4',
      change: '1,319 mesaj otonom yanıtlandı',
      icon: Bot,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'İnsan Temsilci Aktarımları',
      value: '109',
      change: '%7.6 handoff oranı',
      icon: UserCheck,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Ortalama Yanıt Süresi',
      value: '1.8 sn',
      change: 'Anında Meta API iletimi',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-slate-900/50 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Instagram AI SaaS Kontrol Paneli 🚀
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Meta Graph API v21.0 ve Google Gemini AI entegrasyonu başarıyla aktif.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/inbox"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Gelen Kutusuna Git</span>
          </Link>
          <Link
            href="/settings/instagram"
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Hesapları Yönet</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {s.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${s.color} flex items-center justify-center text-white shadow-md`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {s.value}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  {s.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status & Integration Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linked Instagram Accounts Preview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-500" />
              <span>Bağlı Instagram Hesapları</span>
            </h3>
            <Link
              href="/settings/instagram"
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 p-0.5">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                  @O
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  @marka_ornek
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Örnek Butik & Mağaza (İşletme Hesabı)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ● Bağlı
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ● Mesajlaşma Aktif
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ● Webhook Aktif
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                ● AI Bot Açık
              </span>
            </div>
          </div>
        </div>

        {/* Security & Health Checklist */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sistem Güvenlik Durumu</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-300">Meta Webhook HMAC-256</span>
              <span className="font-semibold text-emerald-500">Doğrulanıyor ✓</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-300">Token Şifreleme (AES-GCM)</span>
              <span className="font-semibold text-emerald-500">Aktif ✓</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-300">AI Prompt Injection Koruması</span>
              <span className="font-semibold text-emerald-500">Aktif ✓</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-300">BullMQ Kuyruk & Dağıtık Kilit</span>
              <span className="font-semibold text-emerald-500">Hazır ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
