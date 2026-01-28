import { MessageSquare } from 'lucide-react';

export function FloatingChatButton({ onClick, unreadCount = 0 }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      aria-label="Mở chat AI"
    >
      <MessageSquare className="w-7 h-7" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
}