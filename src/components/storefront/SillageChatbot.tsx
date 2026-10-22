import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Brain,
  ShieldAlert,
  Bot,
  User as UserIcon,
  Search,
} from 'lucide-react';

export const SillageChatbot: React.FC = () => {
  const { knowledgeDocs, products, orders } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; role: 'assistant' | 'user'; text: string; thoughtProcess?: string }[]
  >([
    {
      id: 'init-1',
      role: 'assistant',
      text: 'Greetings. I am Sillage, your master fragrance concierge for HIFFYY. May I assist you with fragrance notes, our royal 60-day maceration process, order tracking, or finding your signature Extrait de Parfum?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useHighThinking, setUseHighThinking] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-sillage-chat', handleOpenChat);
    return () => window.removeEventListener('open-sillage-chat', handleOpenChat);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMsgId = `msg-${Date.now()}`;
    setMessages((prev) => [...prev, { id: newMsgId, role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Prepare grounding docs
      const relevantDocs = knowledgeDocs.map((d) => ({
        title: d.title,
        category: d.category,
        content: d.content,
      }));

      // Add product summary context
      const productsContext = products.map((p) => ({
        title: p.title,
        category: 'product_catalog',
        content: `${p.title} (${p.fragranceFamily}, ${p.concentration}): Top notes [${p.notes.top.join(', ')}], Heart notes [${p.notes.heart.join(', ')}], Base notes [${p.notes.base.join(', ')}]. Longevity: ${p.longevity}. Sillage: ${p.sillage}. Price: ₹${p.sellingPrice}.`,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map((m) => ({ role: m.role, content: m.text })),
          knowledgeDocs: [...relevantDocs, ...productsContext],
          useHighThinking,
        }),
      });

      if (!res.ok) {
        throw new Error('Chat service error');
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: data.reply || 'I am delighted to assist you with HIFFYY perfumes.',
          thoughtProcess: data.thoughtProcess,
        },
      ]);
    } catch {
      // Fallback local smart response based on catalog & orders
      let fallbackText = '';
      const lower = userMessage.toLowerCase();
      if (lower.includes('track') || lower.includes('order')) {
        fallbackText =
          'To track your order, please provide your Order Identifier (e.g., HIF-IN-9821). Deliveries across metro cities arrive within 2-3 business days via Delhivery Express.';
      } else if (lower.includes('oud') || lower.includes('rajasthan')) {
        fallbackText =
          'Oud Royal Rajasthan is our imperial Extrait de Parfum (35% oil concentration) featuring wild Assam agarwood, rare Kashmiri saffron, and Kannauj damask rose with 14+ hours of longevity.';
      } else if (lower.includes('sample') || lower.includes('return')) {
        fallbackText =
          'Every HIFFYY order includes a complimentary 2ml sample vial so you can test the sillage on your skin before opening the main presentation box! Unopened boxes with seals intact have 7-day return eligibility.';
      } else {
        fallbackText =
          'HIFFYY fragrances are formulated specifically for projection in the Indian climate using artisanal botanical absolutes. Which fragrance family resonates with you: Oriental Woody, Fresh Vetiver, or Amber Saffron?';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: fallbackText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Modal (Compact) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[360px] sm:max-w-[380px] h-[450px] bg-[#FAF8F5] border border-[#E6DFD5] shadow-2xl rounded-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="p-3 bg-[#12231A] text-[#FAF8F5] border-b border-[#182F23] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#182F23] border border-[#96F816]/60 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#96F816]" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-white">AI Assistant</h4>
                <p className="text-[9px] text-[#96F816] uppercase tracking-wider font-semibold">
                  HIFFYY Olfactory Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* High Thinking Toggle */}
              <button
                type="button"
                onClick={() => setUseHighThinking(!useHighThinking)}
                className={`p-1 rounded text-[9px] flex items-center gap-1 transition-colors cursor-pointer ${
                  useHighThinking
                    ? 'bg-[#182F23] text-[#96F816] border border-[#96F816]/50'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Deep Thinking Mode"
              >
                <Brain className="w-3 h-3" />
                <span className="hidden sm:inline font-mono text-[9px]">
                  {useHighThinking ? 'Deep' : 'Fast'}
                </span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#FAF8F5]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#12231A] text-[#DFCAAB] flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-[#C5A880]" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 text-xs rounded-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#12231A] text-[#FAF8F5]'
                      : 'bg-white border border-[#E6DFD5] text-[#1B201E]'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#886938] p-2 bg-white/70 border border-[#E6DFD5] rounded-sm max-w-[80%]">
                <Brain className="w-4 h-4 animate-spin text-[#C5A880]" />
                <span className="text-[11px] font-mono">
                  {useHighThinking
                    ? 'Deeply analyzing olfactory notes & knowledge base...'
                    : 'Consulting HIFFYY archives...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-4 py-2 bg-white border-t border-[#F4EFE6] flex gap-2 overflow-x-auto text-[10px]">
            <button
              onClick={() => setInput('What is the difference between Extrait and EDP?')}
              className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E6DFD5] rounded-full hover:border-[#C5A880] text-[#12231A] whitespace-nowrap cursor-pointer"
            >
              Extrait vs EDP
            </button>
            <button
              onClick={() => setInput('Recommend a scent for Indian summer humidity')}
              className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E6DFD5] rounded-full hover:border-[#C5A880] text-[#12231A] whitespace-nowrap cursor-pointer"
            >
              Summer Scent
            </button>
            <button
              onClick={() => setInput('Track my order status HIF-IN-9821')}
              className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E6DFD5] rounded-full hover:border-[#C5A880] text-[#12231A] whitespace-nowrap cursor-pointer"
            >
              Track Order
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E6DFD5] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sillage about notes, orders or sizing..."
              className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none focus:border-[#C5A880]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-[#12231A] text-[#DFCAAB] hover:bg-[#182F23] disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
