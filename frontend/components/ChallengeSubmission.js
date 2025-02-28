import { useState } from 'react';
import { toast } from 'react-hot-toast';

const ChallengeSubmission = ({ challenge, code, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      console.log('Submitting final solution...', {
        challengeId: challenge._id,
        code: code,
        language: 'python',
        isOfficialSubmission: true
      });
      
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          challengeId: challenge._id,
          code: code,
          language: 'python',
          isOfficialSubmission: true // Flag to indicate this is an official submission
        }),
      });

      const data = await response.json();
      console.log('Submission response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit solution');
      }

      if (data.success) {
        if (data.overallPass) {
          if (data.userUpdates) {
            const { experiencePointsEarned, newLevel, oldLevel } = data.userUpdates;
            
            toast.success(`Challenge completed! Earned ${experiencePointsEarned} XP`);
            
            if (newLevel > oldLevel) {
              toast.success(`Level Up! You are now level ${newLevel}`);
            }

            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent('challenge-complete', {
              detail: data.userUpdates
            }));

            if (typeof onSuccess === 'function') {
              onSuccess(data.userUpdates);
            }
          } else {
            // Calculate XP based on difficulty if userUpdates is not available
            const difficultyPoints = {
              'easy': 10,
              'medium': 20,
              'hard': 30
            };
            const xp = difficultyPoints[challenge.difficulty] || 0;
            
            console.warn('Submission successful but stats update failed');
            toast.success(`Challenge completed! You should have earned ${xp} XP`);
            toast.warning('Failed to update stats. Please refresh the page.');
            
            // Still dispatch event to refresh stats
            window.dispatchEvent(new CustomEvent('challenge-complete'));
          }
        } else {
          toast.error('Challenge failed. Try again!');
        }
      } else {
        toast.error(data.message || 'Failed to submit solution');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Error submitting solution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
        <h3 className="text-white font-medium mb-2">Final Submission</h3>
        <p className="text-navy-100 text-sm mb-4">
          Submit your final solution to earn XP and record your achievement. This will be added to your profile's recent activity.
        </p>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all
            ${submitting
              ? 'bg-navy-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
            }`}
        >
          {submitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Final Solution'
          )}
        </button>
      </div>
    </div>
  );
};

export default ChallengeSubmission; 