// frontend/pages/challenges/[id].js
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import CodeEditor from '../../components/CodeEditor';

// Dynamically import CodeEditor so it loads only on the client side
const CodeEditorComponent = dynamic(() => import('../../components/CodeEditor'), {
  ssr: false,
});

const fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
};

export default function ChallengePage() {
  const router = useRouter();
  const { id } = router.query;
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/api/challenges/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setChallenge(data);
          // Set initial code template based on language
          setCode(data.template || '');
        })
        .catch((error) => {
          console.error('Error fetching challenge:', error);
          toast.error('Error loading challenge');
        });
    }
  }, [id]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      console.log('Submitting code with payload:', {
        challengeId: challenge._id,
        code,
        language
      });

      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          challengeId: challenge._id,
          code,
          language
        }),
      });

      const data = await response.json();
      console.log('Submission result:', data);

      if (data.success) {
        setResults({
          passed: data.overallPass,
          testResults: data.testResults,
          language: data.language,
          judgeResults: data.judgeResults
        });

        if (data.overallPass) {
          toast.success(`Challenge completed! You earned ${
            challenge.difficulty === 'easy' ? 10 :
            challenge.difficulty === 'medium' ? 20 : 30
          } XP!`);
        } else {
          toast.error('Some tests failed. Check the results below.');
        }
      } else {
        toast.error(data.message || 'Error submitting solution');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error submitting solution');
    } finally {
      setSubmitting(false);
    }
  };

  if (!challenge) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{challenge.title}</h1>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="whitespace-pre-wrap">{challenge.description}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded p-2"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Your Solution</h2>
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            className="min-h-[300px]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-4 py-2 rounded ${
            submitting
              ? 'bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {submitting ? 'Submitting...' : 'Submit Solution'}
        </button>

        {results && (
          <div className="mt-4 p-4 border rounded">
            <h3 className="text-lg font-bold mb-2">Submission Results</h3>
            <div className="mb-2">
              <span className="font-semibold">Language:</span> {results.language}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Status:</span>
              <span className={results.passed ? 'text-green-600' : 'text-red-600'}>
                {results.passed ? ' Passed' : ' Failed'}
              </span>
            </div>
            {results.judgeResults && (
              <div className="mb-4">
                <div className="font-semibold">Judge0 Results:</div>
                <div className="bg-gray-100 p-2 rounded">
                  <div>Status: {results.judgeResults.status?.description}</div>
                  <div>Execution Time: {results.judgeResults.executionTime}ms</div>
                  {results.judgeResults.error && (
                    <div className="text-red-600">Error: {results.judgeResults.error}</div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-2">
              <div className="font-semibold">Test Results:</div>
              {results.testResults?.map((test, index) => (
                <div key={index} className="border-t mt-2 pt-2">
                  <div>Test Case {index + 1}: {test.passed ? '✅' : '❌'}</div>
                  <div>Input: {test.input}</div>
                  <div>Expected: {test.expectedOutput}</div>
                  <div>Actual: {test.actualOutput}</div>
                  {test.error && <div className="text-red-600">Error: {test.error}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
