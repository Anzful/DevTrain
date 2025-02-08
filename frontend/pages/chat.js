// frontend/pages/chat.js
import Layout from '../components/Layout';
import Chat from '../components/Chat';

export default function ChatPage() {
  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Chat</h1>
        <Chat />
      </div>
    </Layout>
  );
}
