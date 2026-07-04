import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MessageSquare, Send, Paperclip, Image as ImageIcon, Mic,
  Video, Play, Pause, Trash2, CheckCheck, Loader2, AlertCircle,
  Clock, ShieldCheck, Mail, Briefcase, RefreshCw, X, User
} from 'lucide-react';

interface Contact {
  contactId: string; // The candidate's email
  contactName: string;
  contactRole: string;
  lastMessage: string;
  lastMessageType: 'text' | 'image' | 'voice' | 'video';
  lastMessageAt: string;
  unreadCount: number;
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

export const AdminChatCenter: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [contactsLoading, setContactsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Media states
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

  // Load active contacts on launch
  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/chat/active-contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error('Failed to load active chat contacts:', err);
    } finally {
      setContactsLoading(false);
    }
  };

  // Load chat messages with selected candidate
  const fetchMessages = async (contact: Contact) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/chat/messages?senderId=admin&receiverId=${encodeURIComponent(contact.contactId)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load candidate messages:', err);
    } finally {
      setMessagesLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mark selected candidate messages as read
  const markMessagesAsRead = async (contactId: string) => {
    try {
      await fetch('/api/chat/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: contactId, receiverId: 'admin' })
      });
      // Clear local list count
      setContacts(prev => prev.map(c => c.contactId === contactId ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Trigger initial fetch
  useEffect(() => {
    fetchContacts();
  }, []);

  // Sync to active contact changes
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact);
      markMessagesAsRead(selectedContact.contactId);
    }
  }, [selectedContact]);

  // Connect to global SSE Events transmitted via NotificationProvider or direct listeners
  useEffect(() => {
    const handleRealtimeSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      const eventData = customEvent.detail;

      if (eventData.type === 'chat') {
        const newMsg: ChatMessage = eventData.data;

        // Skip chatbot system dialogues
        if (newMsg.senderId === 'chatbot' || newMsg.receiverId === 'chatbot') {
          return;
        }

        // Check if message belongs to the current open chat thread
        if (selectedContact) {
          const isFromSelected = newMsg.senderId === selectedContact.contactId && newMsg.receiverId === 'admin';
          const isToSelected = newMsg.senderId === 'admin' && newMsg.receiverId === selectedContact.contactId;

          if (isFromSelected || isToSelected) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(scrollToBottom, 50);

            if (isFromSelected) {
              markMessagesAsRead(selectedContact.contactId);
            }
          } else {
            // Unrelated contact thread got message. Refresh contacts list
            fetchContacts();
          }
        } else {
          // No active contact chosen. Just refresh contacts list to show unread badges
          fetchContacts();
        }
      } else if (eventData.type === 'chat_read') {
        const { senderId, receiverId } = eventData.data;
        if (selectedContact && senderId === 'admin' && receiverId === selectedContact.contactId) {
          // Candidate read our message, update double ticks
          setMessages(prev => prev.map(m => m.senderId === 'admin' ? { ...m, read: 1 } : m));
        }
      }
    };

    window.addEventListener('realtime-sync', handleRealtimeSync);
    return () => {
      window.removeEventListener('realtime-sync', handleRealtimeSync);
    };
  }, [selectedContact]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedContact) return;
    if (!inputText.trim() && !selectedImage) return;

    const payload = {
      senderId: 'admin',
      senderName: 'DS Tech HR',
      senderRole: 'admin',
      receiverId: selectedContact.contactId,
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
      if (res.ok) {
        // Optimistic local update to avoid waiting for SSE broadcast echo
        fetchContacts();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Image upload
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

  // Audio simulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordDuration(0);
    const timer = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
    setRecordingTimer(timer);
  };

  const stopRecordingAndSend = async (send = true) => {
    clearInterval(recordingTimer);
    setRecordingTimer(null);
    setIsRecording(false);

    if (send && recordDuration > 0 && selectedContact) {
      const durationStr = formatDuration(recordDuration);
      const payload = {
        senderId: 'admin',
        senderName: 'DS Tech HR',
        senderRole: 'admin',
        receiverId: selectedContact.contactId,
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
        fetchContacts();
      } catch (err) {
        console.error('Error sending voice note:', err);
      }
    }
    setRecordDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const playSimulatedAudioNote = (msgId: string) => {
    if (playingAudioId === msgId) {
      if (activeOscillatorRef.current) {
        try { activeOscillatorRef.current.stop(); } catch (e) {}
      }
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(msgId);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const notes = [329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63]; // E Major / C Arpeggio variation
      let curNote = 0;

      const playNext = () => {
        if (curNote >= notes.length) {
          setPlayingAudioId(null);
          ctx.close();
          return;
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[curNote], ctx.currentTime);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.25);

        activeOscillatorRef.current = osc;
        curNote++;

        setTimeout(playNext, 260);
      };

      playNext();
    } catch (e) {
      console.warn('Audio play failed:', e);
      setPlayingAudioId(null);
    }
  };

  const formatMsgTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl h-[650px] transition-all">
      {/* 1. LEFT CONVERSATION LIST PANEL */}
      <div className="w-1/3 border-r dark:border-zinc-800 flex flex-col bg-slate-50/50 dark:bg-zinc-950/20">
        {/* Search header */}
        <div className="p-4 border-b dark:border-zinc-800 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Active Contacts ({filteredContacts.length})
            </h3>
            <button 
              onClick={fetchContacts}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Refresh Threads"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-zinc-900 border-transparent dark:border-transparent text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Contacts list scroll zone */}
        <div className="flex-1 overflow-y-auto divide-y dark:divide-zinc-800/60 scrollbar-thin">
          {contactsLoading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Syncing contacts...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-1 select-none">
              <AlertCircle size={20} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold">No Chats Found</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">No candidates have requested live human chat yet.</p>
            </div>
          ) : (
            filteredContacts.map(c => {
              const isSelected = selectedContact?.contactId === c.contactId;
              return (
                <button
                  key={c.contactId}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full p-4 flex items-start gap-3 transition-colors text-left cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 pl-3' 
                      : 'hover:bg-slate-100/50 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-zinc-800 text-emerald-700 dark:text-zinc-400 flex items-center justify-center font-bold text-xs shadow-inner uppercase">
                    {c.contactName.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-zinc-100 truncate">
                        {c.contactName}
                      </h4>
                      <span className="text-[8px] text-slate-400 font-mono">
                        {new Date(c.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                      {c.contactId}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-1 leading-normal font-medium">
                      {c.lastMessage}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black tracking-tight self-center shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT CHAT THREAD WORKSPACE */}
      <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-zinc-950 transition-colors">
        {selectedContact ? (
          <>
            {/* Active Thread Header */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-b dark:border-zinc-800 flex items-center justify-between shrink-0 shadow-sm transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow uppercase">
                  {selectedContact.contactName.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-1.5 leading-none">
                    {selectedContact.contactName}
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[8px] font-mono font-bold uppercase tracking-wider">
                      {selectedContact.contactRole}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-1">
                    {selectedContact.contactId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live SSE Connected
                </div>
              </div>
            </div>

            {/* Message bubbles scroll view */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col scrollbar-thin">
              {messagesLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Decrypting logs...</span>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === 'admin';
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col max-w-[80%] ${
                        isMe ? 'self-end' : 'self-start'
                      }`}
                    >
                      <div className={`p-2.5 rounded-2xl shadow-sm relative ${
                        isMe 
                          ? 'bg-[#d9fdd3] text-[#303030] rounded-tr-none' 
                          : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-tl-none border dark:border-zinc-700/50'
                      }`}>
                        {/* Type Image attachment */}
                        {msg.type === 'image' && msg.mediaUrl && (
                          <div className="rounded-xl overflow-hidden mb-1.5 border border-black/5 bg-slate-50 max-h-[220px]">
                            <img
                              src={msg.mediaUrl}
                              alt="Admin Media Attachment"
                              referrerPolicy="no-referrer"
                              className="w-full object-cover max-h-[220px] hover:scale-105 transition-transform cursor-pointer"
                            />
                          </div>
                        )}

                        {/* Type voice note */}
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
                                Candidate Voice Memo
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Text Message with auto wrapping */}
                        {msg.message && (
                          <p className="text-xs leading-relaxed font-medium break-words whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        )}

                        {/* Time stamp */}
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

            {/* Media Image Selection preview */}
            {selectedImage && (
              <div className="p-2 border-t shrink-0 flex items-center gap-2 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white">
                  <img
                    src={selectedImage}
                    alt="Preview attachment"
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
                <div>
                  <span className="text-xs font-bold text-emerald-500 block">Ready to transmit image</span>
                  <span className="text-[10px] text-slate-400 font-medium">Will be instantly pushed via server-sent-events.</span>
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-900 border-t dark:border-zinc-800 flex items-center gap-2 shrink-0 transition-colors">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
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

                <button
                  type="button"
                  onClick={() => isRecording ? stopRecordingAndSend(true) : startRecording()}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg' 
                      : 'hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                  }`}
                  title={isRecording ? "Stop & Send Recording" : "Record Voice Note"}
                >
                  <Mic size={18} />
                </button>
              </div>

              <div className="flex-1">
                {isRecording ? (
                  <div className="flex items-center gap-2 py-1 bg-rose-100/50 dark:bg-rose-950/20 px-3 rounded-full border border-rose-200 dark:border-rose-950">
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
                      placeholder={`Send a message to ${selectedContact.contactName}...`}
                      className="w-full py-2 pl-4 pr-10 rounded-full text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-zinc-800 border-transparent dark:border-transparent text-slate-800 dark:text-zinc-100 placeholder-slate-400"
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 select-none">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
              <MessageSquare size={40} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-200">
                DS Tech Live Communication Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-[340px] leading-relaxed">
                Select a candidate conversation from the left pane to begin direct real-time assistance. Monitor unread badges for active queue updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
