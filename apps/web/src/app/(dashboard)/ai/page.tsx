'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import {
  Bot,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  HelpCircle,
  Loader2,
} from 'lucide-react';

export default function AISettingsPage() {
  const queryClient = useQueryClient();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [savedToast, setSavedToast] = useState(false);

  // Form State
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [handoffKeywords, setHandoffKeywords] = useState('yetkili, insan, temsilci, şikayet, telefon');
  const [businessHoursOnly, setBusinessHoursOnly] = useState(false);
  const [autoReplyDelay, setAutoReplyDelay] = useState(3);

  // 1. Fetch Accounts
  const { data: accounts } = useQuery({
    queryKey: ['instagram_accounts'],
    queryFn: () => fetchApi<any[]>('/api/integrations/instagram/accounts'),
  });

  useEffect(() => {
    if (!selectedAccountId && accounts && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // 2. Fetch AI Settings for Selected Account
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['ai_settings', selectedAccountId],
    queryFn: () =>
      selectedAccountId ? fetchApi<any>(`/api/ai/settings/${selectedAccountId}`) : null,
    enabled: !!selectedAccountId,
  });

  useEffect(() => {
    if (settingsData) {
      setEnabled(settingsData.enabled ?? false);
      setProvider(settingsData.provider || 'gemini');
      setModel(settingsData.model || 'gemini-1.5-flash');
      setSystemPrompt(settingsData.systemPrompt || '');
      setTemperature(settingsData.temperature ?? 0.7);
      setMaxTokens(settingsData.maxTokens ?? 500);
      setFallbackMessage(settingsData.fallbackMessage || '');
      setHandoffKeywords(
        Array.isArray(settingsData.handoffKeywords)
          ? settingsData.handoffKeywords.join(', ')
          : 'yetkili, insan, temsilci, şikayet, telefon'
      );
      setBusinessHoursOnly(settingsData.businessHoursOnly ?? false);
      setAutoReplyDelay(settingsData.autoReplyDelay ?? 3);
    }
  }, [settingsData]);

  // 3. Save Mutation
  const saveMutation = useMutation({
    mutationFn: (body: any) =>
      fetchApi(`/api/ai/settings/${selectedAccountId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_settings', selectedAccountId] });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    },
  });

  const handleSave = () => {
    const keywordsArray = handoffKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    saveMutation.mutate({
      enabled,
      provider,
      model,
      systemPrompt,
      temperature: Number(temperature),
      maxTokens: Number(maxTokens),
      fallbackMessage,
      handoffKeywords: keywordsArray,
      businessHoursOnly,
      autoReplyDelay: Number(autoReplyDelay),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            <span>AI Bot Asistanı Yapılandırması</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Google Gemini ve OpenAI destekli yapay zeka müşteri temsilcinizi kişiselleştirin.
          </p>
        </div>

        {accounts && accounts.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Instagram Hesabı:</span>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  @{acc.username}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {savedToast && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>AI Bot ayarları başarıyla kaydedildi!</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500 mb-2" />
          <p className="text-xs">Ayarlar yükleniyor...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Master Enable Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span>AI Asistanı Otonom Yanıtı</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Açık olduğunda Instagram DM kutusuna gelen yeni müşteri soruları yapay zeka tarafından otomatik yanıtlanır.
              </p>
            </div>

            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                enabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.75 ${
                  enabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* AI Model & Provider Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Yapay Zeka Modeli & Sağlayıcı</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  AI Sağlayıcı
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="gemini">Google Gemini (Önerilen)</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini_live">Gemini Multimodal Live API (v2 Sesli / Realtime)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Model Seçimi
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {provider === 'gemini' ? (
                    <>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Ultra Hızlı, Düşük Maliyet)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Derin Muhakeme, Uzun Bağlam)</option>
                    </>
                  ) : provider === 'gemini_live' ? (
                    <>
                      <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Canlı Ses & WebSocket)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                      <option value="gpt-4o">gpt-4o</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* System Prompt Editor Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>AI Sistem Talimatı (Prompt)</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {systemPrompt.length} karakter
              </span>
            </div>

            <textarea
              rows={6}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Sen @firmahesabi adına yanıt veren profesyonel bir Instagram asistanısın. Müşterilere güler yüzlü, kurumsal, kibar ve Türkçe cevap ver..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-[11px] text-slate-400 leading-normal">
              İpucu: Markanızın vizyonunu, hitap şeklini ve ürün detaylarını belirtin. Bilgi Bankası (FAQ) belgeleri otomatik olarak bu komutun altına doğrulanmış bilgi olarak eklenir.
            </p>
          </div>

          {/* Handoff & Safety Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>İnsan Temsilciye Aktarma (Human Handoff) & Güvenlik</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Aktarma Anahtar Kelimeleri (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={handoffKeywords}
                  onChange={(e) => setHandoffKeywords(e.target.value)}
                  placeholder="yetkili, insan, temsilci, şikayet, telefon"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Müşteri bu kelimeleri kullandığında AI otomatik durdurulur ve konuşma &quot;Bekleyen&quot; durumuna alınır.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Aktarma / Hata Durumu Mesajı (Fallback Message)
                </label>
                <input
                  type="text"
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  placeholder="Bu konuda size daha iyi yardımcı olabilmek için sizi müşteri temsilcimize aktarıyorum."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Yanıt Birleştirme Gecikmesi (Debounce: {autoReplyDelay} saniye)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={autoReplyDelay}
                    onChange={(e) => setAutoReplyDelay(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">
                    Müşteri art arda mesaj atarsa {autoReplyDelay} sn bekleyip tek AI yanıtı üretir.
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Yalnızca Çalışma Saatlerinde
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Mesai saatleri dışında kapalı mesajı gönderir.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={businessHoursOnly}
                    onChange={(e) => setBusinessHoursOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Ayarları Kaydet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
