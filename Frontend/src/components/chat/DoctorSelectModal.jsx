import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

export function DoctorSelectModal({ isOpen, onClose, doctors, onSelectDoctor, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Chọn Bác sĩ Tư vấn</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          AI đã ghi nhận yêu cầu hỗ trợ của bạn. Vui lòng chọn một bác sĩ để tiếp tục cuộc trò chuyện.
        </p>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Đang tải danh sách bác sĩ...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có bác sĩ nào đang online.</div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {doctors.map(doctor => (
              <div
                key={doctor.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSelectDoctor(doctor)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-800">{doctor.name}</p>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">Online</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}