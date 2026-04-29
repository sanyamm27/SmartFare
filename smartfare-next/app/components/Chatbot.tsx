"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', sender: 'bot', text: "Hi! I'm the SmartFare Assistant. How can I help you with your booking today?" }
  ]);

  // Contextual Nudge & Tip logic
  useEffect(() => {
    let nudgeTimer: NodeJS.Timeout;
    
    // Seat Selection context tip
    if (pathname?.includes('/services')) {
      const hasTip = messages.some(m => m.text.includes("extra legroom"));
      if (!hasTip) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            sender: 'bot', 
            text: "Need extra legroom? Rows 1-5 are our Premium seats!" 
          }]);
        }, 1500);
      }
    }

    // Auto-Open 'nudge' for payment or seat selection after 30 seconds
    if (pathname?.includes('/services') || pathname?.includes('/booking') || pathname?.includes('/checkout')) {
      nudgeTimer = setTimeout(() => {
        if (!isOpen) {
          setShowNudge(true);
        }
      }, 30000);
    }

    return () => clearTimeout(nudgeTimer);
  }, [pathname, isOpen, messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");

    // Create an empty bot message placeholder for streaming
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, sender: 'bot', text: "" }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          contextPath: pathname
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Connection Failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let chunkText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunkText += decoder.decode(value, { stream: true });
          
          // Update the UI dynamically with accumulated chunks
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: chunkText } : m));
        }
      }
    } catch (e: any) {
      setMessages(prev => prev.map(m => 
        m.id === botMsgId 
          ? { ...m, text: `**System Alert**: ${e.message}. Please verify your API Key constraints or call our 24/7 support at **1800-SMART-FLY**.` } 
          : m
      ));
    }
  };

  const handleActionClick = (action: string) => {
    handleSend(action);
  };

  return (
    <>
      <AnimatePresence>
        {/* The Chat Window */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-24 right-4 md:right-8 w-[calc(100vw-32px)] md:w-[350px] h-[500px] max-h-[80vh] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl overflow-hidden flex flex-col z-50 text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">SmartFare AI</h3>
                  <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-indigo-200 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'}`}>
                    <ReactMarkdown
                      components={{
                        a: ({node, ...props}) => <a {...props} className="font-bold underline cursor-pointer hover:opacity-80" />,
                        p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0 leading-relaxed" />,
                        strong: ({node, ...props}) => <strong {...props} className={msg.sender === 'user' ? 'font-bold' : 'font-bold text-indigo-700 dark:text-indigo-400'} />,
                        ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 mb-2 space-y-1" />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (only show at bottom if latest is bot welcome or we want them persistent. Let's make them horizontal scrollable tokens) */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-slate-100 dark:border-slate-700/50">
               <button onClick={() => handleActionClick("Track my PNR")} className="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors border border-slate-200 dark:border-slate-700">Track my PNR</button>
               <button onClick={() => handleActionClick("Baggage Policy")} className="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors border border-slate-200 dark:border-slate-700">Baggage Policy</button>
               <button onClick={() => handleActionClick("Refund Status")} className="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors border border-slate-200 dark:border-slate-700">Refund Status</button>
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 shrink-0">
               <form 
                 onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
                 className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full pr-2 pl-4 py-1.5 border border-slate-200 dark:border-slate-700"
               >
                 <input 
                   type="text" 
                   value={input}
                   onChange={e => setInput(e.target.value)}
                   placeholder="Type your message..." 
                   className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                 />
                 <button 
                   type="submit"
                   disabled={!input.trim()}
                   className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                 >
                   <span className="material-symbols-outlined text-sm">send</span>
                 </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button & Nudge */}
      <div className="fixed bottom-6 right-4 md:right-8 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Nudge Bubble */}
        <AnimatePresence>
          {showNudge && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-white text-slate-800 px-4 py-3 rounded-2xl rounded-br-sm shadow-xl border border-slate-100 text-sm font-medium w-48 pointer-events-auto cursor-pointer"
              onClick={() => {
                setIsOpen(true);
                setShowNudge(false);
              }}
            >
              Need help checking out? I'm right here! 👋
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <button 
          onClick={() => {
            setIsOpen(!isOpen);
            setShowNudge(false);
          }}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all pointer-events-auto"
        >
          <span className="material-symbols-outlined text-[28px]">{isOpen ? 'close' : 'chat'}</span>
        </button>
      </div>
    </>
  );
}
