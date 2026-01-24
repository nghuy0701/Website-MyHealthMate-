import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function MessageComposer({ onSend }) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleSend = () => {
    if (content.trim()) {
      onSend(content, attachments);
      setContent('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
            rows="3"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gray-100"
          title="Đính kèm tệp"
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </Button>
        <Button
          onClick={handleSend}
          disabled={!content.trim()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      {attachments.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {attachments.length} tệp được chọn
        </div>
      )}
    </div>
  );
}
