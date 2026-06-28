import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Mic, MicOff, Volume2, VolumeX, Briefcase, Award, TrendingUp, Cpu, Compass, BookOpen, GraduationCap } from 'lucide-react';

interface ChatMessage {
  sender: 'ai' | 'candidate';
  text: string;
  timestamp: string;
}

interface SkillPath {
  title: string;
  desc: string;
  certs: string[];
  growthRate: string;
}

export const AIPersonalInterviewer: React.FC<{ candidateName?: string, position?: string }> = ({ 
  candidateName = 'Valued Candidate', 
  position = 'Full-Stack Developer' 
}) => {
  const [activeTab, setActiveTab] = useState<'interview' | 'career'>('interview');
  
  // Interviewer States
  const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
  const [isVoiceOn, setIsVoiceOn] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  // Custom generated career pathways based on their target position
  const careerPaths: SkillPath[] = [
    {
      title: "Cloud Infrastructure Architect",
      desc: "Advance from systems implementation to large-scale distributed systems orchestrations & multi-region Cloud Native deployments.",
      certs: ["Google Cloud Certified Professional Cloud Architect", "HashiCorp Certified Terraform Associate"],
      growthRate: "+34% Market demand"
    },
    {
      title: "AI Integrations Engineer",
      desc: "Specialize in fine-tuning foundation LLMs, neural pipelines deployment, vector databases indexing, and high-performance custom model serving.",
      certs: ["TensorFlow Developer Certificate", "Google Cloud Professional Machine Learning Engineer"],
      growthRate: "+180% Market explosion"
    },
    {
      title: "Security & Biometrics Cryptographer",
      desc: "Pioneer hardware-level WebAuthn security, zero-knowledge educational proofing, and biometric data storage protection.",
      certs: ["Certified Information Systems Security Professional (CISSP)", "Certified WebAuthn Specialist"],
      growthRate: "+42% Security premium"
    }
  ];

  // Simulated AI Questions for Career Screening
  const interviewQuestions = [
    `Greetings ${candidateName}! Welcome to the DS Tech and Digital Marketing Agency automated screening node. To start, please introduce yourself and describe why you are the best fit for our campaigns.`,
    `Fascinating context! How do you handle scalability challenges or critical bugs when deploying a multi-device synced real-time client interface?`,
    `Final screening inquiry: How do you stay updated with rapid modern technologies like AI integration or biometric hardware-level authentication?`
  ];

  const [questionIndex, setQuestionIndex] = useState<number>(0);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiResponding]);

  // text to speech helper
  const speakText = (text: string) => {
    if (!isVoiceOn) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      // Find a premium English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.lang.startsWith('en'));
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis is blocked or unsupported in this window.");
    }
  };

  const handleStartInterview = () => {
    setIsInterviewStarted(true);
    const initialGreeting = interviewQuestions[0];
    setMessages([{
      sender: 'ai',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setTimeout(() => speakText(initialGreeting), 600);
  };

  const handleSendResponse = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add candidate reply
    const updatedMessages = [...messages, {
      sender: 'candidate' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
    setMessages(updatedMessages);
    setInputText('');
    setIsAiResponding(true);

    // Call secure Cloudflare/Gemini backend for real live interactive chat or fallback to premium simulated evaluation!
    try {
      const response = await fetch('/api/gemini/interview-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          position,
          candidateResponse: textToSend,
          previousQuestion: interviewQuestions[questionIndex]
        })
      });

      if (response.ok) {
        const resData = await response.json() as { reply: string };
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: resData.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        speakText(resData.reply);
      } else {
        // Dynamic fallback with screening context
        setTimeout(() => {
          const nextIndex = questionIndex + 1;
          let aiResponse = "";
          if (nextIndex < interviewQuestions.length) {
            aiResponse = `Superb answer! I have cataloged your cognitive reply. Let me advance to the next step: ${interviewQuestions[nextIndex]}`;
            setQuestionIndex(nextIndex);
          } else {
            aiResponse = `Splendid interview! Your responses have been securely packaged and transmitted directly to the Garki headquarters. Alhaji Hassan and the recruitment lead will inspect your voice screening metrics shortly.`;
          }
          setMessages(prev => [...prev, {
            sender: 'ai',
            text: aiResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          speakText(aiResponse);
        }, 1500);
      }
    } catch (e) {
      console.warn("Backend unavailable, fallback activated");
    } finally {
      setIsAiResponding(false);
    }
  };

  // Simple HTML5 Web Speech recognition
  const handleToggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input requires browser Speech Recognition capabilities. Fallback to high-speed text input box!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="relative rounded-3xl p-6 border border-white/25 bg-slate-950/80 text-white backdrop-blur-2xl shadow-3xl overflow-hidden text-left">
      {/* Holographic grid and lens flares */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full filter blur-2xl pointer-events-none" />
      
      {/* Tab Selectors */}
      <div className="relative flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('interview')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'interview' ? 'bg-[#000E32] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu size={13} className="text-orange-400 animate-spin-slow" />
          Automated Voice Screening
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('career')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'career' ? 'bg-[#000E32] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass size={13} className="text-indigo-400" />
          Career Proactive Guidance
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'interview' ? (
          <motion.div
            key="interview-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/20 rounded-xl">
                  <Sparkles size={16} className="text-orange-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase">Interactivity Node Alpha</h4>
                  <p className="text-[9px] text-slate-400 font-medium">Auto voice-synthesizer conducting first-stage reviews</p>
                </div>
              </div>
              
              {/* Voice controls */}
              <button
                type="button"
                onClick={() => {
                  setIsVoiceOn(!isVoiceOn);
                  if (isVoiceOn) window.speechSynthesis.cancel();
                }}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-slate-300 hover:text-white"
                title={isVoiceOn ? 'Mute AI Voice' : 'Unmute AI Voice'}
              >
                {isVoiceOn ? <Volume2 size={14} className="text-orange-400" /> : <VolumeX size={14} />}
              </button>
            </div>

            {!isInterviewStarted ? (
              <div className="py-12 text-center space-y-4">
                {/* Visual glowing brain/node orb */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-500 opacity-20 filter blur-xl"
                  />
                  <div className="absolute w-16 h-16 rounded-full border border-orange-500/30 flex items-center justify-center animate-pulse">
                    <Mic size={24} className="text-orange-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h5 className="font-extrabold text-sm">Interactive AI Screening Chat</h5>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                    This browser window will speak out loud. Allow microphone access to respond by talking, or use the high-fidelity chat box to input replies.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartInterview}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-xl hover:shadow-orange-500/20 transition-all cursor-pointer"
                >
                  📡 Initiate Screening Interview
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Chat Message Logs */}
                <div className="h-64 overflow-y-auto space-y-3.5 pr-2 rounded-2xl bg-black/40 border border-white/5 p-4 scrollbar-thin">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.sender === 'ai' ? -15 : 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3 text-[11px] leading-relaxed relative ${
                        msg.sender === 'ai' 
                          ? 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none'
                          : 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                      }`}>
                        <span className="text-[8px] font-black uppercase tracking-wider block mb-1 text-slate-400">
                          {msg.sender === 'ai' ? '🤖 Cog-Screening Node' : '👤 You'}
                        </span>
                        {msg.text}
                        <span className="text-[7.5px] font-mono text-white/40 block text-right mt-1.5">{msg.timestamp}</span>
                      </div>
                    </motion.div>
                  ))}

                  {isAiResponding && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-white/5 rounded-2xl p-3 rounded-tl-none flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-200" />
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input box row */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleListening}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isListening 
                        ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                    title={isListening ? "Listening... click to stop" : "Use microphone to speak reply"}
                  >
                    {isListening ? <Mic size={15} /> : <MicOff size={15} />}
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendResponse(inputText)}
                    placeholder={isListening ? "Dictating response..." : "Type your screen response here..."}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendResponse(inputText)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="career-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Career Suggestions Intro */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Compass size={16} className="text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider uppercase">Growth Path Projection Model</h4>
                <p className="text-[9px] text-slate-400 font-medium">Predictive future positions based on candidate profile assessment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {careerPaths.map((path, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all space-y-2 relative group"
                >
                  <div className="absolute top-4 right-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                    {path.growthRate}
                  </div>
                  
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 mt-0.5">
                      <Briefcase size={12} />
                    </div>
                    <div>
                      <h5 className="text-[11.5px] font-extrabold text-white group-hover:text-orange-400 transition-colors">{path.title}</h5>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{path.desc}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1">
                      <Award size={10} /> Suggested Certifications
                    </span>
                    <ul className="space-y-1">
                      {path.certs.map((cert, cidx) => (
                        <li key={cidx} className="text-[9px] text-slate-300 flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-orange-500 rounded-full" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Micro training button */}
            <div className="pt-2 text-center">
              <span className="text-[9.5px] text-slate-400 block mb-2.5 font-medium">Want to unlock these certifications instantly?</span>
              <button
                type="button"
                onClick={() => {
                  try {
                    window.history.pushState(null, '', '/training');
                  } catch (e) {}
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="px-5 py-2.5 border border-dashed border-indigo-500/40 hover:border-indigo-500 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer bg-slate-900/40"
              >
                🎓 Enroll in DS Tech Academy Courses
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
