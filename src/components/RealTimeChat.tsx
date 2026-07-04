import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Send, X, Paperclip, Image as ImageIcon, Mic, Video,
  Phone, MoreVertical, Check, CheckCheck, Search, Bot, User, Play, Pause,
  Camera, Trash2, Loader2, Smile, ArrowLeft, Heart, Sparkles, AlertCircle
} from 'lucide-react';
import { useNotifications } from './NotificationProvider';

interface RealTimeChatProps {
  currentUser: { fullName: string; email: string; id: string; role?: string; profilePhoto?: string } | null;
  isDarkMode: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  message: string;
  type: 'text' | 'image' | 'voice' | 'video';
  mediaUrl: string | null;
  createdAt: string;
  read: number;
}

export const RealTimeChat: React.FC<RealTimeChatProps> = ({ currentUser, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chatbot' | 'admin'>('chatbot');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({ chatbot: 0, admin: 0 });

  // Media attachments
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<any>(null);

  // Audio Playback states
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorRef = useRef<OscillatorNode | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const email = currentUser?.email || 'hassanalaminhassan85@gmail.com';
  const name = currentUser?.fullName || 'Candidate';
  const role = currentUser?.role || 'user';

  // Keep track of open chat state globally for Toast suppressing
  useEffect(() => {
    (window as any).isChatActive = isOpen;
    if (isOpen) {
      // Clear unread counts
      markMessagesAsRead();
    }
    return () => {
      (window as any).isChatActive = false;
    };
  }, [isOpen, activeTab]);

  // Fetch unread counts
  const fetchUnreadCounts = async () => {
    try {
      const res = await fetch(`/api/chat/unread?userId=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        const counts = data.unread || {};
        setUnreadCounts({
          chatbot: counts['chatbot'] || 0,
          admin: counts['admin'] || 0
        });
      }
    } catch (err) {
      console.warn('Failed to fetch chat unread counts:', err);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!isOpen) return;
    try {
      await fetch('/api/chat/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: activeTab, receiverId: email })
      });
      setUnreadCounts(prev => ({
        ...prev,
        [activeTab]: 0
      }));
    } catch (err) {
      console.warn('Failed to mark messages read:', err);
    }
  };

  // Fetch Message History
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/messages?senderId=${encodeURIComponent(email)}&receiverId=${encodeURIComponent(activeTab)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Trigger history load on tab switch
  useEffect(() => {
    fetchHistory();
    fetchUnreadCounts();
  }, [activeTab, email]);

  // Handle SSE live notifications
  useEffect(() => {
    const handleRealtimeSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      const eventData = customEvent.detail;

      if (eventData.type === 'chat') {
        const newMsg: ChatMessage = eventData.data;
        // Verify if message belongs to current active chat tab
        const isFromCurrentTab = (newMsg.senderId === activeTab && newMsg.receiverId === email);
        const isToCurrentTab = (newMsg.senderId === email && newMsg.receiverId === activeTab);

        if (isFromCurrentTab || isToCurrentTab) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(scrollToBottom, 50);

          if (isFromCurrentTab && isOpen) {
            markMessagesAsRead();
          }
        } else {
          // Update counts
          fetchUnreadCounts();
        }
      } else if (eventData.type === 'chat_read') {
        const { senderId, receiverId } = eventData.data;
        if (senderId === email && receiverId === activeTab) {
          // Double tick read state updated!
          setMessages(prev => prev.map(m => m.senderId === email ? { ...m, read: 1 } : m));
        }
      }
    };

    window.addEventListener('realtime-sync', handleRealtimeSync);
    // Initial fetch unread counts
    fetchUnreadCounts();

    return () => {
      window.removeEventListener('realtime-sync', handleRealtimeSync);
    };
  }, [activeTab, email, isOpen]);

  // Handle Sending message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const payload = {
      senderId: email,
      senderName: name,
      senderRole: role,
      receiverId: activeTab,
      message: inputText,
      type: selectedImage ? 'image' : 'text',
      mediaUrl: selectedImage || null
    };

    setInputText('');
    setSelectedImage(null);
    scrollToBottom();

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  // Image Upload handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Start Simulated Voice Recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordDuration(0);
    const timer = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
    setRecordingTimer(timer);
  };

  // Stop Recording & Send Voice Note
  const stopRecordingAndSend = async (send = true) => {
    clearInterval(recordingTimer);
    setRecordingTimer(null);
    setIsRecording(false);

    if (send && recordDuration > 0) {
      // Send beautiful simulated audio message with custom waveform
      const durationStr = formatDuration(recordDuration);
      const payload = {
        senderId: email,
        senderName: name,
        senderRole: role,
        receiverId: activeTab,
        message: `Voice Note (${durationStr})`,
        type: 'voice',
        mediaUrl: `https://alihsan.online/simulated-audio-${recordDuration}.mp3`
      };

      try {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error('Error sending simulated voice note:', err);
      }
    }
    setRecordDuration(0);
  };

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Play synthesized melody sound when voice note clicked
  const playSimulatedAudioNote = (msgId: string) => {
    if (playingAudioId === msgId) {
      // Stop
      if (activeOscillatorRef.current) {
        try { activeOscillatorRef.current.stop(); } catch (e) {}
      }
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(msgId);

    // Initialize AudioContext
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Create synthesizer melody for beautiful retro feedback
      const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63]; // Arpeggio C Major
      let curNote = 0;

      const playNextNote = () => {
        if (curNote >= notes.length) {
          setPlayingAudioId(null);
          ctx.close();
          return;
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[curNote], ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);

        activeOscillatorRef.current = osc;
        curNote++;

        setTimeout(playNextNote, 320);
      };

      playNextNote();
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
      setPlayingAudioId(null);
    }
  };

  // Format message time
  const formatMsgTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <>
      {/* 1. FLOATING WHATSAPP RECTANGLE ACTIVATOR BUTTON */}
      <motion.button
        id="whatsapp-chat-button"
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[999] p-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl cursor-pointer flex items-center justify-center border border-emerald-400/20"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6" />
          {unreadCounts.chatbot + unreadCounts.admin > 0 && (
            <span className="absolute -top-3.5 -right-3.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black tracking-tight border border-white animate-bounce">
              {unreadCounts.chatbot + unreadCounts.admin}
            </span>
          )}
        </div>
      </motion.button>

      {/* 2. CHAT DRAWER WITH FULL WHATSAPP USER EXPERIENCE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="whatsapp-chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed bottom-24 right-6 z-[999] w-[92%] sm:w-[410px] h-[600px] rounded-3xl overflow-hidden shadow-2xl border transition-colors flex flex-col ${
              isDarkMode 
                ? 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-emerald-950/10' 
                : 'bg-[#efeae2] border-slate-200 text-slate-800 shadow-slate-300'
            }`}
          >
            {/* Header section styled after WhatsApp web */}
            <div className="bg-[#075e54] text-white p-4 shrink-0 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#128c7e] border border-emerald-400/30 flex items-center justify-center shadow-inner">
                    <Bot className="w-5 h-5 text-emerald-100" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">DS Tech Care & AI</h3>
                    <p className="text-[10px] text-emerald-100/90 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Continuous SSE Synchronization
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs (WhatsApp Contacts tab styling) */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all relative ${
                    activeTab === 'chatbot'
                      ? 'bg-[#128c7e] text-white'
                      : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Copilot
                  {unreadCounts.chatbot > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-black">
                      {unreadCounts.chatbot}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all relative ${
                    activeTab === 'admin'
                      ? 'bg-[#128c7e] text-white'
                      : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  HR Live
                  {unreadCounts.admin > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-black">
                      {unreadCounts.admin}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Chat Room Banner informing of status */}
            <div className={`px-4 py-1.5 text-[10px] border-b font-medium text-center flex items-center justify-center gap-1 select-none ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400' 
                : 'bg-white/90 border-slate-200 text-slate-500'
            }`}>
              <AlertCircle size={11} className="text-emerald-500" />
              {activeTab === 'chatbot' 
                ? "Powered by Multimodal Gemini 3.5. Describe screens or upload images!"
                : "Secure direct link to DS Tech HR Recruitment Administrators."
              }
            </div>

            {/* 3. MESSAGES SCROLL AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col scrollbar-thin">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="text-xs text-slate-400 font-medium">Securing connection...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2 select-none">
                  <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600">
                    <MessageSquare size={32} />
                  </div>
                  <h4 className="font-bold text-sm">No Messages Yet</h4>
                  <p className="text-xs text-slate-400 max-w-[200px]">
                    {activeTab === 'chatbot' 
                      ? "Ask me anything about career acceleration or interview training!"
                      : "Send a message to DS Tech staff. We usually reply in real-time."
                    }
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === email;
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col max-w-[80%] ${
                        isMe ? 'self-end' : 'self-start'
                      }`}
                    >
                      {/* Message Bubble Container */}
                      <div className={`p-2.5 rounded-2xl shadow-sm relative group ${
                        isMe 
                          ? 'bg-[#d9fdd3] text-[#303030] rounded-tr-none' 
                          : isDarkMode 
                            ? 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        {/* Render Message header name only on Support group chat for context */}
                        {!isMe && activeTab === 'admin' && (
                          <span className="text-[9px] font-black text-indigo-500 block mb-0.5 uppercase tracking-wide">
                            {msg.senderName}
                          </span>
                        )}

                        {/* Rendering Image content */}
                        {msg.type === 'image' && msg.mediaUrl && (
                          <div className="rounded-xl overflow-hidden mb-1.5 border border-black/5 bg-slate-50 max-h-[220px]">
                            <img
                              src={msg.mediaUrl}
                              alt="Media Attachment"
                              referrerPolicy="no-referrer"
                              className="w-full object-cover max-h-[220px] hover:scale-105 transition-transform cursor-pointer"
                            />
                          </div>
                        )}

                        {/* Rendering Voice note audio content with real synthesized sound */}
                        {msg.type === 'voice' && (
                          <div className="flex items-center gap-3 py-1.5 pr-2">
                            <button
                              onClick={() => playSimulatedAudioNote(msg.id)}
                              className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
                            >
                              {playingAudioId === msg.id ? (
                                <Pause className="w-4 h-4 text-emerald-600 animate-pulse" />
                              ) : (
                                <Play className="w-4 h-4 text-emerald-600 ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1 space-y-1">
                              {/* Faux Waveform columns that animate when playing */}
                              <div className="flex items-center gap-0.5 h-6">
                                {[1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1].map((val, idx) => (
                                  <div
                                    key={idx}
                                    style={{ height: playingAudioId === msg.id ? '100%' : `${val * 20}%` }}
                                    className={`w-[2px] rounded bg-emerald-500/60 transition-all ${
                                      playingAudioId === msg.id ? 'animate-bounce' : ''
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] font-mono text-slate-500 block">
                                Simulated Voice Message
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Text Message Content with standard word wrapping */}
                        {msg.message && (
                          <p className="text-xs leading-relaxed font-medium break-words whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        )}

                        {/* Time stamp and double-ticks */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-500 font-mono select-none">
                          <span>{formatMsgTime(msg.createdAt)}</span>
                          {isMe && (
                            msg.read === 1 ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 4. ATTACHMENT IMAGES PREVIEW CAROUSEL ROW */}
            {selectedImage && (
              <div className={`p-2 border-t flex items-center gap-2 shrink-0 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-0.5 right-0.5 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-emerald-500 block">Ready to send image</span>
                  <span className="text-[10px] text-slate-400 font-medium">Multimodal Gemini model will analyze this picture!</span>
                </div>
              </div>
            )}

            {/* 5. INPUT ACTIONS ROW CONTAINER */}
            <div className={`p-3 border-t shrink-0 flex items-center gap-2 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
            }`}>
              {/* Attachment selector buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                  title="Attach Photo"
                >
                  <ImageIcon size={18} />
                </button>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Simulated audio recorder button */}
                <button
                  type="button"
                  onClick={() => isRecording ? stopRecordingAndSend(true) : startRecording()}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg' 
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                  }`}
                  title={isRecording ? "Stop & Send Recording" : "Record Simulated Voice Note"}
                >
                  <Mic size={18} />
                </button>
              </div>

              {/* Text Input area or active Voice Note visual waveform */}
              <div className="flex-1">
                {isRecording ? (
                  <div className="flex items-center gap-2 py-1 bg-rose-50 dark:bg-rose-950/20 px-3 rounded-full border border-rose-100 dark:border-rose-950">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                      RECORDING... {formatDuration(recordDuration)}
                    </span>
                    <button
                      type="button"
                      onClick={() => stopRecordingAndSend(false)}
                      className="ml-auto p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={activeTab === 'chatbot' ? "Ask the AI Assistant..." : "Type message..."}
                      className={`w-full py-1.5 pl-4 pr-10 rounded-full text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isDarkMode 
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500' 
                          : 'bg-[#f0f2f5] border-transparent text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="absolute right-1 p-1.5 rounded-full text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
