'use client';
import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {                                                    
  apiKey: "AIzaSyBeNKymDI7abdj6Hj6YVHWqPU4QoIA8Kac",
  authDomain: "landslide-7cf2a.firebaseapp.com",
  databaseURL: "https://landslide-7cf2a-default-rtdb.firebaseio.com",
  projectId: "landslide-7cf2a",
  storageBucket: "landslide-7cf2a.firebasestorage.app",
  messagingSenderId: "939694240101",
  appId: "1:939694240101:web:c2ba7a13b43f59a0f9718c",
  measurementId: "G-F5PSQDXDTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function MessagePage() {
  const [messages, setMessages] = useState<{ id: string; name: string; subject: string; message: string }[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = ref(database, 'message from users');
      const snapshot = await get(messagesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedMessages = Object.keys(data).map((id) => ({
          id,
          ...data[id],
        }));
        setMessages(formattedMessages);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Messages from Users</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700" style={{ width: '5%' }}>ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700" style={{ width: '15%' }}>Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700" style={{ width: '20%' }}>Subject</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-700" style={{ width: '60%' }}>Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, index) => (
              <tr
                key={msg.id}
                className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white hover:bg-gray-100'}
              >
                <td className="border border-gray-300 px-4 py-2 text-gray-600">{msg.id}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600">{msg.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600">{msg.subject}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600">{msg.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}