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
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            CodeCraft
          </Link>
          <Link href="/challenges" className="hover:text-gray-300">
            Challenges
          </Link>
          <Link href="/forum" className="hover:text-gray-300">
            Forum
          </Link>
          <Link href="/leaderboards" className="hover:text-gray-300">
            Leaderboards
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2">
                <span>{user.name}</span>
                <span className="text-sm text-gray-400">({user.experiencePoints} XP)</span>
              </div>
              {user.isAdmin && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-gray-300">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
