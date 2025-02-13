// frontend/components/Navbar.js
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    if (localStorage.getItem('token')) {
      fetchUser();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  return (
    <nav className="bg-navy-800 border-b border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center space-x-2"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                DevTrain
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/challenges" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  router.pathname.includes('/challenges')
                    ? 'text-blue-400'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Challenges
              </Link>
              <Link 
                href="/forum" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  router.pathname === '/forum'
                    ? 'text-blue-400'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Forum
              </Link>
              <Link 
                href="/leaderboards" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  router.pathname === '/leaderboards'
                    ? 'text-blue-400'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Leaderboards
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-navy-100">
                    <span>{user.name}</span>
                    <div className="flex items-center px-2 py-1 rounded-full bg-navy-700/50 text-xs">
                      <svg 
                        className="w-3 h-3 text-yellow-500 mr-1" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{user.experiencePoints} XP</span>
                    </div>
                  </div>
                  {user.isAdmin && (
                    <Link 
                      href="/admin" 
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-lg transition-colors border border-navy-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/login" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
