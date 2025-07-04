import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from 'declarations/backend';
import botImg from '/bot.svg';
import userImg from '/user.svg';
import '/index.css';

const App = () => {
  const [chat, setChat] = useState([
    {
      system: {
        content:
          "I'm FarmIQ, a smart farming assistant helping Kenyan farmers with agriculture-related advice only. I respond to questions about crops, soil, weather, livestock, fertilizers, and local farming practices."
      }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  const askAgent = async (messages) => {
    try {
      const response = await backend.chat(messages);
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop(); // remove "Thinking ..."
        newChat.push({ system: { content: response } });
        return newChat;
      });
    } catch (e) {
      console.error(e);
      const eStr = String(e);
      const match = eStr.match(/(SysTransient|CanisterReject), \\+"([^\\"]+)/);
      if (match) {
        alert(match[2]);
      }
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop(); // remove "Thinking ..."
        return newChat;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      user: { content: inputValue }
    };
    const thinkingMessage = {
      system: { content: 'Thinking ...' }
    };
    setChat((prevChat) => [...prevChat, userMessage, thinkingMessage]);
    setInputValue('');
    setIsLoading(true);

    const messagesToSend = chat.slice(1).concat(userMessage); // remove initial system message
    askAgent(messagesToSend);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">🌿 FarmIQ</h1>
        <ul className="flex space-x-6 text-sm text-gray-700 font-medium">
          <li className="hover:text-green-600 cursor-pointer">Home</li>
          <li className="hover:text-green-600 cursor-pointer">Dashboard</li>
          <li className="text-green-700 font-semibold underline">AI Assistant</li>
        </ul>
      </nav>

      {/* Chat Interface */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
          <div className="flex-1 overflow-y-auto rounded-t-lg bg-gray-100 p-4" ref={chatBoxRef}>
            {chat.map((message, index) => {
              const isUser = 'user' in message;
              const img = isUser ? userImg : botImg;
              const name = isUser ? 'You' : 'FarmIQ';
              const text = isUser ? message.user.content : message.system.content;

              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                  {!isUser && (
                    <div
                      className="mr-2 h-10 w-10 rounded-full"
                      style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                    ></div>
                  )}
                  <div className={`max-w-[70%] rounded-lg p-3 ${isUser ? 'bg-green-600 text-white' : 'bg-white shadow'}`}>
                    <div
                      className={`mb-1 flex items-center justify-between text-sm ${isUser ? 'text-white' : 'text-gray-500'}`}
                    >
                      <div>{name}</div>
                      <div className="mx-2">{formatDate(new Date())}</div>
                    </div>
                    <div>{text}</div>
                  </div>
                  {isUser && (
                    <div
                      className="ml-2 h-10 w-10 rounded-full"
                      style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
          <form className="flex rounded-b-lg border-t bg-white p-4" onSubmit={handleSubmit}>
            <input
              type="text"
              className="flex-1 rounded-l border p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Ask a farming question, e.g. 'Can I grow beans in clay soil?'"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="rounded-r bg-green-600 p-2 text-white hover:bg-green-700 disabled:bg-green-300"
              disabled={isLoading}
            >
              Send
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-100 text-center text-sm text-green-800 py-2">
        © {new Date().getFullYear()} FarmIQ. Empowering Smart Farming in Kenya
      </footer>
    </div>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

