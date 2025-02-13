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
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData = await response.json();
        console.log('User data:', userData);
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
    <div className="min-h-screen bg-navy-900">
      <nav className="bg-navy-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex space-x-7">
              <Link href="/dashboard" className="flex items-center py-4 px-2">
                <span className="font-bold text-white text-2xl">CodeCraft</span>
              </Link>
            </div>

            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className={`py-2 px-3 rounded ${
                  router.pathname === '/dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/challenges"
                className={`py-2 px-3 rounded ${
                  router.pathname === '/challenges'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Challenges
              </Link>
              <Link
                href="/forum"
                className={`py-2 px-3 rounded ${
                  router.pathname === '/forum'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Forum
              </Link>
              <Link
                href="/leaderboards"
                className={`py-2 px-3 rounded ${
                  router.pathname === '/leaderboards'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Leaderboards
              </Link>
              <Link
                href="/directmessages"
                className={`py-2 px-3 rounded ${
                  router.pathname === '/directmessages'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Messages
              </Link>
              {user?.isAdmin && (
                <Link
                  href="/admin"
                  className={`py-2 px-3 rounded ${
                    router.pathname === '/admin'
                      ? 'bg-blue-600 text-white'
                      : 'text-navy-100 hover:text-white'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {!loading && (
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl">{user.currentBadge?.image || '🔰'}</span>
                      <div className="text-sm">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-navy-200">Level {user.level || 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="py-6">{children}</main>

      <footer className="bg-navy-800 text-navy-200 text-center py-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} CodeCraft. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
