import { FileText, FileSpreadsheet, File as FileIcon, Download, ExternalLink } from 'lucide-react';
import { formatFileSize } from '../../utils/fileUtils';

export function MessageBubble({ message, isOwn }) {
  const { content, createdAt, attachments } = message;

  // Normalize attachment object to handle different field names from backend
  const normalizeAttachment = (att) => {
    if (!att) return null;
    
    return {
      url: att.url || att.fileUrl || att.path || att.secure_url,
      filename: att.filename || att.originalName || att.name || att.original_name,
      mimeType: att.mimeType || att.mime || att.mimetype || att.type,
      size: att.size || att.fileSize,
      type: att.type || (att.mimeType && att.mimeType.startsWith('image/') ? 'image' : 'file')
    };
  };

  // Debug logging
  if (attachments && attachments.length > 0) {
    console.log('[MessageBubble] Rendering message with attachments:', {
      messageId: message.id,
      content,
      attachmentsCount: attachments.length,
      attachments
    });
    
    // Log each attachment details
    attachments.forEach((att, idx) => {
      const normalized = normalizeAttachment(att);
      console.log(`[MessageBubble] Attachment ${idx} (original):`, att);
      console.log(`[MessageBubble] Attachment ${idx} (normalized):`, normalized);
    });
  }

  // Format timestamp to HH:mm
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const messageTime = formatTime(createdAt);

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return FileText;
    if (mimeType?.includes('word') || mimeType?.includes('document')) return FileText;
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return FileSpreadsheet;
    return FileIcon;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isOwn
              ? 'bg-green-600 text-white rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
          }`}
        >
          {/* Message Content */}
          {content && content.trim() && (
            <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${
              isOwn ? 'text-white' : 'text-gray-800'
            }`}>
              {content}
            </p>
          )}

          {/* Attachments - Show even if no content */}
          {attachments && attachments.length > 0 && (
            <div className={`${content && content.trim() ? 'mt-2' : ''} space-y-2`}>
              {attachments.map((attachment, index) => {
                // Normalize attachment fields
                const normalized = normalizeAttachment(attachment);
                
                console.log('[MessageBubble] Rendering attachment:', { original: attachment, normalized });
                
                // Guard against null/undefined or missing URL
                if (!normalized || !normalized.url) {
                  console.warn('[MessageBubble] Skipping invalid attachment at index', index, normalized);
                  return null;
                }
                
                // Determine if it's an image
                const isImage = normalized.type === 'image' || 
                               (normalized.mimeType && normalized.mimeType.startsWith('image/'));
                
                console.log('[MessageBubble] Attachment decision:', { 
                  index, 
                  isImage, 
                  url: normalized.url,
                  filename: normalized.filename,
                  mimeType: normalized.mimeType
                });
                
                return (
                  <div key={index} className="attachment-wrapper">
                    {isImage ? (
                      /* Image Preview */
                      <a
                        href={normalized.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={normalized.url}
                          alt={normalized.filename || 'Image'}
                          className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ maxHeight: '300px', objectFit: 'cover' }}
                          onError={(e) => {
                            console.error('[MessageBubble] Image load error:', normalized.url);
                            e.target.style.display = 'none';
                          }}
                        />
                      </a>
                    ) : (
                      /* File Card */
                      <a
                        href={normalized.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          isOwn
                            ? 'bg-green-700 hover:bg-green-800'
                            : 'bg-gray-50 hover:bg-gray-100'
                        } transition-colors`}
                      >
                        {(() => {
                          const Icon = getFileIcon(normalized.mimeType);
                          return <Icon className={`w-6 h-6 flex-shrink-0 ${
                            isOwn ? 'text-green-100' : 'text-gray-500'
                          }`} />;
                        })()}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isOwn ? 'text-white' : 'text-gray-700'
                          }`}>
                            {normalized.filename || 'File'}
                          </p>
                          {normalized.size && (
                            <p className={`text-xs ${
                              isOwn ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {formatFileSize(normalized.size)}
                            </p>
                          )}
                        </div>
                        <Download className={`w-4 h-4 flex-shrink-0 ${
                          isOwn ? 'text-green-100' : 'text-gray-500'
                        }`} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Timestamp below bubble */}
        {messageTime && (
          <p className="text-xs text-gray-400 mt-1 px-1">
            {messageTime}
          </p>
        )}
      </div>
    </div>
  );
}
