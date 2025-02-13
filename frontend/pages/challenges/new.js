import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { toast } from 'react-hot-toast';

export default function NewChallenge() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    language: 'python',
    testCases: [
      { input: '', expectedOutput: '' },
      { input: '', expectedOutput: '' }
    ]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(challenge)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create challenge');
      }

      toast.success('Challenge created successfully');
      router.push('/admin');
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error(error.message || 'Failed to create challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChallenge(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setChallenge(prev => ({
      ...prev,
      testCases: prev.testCases.map((testCase, i) => 
        i === index ? { ...testCase, [field]: value } : testCase
      )
    }));
  };

  const addTestCase = () => {
    setChallenge(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '' }]
    }));
  };

  const removeTestCase = (index) => {
    if (challenge.testCases.length <= 2) {
      toast.error('Minimum 2 test cases required');
      return;
    }
    setChallenge(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Create New Challenge</h1>
          
          <form onSubmit={handleSubmit} className="bg-navy-800/50 rounded-lg border border-navy-600/50 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-navy-100 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={challenge.title}
                onChange={handleChange}
                className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-100 mb-1">Description</label>
              <textarea
                name="description"
                value={challenge.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-100 mb-1">Difficulty</label>
                <select
                  name="difficulty"
                  value={challenge.difficulty}
                  onChange={handleChange}
                  className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-100 mb-1">Language</label>
                <select
                  name="language"
                  value={challenge.language}
                  onChange={handleChange}
                  className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-100 mb-2">Test Cases</label>
              <div className="space-y-4">
                {challenge.testCases.map((testCase, index) => (
                  <div key={index} className="flex space-x-4 items-start bg-navy-700/50 p-4 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs text-navy-200 mb-1">Input</label>
                      <input
                        type="text"
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-navy-200 mb-1">Expected Output</label>
                      <input
                        type="text"
                        value={testCase.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                        className="w-full bg-navy-700 border border-navy-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="mt-6 text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTestCase}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Test Case
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-600 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Challenge'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 