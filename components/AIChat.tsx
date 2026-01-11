import React, { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { User, AlignLeft, Send, X, MessageCircle, Loader2 } from 'lucide-react';

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const initChat = async () => {
    if (!chatSessionRef.current) {
      try {
        chatSessionRef.current = await createChatSession();
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
        initChat();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessageStream({ message: userMsg });
      
      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of response) {
         const c = chunk as GenerateContentResponse;
         if (c.text) {
             fullText += c.text;
             setMessages(prev => {
                 const newHistory = [...prev];
                 newHistory[newHistory.length - 1].text = fullText;
                 return newHistory;
             });
         }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl w-80 sm:w-96 mb-4 overflow-hidden flex flex-col h-[500px] transition-all duration-200">
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <h3 className="font-semibold">InkFlow AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
             {messages.length === 0 && (
                 <div className="text-center text-gray-400 text-sm mt-10">
                     <p>Hello! Ask me anything about novels or writing.</p>
                 </div>
             )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex justify-start w-full">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask something..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 disabled:opacity-50 transition"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-indigo-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};