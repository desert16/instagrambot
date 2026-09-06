'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import {
  Zap,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Filter,
  MessageSquare,
  Tag,
  Loader2,
} from 'lucide-react';

export default function AutomationsPage() {
  const queryClient = useQueryClient();
  const [testInput, setTestInput] = useState('Fiyatınız nedir ve kargo ücreti ne kadar?');
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Fetch automations
  const { data: automations, isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: () => fetchApi<any[]>('/api/automations'),
  });

  // Toggle automation
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetchApi(`/api/automations/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
    },
  });

  // Simulation test mutation (Dry-run without sending message)
  const testMutation = useMutation({
    mutationFn: (message: string) =>
      fetchApi('/api/automations/test', {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    onSuccess: (data) => {
      setSimulationResult(data);
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Otomasyon Kuralları & Tetikleyiciler</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gelen mesajlara, anahtar kelimelere ve çalışma saatlerine göre otonom aksiyon zincirleri oluşturun.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Yeni Kural Oluştur</span>
        </button>
      </div>

      {/* Simulator / Dry-Run Test Tool */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5" />
            <span>Otomasyon Simülasyonu (Canlı Test - Mesaj Gönderilmez)</span>
          </h3>
          <span className="text-[10px] text-slate-400">Dry-Run Engine</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Test edilecek örnek müşteri mesajını yazın..."
            className="flex-1 w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => testMutation.mutate(testInput)}
            disabled={testMutation.isPending || !testInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {testMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Kuralı Simüle Et</span>
          </button>
        </div>

        {simulationResult && (
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {simulationResult.matchesFound
                  ? `Simülasyon Başarılı: ${simulationResult.matchedAutomations.length} adet otomasyon kuralı tetiklendi.`
                  : 'Bu mesaja uyan herhangi bir otomasyon kuralı bulunamadı (Mesaj doğrudan AI motoruna aktarılacak).'}
              </span>
            </div>
            {simulationResult.matchesFound && (
              <div className="space-y-1.5 pl-6 pt-1 text-slate-300">
                {simulationResult.matchedAutomations.map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-white">Kural: {m.automationName}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-indigo-300">Aksiyon: {JSON.stringify(m.actions)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {/* Sample Automation Cards */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Fiyat & Kargo Sorusu Otomatik Yanıtı
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/20">
                Aktif
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                <MessageSquare className="w-3 h-3 text-indigo-500" />
                Tetikleyici: Yeni Mesaj
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                <Filter className="w-3 h-3 text-amber-500" />
                İçerik: &quot;fiyat&quot; veya &quot;kargo&quot;
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 px-2 py-1 rounded-md font-semibold">
                <Tag className="w-3 h-3" />
                Aksiyon: [Fiyat] Etiketi Ekle + AI Yanıtla
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                VIP Müşteri Temsilci Ataması
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/20">
                Aktif
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                <Tag className="w-3 h-3 text-amber-500" />
                Tetikleyici: [VIP] Etiketi Eklendiğinde
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 px-2 py-1 rounded-md font-semibold">
                Aksiyon: Kıdemli Temsilciye Ata + Öncelik Yükselt
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
