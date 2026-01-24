import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Phone, Video, Calendar, FileText, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';

export function ChatInfoPanel({ doctor, patientHistory, isLoadingHistory = false, isDoctor = false, onPredictionClick }) {
  if (!doctor) return null;

  const handlePredictionClick = (predictionId) => {
    if (predictionId && onPredictionClick) {
      onPredictionClick(predictionId);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Doctor/Patient Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 mb-3">
            <AvatarImage src={doctor.avatar} alt={doctor.name} />
            <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
              {doctor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-semibold text-gray-800 text-lg mb-1">
            {doctor.name}
          </h3>
          
          {doctor.specialty && (
            <p className="text-sm text-gray-600 mb-2">{doctor.specialty}</p>
          )}
          
          <div className={`text-sm ${doctor.status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
            {doctor.status === 'online' ? '● Đang online' : '○ Offline'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-gray-200 grid grid-cols-2 gap-2">
        <Button variant="outline" className="flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          <span className="text-sm">Gọi điện</span>
        </Button>
        <Button variant="outline" className="flex items-center justify-center gap-2">
          <Video className="w-4 h-4" />
          <span className="text-sm">Video</span>
        </Button>
      </div>

      {/* Patient/User History */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {isDoctor ? 'Lịch sử dự đoán' : 'Lịch sử khám'}
        </h4>
        
        {/* Loading State */}
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : patientHistory && patientHistory.length > 0 ? (
          /* History Items */
          <div className="space-y-2">
            {patientHistory.map((item, index) => (
              <Card 
                key={item.predictionId || index} 
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handlePredictionClick(item.predictionId)}
              >
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium mb-1">
                {isDoctor ? 'Chưa có lịch sử dự đoán' : 'Chưa có lịch sử khám'}
              </p>
              <p className="text-xs">
                {isDoctor 
                  ? 'Bệnh nhân chưa thực hiện dự đoán nào'
                  : 'Hãy thực hiện dự đoán để xem lịch sử'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
