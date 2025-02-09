// frontend/pages/login.js
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data); // Debug log

      if (response.ok && data.userId) {
        // Store both token and userId
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        console.log('Stored userId:', data.userId); // Debug log
        
        // Verify storage
        const storedId = localStorage.getItem('userId');
        console.log('Verified stored userId:', storedId); // Debug log
        
        window.location.href = '/directmessages';
      } else {
        console.error('Login failed:', data.message);
        // Show error to user
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col w-80">
        <input
          type="email"
          placeholder="Email"
          className="mb-2 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-2 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded">
          Login
        </button>
      </form>
      <div className="mt-4">
        {/* External links => use <a> */}
        <a href="http://localhost:5000/api/auth/google" className="mr-2 text-blue-500">
          Login with Google
        </a>
        <a href="http://localhost:5000/api/auth/github" className="text-gray-700">
          Login with GitHub
        </a>
      </div>
    </div>
  );
}
