import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Paperclip, Send } from 'lucide-react';

/**
 * MessageComposer - Chat input component
 * 
 * Typing indicator logic:
 * - Notify parent with input length on EVERY change
 * - Parent decides when to emit socket events (with debounce)
 * - Parent controls UI visibility based on input length (instant)
 */
export function MessageComposer({ onSendMessage, onTypingChange, disabled }) {
  const [messageInput, setMessageInput] = useState('');

  // Handle input change - notify parent with input length
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setMessageInput(newValue);
    
    // Always notify parent with current input length
    // Parent will handle UI visibility and socket emission
    if (onTypingChange) {
      onTypingChange(newValue.length);
    }
  };

  const handleSend = () => {
    if (!messageInput.trim() || disabled) return;
    onSendMessage(messageInput.trim());
    setMessageInput('');
    
    // Notify parent that input is now empty
    if (onTypingChange) {
      onTypingChange(0);
    }
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
          onChange={handleInputChange}
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
