// frontend/pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">
        Welcome to AI-Powered E-Learning Platform
      </h1>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700 transition-colors">
          Login
        </Link>
        <Link href="/register" className="px-4 py-2 bg-green-600 text-white rounded text-center hover:bg-green-700 transition-colors">
          Register
        </Link>
      </div>
    </div>
  );
}
