// frontend/pages/leaderboards.js
<<<<<<< HEAD
import { useState } from 'react';
=======
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec
import useSWR from 'swr';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }).then((res) => res.json());

export default function Leaderboards() {
<<<<<<< HEAD
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'month', 'week'
  
  const { data, error } = useSWR(
    `http://localhost:5000/api/leaderboards?timeframe=${timeframe}`,
    fetcher
  );

  if (error) return (
    <Layout>
      <div className="text-red-500">Error loading leaderboards</div>
    </Layout>
  );
  
  if (!data) return (
    <Layout>
      <div className="text-gray-500">Loading leaderboards...</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Leaderboards</h1>
          <div className="space-x-2">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-4 py-2 rounded ${
                timeframe === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-4 py-2 rounded ${
                timeframe === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-4 py-2 rounded ${
                timeframe === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
=======
  const { data, error } = useSWR('http://localhost:5000/api/leaderboards', fetcher);

  if (error)
    return (
      <Layout>
        <div className="text-red-500">Error loading leaderboards</div>
      </Layout>
    );
  if (!data)
    return (
      <Layout>
        <div className="text-gray-500">Loading leaderboards...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Leaderboards</h1>
>>>>>>> 2aaa4a0f32c6f5f6905215075cd8474278ab18ec
        <Leaderboard data={data} />
      </div>
    </Layout>
  );
}
