/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB", "500 KB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  
  if (bytes >= GB) {
    return `${(bytes / GB).toFixed(2)} GB`;
  } else if (bytes >= MB) {
    return `${(bytes / MB).toFixed(2)} MB`;
  } else if (bytes >= KB) {
    return `${(bytes / KB).toFixed(2)} KB`;
  } else {
    return `${bytes} B`;
  }
};

/**
 * Check if a file is an image based on mime type
 * @param {string} mimeType - File mime type
 * @returns {boolean} True if image
 */
export const isImageFile = (mimeType) => {
  return mimeType?.startsWith('image/');
};

/**
 * Get file icon name based on mime type
 * @param {string} mimeType - File mime type
 * @returns {string} Icon name for lucide-react
 */
export const getFileIcon = (mimeType) => {
  if (mimeType?.includes('pdf')) return 'FileText';
  if (mimeType?.includes('word') || mimeType?.includes('document')) return 'FileText';
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'FileSpreadsheet';
  if (mimeType?.includes('zip')) return 'FileArchive';
  if (mimeType?.includes('text')) return 'FileText';
  return 'File';
};
