import { createPortal } from 'react-dom';
import { Button } from '../ui/button';

export function LeaveGroupModal({ isOpen, groupName, onConfirm, onCancel }) {
  console.log('[LeaveGroupModal] Render - isOpen:', isOpen, 'groupName:', groupName);
  
  if (!isOpen) return null;

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          maxWidth: '28rem',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          zIndex: 10000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Rời khỏi nhóm</h3>
            <p className="text-sm text-gray-500">Xác nhận hành động</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          Bạn có chắc muốn rời khỏi nhóm <span className="font-semibold">{groupName}</span> không? 
          Bạn sẽ không còn nhận được tin nhắn từ nhóm này.
        </p>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            onClick={onCancel}
            variant="outline"
            style={{ flex: 1, padding: '0.5rem 1rem' }}
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            style={{ 
              flex: 1, 
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white'
            }}
            className="hover:bg-red-700"
          >
            Rời nhóm
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
