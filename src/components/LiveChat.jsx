import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! 👋 Welcome to 360 Cleaning Co. How can we help you today?", isBot: true, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const chatIdRef = useRef(null);

  useEffect(() => {
    chatIdRef.current = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.hostname}:3001`;

      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('Chat connected');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'chat_message' && data.chatId !== chatIdRef.current) {
              addBotMessage(data.text);
            }
          } catch (e) {}
        };

        wsRef.current.onclose = () => {
          setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = () => {
          wsRef.current.close();
        };
      } catch (e) {
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      isBot: true,
      time: new Date()
    }]);
    setIsTyping(false);
    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      isBot: false,
      time: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        chatId: chatIdRef.current,
        text: input
      }));
    }

    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        "Thanks for your message! A member of our NJ team will get back to you shortly. 📞",
        "Great question! For immediate assistance, call us at (862) 285-4949. We're here 7AM-8PM daily!",
        "We'd love to help! Would you like to schedule a cleaning or get a free quote?",
        "Our team is standing by! For the fastest response, give us a call at (862) 285-4949. ⭐"
      ];
      addBotMessage(responses[Math.floor(Math.random() * responses.length)]);
    }, 1500);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 z-50 w-80 md:w-96"
          >
            <Card className="bg-slate-900 border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">💬</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-cyan-500"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Live Chat</h3>
                    <p className="text-xs text-cyan-100">We typically reply in minutes</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white text-2xl leading-none transition"
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>

              <CardContent className="p-0">
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.isBot
                            ? 'bg-slate-700 text-slate-100 rounded-tl-none'
                            : 'bg-cyan-500 text-white rounded-tr-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.isBot ? 'text-slate-400' : 'text-cyan-100'}`}>
                          {formatTime(msg.time)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 text-slate-100 rounded-2xl rounded-tl-none px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-3 border-t border-slate-700 bg-slate-900">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 text-sm outline-none focus:border-cyan-500 transition"
                    />
                    <Button
                      type="submit"
                      disabled={!input.trim()}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl px-4"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>360 Cleaning Co. NJ</span>
                    <span>Mon-Sun: 7AM-8PM</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-50 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-2xl shadow-cyan-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform md:bottom-6 md:right-6"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open live chat'}
      >
        {isOpen ? (
          <span className="text-2xl">×</span>
        ) : (
          <>
            <span className="text-2xl">💬</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </motion.button>
    </>
  );
};

export default LiveChat;