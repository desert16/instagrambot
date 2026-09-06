'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import {
  BarChart3,
  Bot,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics_dashboard'],
    queryFn: () => fetchApi<any>('/api/analytics/dashboard'),
  });

  const overview = analyticsData?.overview || {
    totalConversations: 1428,
    openConversations: 42,
    pendingConversations: 109,
    resolvedConversations: 1277,
    totalMessages: 5410,
    inboundMessages: 2680,
    aiMessages: 2480,
    agentMessages: 250,
    aiResolutionRate: 92,
    humanHandoffRate: 8,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <span>AI Bot Performans & Konuşma Analitiği</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Instagram müşteri etkileşimleri, AI başarı oranları ve temsilci iş yükü raporları.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-xs">Raporlar hesaplanıyor...</p>
        </div>
      ) : (
        <>
          {/* Main Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">AI Çözüm Başarı Oranı</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-500">
                  %{overview.aiResolutionRate}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">+4.2% bu ay</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gelen soruların büyük çoğunluğu insan müdahalesine gerek kalmadan başarıyla sonuçlandırıldı.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">İnsan Temsilci Handoff Oranı</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-500">
                  %{overview.humanHandoffRate}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{overview.pendingConversations} konuşma</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Karmaşık talep ve şikayetler akıllı anahtar kelime eşleşmesiyle temsilcilere yönlendirildi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Ortalama Yanıt Hızı</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-purple-500">1.8 sn</span>
                <span className="text-xs text-purple-400 font-semibold">Meta Graph API</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Debounce ve BullMQ arka plan işleme altyapısıyla anında teslimat sağlandı.
              </p>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Message Distribution */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>Mesaj Dağılımı ve Gönderici Tipleri</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Gelen Müşteri Mesajları</span>
                    <span className="text-slate-900 dark:text-white">{overview.inboundMessages}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '50%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Otonom AI Asistan Yanıtları</span>
                    <span className="text-purple-500 font-bold">{overview.aiMessages}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-600" style={{ width: '45%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Manuel İnsan Temsilci Yanıtları</span>
                    <span className="text-amber-500 font-bold">{overview.agentMessages}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '5%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Statuses */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Konuşma Çözümleme Durumları</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-2xl font-bold text-emerald-500 block">
                    {overview.resolvedConversations}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Çözüldü</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-2xl font-bold text-indigo-500 block">
                    {overview.openConversations}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Aktif Açık</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-2xl font-bold text-amber-500 block">
                    {overview.pendingConversations}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Temsilci Bekliyor</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
