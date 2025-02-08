// frontend/pages/challenges/index.js
import useSWR from 'swr';
import Link from 'next/link';
import Layout from '../../components/Layout';

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }).then((res) => res.json());

export default function Challenges() {
  const { data, error } = useSWR('http://localhost:5000/api/challenges', fetcher);
  if (error)
    return (
      <Layout>
        <div>Error loading challenges</div>
      </Layout>
    );
  if (!data)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Coding Challenges</h1>
        <ul>
          {data.map((challenge) => (
            <li key={challenge._id} className="mb-2">
              <Link href={`/challenges/${challenge._id}`} className="text-blue-500">
                {challenge.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
