import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  FileText, 
  MapPin, 
  MessageSquare, 
  ArrowRight,
  Activity,
  ExternalLink
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CityHeatmap } from '../components/map/CityHeatmap';
import { useComplaints } from '../context/ComplaintsContext';
import * as api from '../lib/api';



interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, addComplaint } = useComplaints();
  
  // Voice AI Assistant States
  const [language, setLanguage] = useState<'en' | 'hi' | 'rajasthani'>('en');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! I am the CityPulse AI voice assistant. Speak to me in English, Hindi, or Rajasthani to log a complaint or check ticket status.",
      timestamp: new Date()
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  // Local storage for citizen's reported ticket IDs to show "My Reported Issues"
  const [myTicketIds, setMyTicketIds] = useState<string[]>([]);
  
  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync my ticket IDs from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem('my_reported_tickets');
    if (saved) {
      try {
        setMyTicketIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Trigger speech synthesis voices loading for Chrome/Edge asynchronous behavior
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);


  // Save ticket helper
  const trackNewTicket = (id: string) => {
    const updated = [id, ...myTicketIds];
    setMyTicketIds(updated);
    localStorage.setItem('my_reported_tickets', JSON.stringify(updated));
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiTyping]);

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          handleUserMessage(transcript);
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, [language]);

  // Handle Speech Recognition toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Configure language code
      if (language === 'hi' || language === 'rajasthani') {
        recognitionRef.current.lang = 'hi-IN';
      } else {
        recognitionRef.current.lang = 'en-IN';
      }
      recognitionRef.current.start();
    }
  };

  // Browser TTS voice speaker helper
  const speakText = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = (language === 'hi' || language === 'rajasthani') ? 'hi-IN' : 'en-IN';
    utterance.lang = targetLang;
    
    // Find matching browser voice
    const voices = window.speechSynthesis.getVoices();
    let matchingVoice = voices.find(v => v.lang === targetLang);
    if (!matchingVoice) {
      // Fallback loose match (e.g. 'hi')
      matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang.split('-')[0].toLowerCase()));
    }
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };


  // Process User text input/voice transcript
  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      // Hit assistant backend
      const res = await api.chatWithAssistant(text, language);
      
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: res.reply,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, aiMsg]);
      setIsAiTyping(false);
      speakText(res.reply);

      // Perform actions if returned by AI
      if (res.action === 'create_complaint' && res.action_data) {
        // AI generated a complaint, let's submit it automatically!
        const data = res.action_data;
        
        // Mock a classification structure matching requirements
        const mockClassification = {
          category: data.category || 'Other',
          priority_score: 5,
          reasoning: "AI Voice Assistant logged complaint.",
          department: data.category === 'Water' ? 'Jal Board' : 
                      data.category === 'Electricity' ? 'DISCOM' :
                      data.category === 'Sanitation' ? 'Municipal Sanitation' : 
                      data.category === 'Road' ? 'Public Works Department' : 'General',
          resolution_days: data.category === 'Electricity' ? 2 : 5
        };

        const resultComplaint = await addComplaint(
          data.text || text,
          mockClassification as any,
          data.ward || 'Chetak Circle'
        );
        
        // Notify user about creation success
        const successSpeech = language === 'hi' ? 
          `आपकी शिकायत दर्ज कर ली गई है। टिकट नंबर है UDAI-${resultComplaint.id.toUpperCase()}` :
          language === 'rajasthani' ?
          `थारी शिकायत लिख लीदी है सा। टिकट नंबर है UDAI-${resultComplaint.id.toUpperCase()}` :
          `Your complaint has been successfully registered. Ticket number is UDAI-${resultComplaint.id.toUpperCase()}`;
        
        // Track ID in local storage
        trackNewTicket(resultComplaint.id);

        setTimeout(() => {
          setChatHistory(prev => [...prev, {
            sender: 'ai',
            text: successSpeech,
            timestamp: new Date()
          }]);
          speakText(successSpeech);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setIsAiTyping(false);
      const errorMsg = "Sorry, my systems are experiencing high traffic. Please try again.";
      setChatHistory(prev => [...prev, {
        sender: 'ai',
        text: errorMsg,
        timestamp: new Date()
      }]);
      speakText(errorMsg);
    }
  };

  // Filter complaints list to only show citizen's reported complaints
  const myComplaints = complaints.filter(c => myTicketIds.includes(c.id));

  // Category classes helper
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Road': return 'bg-blue-500/10 text-blue-600 border border-blue-200';
      case 'Water': return 'bg-cyan-500/10 text-cyan-600 border border-cyan-200';
      case 'Electricity': return 'bg-amber-500/10 text-amber-600 border border-amber-200';
      case 'Sanitation': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-200';
      default: return 'bg-slate-500/10 text-slate-600 border border-slate-200';
    }
  };

  // Status badge style helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-slate-100 text-slate-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      case 'SLA Breached': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow flex flex-col gap-6">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cp-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-cp-teal/10 text-cp-teal font-display font-bold text-label px-2.5 py-1 rounded-badge">
                  CITIZEN SERVICE PORTAL
                </span>
                <span className="flex items-center gap-1 text-[11px] text-cp-text-secondary bg-cp-surface-2 px-2 py-1 rounded">
                  <Activity size={10} className="text-cp-teal animate-pulse" />
                  Udaipur Smart City
                </span>
              </div>
              <h1 className="font-display text-display-md text-cp-text-primary tracking-tight font-extrabold mt-2">
                AI-Powered Citizen Services
              </h1>
              <p className="text-body-sm text-cp-text-secondary mt-1">
                Report local issues, track redressal progress, and engage with automated governance instantly.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary"
                onClick={() => navigate('/govt')}
                icon={<ExternalLink size={16} />}
              >
                Govt Control Room
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow items-start">
            
            {/* LEFT COLUMN: MULTILINGUAL VOICE AI (Col span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <Card className="border border-cp-border shadow-card flex flex-col h-[520px] bg-white relative overflow-hidden">
                {/* Header widget */}
                <div className="flex items-center justify-between pb-4 border-b border-cp-border mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-cp-teal-glow flex items-center justify-center text-cp-teal">
                      <Sparkles size={18} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-body-md text-cp-text-primary">
                        Voice AI Assistant
                      </h3>
                      <p className="text-[10px] text-cp-text-secondary">Free Natural-Speech Interaction</p>
                    </div>
                  </div>
                  
                  {/* TTS & Sound Toggles */}
                  <div className="flex items-center gap-1 bg-cp-surface-2 p-1 rounded-badge">
                    <button
                      onClick={() => setTtsEnabled(!ttsEnabled)}
                      className={`p-1.5 rounded-badge transition-colors ${ttsEnabled ? 'text-cp-teal bg-white shadow-sm' : 'text-cp-text-muted hover:text-cp-text-secondary'}`}
                      title={ttsEnabled ? "Mute Readback" : "Enable Readback"}
                    >
                      {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>
                  </div>
                </div>

                {/* Language Selectors */}
                <div className="grid grid-cols-3 gap-1 mb-4 bg-cp-surface-2 p-1 rounded-badge text-[11px] font-semibold text-center">
                  {[
                    { code: 'en', label: 'English (India)' },
                    { code: 'hi', label: 'Hindi (हिन्दी)' },
                    { code: 'rajasthani', label: 'Rajasthani (मारवाड़ी)' }
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code as any)}
                      className={`py-1.5 rounded transition-all duration-150 ${language === l.code ? 'bg-cp-teal text-white shadow-sm font-bold' : 'text-cp-text-secondary hover:text-cp-text-primary'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* Chat History Panel */}
                <div className="flex-grow overflow-y-auto px-1 space-y-3.5 pr-2 scrollbar-thin select-none">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div
                        className={`px-3.5 py-2.5 rounded-[14px] text-body-sm shadow-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-cp-teal text-white rounded-br-none'
                            : 'bg-cp-surface-2 text-cp-text-primary rounded-bl-none border border-cp-border/50'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-cp-text-muted mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  
                  {isAiTyping && (
                    <div className="flex items-center gap-1.5 text-cp-text-muted text-body-sm bg-cp-surface-2 border border-cp-border/50 px-3 py-2 rounded-[14px] rounded-bl-none w-max">
                      <span className="w-1.5 h-1.5 bg-cp-teal rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-cp-teal rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-cp-teal rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Animated Waveform Visualizer (renders while listening) */}
                <div className="h-10 border-t border-cp-border/40 flex items-center justify-center bg-cp-base/30 relative">
                  <AnimatePresence>
                    {isListening ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1 h-5"
                      >
                        {[...Array(9)].map((_, idx) => (
                          <motion.span
                            key={idx}
                            className="w-1 bg-cp-teal rounded-full"
                            animate={{
                              height: [8, 20, 8],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: idx * 0.08,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                        <span className="text-[10px] text-cp-teal font-semibold tracking-wider font-display ml-2.5 animate-pulse uppercase">Listening...</span>
                      </motion.div>
                    ) : (
                      <span className="text-[10px] text-cp-text-muted font-medium">Click mic to record or type request below</span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Chat Inputs */}
                <div className="pt-3 border-t border-cp-border flex gap-2 items-center">
                  {/* Glowing Recording Button */}
                  <div className="relative">
                    <button
                      onClick={toggleListening}
                      className={`w-11 h-11 rounded-full flex items-center justify-center shadow transition-all duration-200 relative z-10 focus:outline-none ${
                        isListening 
                          ? 'bg-cp-coral text-white ring-4 ring-cp-coral/25 shadow-glow-coral' 
                          : 'bg-cp-teal text-white hover:bg-cp-teal-dim shadow-glow-teal ring-4 ring-cp-teal-glow'
                      }`}
                      aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    {isListening && (
                      <div className="absolute inset-0 rounded-full bg-cp-coral animate-ping opacity-45 -z-0"></div>
                    )}
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUserMessage(chatInput);
                    }}
                    className="flex-grow flex items-center bg-cp-surface-2 rounded-btn border border-cp-border focus-within:border-cp-teal focus-within:ring-2 focus-within:ring-cp-teal-glow transition-all px-2.5 h-11"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={language === 'hi' ? 'अपनी शिकायत यहाँ लिखें...' : language === 'rajasthani' ? 'म्हारी शिकायत अठे लिखो...' : 'Type complaint or query...'}
                      className="bg-transparent border-none outline-none flex-grow text-body-sm text-cp-text-primary placeholder:text-cp-text-muted focus:ring-0 focus:outline-none focus:border-none"
                    />
                    <button 
                      type="submit" 
                      className="text-cp-teal hover:text-cp-teal-dim p-1 transition-colors"
                      disabled={!chatInput.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>

              </Card>

            </div>

            {/* RIGHT COLUMN: ACTION & LISTS (Col span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* SECTION: WARD MAP (NATURAL COLORS) */}
              <Card className="border border-cp-border p-3 bg-white">
                <div className="flex justify-between items-center mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-cp-teal" />
                    <h3 className="font-display font-bold text-body-sm text-cp-text-primary">
                      Local Grievance Map
                    </h3>
                  </div>
                  <span className="text-[10px] text-cp-text-secondary bg-cp-surface-2 px-2 py-0.5 rounded font-medium">Udaipur Wards</span>
                </div>
                <div className="h-[210px] rounded-card overflow-hidden">
                  <CityHeatmap complaints={complaints} />
                </div>
              </Card>

              {/* SECTION: MY REPORTED ISSUES */}
              <Card className="border border-cp-border bg-white flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between border-b border-cp-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-cp-teal" />
                    <h3 className="font-display font-bold text-body-md text-cp-text-primary">
                      My Reported Grievances
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold text-cp-teal bg-cp-teal-glow rounded-badge font-display">
                    {myComplaints.length} Tickets
                  </span>
                </div>


                <div className="flex-grow overflow-x-auto select-none">
                  {myComplaints.length === 0 ? (
                    <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center gap-2 p-6 bg-cp-base/20 rounded-card border border-dashed border-cp-border">
                      <MessageSquare className="text-cp-text-muted" size={32} />
                      <p className="text-body-sm text-cp-text-secondary font-medium">No grievances registered in this session.</p>
                      <p className="text-[11px] text-cp-text-muted max-w-[280px]">Speak to our Voice AI assistant above or say "Pothole in Hiran Magri" to submit your first ticket.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-cp-border text-label text-cp-text-secondary">
                          <th className="py-2.5 font-semibold">TICKET ID</th>
                          <th className="py-2.5 font-semibold">WARD</th>
                          <th className="py-2.5 font-semibold">ISSUE DETAIL</th>
                          <th className="py-2.5 font-semibold">CATEGORY</th>
                          <th className="py-2.5 font-semibold">STATUS</th>
                          <th className="py-2.5 font-semibold text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cp-border/50 text-body-sm text-cp-text-primary">
                        {myComplaints.map((c) => (
                          <tr key={c.id} className="hover:bg-cp-base/30 transition-colors">
                            <td className="py-3 font-mono font-bold text-cp-teal text-[11px]">
                              UDAI-{c.id.toUpperCase()}
                            </td>
                            <td className="py-3 font-medium">{c.ward}</td>
                            <td className="py-3 max-w-[180px] truncate pr-4 text-cp-text-secondary">
                              {c.text}
                            </td>
                            <td className="py-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-pill font-bold tracking-wide uppercase ${getCategoryColor(c.category)}`}>
                                {c.category}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusBadgeClass(c.status)}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => navigate(`/timeline/${c.id}`)}
                                icon={<ArrowRight size={10} />}
                              >
                                Track
                              </Button>

                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>

            </div>

          </div>

        </div>
      </PageTransition>
    </AppLayout>
  );
};
export default CitizenDashboard;
