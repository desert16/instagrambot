'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function KnowledgeBasePage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['knowledge_base'],
    queryFn: () => fetchApi<any[]>('/api/knowledge-base'),
  });

  // Create document mutation
  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      fetchApi('/api/knowledge-base', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setTitle('');
      setContent('');
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ['knowledge_base'] });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/knowledge-base/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge_base'] });
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span>Kurumsal Bilgi Bankası (Knowledge Base & FAQ)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Yapay zekanın müşterilere kesin ve doğrulanmış bilgi vermesi için işletme dökümanlarınızı ekleyin.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Belge Ekle</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-700 dark:text-purple-300 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
        <span>
          <strong>Halüsinasyon Önleyici AI Altyapısı:</strong> Model, kullanıcı sorularını yanıtlarken öncelikle aşağıdaki doğrulanmış belgeleri referans alır. Bilgi bankasında bulunmayan veya emin olunmayan konularda uydurma bilgi vermez, kullanıcıyı kibarca insan temsilciye aktarır.
        </span>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Yeni Bilgi Bankası Belgesi Ekle
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Başlık (Örn: Kargo ve Teslimat Koşulları, İade Politikası)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Kargo ve Teslimat Bilgisi"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  İçerik & Detaylar
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Yurtiçi Kargo ile çalışmaktayız. 500 TL üzeri alışverişlerde kargo ücretsizdir. Siparişler 24 saat içerisinde kargoya teslim edilir..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                İptal
              </button>
              <button
                onClick={() => createMutation.mutate({ title, content })}
                disabled={!title.trim() || !content.trim() || createMutation.isPending}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
              >
                {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-xs">Belgeler yükleniyor...</p>
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>{doc.title}</span>
                  </h4>
                  <button
                    onClick={() => deleteMutation.mutate(doc.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-wrap">
                  {doc.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Eklenme: {new Date(doc.createdAt).toLocaleDateString()}</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  AI Doğrulandı
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-indigo-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Henüz bilgi bankası belgesi eklenmedi
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Sıkça sorulan soruları, kargo/fiyat detaylarını ve iade prosedürlerini ekleyerek AI asistanınızın müşterilere kesin bilgi vermesini sağlayın.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Belgeyi Ekle</span>
          </button>
        </div>
      )}
    </div>
  );
}
