'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { realtimeSocket } from '@/lib/socket';
import {
  Search,
  Send,
  Bot,
  User,
  CheckCheck,
  Tag,
  FileText,
  UserCheck,
  Sparkles,
  Paperclip,
  Clock,
  Instagram,
  Circle,
} from 'lucide-react';

export default function InboxPage() {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OPEN' | 'PENDING' | 'RESOLVED' | ''>('OPEN');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Connect to Realtime WebSocket
  useEffect(() => {
    // Connect to demo/active workspace
    realtimeSocket.connect('demo-workspace');

    // Subscribe to new incoming and outbound messages
    const unsubscribeMsg = realtimeSocket.subscribe('message.created', (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
    });

    const unsubscribeConv = realtimeSocket.subscribe('conversation.updated', () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (selectedConversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      }
    });

    return () => {
      unsubscribeMsg();
      unsubscribeConv();
    };
  }, [queryClient, selectedConversationId]);

  // 2. Fetch Conversations
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations', activeTab, searchQuery],
    queryFn: () =>
      fetchApi<{ items: any[] }>(
        `/api/inbox/conversations?status=${activeTab}&search=${encodeURIComponent(searchQuery)}`
      ),
  });

  const conversations = conversationsData?.items || [];

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // 3. Fetch Selected Conversation Details
  const { data: activeConversation } = useQuery({
    queryKey: ['conversation', selectedConversationId],
    queryFn: () =>
      selectedConversationId
        ? fetchApi<any>(`/api/inbox/conversations/${selectedConversationId}`)
        : null,
    enabled: !!selectedConversationId,
  });

  // 4. Fetch Messages
  const { data: messagesData } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: () =>
      selectedConversationId
        ? fetchApi<{ items: any[] }>(`/api/inbox/conversations/${selectedConversationId}/messages`)
        : null,
    enabled: !!selectedConversationId,
  });

  const messages = messagesData?.items || [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Human Agent Message Mutation
  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      fetchApi(`/api/inbox/conversations/${selectedConversationId}/send`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
    onSuccess: () => {
      setInputText('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Toggle AI Mutation
  const toggleAIMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      fetchApi(`/api/inbox/conversations/${selectedConversationId}/ai`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Change Status Mutation
  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      fetchApi(`/api/inbox/conversations/${selectedConversationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Add Note Mutation
  const addNoteMutation = useMutation({
    mutationFn: (content: string) =>
      fetchApi(`/api/inbox/conversations/${selectedConversationId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      setNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversationId] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sendMutation.isPending) return;
    sendMutation.mutate(inputText.trim());
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* ========================================================================= */}
      {/* COLUMN 1: CONVERSATIONS LIST & FILTERS */}
      {/* ========================================================================= */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        {/* Search */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Konuşma veya müşteri ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('OPEN')}
              className={`flex-1 py-1 rounded-md transition-all ${
                activeTab === 'OPEN'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Açık
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`flex-1 py-1 rounded-md transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Bekleyen
            </button>
            <button
              onClick={() => setActiveTab('RESOLVED')}
              className={`flex-1 py-1 rounded-md transition-all ${
                activeTab === 'RESOLVED'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Çözüldü
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const isSelected = conv.id === selectedConversationId;
              const contactName = conv.contact?.name || conv.contact?.username || 'Instagram Kullanıcısı';

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 p-0.5 shrink-0">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                      {contactName.substring(0, 1).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {contactName}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {conv.lastMessage?.text || 'Yeni konuşma'}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2">
                      {conv.aiEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-800/50">
                          <Bot className="w-2.5 h-2.5" />
                          AI Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/50">
                          <User className="w-2.5 h-2.5" />
                          Temsilci
                        </span>
                      )}

                      {conv.unreadCount > 0 && (
                        <span className="ml-auto w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">Bu filtrede konuşma bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COLUMN 2: ACTIVE CONVERSATION MESSAGES & INPUT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        {activeConversation ? (
          <>
            {/* Conversation Header */}
            <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                    {(activeConversation.contact?.name || activeConversation.contact?.username || 'U').substring(0, 1)}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{activeConversation.contact?.name || activeConversation.contact?.username}</span>
                    <span className="text-[10px] text-pink-500 font-normal flex items-center gap-1">
                      <Instagram className="w-3 h-3" />
                      @{activeConversation.instagramAccount?.username}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ID: {activeConversation.contact?.externalUserId}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                    activeConversation.status === 'OPEN'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/20'
                      : activeConversation.status === 'PENDING'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <Circle className="w-2 h-2 fill-current" />
                  {activeConversation.status === 'OPEN' ? 'Açık' : activeConversation.status === 'PENDING' ? 'Bekleyen' : 'Çözüldü'}
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-[#080d19]">
              {messages.map((msg) => {
                const isCustomer = msg.direction === 'INBOUND';
                const isAI = msg.senderType === 'AI';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-sm space-y-1 ${
                        isCustomer
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                          : isAI
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-indigo-600 text-white rounded-br-sm'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 opacity-80 text-[10px] font-semibold mb-0.5">
                        {isCustomer ? (
                          <span>Müşteri</span>
                        ) : isAI ? (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-200" />
                            AI Asistan (Gemini)
                          </span>
                        ) : (
                          <span>Temsilci</span>
                        )}
                      </div>

                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      <div className="flex items-center justify-end gap-1 text-[10px] opacity-70">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!isCustomer && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shrink-0"
            >
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={
                  activeConversation.aiEnabled
                    ? 'Mesajınızı yazın (Temsilci yanıtı gönderildiğinde AI otomatik duraklatılır)...'
                    : 'Müşteriye yanıt yazın...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || sendMutation.isPending}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <span>Gönder</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Görüntülemek için bir konuşma seçin
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* COLUMN 3: CONTACT PROFILE, AI CONTROLS & NOTES */}
      {/* ========================================================================= */}
      {activeConversation && (
        <div className="w-72 border-l border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-5 overflow-y-auto">
          {/* Contact Details */}
          <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 p-0.5 mx-auto mb-2">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white text-lg font-bold">
                {(activeConversation.contact?.name || activeConversation.contact?.username || 'U').substring(0, 1)}
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {activeConversation.contact?.name || activeConversation.contact?.username}
            </h4>
            <p className="text-[11px] text-slate-400">
              @{activeConversation.contact?.username || 'instagram_kullanicisi'}
            </p>
          </div>

          {/* AI Bot Toggle Switch */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-500" />
                AI Bot Yanıtı
              </span>
              <button
                onClick={() => toggleAIMutation.mutate(!activeConversation.aiEnabled)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  activeConversation.aiEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.75 ${
                    activeConversation.aiEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              {activeConversation.aiEnabled
                ? 'AI gelen müşteri mesajlarını otonom yanıtlar.'
                : 'AI duraklatıldı. Sadece insan temsilci yanıt verebilir.'}
            </p>
          </div>

          {/* Status Changer */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Konuşma Durumu
            </span>
            <div className="grid grid-cols-3 gap-1">
              {['OPEN', 'PENDING', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => statusMutation.mutate(st)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    activeConversation.status === st
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {st === 'OPEN' ? 'Açık' : st === 'PENDING' ? 'Bekleyen' : 'Çözüldü'}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Etiketler
            </span>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                VIP
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Fiyat Sorusu
              </span>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="flex-1 space-y-2 flex flex-col min-h-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Dahili Temsilci Notları
            </span>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activeConversation.notes?.map((n: any) => (
                <div
                  key={n.id}
                  className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-[11px] text-amber-900 dark:text-amber-200 space-y-1"
                >
                  <p>{n.content}</p>
                  <span className="text-[9px] text-amber-600/70 block">
                    {n.author?.name} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <textarea
                placeholder="Özel not ekle..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={2}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
              <button
                onClick={() => noteContent.trim() && addNoteMutation.mutate(noteContent.trim())}
                disabled={!noteContent.trim() || addNoteMutation.isPending}
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Not Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
