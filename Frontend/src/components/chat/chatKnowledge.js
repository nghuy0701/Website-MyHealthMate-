export const DEFAULT_WELCOME =
  "Xin chào! Mình là AI tư vấn của Diabetes Predictor. Bạn muốn tìm hiểu gì hôm nay?";

export function diabetesWhatIsText() {
  return (
    "✅ Bệnh tiểu đường (đái tháo đường) là tình trạng cơ thể không kiểm soát tốt lượng đường trong máu do **thiếu insulin** hoặc **insulin hoạt động không hiệu quả**, khiến **đường huyết tăng cao trong thời gian dài**.\n\n" +
    "Các loại tiểu đường thường gặp:\n" +
    "• Loại 1: cơ thể gần như không tự sản xuất insulin.\n" +
    "• Loại 2: cơ thể vẫn có insulin nhưng sử dụng kém hiệu quả (phổ biến nhất).\n\n" +
    "Nếu không được kiểm soát tốt, tiểu đường có thể ảnh hưởng đến tim mạch, thận, mắt và thần kinh.\n\n" +
    "👉 Mình có thể giúp bạn nhận biết dấu hiệu sớm hoặc hướng dẫn dự đoán nguy cơ mắc bệnh nếu bạn muốn."
  );
}

export function howToKnowText() {
  return (
    "✅ Để biết nguy cơ, bạn có thể:\n" +
    "• Dùng chức năng Dự đoán trên hệ thống để ước tính nguy cơ từ các chỉ số.\n" +
    "• Nếu có điều kiện, kiểm tra y tế: đường huyết đói, **HbA1c**...\n\n" +
    "Bạn muốn mình điều hướng bạn qua trang **Dự đoán không?"
  );
}

export const QUICK_REPLIES = [
  { key: "what", label: "❓ Bệnh tiểu đường là gì?" },
  { key: "how", label: "🩺 Làm sao biết mình mắc?" },
  { key: "percent", label: "📊 70%/80% có bị không?" },
  { key: "doctor", label: "👨‍⚕️ Kết nối bác sĩ" },
];
