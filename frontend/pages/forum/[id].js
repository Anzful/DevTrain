import { useRouter } from 'next/router';
import useSWR from 'swr';
import Layout from '../../components/Layout';
import PostDetail from '../../components/PostDetail';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'; // Fallback for local dev

const fetcher = (url) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  }).then((res) => res.json());

export default function ForumPost() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error, mutate } = useSWR(
    id ? `${BACKEND_URL}/api/forum/${id}` : null,
    fetcher
  );

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="text-red-400 bg-red-900/20 px-4 py-2 rounded">
            Failed to load post
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/forum" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Forum
          </Link>

          <PostDetail post={data} mutate={mutate} />
        </div>
      </div>
    </Layout>
  );
}