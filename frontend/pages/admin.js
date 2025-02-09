import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    template: '',
    testCases: [{ input: '', output: '' }]
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (!data.isAdmin) {
          router.push('/');
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        router.push('/');
      }
    };
    checkAdmin();
  }, []);

  const handleAddTestCase = () => {
    setNewChallenge(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', output: '' }]
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...newChallenge.testCases];
    updatedTestCases[index][field] = value;
    setNewChallenge(prev => ({
      ...prev,
      testCases: updatedTestCases
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newChallenge),
      });

      if (response.ok) {
        toast.success('Challenge created successfully!');
        setNewChallenge({
          title: '',
          description: '',
          difficulty: 'easy',
          template: '',
          testCases: [{ input: '', output: '' }]
        });
      } else {
        toast.error('Failed to create challenge');
      }
    } catch (error) {
      toast.error('Error creating challenge');
    }
  };

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Challenge</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Title</label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge(prev => ({...prev, title: e.target.value}))}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge(prev => ({...prev, description: e.target.value}))}
                  className="w-full border rounded p-2 h-32"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Difficulty</label>
                <select
                  value={newChallenge.difficulty}
                  onChange={(e) => setNewChallenge(prev => ({...prev, difficulty: e.target.value}))}
                  className="border rounded p-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Code Template</label>
                <textarea
                  value={newChallenge.template}
                  onChange={(e) => setNewChallenge(prev => ({...prev, template: e.target.value}))}
                  className="w-full border rounded p-2 h-32 font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">Test Cases</label>
                {newChallenge.testCases.map((testCase, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Input"
                      value={testCase.input}
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      className="border rounded p-2 flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Expected Output"
                      value={testCase.output}
                      onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                      className="border rounded p-2 flex-1"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="text-blue-600 hover:text-blue-700"
                >
                  + Add Test Case
                </button>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Challenge
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 