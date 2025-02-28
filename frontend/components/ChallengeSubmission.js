const handleSubmit = async () => {
  try {
    setSubmitting(true);
    console.log('Submitting solution...');
    
    const response = await fetch('http://localhost:5000/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        challengeId: challenge._id,
        code: code,
        language: 'python'
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