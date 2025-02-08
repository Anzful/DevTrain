// frontend/pages/challenges/[id].js
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import CodeEditor so it loads only on the client side
const CodeEditor = dynamic(() => import('../../components/CodeEditor'), {
  ssr: false,
});

const fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
};

export default function Challenge() {
  const router = useRouter();
  const { id } = router.query;

  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python'); // default language
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch challenge data from the backend using SWR
  const { data: challenge, error } = useSWR(
    id ? `http://localhost:5000/api/challenges/${id}` : null,
    fetcher
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const submitCode = async () => {
    if (code.trim() === "") {
      setMessage('❌ Code cannot be empty. Please write your code before submitting.');
      return;
    }
    setLoading(true);
    setMessage('');
    setResult(null);

    try {
      console.log('Submitting code with payload:', {
        challengeId: id,
        code,
        language: selectedLanguage,
      });

      const res = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          challengeId: id,
          code,
          language: selectedLanguage,
          stdin: '' // Optional: pass custom input if needed
        }),
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      console.log('Submission result:', data);
      setResult(data);
      setMessage('✅ Code submitted successfully!');
    } catch (error) {
      console.error('Submission failed:', error);
      setMessage('❌ Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="text-red-500">Error loading challenge: {error.message}</div>
      </Layout>
    );
  }
  if (!router.isReady || !id) {
    return (
      <Layout>
        <div className="text-gray-500">⏳ Waiting for challenge ID...</div>
      </Layout>
    );
  }
  if (!challenge) {
    return (
      <Layout>
        <div className="text-gray-500">Loading challenge data...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{challenge.title}</h1>
        <p className="mb-4">{challenge.description}</p>

        {/* Language Dropdown */}
        <label htmlFor="language-select" className="block mb-2 font-bold">
          Select Language:
        </label>
        <select
          id="language-select"
          className="border p-2 mb-4"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          {/* Add more languages as needed */}
        </select>

        {/* Code Editor */}
        <CodeEditor value={code} onChange={setCode} language={selectedLanguage} />

        <button
          onClick={submitCode}
          disabled={loading}
          className={`mt-4 px-4 py-2 text-white rounded ${
            loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Code'}
        </button>

        {message && (
          <div className={`mt-4 p-2 text-white rounded ${message.startsWith('✅') ? 'bg-green-500' : 'bg-red-500'}`}>
            {message}
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h2 className="text-xl font-bold mb-2">Submission Result</h2>
            <div className="mb-4">
              <p>
                <strong>Overall Status:</strong>{' '}
                {result.overallPass ? (
                  <span className="text-green-600">Passed</span>
                ) : (
                  <span className="text-red-600">Failed</span>
                )}
              </p>
            </div>
            {result.testResults && result.testResults.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Test Cases</h3>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">#</th>
                      <th className="border px-2 py-1">Input</th>
                      <th className="border px-2 py-1">Expected Output</th>
                      <th className="border px-2 py-1">Actual Output</th>
                      <th className="border px-2 py-1">Result</th>
                      <th className="border px-2 py-1">Time</th>
                      <th className="border px-2 py-1">Memory</th>
                      <th className="border px-2 py-1">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.testResults.map((test, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1 text-center">{idx + 1}</td>
                        <td className="border px-2 py-1">{test.input}</td>
                        <td className="border px-2 py-1">{test.expectedOutput}</td>
                        <td className="border px-2 py-1">{test.actualOutput}</td>
                        <td className="border px-2 py-1 text-center">
                          {test.passed ? (
                            <span className="text-green-600 font-bold">Passed</span>
                          ) : (
                            <span className="text-red-600 font-bold">Failed</span>
                          )}
                        </td>
                        <td className="border px-2 py-1 text-center">{test.time || '-'}</td>
                        <td className="border px-2 py-1 text-center">{test.memory || '-'}</td>
                        <td className="border px-2 py-1">{test.error || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Submission Details</h3>
              <p>
                <strong>Code Submitted:</strong>
              </p>
              <pre className="bg-gray-200 p-2 rounded whitespace-pre-wrap">{result.submission.code}</pre>
              <p>
                <strong>Language:</strong> {result.submission.language}
              </p>
              <p>
                <strong>Feedback:</strong>
              </p>
              <pre className="bg-gray-200 p-2 rounded whitespace-pre-wrap">{result.submission.feedback}</pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Judge0 Raw Result</h3>
              <pre className="bg-gray-200 p-2 rounded whitespace-pre-wrap">
                {JSON.stringify(result.judge0Result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
