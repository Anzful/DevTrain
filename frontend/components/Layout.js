// frontend/components/Layout.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/users/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex space-x-7">
              <Link href="/dashboard" className="flex items-center py-4 px-2">
                <span className="font-semibold text-gray-500 text-lg">DevTrain</span>
              </Link>
            </div>

            <div className="flex space-x-4">
              <Link href="/dashboard" className={`py-2 px-3 rounded ${
                router.pathname === '/dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-indigo-600'
              }`}>
                Dashboard
              </Link>
              <Link href="/challenges" className={`py-2 px-3 rounded ${
                router.pathname === '/challenges' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-indigo-600'
              }`}>
                Challenges
              </Link>
              <Link href="/leaderboards" className={`py-2 px-3 rounded ${
                router.pathname === '/leaderboards' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-indigo-600'
              }`}>
                Leaderboards
              </Link>
              <Link href="/directmessages" className={`py-2 px-3 rounded ${
                router.pathname === '/directmessages' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-indigo-600'
              }`}>
                Messages
              </Link>
            </div>

            {!loading && (
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{user.currentBadge?.image || '🔰'}</span>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-700">{user.name}</p>
                        <p className="text-gray-500">Level {user.level || 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="py-4">
        {children}
      </main>
    </div>
  );
}
