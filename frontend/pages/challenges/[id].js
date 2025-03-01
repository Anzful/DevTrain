// frontend/pages/challenges/[id].js
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import ChallengeSubmission from '../../components/ChallengeSubmission';
import Head from 'next/head';

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

export default function ChallengePage() {
  const router = useRouter();
  const { id } = router.query;
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching challenge:', error);
          toast.error('Error loading challenge');
          setLoading(false);
          setError('Failed to load challenge data');
        });
    }
  }, [id]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      console.log('Running code with payload:', {
        challengeId: challenge._id,
        code,
        language,
        isOfficialSubmission: false // Flag to indicate this is just a test run
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
          language,
          isOfficialSubmission: false // Not an official submission
        }),
      });

      const data = await response.json();
      console.log('Run result:', data);

      if (data.success) {
        setResults({
          passed: data.overallPass,
          testResults: data.testResults,
          language: data.language,
          judgeResults: data.judgeResults
        });

        if (data.overallPass) {
          toast.success('All tests passed! You can now submit your solution to earn XP.');
        } else {
          toast.error('Some tests failed. Check the results below.');
        }
      } else {
        toast.error(data.message || 'Error running solution');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error running solution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccess = (userUpdates) => {
    // Update challenge completion status
    setChallenge(prev => ({
      ...prev,
      completed: true
    }));
    
    toast.success('Challenge completed!');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !challenge) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="text-red-400 bg-red-900/20 px-4 py-2 rounded">
            {error || 'Failed to load challenge'}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{challenge.title} - DevTrain Challenge</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-4 sm:py-6 md:py-8 px-4">
        <div className="max-w-[1600px] mx-auto">
          {/* Challenge Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{challenge.title}</h1>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                    challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'}`}
                >
                  {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  {challenge.category ? challenge.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Other'}
                </span>
                {challenge.completed && (
                  <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 text-navy-200">
              <div className="flex items-center">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs sm:text-sm">{challenge.points || 0} XP</span>
              </div>
              <div className="flex items-center">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs sm:text-sm">{challenge.timeLimit || 30} min</span>
              </div>
            </div>
          </div>

          {/* Main Content - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Description Panel */}
            <div className="bg-navy-800/50 rounded-lg p-4 sm:p-6 border border-navy-600/50 h-fit space-y-4 sm:space-y-6">
              {/* Description Section */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">Description</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-navy-100 text-sm sm:text-base whitespace-pre-wrap">{challenge.description}</p>
                </div>
              </div>

              {/* Examples Section */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Examples</h3>
                <div className="space-y-3 sm:space-y-4">
                  {challenge.testCases?.slice(0, 2).map((testCase, index) => (
                    <div key={index} className="bg-navy-700/50 rounded-lg p-3 sm:p-4">
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <span className="text-navy-200 text-xs sm:text-sm">Input:</span>
                          <div className="mt-1 bg-navy-800 p-1.5 sm:p-2 rounded font-mono text-xs sm:text-sm text-navy-100">
                            {testCase.input}
                          </div>
                        </div>
                        <div>
                          <span className="text-navy-200 text-xs sm:text-sm">Expected Output:</span>
                          <div className="mt-1 bg-navy-800 p-1.5 sm:p-2 rounded font-mono text-xs sm:text-sm text-navy-100">
                            {testCase.expectedOutput}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints Section - if you have any */}
              {challenge.constraints && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-navy-100 text-sm sm:text-base">
                    {challenge.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Code Editor Panel */}
            <div className="bg-navy-800/50 rounded-lg p-4 sm:p-6 border border-navy-600/50">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Solution</h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-navy-700 border border-navy-600 text-navy-100 text-xs sm:text-sm rounded-md px-2 sm:px-3 py-1 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden border border-navy-600">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  height="350px"
                  className="text-sm"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all
                  ${submitting
                    ? 'bg-navy-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span>Running Tests...</span>
                  </div>
                ) : (
                  'Run Code'
                )}
              </button>
            </div>
          </div>

          {/* Results Section - Full Width */}
          {results && (
            <div className="mt-4 sm:mt-6 bg-navy-800/50 rounded-lg p-4 sm:p-6 border border-navy-600/50">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Test Results</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-navy-100 text-sm sm:text-base">Status:</span>
                  <span className={`font-medium text-sm sm:text-base ${results.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {results.passed ? 'All Tests Passed' : 'Some Tests Failed'}
                  </span>
                </div>

                {results.judgeResults && (
                  <div className="bg-navy-700/50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-base sm:text-lg font-medium text-white mb-2">Execution Details</h4>
                    <div className="space-y-2 text-navy-100 text-sm sm:text-base">
                      <div>Status: {results.judgeResults.status?.description}</div>
                      <div>Time: {results.judgeResults.executionTime}ms</div>
                      {results.judgeResults.error && (
                        <div className="text-red-400 bg-red-900/20 p-2 sm:p-3 rounded text-xs sm:text-sm">
                          {results.judgeResults.error}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  {results.testResults?.map((test, index) => (
                    <div
                      key={index}
                      className={`bg-navy-700/50 rounded-lg p-3 sm:p-4 border
                        ${test.passed ? 'border-green-500/20' : 'border-red-500/20'}`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-base sm:text-lg ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {test.passed ? '✓' : '✗'}
                        </span>
                        <h5 className="text-white font-medium text-sm sm:text-base">Test Case {index + 1}</h5>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <div className="text-navy-200 mb-1">Input:</div>
                          <div className="bg-navy-800 p-1.5 sm:p-2 rounded text-navy-100">{test.input}</div>
                        </div>
                        <div>
                          <div className="text-navy-200 mb-1">Expected Output:</div>
                          <div className="bg-navy-800 p-1.5 sm:p-2 rounded text-navy-100">{test.expectedOutput}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-navy-200 mb-1">Your Output:</div>
                          <div className="bg-navy-800 p-1.5 sm:p-2 rounded text-navy-100">{test.actualOutput}</div>
                        </div>
                      </div>

                      {test.error && (
                        <div className="mt-2 text-red-400 bg-red-900/20 p-1.5 sm:p-2 rounded text-xs sm:text-sm">
                          {test.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Challenge Submission Panel */}
          <div className="mt-4 sm:mt-6 bg-navy-800/50 rounded-lg p-4 sm:p-6 border border-navy-600/50">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Submit Your Solution</h2>
            <ChallengeSubmission
              challenge={challenge}
              code={code}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
