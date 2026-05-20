import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';

export default function ChatbotWidget({ isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        from: 'bot',
        text: 'Hello! I am the 360 Cleaning Co. assistant. How can I help you today? You can ask me about our services, pricing, or how to schedule a cleaning.',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chatbot/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { from: 'customer', text: inputValue, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: currentInput
        })
      });
      const data = await res.json();
      if (data.responses && data.responses.length > 0) {
        const botMessages = data.responses.map(text => ({
          from: 'bot',
          text,
          timestamp: new Date().toISOString()
        }));
        setMessages(prev => [...prev, ...botMessages]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => [...prev, {
        from: 'bot',
        text: 'Sorry, I encountered an error. Please try again or call us at (862) 285-4949.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-500 rounded-full shadow-lg flex items-center justify-center hover:bg-cyan-600 transition-colors z-50"
      >
        <MessageCircle size={24} className="text-white" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-80 md:w-96 ${isMinimized ? 'h-14' : 'h-[28rem]'} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-height duration-300`}>
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-500 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-semibold">360 Cleaning Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-cyan-600 rounded">
            <Minimize2 size={16} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-cyan-600 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.from === 'customer'
                    ? 'bg-cyan-500 text-white rounded-br-md'
                    : isDarkMode ? 'bg-slate-700 text-white rounded-bl-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  <div className="flex items-start gap-2">
                    {msg.from === 'bot' && <Bot size={14} className="mt-1 flex-shrink-0 opacity-70" />}
                    {msg.from === 'customer' && <User size={14} className="mt-1 flex-shrink-0 opacity-70" />}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} flex-shrink-0`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className={`flex-1 px-4 py-2 rounded-full text-sm ${
                  isDarkMode ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}