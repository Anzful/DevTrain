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
      if (data.submission.passed) {
        if (data.userUpdates) {
          const { experiencePointsEarned, newLevel, oldLevel } = data.userUpdates;
          
          toast.success(`Challenge completed! Earned ${experiencePointsEarned} XP`);
          
          if (newLevel > oldLevel) {
            toast.success(`Level Up! You are now level ${newLevel}`);
          }

          if (typeof onSuccess === 'function') {
            onSuccess(data.userUpdates);
          }
        } else if (data.error) {
          console.warn('Submission successful but stats update failed:', data.error);
          toast.success('Challenge completed!');
          toast.warning('Failed to update stats. Please refresh the page.');
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