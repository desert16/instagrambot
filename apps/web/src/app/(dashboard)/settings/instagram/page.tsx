'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import {
  Instagram,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Bot,
  ShieldAlert,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function InstagramSettingsPage() {
  const queryClient = useQueryClient();
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Check URL query parameters for OAuth redirect status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      const message = params.get('message');

      if (status === 'success') {
        setFeedbackMessage({
          type: 'success',
          text: '✓ Instagram hesabınız ve mesajlaşma yetkileri Meta üzerinden başarıyla bağlandı!',
        });
      } else if (status === 'cancelled') {
        setFeedbackMessage({
          type: 'info',
          text: 'Instagram yetkilendirme işlemi iptal edildi.',
        });
      } else if (status === 'error') {
        setFeedbackMessage({
          type: 'error',
          text: message ? decodeURIComponent(message) : 'Instagram bağlanırken bir hata oluştu.',
        });
      }
    }
  }, []);

  // Fetch linked accounts
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['instagram_accounts'],
    queryFn: () => fetchApi<any[]>('/api/integrations/instagram/accounts'),
  });

  // Start OAuth Flow (Zero-Friction 1-Click Connect)
  const connectMutation = useMutation({
    mutationFn: async () => {
      const data = await fetchApi<{ url: string }>('/api/integrations/instagram/connect');
      return data.url;
    },
    onSuccess: (authUrl) => {
      window.location.href = authUrl;
    },
    onError: (err: any) => {
      setFeedbackMessage({ type: 'error', text: err.message });
    },
  });

  // Test Connection
  const testMutation = useMutation({
    mutationFn: (accountId: string) =>
      fetchApi(`/api/integrations/instagram/${accountId}/test`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram_accounts'] });
      setFeedbackMessage({
        type: 'success',
        text: '✓ Instagram bağlantı testi başarılı! Token, izinler ve mesajlaşma API doğrulanmıştır.',
      });
    },
    onError: (err: any) => {
      setFeedbackMessage({ type: 'error', text: `Test başarısız: ${err.message}` });
    },
  });

  // Disconnect Account
  const disconnectMutation = useMutation({
    mutationFn: (accountId: string) =>
      fetchApi(`/api/integrations/instagram/${accountId}/disconnect`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram_accounts'] });
      setFeedbackMessage({ type: 'info', text: 'Instagram hesabı bağlantısı başarıyla kesildi.' });
    },
    onError: (err: any) => {
      setFeedbackMessage({ type: 'error', text: err.message });
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & 1-Click Connect Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Instagram className="w-5 h-5 text-pink-500" />
            <span>Instagram Hesapları ve Meta Entegrasyonu</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resmi Meta Graph API üzerinden Instagram Profesyonel hesaplarınızı tek tıkla bağlayın.
          </p>
        </div>

        <button
          onClick={() => connectMutation.mutate()}
          disabled={connectMutation.isPending}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {connectMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>Instagram Hesabı Bağla</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : feedbackMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-500" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Account Cards Section */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-xs">Instagram hesapları yükleniyor...</p>
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="space-y-4">
          {accounts.map((account) => {
            const isConnected = account.status === 'CONNECTED';
            const isMessagingActive = account.messagingReady;
            const isWebhookActive = account.webhookReady;
            const isAIActive = account.aiSettings?.enabled;

            return (
              <div
                key={account.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                {/* Account Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-md">
                      <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {account.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={account.profilePictureUrl}
                            alt={account.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          `@${account.username.substring(0, 1).toUpperCase()}`
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          @{account.username}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {account.accountType || 'BUSINESS'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {account.name || 'Instagram Profesyonel Hesabı'} • ID: {account.externalAccountId}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/ai?accountId=${account.id}`}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Bot className="w-3.5 h-3.5 text-purple-500" />
                      <span>AI Bot Ayarları</span>
                    </Link>

                    <button
                      onClick={() => testMutation.mutate(account.id)}
                      disabled={testMutation.isPending}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${testMutation.isPending ? 'animate-spin' : ''}`} />
                      <span>Entegrasyonu Test Et</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`@${account.username} hesabının bağlantısını kesmek istediğinize emin misiniz?`)) {
                          disconnectMutation.mutate(account.id);
                        }
                      }}
                      disabled={disconnectMutation.isPending}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Bağlantıyı Kes</span>
                    </button>
                  </div>
                </div>

                {/* Capability Status Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Bağlantı</span>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Mesajlaşma API</span>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${isMessagingActive ? 'text-emerald-500' : 'text-amber-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${isMessagingActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {isMessagingActive ? 'Aktif' : 'Beklemede'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Meta Webhook</span>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${isWebhookActive ? 'text-emerald-500' : 'text-amber-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${isWebhookActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {isWebhookActive ? 'Aktif' : 'Hazır Değil'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">AI Bot Durumu</span>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${isAIActive ? 'text-purple-500' : 'text-slate-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${isAIActive ? 'bg-purple-500' : 'bg-slate-400'}`} />
                      {isAIActive ? 'Aktif (Gemini)' : 'Kapalı'}
                    </span>
                  </div>
                </div>

                {/* Token Expiry or Permission Notice */}
                {account.status === 'PERMISSION_ERROR' && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>İzinler eksik veya token süresi dolmuş olabilir.</span>
                    </div>
                    <button
                      onClick={() => connectMutation.mutate()}
                      className="text-xs font-semibold text-amber-800 dark:text-amber-200 underline"
                    >
                      Instagram&apos;ı Yeniden Bağla
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center mx-auto text-pink-500">
            <Instagram className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Henüz Instagram Hesabı Bağlanmadı
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Müşteri mesajlarını doğrudan yapay zeka ile yanıtlamak ve canlı gelen kutusunu kullanmak için resmi Meta ekranından Instagram hesabınızı bağlayın.
            </p>
          </div>
          <button
            onClick={() => connectMutation.mutate()}
            disabled={connectMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Instagram Hesabı Bağla</span>
          </button>
        </div>
      )}
    </div>
  );
}
