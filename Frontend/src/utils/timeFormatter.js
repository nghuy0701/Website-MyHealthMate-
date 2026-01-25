/**
 * Format timestamp as human-readable relative time in Vietnamese
 * @param {string | Date | number} date - Date to format
 * @returns {string} Relative time string (e.g., "5 phút trước", "2 giờ trước", "3 ngày trước")
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const inputDate = new Date(date);
  
  // Validate date
  if (isNaN(inputDate.getTime())) return '';
  
  const diffMs = now - inputDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 minute
  if (diffMinutes < 1) return 'Vừa xong';
  
  // Less than 60 minutes
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  
  // Less than 24 hours
  if (diffHours < 24) return `${diffHours} giờ trước`;
  
  // 1 day
  if (diffDays === 1) return 'Hôm qua';
  
  // More than 1 day
  return `${diffDays} ngày trước`;
}
