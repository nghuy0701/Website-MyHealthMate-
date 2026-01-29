export function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function parsePercent(input) {
  const s = String(input).toLowerCase();

  const m1 = s.match(/(\d{1,3})\s*%/);
  if (m1) return clamp01to100(Number(m1[1]));

  const m2 = s.match(/(\d{1,3})\s*(phần trăm|phan tram)/);
  if (m2) return clamp01to100(Number(m2[1]));

  const m3 = s.match(/\b(0?\.\d+)\b/);
  if (m3) {
    const v = Number(m3[1]);
    if (!Number.isNaN(v) && v >= 0 && v <= 1) return Math.round(v * 100);
  }

  const hasRiskKeyword = /(nguy cơ|ket qua|kết quả|risk|prob|probability|%)/.test(s);
  const m4 = s.match(/\b(\d{1,3})\b/);
  if (hasRiskKeyword && m4) return clamp01to100(Number(m4[1]));

  return null;
}

function clamp01to100(n) {
  if (Number.isNaN(n)) return null;
  return Math.min(100, Math.max(0, n));
}

export function riskExplain(percent) {
  if (percent === null || percent === undefined) return null;
  const p = Math.min(100, Math.max(0, Number(percent)));

  let level = "Thấp";
  let advice =
    "Nguy cơ hiện tại thấp. Duy trì lối sống lành mạnh và theo dõi sức khỏe định kỳ.";

  if (p >= 30 && p < 60) {
    level = "Trung bình";
    advice =
      "Nguy cơ trung bình. Nên theo dõi chỉ số đường huyết/HbA1c (nếu có), cải thiện lối sống, cân nhắc kiểm tra y tế nếu có triệu chứng.";
  }
  if (p >= 60) {
    level = "Cao";
    advice =
      "Nguy cơ cao. Nên kiểm tra y tế (đường huyết đói, HbA1c...) và/hoặc tư vấn bác sĩ để được đánh giá chính xác.";
  }

  return `Kết quả ${p}% là xác suất/độ tin cậy dự đoán nguy cơ từ mô hình, không phải chẩn đoán chắc chắn. Mức: ${level}.\n\nGợi ý: ${advice}`;
}
