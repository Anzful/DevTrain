import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { HandThumbUpIcon, HandThumbDownIcon, ArrowUturnLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

// Using environment variable for backend URL
const BACKEND_URL = 'https://devtrain.onrender.com';

export default function PostDetail({ post, mutate }) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleVote = async (type, id, isComment = false, commentId = null) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('You must be logged in to vote');
        return;
      }

      let url;
      if (isComment) {
        url = `${BACKEND_URL}/api/forum/${id}/comment/${commentId}/${type}`;
      } else {
        url = `${BACKEND_URL}/api/forum/${id}/${type}`;
      }

      const response = await fetch(url, {
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BACKEND_URL}/api/forum/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setComment('');
      setShowCommentForm(false);
      toast.success('Comment added successfully');
      mutate();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to check if user has voted
  const hasUserVoted = (votesArray, userId) => {
    if (!votesArray || !userId) return false;
    return votesArray.some(id => id.toString() === userId.toString());
  };

  const userId = localStorage.getItem('userId');
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-navy-800/60 rounded-xl p-6 border border-navy-600/50 shadow-lg mb-8">
      {/* Post Header */}
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
          <h2 className="text-2xl font-semibold text-white mb-2">{post.title}</h2>
          <div className="flex items-center space-x-2 text-navy-300 text-sm mb-4">
            <span className="font-medium text-blue-400">{post.user?.name || 'Anonymous'}</span>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>

          {/* Post Content */}
          <div className="bg-navy-700/30 rounded-lg p-4 mb-6 border border-navy-600/30">
            <p className="text-navy-100 whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-end space-x-4 mb-6 border-t border-navy-600/50 pt-4 mt-2">
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            showCommentForm 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'text-navy-300 hover:text-blue-400 hover:bg-blue-500/10'
          }`}
        >
          <ArrowUturnLeftIcon className="h-5 w-5" />
          <span>{showCommentForm ? 'Cancel Reply' : 'Reply to Post'}</span>
        </button>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <form onSubmit={handleAddComment} className="mb-8 bg-navy-700/30 rounded-xl p-4 border border-navy-600/30">
          <label htmlFor="comment" className="block text-sm font-medium text-navy-200 mb-2">
            Write a comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts on this post..."
            rows={4}
            className="w-full bg-navy-700/80 border border-navy-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-medium ${
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
                <>
                  <PaperAirplaneIcon className="h-4 w-4" />
                  <span>Post Comment</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Comments Section */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span>Comments</span>
            <span className="ml-2 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">
              {post.comments.length}
            </span>
          </h3>
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment._id} className="bg-navy-700/40 rounded-xl p-5 border border-navy-600/30 hover:border-navy-500/50 transition-all">
                <div className="flex items-start">
                  {/* Comment Vote Column */}
                  <div className="flex flex-col items-center space-y-1 mr-3">
                    <button
                      onClick={() => handleVote('upvote', post._id, true, comment._id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        hasUserVoted(comment.upvotes, userId)
                          ? 'text-green-500 bg-green-500/10'
                          : 'text-navy-300 hover:text-green-500 hover:bg-green-500/10'
                      }`}
                    >
                      <HandThumbUpIcon className="h-4 w-4" />
                    </button>
                    <span className={`text-sm font-medium ${
                      (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0) > 0
                        ? 'text-green-500'
                        : (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0) < 0
                        ? 'text-red-500'
                        : 'text-navy-300'
                    }`}>
                      {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
                    </span>
                    <button
                      onClick={() => handleVote('downvote', post._id, true, comment._id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        hasUserVoted(comment.downvotes, userId)
                          ? 'text-red-500 bg-red-500/10'
                          : 'text-navy-300 hover:text-red-500 hover:bg-red-500/10'
                      }`}
                    >
                      <HandThumbDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Comment Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 text-navy-300 text-sm mb-2">
                      <span className="font-medium text-blue-400">{comment.user?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-navy-100">{comment.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}