import { useState, useRef } from 'react';
import { Image as ImageIcon, Paperclip, X, FileText, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import { formatFileSize, isImageFile } from '../../utils/fileUtils';

/**
 * AttachmentPicker Component
 * Two separate icon buttons: Image and File
 */
export function AttachmentPicker({ onFilesSelected, disabled }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        preview: isImageFile(file.type) ? URL.createObjectURL(file) : null,
        type: isImageFile(file.type) ? 'image' : 'file'
      }));

      setSelectedFiles(prev => [...prev, ...newFiles]);
      onFilesSelected([...selectedFiles, ...newFiles]);
    }

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    const updatedFiles = selectedFiles.filter(f => f.id !== fileId);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);

    // Revoke object URL if it's an image
    const fileToRemove = selectedFiles.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return FileText;
    if (mimeType?.includes('word') || mimeType?.includes('document')) return FileText;
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return FileSpreadsheet;
    return FileIcon;
  };

  return (
    <div>
      {/* Icon Buttons with Hidden Inputs */}
      <div className="flex gap-1">
        {/* Image Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* File Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Hidden Image Input */}
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Preview Bar */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-t border-gray-200">
          {selectedFiles.map((item) => (
            <div
              key={item.id}
              className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden"
              style={{ maxWidth: '120px' }}
            >
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveFile(item.id)}
                className="absolute top-1 right-1 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>

              {item.type === 'image' ? (
                /* Image Preview */
                <div className="w-full h-20 overflow-hidden">
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                /* File Card */
                <div className="flex items-center gap-2 p-2">
                  {(() => {
                    const Icon = getFileIcon(item.file.type);
                    return <Icon className="w-6 h-6 text-gray-500 flex-shrink-0" />;
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
