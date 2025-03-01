import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <nav className="bg-navy-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center py-4 px-2">
                <span className="font-bold text-white text-xl md:text-2xl">DevTrain</span>
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex space-x-1 lg:space-x-4">
              <Link
                href="/dashboard"
                className={`py-2 px-2 lg:px-3 rounded text-sm lg:text-base ${
                  router.pathname === '/dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/challenges"
                className={`py-2 px-2 lg:px-3 rounded text-sm lg:text-base ${
                  router.pathname === '/challenges'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Challenges
              </Link>
              <Link
                href="/forum"
                className={`py-2 px-2 lg:px-3 rounded text-sm lg:text-base ${
                  router.pathname === '/forum'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Forum
              </Link>
              <Link
                href="/leaderboards"
                className={`py-2 px-2 lg:px-3 rounded text-sm lg:text-base ${
                  router.pathname === '/leaderboards'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Leaderboards
              </Link>
              <Link
                href="/directmessages"
                className={`py-2 px-2 lg:px-3 rounded text-sm lg:text-base ${
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
                  className={`py-2 px-2 lg:px-3 rounded text-sm lg:text-base ${
                    router.pathname === '/admin'
                      ? 'bg-blue-600 text-white'
                      : 'text-navy-100 hover:text-white'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* User Profile & Login/Logout - Hidden on mobile */}
            {!loading && (
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl lg:text-3xl">{user.currentBadge?.image || '🔰'}</span>
                      <div className="text-xs lg:text-sm">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-navy-200">Level {user.level || 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base rounded hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base rounded hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                className="outline-none mobile-menu-button"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-4 space-y-1 bg-navy-700">
            <Link
              href="/dashboard"
              className={`block py-2 px-4 rounded ${
                router.pathname === '/dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-navy-100 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/challenges"
              className={`block py-2 px-4 rounded ${
                router.pathname === '/challenges'
                  ? 'bg-blue-600 text-white'
                  : 'text-navy-100 hover:text-white'
              }`}
            >
              Challenges
            </Link>
            <Link
              href="/forum"
              className={`block py-2 px-4 rounded ${
                router.pathname === '/forum'
                  ? 'bg-blue-600 text-white'
                  : 'text-navy-100 hover:text-white'
              }`}
            >
              Forum
            </Link>
            <Link
              href="/leaderboards"
              className={`block py-2 px-4 rounded ${
                router.pathname === '/leaderboards'
                  ? 'bg-blue-600 text-white'
                  : 'text-navy-100 hover:text-white'
              }`}
            >
              Leaderboards
            </Link>
            <Link
              href="/directmessages"
              className={`block py-2 px-4 rounded ${
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
                className={`block py-2 px-4 rounded ${
                  router.pathname === '/admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-navy-100 hover:text-white'
                }`}
              >
                Admin
              </Link>
            )}
            
            {/* User info and logout for mobile */}
            {!loading && user && (
              <div className="pt-2 border-t border-navy-600">
                <div className="flex items-center px-4 py-2">
                  <span className="text-2xl mr-2">{user.currentBadge?.image || '🔰'}</span>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-navy-200 text-sm">Level {user.level || 1}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
            
            {!loading && !user && (
              <div className="pt-2 border-t border-navy-600">
                <Link
                  href="/login"
                  className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="py-6">{children}</main>

      <footer className="bg-navy-800 text-navy-200 text-center py-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} DevTrain. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
