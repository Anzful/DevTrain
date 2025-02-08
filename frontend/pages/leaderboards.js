// frontend/pages/leaderboards.js
import useSWR from 'swr';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }).then((res) => res.json());

export default function Leaderboards() {
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
        <Leaderboard data={data} />
      </div>
    </Layout>
  );
}
