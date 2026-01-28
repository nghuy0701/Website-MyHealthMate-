// Frontend/src/lib/ai-chat-data.js

export const AI_NAME = 'MyHealthMate AI';
export const AI_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg?seed=MyHealthMateAI';

export const DOCTOR_SUPPORT_START_HOUR = 8; // 8 AM
export const DOCTOR_SUPPORT_END_HOUR = 22; // 10 PM

export const initialAiMessage = {
  id: 'ai-initial',
  senderType: 'AI',
  content: `Chào bạn! Tôi là trợ lý y tế AI của MyHealthMate. Tôi có thể giúp bạn:
  \n• Hướng dẫn dự đoán nguy cơ tiểu đường
  \n• Giải thích kết quả dự đoán
  \n• Cung cấp kiến thức về bệnh tiểu đường
  \n• Kết nối bạn với bác sĩ khi cần
  \nBạn cần hỗ trợ gì?`,
  createdAt: new Date().toISOString(),
};

export const initialQuickReplies = [
  { text: 'Bắt đầu dự đoán', payload: 'START_PREDICTION' },
  { text: 'Giải thích kết quả', payload: 'EXPLAIN_RESULT' },
  { text: 'Bệnh tiểu đường là gì?', payload: 'WHAT_IS_DIABETES' },
  { text: 'Kết nối bác sĩ', payload: 'CONNECT_DOCTOR' },
];

