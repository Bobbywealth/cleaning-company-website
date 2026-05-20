import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  Send,
  Users,
  X,
  Phone,
  Mail,
  Clock,
  Circle,
  Search,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';

const ChatManager = ({ theme = 'dark' }) => {
  const { user } = useApp();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const adminChatIdRef = useRef(null);

  useEffect(() => {
    adminChatIdRef.current = `admin_${Date.now()}`;

    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.hostname}:3001`;

      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('Admin chat connected');
          setConnected(true);
          wsRef.current.send(JSON.stringify({
            type: 'admin_register',
            adminId: adminChatIdRef.current
          }));
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'visitor_joined') {
              const newSession = {
                id: data.chatId,
                visitorName: data.visitorName || `Visitor ${data.chatId.slice(-4)}`,
                visitorId: data.chatId,
                lastMessage: 'Visitor joined the chat',
                lastMessageTime: new Date().toISOString(),
                unread: true,
                status: 'active'
              };
              setSessions(prev => {
                const exists = prev.find(s => s.id === data.chatId);
                if (!exists) {
                  return [newSession, ...prev];
                }
                return prev;
              });
            }

            if (data.type === 'chat_message' && data.chatId !== adminChatIdRef.current) {
              setSessions(prev => prev.map(s =>
                s.id === data.chatId
                  ? { ...s, lastMessage: data.text, lastMessageTime: new Date().toISOString(), unread: !activeSession || activeSession.id !== data.chatId ? true : s.unread }
                  : s
              ));

              if (activeSession && activeSession.id === data.chatId) {
                setMessages(prev => [...prev, {
                  id: Date.now(),
                  text: data.text,
                  isAdmin: false,
                  time: new Date()
                }]);
              }
            }

            if (data.type === 'visitor_left') {
              setSessions(prev => prev.map(s =>
                s.id === data.chatId
                  ? { ...s, lastMessage: 'Visitor left the chat', status: 'ended' }
                  : s
              ));
            }
          } catch (e) {}
        };

        wsRef.current.onclose = () => {
          setConnected(false);
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
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectSession = (session) => {
    setActiveSession(session);
    setMessages([]);
    setSessions(prev => prev.map(s =>
      s.id === session.id ? { ...s, unread: false } : s
    ));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join_session',
        chatId: session.id,
        adminId: adminChatIdRef.current
      }));
    }

    setTimeout(() => {
      setMessages([
        { id: 1, text: `Starting conversation with ${session.visitorName}`, isAdmin: true, time: new Date() }
      ]);
    }, 100);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;

    const newMessage = {
      id: Date.now(),
      text: input,
      isAdmin: true,
      time: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'admin_message',
        chatId: activeSession.id,
        text: input,
        adminId: adminChatIdRef.current
      }));
    }

    setInput('');

    setSessions(prev => prev.map(s =>
      s.id === activeSession.id
        ? { ...s, lastMessage: input, lastMessageTime: new Date().toISOString() }
        : s
    ));
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return formatTime(dateStr);
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredSessions = sessions.filter(s =>
    s.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = sessions.filter(s => s.unread).length;

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4">
      <Card className={`w-80 flex flex-col ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Live Chats
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h3>
            <div className={`flex items-center gap-1 text-xs ${connected ? 'text-green-400' : 'text-red-400'}`}>
              <Circle className={`w-2 h-2 ${connected ? 'fill-green-400' : 'fill-red-400'}`} />
              {connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm ${theme === 'dark' ? 'bg-white/10 border-white/10 text-white placeholder-slate-400' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-500'} border outline-none focus:ring-2 focus:ring-cyan-400/50`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className={`p-4 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active chats</p>
              <p className="text-xs mt-1">Waiting for visitors...</p>
            </div>
          ) : (
            filteredSessions.map(session => (
              <button
                key={session.id}
                onClick={() => selectSession(session)}
                className={`w-full p-4 text-left border-b ${theme === 'dark' ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} transition ${activeSession?.id === session.id ? (theme === 'dark' ? 'bg-cyan-400/10' : 'bg-cyan-50') : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`font-semibold text-sm truncate ${session.unread ? 'text-cyan-400' : ''}`}>
                    {session.visitorName}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatDate(session.lastMessageTime)}
                  </span>
                </div>
                <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {session.lastMessage}
                </p>
                {session.unread && (
                  <span className="inline-block mt-1 w-2 h-2 bg-cyan-400 rounded-full" />
                )}
              </button>
            ))
          )}
        </div>
      </Card>

      {activeSession ? (
        <Card className={`flex-1 flex flex-col ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveSession(null)}
                  className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold">{activeSession.visitorName}</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activeSession.status === 'active' ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <Circle className="w-2 h-2 fill-green-400" /> Active now
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Circle className="w-2 h-2 fill-slate-400" /> Chat ended
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                  title="Call visitor"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                  title="Send email"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.isAdmin
                      ? 'bg-cyan-500 text-white rounded-tr-none'
                      : theme === 'dark'
                        ? 'bg-slate-700 text-white rounded-tl-none'
                        : 'bg-white border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.isAdmin ? 'text-cyan-100' : theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
                    {formatTime(msg.time)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className={`p-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={activeSession.status !== 'active'}
                className={`flex-1 rounded-xl px-4 py-3 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white placeholder-slate-400' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-500'} border outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50`}
              />
              <Button
                type="submit"
                disabled={!input.trim() || activeSession.status !== 'active'}
                className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {activeSession.status !== 'active' && (
              <p className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <AlertCircle className="w-3 h-3 inline mr-1" />
                This chat has ended. The visitor has left.
              </p>
            )}
          </form>
        </Card>
      ) : (
        <Card className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="text-center">
            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />
            <h3 className="text-lg font-bold mb-2">Select a conversation</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Choose a chat from the list to start responding
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatManager;