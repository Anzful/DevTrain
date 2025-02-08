// frontend/components/Navbar.js
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div>
        <Link href="/dashboard" className="mr-4">
          Dashboard
        </Link>
        <Link href="/challenges" className="mr-4">
          Challenges
        </Link>
        <Link href="/forum" className="mr-4">
          Forum
        </Link>
      </div>
      <div>
        <Link href="/login" className="mr-4">
          Login
        </Link>
        <Link href="/register">Register</Link>
      </div>
    </nav>
  );
}
