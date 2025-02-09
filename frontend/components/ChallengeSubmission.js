const handleSubmit = async () => {
  try {
    setSubmitting(true);
    const response = await fetch('http://localhost:5000/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        challengeId: challenge._id,
        code: code,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
    }
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ 
      message: 'Error submitting solution', 
      error: error.message,
      details: error.response?.data || error
    });
  }
}; 