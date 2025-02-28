// frontend/pages/index.js
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>CodeCraft - AI-Powered E-Learning Platform</title>
        <meta name="description" content="Enhance your coding skills with our AI-powered learning platform" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-32 sm:pb-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                <span className="block">Master Coding with</span>
                <span className="block text-blue-400">AI-Powered Learning</span>
              </h1>
              
              <p className="max-w-md mx-auto text-base sm:text-lg md:text-xl text-gray-300 mb-10">
                Enhance your programming skills through interactive challenges, real-time feedback, and personalized learning paths.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700 transition-colors relative z-10 touch-manipulation shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Get Started
                </Link>
                <Link href="/register" className="px-8 py-4 bg-transparent border-2 border-blue-400 text-blue-400 rounded-lg text-center font-medium hover:bg-blue-400/10 transition-colors relative z-10 touch-manipulation">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            Why Choose Our Platform?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-600/50 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Challenges</h3>
              <p className="text-gray-300">Practice with real-world coding challenges that adapt to your skill level.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-600/50 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Feedback</h3>
              <p className="text-gray-300">Receive instant, personalized feedback on your code to improve faster.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-600/50 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Skill Progression</h3>
              <p className="text-gray-300">Track your progress with XP, levels, and badges as you master new concepts.</p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-12 shadow-xl">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to start your coding journey?
              </h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who are improving their skills and advancing their careers with our platform.
              </p>
              <Link href="/register" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg relative z-10 touch-manipulation">
                Start Learning Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
