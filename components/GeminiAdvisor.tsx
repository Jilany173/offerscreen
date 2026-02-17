
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiAdvisorResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const GeminiAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your Elite Academy Advisor. Curious about our 150-hour Jackpot offer?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Create a simplified history for context if needed, but the service handles system prompt
      const aiResponse = await getGeminiAdvisorResponse(userMsg, []);
      setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the network. Please check your connection!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[320px] md:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-fade-in">
          {/* Header */}
          <div className="bg-brand-blue p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center">
                <i className="fa-solid fa-robot text-sm"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Elite Advisor</h3>
                <span className="text-[10px] text-slate-400">Online | AI Powered</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-brand-red transition-colors">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-brand-red text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about courses..."
              className="flex-grow bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-red"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-brand-blue text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-brand-red transition-all disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 bg-brand-red rounded-full shadow-2xl flex items-center justify-center text-white text-2xl md:text-3xl hover:scale-110 active:scale-95 transition-all relative"
      >
        {isOpen ? (
          <i className="fa-solid fa-chevron-down"></i>
        ) : (
          <>
            <i className="fa-solid fa-message"></i>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-blue rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-white animate-bounce">
              1
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default GeminiAdvisor;
