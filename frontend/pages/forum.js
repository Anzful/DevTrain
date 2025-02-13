// frontend/pages/forum.js
import useSWR from 'swr';
import Layout from '../components/Layout';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }).then((res) => res.json());

export default function Forum() {
  const { data, error, mutate } = useSWR('http://localhost:5000/api/forum', fetcher);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const createPost = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:5000/api/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      setTitle('');
      setContent('');
      toast.success('Post created successfully');
      mutate();
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="text-red-400 bg-red-900/20 px-4 py-2 rounded">
            Failed to load forum
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Forum</h1>

          {/* Create Post Form */}
          <div className="bg-navy-800/50 rounded-lg p-6 border border-navy-600/50 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Post</h2>
            <div className="space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={createPost}
                disabled={submitting}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  submitting
                    ? 'bg-navy-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {data.map((post) => (
              <div key={post._id} className="bg-navy-800/50 rounded-lg p-6 border border-navy-600/50">
                <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
                <div className="flex items-center space-x-2 text-navy-200 text-sm mb-4">
                  <span>{post.user?.name}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-navy-100 whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
