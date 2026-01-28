import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Send, Loader2 } from 'lucide-react';
import { AttachmentPicker } from './AttachmentPicker';
import { chatAPI } from '../../lib/api';

/**
 * MessageComposer - Chat input component with attachment support
 * Supports multiline text with Shift+Enter
 */
export function MessageComposer({ onSendMessage, onTypingChange, disabled }) {
  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleSend = async () => {
    if ((!messageInput.trim() && selectedFiles.length === 0) || disabled || isUploading) return;
    
    try {
      setIsUploading(true);
      
      // Upload files if any
      let attachments = [];
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (item) => {
          const formData = new FormData();
          formData.append('file', item.file);
          
          // Debug: Log FormData contents
          console.log('[MessageComposer] Uploading file:', {
            name: item.file.name,
            type: item.file.type,
            size: item.file.size
          });
          
          const response = await chatAPI.uploadFile(formData);
          console.log('[MessageComposer] Upload response:', response);
          
          // Backend returns data directly (not wrapped in .data)
          return response;
        });
        
        attachments = await Promise.all(uploadPromises);
        console.log('[MessageComposer] All uploads complete:', attachments);
      }
      
      // Send message with attachments
      await onSendMessage(messageInput.trim(), attachments);
      
      // Clear input and attachments
      setMessageInput('');
      setSelectedFiles([]);
      
      // Notify parent that input is now empty
      if (onTypingChange) {
        onTypingChange(0);
      }
    } catch (error) {
      console.error('Error uploading attachments:', error);
      alert('Failed to upload attachments. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    // Enter alone = send message
    // Shift + Enter = new line (default textarea behavior)
    if (e.key === 'Enter' && !e.shiftKey && !isUploading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  return (
    <div className="bg-white border-t border-gray-200 flex-shrink-0">
      <div className="p-4">
        <div className="flex items-end gap-2">
          <AttachmentPicker
            onFilesSelected={handleFilesSelected}
            disabled={disabled || isUploading}
          />
          
          <textarea
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Nhập câu hỏi sức khỏe của bạn..."
            className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || isUploading}
            rows={1}
            style={{ maxHeight: '120px' }}
          />
          
          <Button
            onClick={handleSend}
            disabled={(!messageInput.trim() && selectedFiles.length === 0) || disabled || isUploading}
            className="rounded-full bg-green-600 hover:bg-green-700 w-10 h-10 p-0 flex-shrink-0"
            type="button"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* AttachmentPicker includes its own preview bar */}
    </div>
  );
}
