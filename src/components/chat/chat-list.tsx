'use client';

interface ChatListProps {
  chats: any[];
  selectedChat: string | null;
  onSelect: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChat, onSelect }: ChatListProps) {
  const mockChats = [
    { id: 1, name: 'Tech Startup Inc.', lastMessage: 'GST documents ready', unread: 2 },
    { id: 2, name: 'John Doe', lastMessage: 'When will the invoice be ready?', unread: 0 },
    { id: 3, name: 'Manufacturing Co.', lastMessage: 'Thank you', unread: 1 },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-900 text-lg">Messages</h2>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {mockChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelect(chat.id.toString())}
            className={`p-4 border-b border-gray-100 cursor-pointer transition ${
              selectedChat === chat.id.toString()
                ? 'bg-indigo-50 border-indigo-200'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-gray-900">{chat.name}</p>
              {chat.unread > 0 && (
                <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">
                  {chat.unread}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
