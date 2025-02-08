// frontend/components/Chat.js
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null); // use ref to store the socket instance

  useEffect(() => {
    // Initialize socket connection and store in ref
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    socketRef.current = io(backendUrl);
    console.log('Socket connected to:', backendUrl);

    // Register the current user
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId) {
      socketRef.current.emit('register', currentUserId);
      console.log('Registered current user:', currentUserId);
    } else {
      console.warn('No userId found in localStorage');
    }

    // Listen for incoming direct messages
    socketRef.current.on('direct message', (data) => {
      console.log("New direct message received:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Optionally, listen for broadcast messages
    socketRef.current.on('chat message', (msg) => {
      console.log("New broadcast message received:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, []);

  // Auto-scroll for new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() !== '') {
      const currentUserId = localStorage.getItem('userId');
      // For direct messaging, you'll need to include the recipient's id.
      // Replace "TARGET_USER_ID" with the actual recipient's id.
      const messageData = { from: currentUserId, to: "TARGET_USER_ID", message: input };

      // Use the stored socket instance to emit the message.
      socketRef.current.emit('direct message', messageData);
      setMessages((prev) => [...prev, messageData]);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border p-4">
      <h2 className="text-xl font-bold mb-2">Chat</h2>
      <div className="h-40 overflow-y-scroll border-b mb-2 p-2">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <p key={index} className="mb-1">{msg.message || msg}</p>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="p-2 border w-full"
        placeholder="Type a message"
      />
      <button onClick={sendMessage} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        Send
      </button>
    </div>
  );
}
