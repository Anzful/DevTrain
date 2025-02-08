// frontend/pages/forum.js
import useSWR from 'swr';
import Layout from '../components/Layout';
import { useState } from 'react';

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }).then((res) => res.json());

export default function Forum() {
  const { data, error, mutate } = useSWR('http://localhost:5000/api/forum', fetcher);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const createPost = async () => {
    await fetch('http://localhost:5000/api/forum', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ title, content }),
    });
    mutate();
  };

  if (error)
    return (
      <Layout>
        <div>Error loading forum</div>
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
        <h1 className="text-2xl font-bold mb-4">Forum</h1>
        <div className="mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="p-2 border w-full mb-2"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            className="p-2 border w-full mb-2"
          ></textarea>
          <button onClick={createPost} className="px-4 py-2 bg-green-500 text-white rounded">
            Post
          </button>
        </div>
        {data.map((post) => (
          <div key={post._id} className="border p-4 mb-2">
            <h2 className="font-bold">{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
