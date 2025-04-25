import { useState, useRef, useEffect } from 'react';
import { ChatSession, Message } from '../lib/types';

interface ChatListProps {
  sessions: ChatSession[];
}

interface ChatDetailsModalProps {
  messages: Message[];
  onClose: () => void;
  title: string;
}

const ChatDetailsModal: React.FC<ChatDetailsModalProps> = ({ messages, onClose, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={`message-${message.id || message.timestamp}-${index}`}
              className={`p-3 rounded-lg ${
                message.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
              } max-w-[80%]`}
            >
              <p>{message.text}</p>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChatList: React.FC<ChatListProps> = ({ sessions }) => {
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <div 
          key={`chat-${session.id}-${index}`}
          className="chat-summary border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setSelectedChat(session)}
        >
          <h3>{session.title || 'New Chat'}</h3>
          <p>Last updated: {new Date(session.updatedAt).toLocaleString()}</p>
          <p>{session.messageCount} messages</p>
          <p className="text-gray-600 truncate">{session.lastMessage}</p>
        </div>
      ))}

      {selectedChat && selectedChat.messages && (
        <ChatDetailsModal
          messages={selectedChat.messages}
          title={selectedChat.title || 'Chat History'}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

export default ChatList;