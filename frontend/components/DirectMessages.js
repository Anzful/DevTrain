useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
    
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId) {
      socket.emit('register', currentUserId);
      console.log('Registered user:', currentUserId);
    } else {
      console.warn('No userId found in localStorage');
    }
  
    socket.on('direct message', (data) => {
      console.log("New direct message received:", data);
      setMessages((prev) => [...prev, data]);
    });
    
    return () => socket.disconnect();
  }, []);
  