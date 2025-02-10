import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

const ChatWindow = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
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
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const messageData = {
        to: user._id,
        content: newMessage.trim()
      };

      console.log('Sending message:', messageData);

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
      console.log('Message sent successfully:', savedMessage);

      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      
      // Emit through socket for real-time updates
      socket?.emit('message', savedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    }
  };

  return (
    <div className="fixed bottom-0 right-4 w-96 bg-white shadow-lg rounded-t-lg">
      <div className="p-4 bg-indigo-600 text-white rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{user.currentBadge?.image || '🔰'}</span>
          <span className="font-semibold">{user.name}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`mb-2 ${
              message.from === currentUserId
                ? 'text-right'
                : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.from === currentUserId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors ${
              !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 