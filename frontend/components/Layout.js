// frontend/components/Layout.js
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div>
      <nav className="bg-gray-800 text-white p-4">
        <Link href="/dashboard" className="mr-4">Dashboard</Link>
        <Link href="/challenges" className="mr-4">Challenges</Link>
        <Link href="/forum" className="mr-4">Forums</Link>
        <Link href="/leaderboards" className="mr-4">Leaderboards</Link>
        <Link href="/directmessages" className="mr-4">Chat</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
