import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function UserProfile({ user }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMessage = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      if (!currentUser) {
        toast.error('Please log in to send messages');
        return;
      }

      // Store selected user in localStorage
      const selectedUser = {
        _id: user._id,
        name: user.name,
        email: user.email
      };
      
      localStorage.setItem('selectedChatUser', JSON.stringify(selectedUser));
      router.push('/messages');
      
    } catch (error) {
      console.error('Error handling message:', error);
      toast.error('Failed to open chat');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">Level {user.level || 1}</p>
          <p className="text-gray-600">XP: {user.experiencePoints || 0}</p>
        </div>
        <button
          onClick={handleMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Message
        </button>
      </div>
      {user.currentBadge && (
        <div className="mt-4">
          <p className="font-semibold">Current Badge:</p>
          <div className="flex items-center mt-2">
            <img
              src={user.currentBadge.image}
              alt={user.currentBadge.name}
              className="w-8 h-8 mr-2"
            />
            <span>{user.currentBadge.name}</span>
          </div>
        </div>
      )}
    </div>
  );
} 