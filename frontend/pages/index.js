// frontend/pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to AI-Powered E-Learning Platform
      </h1>
      <div>
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded mr-2">
          Login
        </Link>
        <Link href="/register" className="px-4 py-2 bg-green-600 text-white rounded">
          Register
        </Link>
      </div>
    </div>
  );
}
