// frontend/pages/forum.js
import useSWR from 'swr';
import Layout from '../components/Layout';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon, PlusIcon } from '@heroicons/react/24/solid';

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }).then((res) => res.json());

export default function Forum() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data, error, mutate } = useSWR('http://localhost:5000/api/forum', fetcher);

  // Helper function to check if user has voted
  const hasUserVoted = (votesArray, userId) => {
    if (!votesArray || !userId) return false;
    return votesArray.some(id => id.toString() === userId.toString());
  };

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
      setShowCreateForm(false);
      toast.success('Post created successfully');
      mutate();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (type, id) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('You must be logged in to vote');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/forum/${id}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${type}`);
      }

      mutate();
    } catch (error) {
      toast.error(error.message);
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

  const userId = localStorage.getItem('userId');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with Create Post Button */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Community Forum</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
            >
              <PlusIcon className="h-5 w-5" />
              <span>{showCreateForm ? 'Cancel' : 'New Post'}</span>
            </button>
          </div>

          {/* Create Post Form - Collapsible */}
          {showCreateForm && (
            <div className="bg-navy-800/80 rounded-xl p-6 border border-blue-500/30 mb-8 shadow-lg transform transition-all duration-300 ease-in-out">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Post</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-navy-200 mb-1">Title</label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your post a title"
                    className="w-full bg-navy-700/80 border border-navy-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-navy-200 mb-1">Content</label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, questions, or ideas..."
                    rows={6}
                    className="w-full bg-navy-700/80 border border-navy-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={createPost}
                    disabled={submitting}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      submitting
                        ? 'bg-navy-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Posting...</span>
                      </div>
                    ) : (
                      'Publish Post'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-6">
            {data.length === 0 ? (
              <div className="bg-navy-800/50 rounded-xl p-8 border border-navy-600/50 text-center">
                <p className="text-navy-200 text-lg">No posts yet. Be the first to start a discussion!</p>
              </div>
            ) : (
              data.map((post) => (
                <div key={post._id} className="bg-navy-800/60 rounded-xl p-6 border border-navy-600/50 hover:border-blue-500/30 transition-all shadow-md hover:shadow-lg">
                  <div className="flex items-start">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center space-y-2 mr-4">
                      <button
                        onClick={() => handleVote('upvote', post._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          hasUserVoted(post.upvotes, userId)
                            ? 'text-green-500 bg-green-500/10'
                            : 'text-navy-300 hover:text-green-500 hover:bg-green-500/10'
                        }`}
                      >
                        <HandThumbUpIcon className="h-5 w-5" />
                      </button>
                      <span className={`font-medium text-lg ${
                        post.voteCount > 0 ? 'text-green-500' : 
                        post.voteCount < 0 ? 'text-red-500' : 'text-navy-200'
                      }`}>
                        {post.voteCount || 0}
                      </span>
                      <button
                        onClick={() => handleVote('downvote', post._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          hasUserVoted(post.downvotes, userId)
                            ? 'text-red-500 bg-red-500/10'
                            : 'text-navy-300 hover:text-red-500 hover:bg-red-500/10'
                        }`}
                      >
                        <HandThumbDownIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Content Column */}
                    <div className="flex-1">
                      <Link href={`/forum/${post._id}`} className="block">
                        <h2 className="text-xl font-semibold text-white mb-2 hover:text-blue-400 transition-colors">{post.title}</h2>
                      </Link>
                      <div className="flex items-center space-x-2 text-navy-300 text-sm mb-3">
                        <span className="font-medium text-blue-400">{post.user?.name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <p className="text-navy-100 whitespace-pre-wrap mb-4 line-clamp-3">
                        {post.content}
                      </p>
                      <Link 
                        href={`/forum/${post._id}`} 
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ChatBubbleLeftIcon className="h-5 w-5" />
                        <span>{post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}</span>
                        <span className="text-navy-400">• Click to view discussion</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
