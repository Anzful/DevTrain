// frontend/pages/_app.js
import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import 'monaco-editor/min/vs/editor/editor.main.css';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    // If OAuth returns token in URL, store it and redirect
    if (router.query.token) {
      localStorage.setItem('token', router.query.token);
      router.replace('/dashboard');
    }
  }, [router]);
  return ( 
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
