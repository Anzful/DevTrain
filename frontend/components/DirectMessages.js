<<<<<<< HEAD
import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const DirectMessages = () => {
  const socketRef = useRef(null);
  const [messages, setMessages] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    socketRef.current = io(backendUrl);
    console.log('Socket connected to:', backendUrl);

    const currentUserId = localStorage.getItem('userId');
    if (currentUserId) {
      socketRef.current.emit('register', currentUserId);
=======
useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
    
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId) {
      socket.emit('register', currentUserId);
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec
      console.log('Registered user:', currentUserId);
    } else {
      console.warn('No userId found in localStorage');
    }
<<<<<<< HEAD

    socketRef.current.on('direct message', (data) => {
      console.log("New direct message received:", data);
      // Only add message if it's between the current user and selected user
      setMessages((prev) => {
        if (
          selectedUser && 
          ((data.from === currentUserId && data.to === selectedUser._id) ||
           (data.from === selectedUser._id && data.to === currentUserId))
        ) {
          return [...prev, data];
        }
        return prev;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, [selectedUser]); // Add selectedUser as dependency

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default DirectMessages;
=======
  
    socket.on('direct message', (data) => {
      console.log("New direct message received:", data);
      setMessages((prev) => [...prev, data]);
    });
    
    return () => socket.disconnect();
  }, []);
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec
  