export const aiResponses = {
  START_PREDICTION: {
    content: `Tuyệt vời! Để bắt đầu dự đoán nguy cơ tiểu đường, bạn vui lòng truy cập trang Dự đoán của chúng tôi. Tại đó, bạn sẽ điền các chỉ số sức khỏe cần thiết và nhận kết quả ngay lập tức.
    \nBấm vào đây để đến trang Dự đoán`,
    quickReplies: [
      { text: 'Giải thích kết quả', payload: 'EXPLAIN_RESULT' },
      { text: 'Bệnh tiểu đường là gì?', payload: 'WHAT_IS_DIABETES' },
      { text: 'Kết nối bác sĩ', payload: 'CONNECT_DOCTOR' },
    ],
  },
  EXPLAIN_RESULT: {
    content: `Để tôi có thể giải thích kết quả dự đoán, bạn vui lòng cung cấp kết quả của bạn (ví dụ: "Nguy cơ cao" hoặc "Nguy cơ thấp") và các chỉ số chính nếu có.
    \nHoặc bạn có thể nhập các chỉ số như Glucose, BMI, Huyết áp để tôi đưa ra thông tin chung.`,
    quickReplies: [
      { text: 'Tôi có kết quả "Nguy cơ cao"', payload: 'RESULT_HIGH_RISK' },
      { text: 'Tôi có kết quả "Nguy cơ thấp"', payload: 'RESULT_LOW_RISK' },
      { text: 'Quay lại menu chính', payload: 'MAIN_MENU' },
    ],
  },
  RESULT_HIGH_RISK: {
    content: `Nếu kết quả dự đoán là "Nguy cơ cao", điều này có nghĩa là dựa trên các chỉ số bạn cung cấp, khả năng bạn mắc bệnh tiểu đường hoặc tiền tiểu đường là đáng kể.
    \n**Khuyến nghị:**
    \n1. **Tham khảo ý kiến bác sĩ:** Đây là bước quan trọng nhất. Bác sĩ sẽ chỉ định các xét nghiệm chuyên sâu (như HbA1c, đường huyết lúc đói, nghiệm pháp dung nạp glucose) để đưa ra chẩn đoán chính xác.
    \n2. **Thay đổi lối sống:** Bắt đầu ngay với chế độ ăn uống lành mạnh (giảm đường, tinh bột tinh chế, tăng rau xanh, chất xơ), tập thể dục đều đặn (ít nhất 30 phút/ngày, 5 ngày/tuần).
    \n3. **Kiểm soát cân nặng:** Giảm cân nếu bạn đang thừa cân hoặc béo phì.
    \n4. **Theo dõi đường huyết:** Nếu có thể, hãy theo dõi đường huyết tại nhà theo hướng dẫn của bác sĩ.
    \nĐừng quá lo lắng, phát hiện sớm và can thiệp kịp thời sẽ giúp bạn kiểm soát tốt tình hình.`,
    quickReplies: [
      { text: 'Tôi muốn kết nối bác sĩ', payload: 'CONNECT_DOCTOR' },
      { text: 'Tìm hiểu thêm về tiểu đường', payload: 'WHAT_IS_DIABETES' },
      { text: 'Quay lại menu chính', payload: 'MAIN_MENU' },
    ],
  },
  RESULT_LOW_RISK: {
    content: `Nếu kết quả dự đoán là "Nguy cơ thấp", điều này rất đáng mừng! Nó cho thấy các chỉ số sức khỏe của bạn hiện tại không cho thấy nguy cơ cao mắc bệnh tiểu đường.
    \n**Khuyến nghị:**
    \n1. **Duy trì lối sống lành mạnh:** Tiếp tục chế độ ăn uống cân bằng, tập thể dục đều đặn và kiểm soát cân nặng.
    \n2. **Kiểm tra định kỳ:** Dù nguy cơ thấp, bạn vẫn nên kiểm tra sức khỏe định kỳ, đặc biệt là đường huyết, để đảm bảo duy trì tình trạng tốt.
    \n3. **Tìm hiểu kiến thức:** Nắm vững kiến thức về tiểu đường để phòng ngừa hiệu quả hơn trong tương lai.`,
    quickReplies: [
      { text: 'Tìm hiểu thêm về tiểu đường', payload: 'WHAT_IS_DIABETES' },
      { text: 'Quay lại menu chính', payload: 'MAIN_MENU' },
    ],
  },
  WHAT_IS_DIABETES: {
    content: `Bệnh tiểu đường (hay đái tháo đường) là một bệnh mãn tính xảy ra khi tuyến tụy không sản xuất đủ insulin, hoặc khi cơ thể không thể sử dụng hiệu quả insulin mà nó sản xuất. Insulin là một hormone điều hòa đường huyết.
    \nCó hai loại tiểu đường chính:
    \n• **Tiểu đường Type 1:** Cơ thể không sản xuất insulin.
    \n• **Tiểu đường Type 2:** Cơ thể không sản xuất đủ insulin hoặc không sử dụng insulin hiệu quả. Đây là loại phổ biến nhất.
    \nCác triệu chứng phổ biến bao gồm khát nước nhiều, đi tiểu nhiều, đói liên tục, sụt cân không rõ nguyên nhân, mệt mỏi, và nhìn mờ.
    \nĐể tìm hiểu sâu hơn, bạn có thể đọc các bài viết chuyên sâu của chúng tôi tại trang Kiến thức.`,
    quickReplies: [
      { text: 'Bắt đầu dự đoán', payload: 'START_PREDICTION' },
      { text: 'Kết nối bác sĩ', payload: 'CONNECT_DOCTOR' },
      { text: 'Quay lại menu chính', payload: 'MAIN_MENU' },
    ],
  },
  CONNECT_DOCTOR: {
    content: `Bạn muốn kết nối với bác sĩ? Tôi sẽ kiểm tra xem có bác sĩ nào đang online và sẵn sàng tư vấn không.`,
    quickReplies: [], // No quick replies, will be replaced by modal or system message
  },
  MAIN_MENU: initialAiMessage, // Go back to initial message
  DEFAULT_RESPONSE: {
    content: `Xin lỗi, tôi chưa hiểu yêu cầu của bạn. Bạn có thể thử lại hoặc chọn một trong các tùy chọn dưới đây nhé.`,
    quickReplies: initialQuickReplies,
  },
  OUT_OF_HOURS_MESSAGE: `Diabetes Predictor đã nhận được yêu cầu hỗ trợ từ Quý khách, nhưng rất tiếc là thời gian hỗ trợ từ 8:00 - 22:00. Diabetes Predictor sẽ quay trở lại phục vụ Anh/Chị trong thời gian sớm nhất ạ.`,
};

// Mock doctors data (replace with actual API call in later stages)
export const mockDoctors = [
  {
    id: 'doc-1',
    name: 'BS.CKI Nguyễn Thị Hương',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenThiHuong',
    specialty: 'Nội tiết - Đái tháo đường',
    isOnline: true,
  },
  {
    id: 'doc-2',
    name: 'CN. Lê Minh Tuấn',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeMinhTuan',
    specialty: 'Chuyên gia Dinh dưỡng',
    isOnline: true,
  },
  {
    id: 'doc-3',
    name: 'TS.BS Phạm Đức Minh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamDucMinh',
    specialty: 'Tiến sĩ Nội tiết',
    isOnline: false, // Offline
  },
];