import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { CalculationContext, ChatMessage } from '../types';

interface AiTutorProps {
  context: CalculationContext;
}

const AiTutor: React.FC<AiTutorProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hi! I'm watching your subnet calculations for **${context.ip}**. Ask me anything about your current setup!` }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await sendMessageToGemini(userText, context);
      if (response) {
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      }
    } catch (error) {
        let msg = "Sorry, I couldn't reach the server.";
        if (error instanceof Error) msg = error.message;
        setMessages(prev => [...prev, { role: 'model', text: msg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window - Uses CSS opacity/transform to preserve state when closed */}
      <div 
        className={`
            bg-slate-900 w-[90vw] sm:w-[400px] h-[500px] sm:h-[600px] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 origin-bottom-right ease-out
            ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-slate-100 text-sm">AI Network Tutor</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-[10px] text-slate-400 font-medium">Online</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50" ref={scrollRef}>
            {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : msg.isError 
                        ? 'bg-red-900/50 text-red-200 border border-red-800 rounded-bl-none'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-bl-none'
                }`}
                >
                {msg.text.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-white font-bold bg-white/10 px-1 rounded">{part}</strong> : part
                )}
                </div>
            </div>
            ))}
            {loading && (
            <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-700 flex gap-1.5 items-center h-10 shadow-sm">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
            </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-slate-700 bg-slate-800 shrink-0">
            <div className="flex gap-2 relative">
            <input
                type="text"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder="Ask about this subnet..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
            />
            <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 flex items-center justify-center transition-all disabled:opacity-0 disabled:scale-90"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
            </button>
            </div>
            <div className="text-[10px] text-center text-slate-500 mt-2">
                Powered by Gemini. AI can make mistakes.
            </div>
        </div>
      </div>

      {/* FAB Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
            pointer-events-auto w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/30
            ${isOpen ? 'bg-slate-700 rotate-90' : 'bg-blue-600 hover:bg-blue-500 rotate-0'}
        `}
      >
        {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
        ) : (
            <div className="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                 </svg>
                 {/* Notification Dot */}
                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-blue-600"></span>
                 </span>
            </div>
        )}
      </button>

    </div>
  );
};

export default AiTutor;