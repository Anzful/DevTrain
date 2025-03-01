import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - DevTrain</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">DevTrain</h1>
            <p className="text-navy-300">Sign in to your account</p>
          </div>
          
          {/* Login Card */}
          <div className="bg-navy-800/60 rounded-xl shadow-xl border border-navy-700/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy-200 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-navy-700/80 border border-navy-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-navy-200">
                    Password
                  </label>
                  <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-navy-700/80 border border-navy-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-lg py-3 px-4 font-medium text-white ${
                    loading
                      ? 'bg-blue-700/50 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-navy-700/50 text-center">
              <p className="text-navy-300">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
