import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Paperclip, Send } from 'lucide-react';

export function MessageComposer({ onSendMessage, disabled }) {
  const [messageInput, setMessageInput] = useState('');

  const handleSend = () => {
    if (!messageInput.trim() || disabled) return;
    onSendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full flex-shrink-0"
          type="button"
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </Button>
        
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập câu hỏi sức khỏe của bạn..."
          className="flex-1 rounded-full border-gray-300"
          disabled={disabled}
        />
        
        <Button
          onClick={handleSend}
          disabled={!messageInput.trim() || disabled}
          className="rounded-full bg-green-600 hover:bg-green-700 w-10 h-10 p-0 flex-shrink-0"
          type="button"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
