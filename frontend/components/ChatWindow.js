import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const ChatWindow = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');

  // Load previous messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Loading messages for user:', user._id);
        
        const response = await fetch(`http://localhost:5000/api/chat/messages/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to load messages');
        }

        const data = await response.json();
        console.log('Loaded messages:', data.length);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error(error.message || 'Failed to load messages');
      }
    };

    if (user?._id) {
      loadMessages();
    }
  }, [user?._id]);

  // Socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5000', {
      auth: { token },
      query: { userId: currentUserId }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
      // Show notification if message is from the other user
      if (message.from === user._id) {
        const notification = new Notification(`New message from ${user.name}`, {
          body: message.content,
          icon: '/favicon.ico'
        });
        
        notification.onclick = () => {
          window.focus();
        };
      }
    });

    newSocket.on('error', (error) => {
      toast.error(error.message);
    });

    setSocket(newSocket);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [currentUserId, user._id, user.name]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format date for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const messageData = {
        to: user._id,
        content: newMessage.trim()
      };

      const response = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      const savedMessage = await response.json();
      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      socket?.emit('message', savedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-4 w-96 bg-navy-800/90 shadow-xl rounded-t-xl border border-navy-600/50 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-navy-700/80 to-navy-800/80 rounded-t-xl flex justify-between items-center border-b border-navy-600/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-navy-600/50 text-xl shadow-md">
            {user.currentBadge?.image || '🎯'}
          </div>
          <div>
            <h3 className="font-medium text-white">{user.name}</h3>
            <div className="flex items-center text-xs">
              <span className="inline-flex items-center bg-navy-700/60 text-navy-200 px-2 py-0.5 rounded-md">
                Level {user.level || 1}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-navy-200 hover:text-white transition-colors p-1.5 bg-navy-700/40 rounded-lg hover:bg-navy-700/60"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 bg-navy-800/50 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-navy-700/40 p-3 rounded-full mb-3">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-navy-300" />
            </div>
            <p className="text-navy-300 mb-1">No messages yet</p>
            <p className="text-navy-400 text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-navy-700/40 text-navy-300 text-xs px-3 py-1 rounded-full">
                  {formatDate(group.date)}
                </div>
              </div>
              
              {group.messages.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex ${
                    message.from === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="max-w-[75%]">
                    <div
                      className={`p-3 rounded-lg shadow-sm ${
                        message.from === currentUserId
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
                          : 'bg-navy-700/80 text-navy-100 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className={`text-xs text-navy-400 mt-1 ${
                      message.from === currentUserId ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-navy-600/50 bg-navy-700/30">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-navy-700/60 border border-navy-600/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`px-3 py-2.5 bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors ${
              !newMessage.trim() || sending
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 