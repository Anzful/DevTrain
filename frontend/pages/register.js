// frontend/pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Head from 'next/head';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Sending registration data:', formData);
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      toast.success('Registration successful!');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <>
      <Head>
        <title>Register - CodeCraft</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-navy-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <div className="text-center">
            <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-white">
              Create your account
            </h2>
          </div>
          <div className="bg-navy-800 p-5 sm:p-8 shadow-lg rounded-lg">
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-navy-700 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-navy-700 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-navy-700 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
          <div className="text-center">
            <Link href="/login" className="text-xs sm:text-sm text-blue-400 hover:text-blue-300">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
