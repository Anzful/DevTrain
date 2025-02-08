// frontend/pages/dashboard.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch((err) => console.error(err));
    }
  }, []);

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user && <p>Welcome, {user.name}!</p>}
        <div className="mt-4">
          <Link href="/challenges" className="px-4 py-2 bg-blue-500 text-white rounded">
            Coding Challenges
          </Link>
        </div>
      </div>
    </Layout>
  );
}
