import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

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
    <div className="fixed bottom-0 right-4 w-96 bg-navy-800 shadow-xl rounded-t-lg border border-navy-600/50">
      {/* Chat Header */}
      <div className="p-4 bg-navy-700/50 rounded-t-lg flex justify-between items-center border-b border-navy-600/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-600 text-xl">
            {user.currentBadge?.image || '🎯'}
          </div>
          <div>
            <h3 className="font-medium text-white">{user.name}</h3>
            <div className="text-xs text-navy-200">Level {user.level || 1}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-navy-200 hover:text-white transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 bg-navy-800/50 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`flex ${
              message.from === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className="max-w-[75%]">
              <div
                className={`p-3 rounded-lg ${
                  message.from === currentUserId
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-navy-700 text-navy-100 rounded-bl-none'
                }`}
              >
                {message.content}
              </div>
              <div className={`text-xs text-navy-300 mt-1 ${
                message.from === currentUserId ? 'text-right' : 'text-left'
              }`}>
                {new Date(message.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-navy-600/50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 transition-colors ${
              !newMessage.trim() || sending
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sending</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 