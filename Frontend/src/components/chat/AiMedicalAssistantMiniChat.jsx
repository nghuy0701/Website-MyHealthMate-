import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DoctorSelectModal from "./DoctorSelectModal";
import { TypingIndicator } from "./TypingIndicator";
import { makeId, parsePercent, riskExplain } from "./chatUtils";
import {
  DEFAULT_WELCOME,
  QUICK_REPLIES,
  diabetesWhatIsText,
  howToKnowText,
} from "./chatKnowledge";

const WIDGET_WIDTH = 480;
const WIDGET_HEIGHT = 560;
const PREDICT_PATH = "/du-doan";

// ✅ Trang tư vấn
const CONSULT_PATH = "/chat";

const DOCTORS = [
  { id: "noi", name: "BS. An", spec: "Nội tổng quát", online: true },
  { id: "tim", name: "BS. Bình", spec: "Tim mạch", online: true },
  { id: "da", name: "BS. Chi", spec: "Da liễu", online: false },
  { id: "nhi", name: "BS. Dũng", spec: "Nhi khoa", online: true },
];

const OUT_OF_HOURS_MESSAGE =
  "📩 **MyHealthMate Chat đã nhận được yêu cầu hỗ trợ từ Quý khách!**\n\n" +
  "⏰ Hiện tại đang **ngoài thời gian làm việc (8:00 – 22:00 hàng ngày)**, Dược sĩ/Bác sĩ sẽ quay lại hỗ trợ Quý khách trong thời gian sớm nhất.\n\n" +
  "🙏 Rất mong Quý khách thông cảm vì sự bất tiện này.\n" +
  "Xin trân trọng cảm ơn!";

// ✅ Giờ làm việc: 08:00 - 22:00 (mỗi ngày)
function isWorkingHour() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 8 && hour < 22;
}

function chipStyle() {
  return {
    width: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    border: "1px solid #bbf7d0",
    background: "#ffffff",
    color: "#0f172a",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

export function AiMedicalAssistantMiniChat() {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // ✅ AI typing
  const [isAITyping, setIsAITyping] = useState(false);

  const [messages, setMessages] = useState(() => [
    { id: "welcome", from: "assistant", type: "text", text: DEFAULT_WELCOME },
  ]);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const zWidget = 9999;
  const zFab = 10000;
  const zModal = 10001;

  const widgetStyle = useMemo(() => ({ width: `${WIDGET_WIDTH}px` }), []);

  const goToPredict = () => {
    window.location.href = PREDICT_PATH;
  };

  // ✅ Chuyển sang trang tư vấn + truyền doctorId
  const goToConsult = (doctorId) => {
    const url = `${CONSULT_PATH}?doctorId=${encodeURIComponent(doctorId)}`;
    window.location.href = url;
  };

  // Ensure render only on client (safe for SSR/hydration)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ESC close
  useEffect(() => {
    if (!isOpen && !isDoctorModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDoctorModalOpen(false);
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isDoctorModalOpen]);

  // focus input
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus?.(), 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  // scroll bottom (only inside message list)
  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isOpen, isAITyping]);

  const pushAssistant = (payload) =>
    setMessages((prev) => [...prev, { id: makeId(), from: "assistant", ...payload }]);

  const pushUserText = (text) =>
    setMessages((prev) => [...prev, { id: makeId(), from: "user", type: "text", text }]);

  // ✅ helper: AI typing rồi mới trả lời
  const pushAssistantWithTyping = (payload, delay = 800) => {
    setIsAITyping(true);
    setTimeout(() => {
      setIsAITyping(false);
      pushAssistant(payload);
    }, delay);
  };

  const answerDiabetesWhatIs = () => {
    pushAssistantWithTyping({ type: "text", text: diabetesWhatIsText() }, 900);
  };

  const answerHowKnow = () => {
    pushAssistantWithTyping(
      {
        type: "actions",
        text: howToKnowText(),
        actions: [{ key: "go-predict", label: "Đi tới Dự đoán", onClick: goToPredict }],
      },
      850
    );
  };

  const answerPercent = (p) => {
    const explain = riskExplain(p);
    pushAssistantWithTyping(
      {
        type: "actions",
        text: `${explain}\n\nBạn muốn mình hướng dẫn cách nhập dữ liệu để dự đoán lại không?`,
        actions: [
          { key: "go-predict", label: "Đi tới Dự đoán", onClick: goToPredict },
          {
            key: "connect-doc",
            label: "Tư vấn bác sĩ",
            onClick: () => setIsDoctorModalOpen(true),
          },
        ],
      },
      900
    );
  };

  const openDoctors = () => {
    pushAssistantWithTyping(
      {
        type: "text",
        text: "👨‍⚕️ Bạn hãy chọn **bác sĩ đang online** để chuyển sang trang Tư vấn.",
      },
      650
    );
    setTimeout(() => setIsDoctorModalOpen(true), 680);
  };

  const handleQuick = (key) => {
    if (key === "what") {
      pushUserText("Bệnh tiểu đường là gì?");
      answerDiabetesWhatIs();
      return;
    }
    if (key === "how") {
      pushUserText("Làm sao biết mình mắc tiểu đường?");
      answerHowKnow();
      return;
    }
    if (key === "percent") {
      pushUserText("70% có bị tiểu đường không?");
      answerPercent(70);
      return;
    }
    if (key === "doctor") {
      pushUserText("Tư vấn bác sĩ");
      openDoctors();
      return;
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    pushUserText(text);
    setMessage("");

    const p = parsePercent(text);
    if (p !== null) {
      answerPercent(p);
      return;
    }

    const lower = text.toLowerCase();
    if (lower.includes("tiểu đường là gì") || lower.includes("tieu duong la gi")) {
      answerDiabetesWhatIs();
      return;
    }

    if (
      lower.includes("làm thế nào") ||
      lower.includes("lam the nao") ||
      lower.includes("biết mình")
    ) {
      answerHowKnow();
      return;
    }

    // ✅ user muốn tư vấn bác sĩ -> mở modal chọn bác sĩ
    if (
      lower.includes("tư vấn") ||
      lower.includes("tu van") ||
      lower.includes("bác sĩ") ||
      lower.includes("bac si") ||
      lower.includes("kết nối") ||
      lower.includes("ket noi")
    ) {
      openDoctors();
      return;
    }

    pushAssistantWithTyping(
      { type: "text", text: "Chào bạn! Không biết mình có thể hỗ trợ bạn gì không?" },
      650
    );
  };

  // ✅ chọn bác sĩ online -> nếu ngoài giờ thì KHÔNG chuyển trang, báo ngay
  const selectDoctor = (d) => {
    if (!d?.online) {
      pushAssistantWithTyping(
        {
          type: "text",
          text: `⛔ **${d?.name || "Bác sĩ"}** hiện đang **offline**. Bạn chọn bác sĩ khác đang online nhé.`,
        },
        550
      );
      return;
    }

    // ❌ ngoài giờ
    if (!isWorkingHour()) {
      setIsDoctorModalOpen(false);
      pushAssistantWithTyping({ type: "text", text: OUT_OF_HOURS_MESSAGE }, 850);
      return;
    }

    // ✅ trong giờ
    setIsDoctorModalOpen(false);

    pushAssistantWithTyping(
      {
        type: "text",
        text: `✅ Đang chuyển bạn tới trang **Tư vấn** với **${d.name} (${d.spec})**...`,
      },
      650
    );

    setTimeout(() => goToConsult(d.id), 750);
  };

  const renderMsg = (m) => {
    const isUser = m.from === "user";
    const bubble = {
      maxWidth: "85%",
      borderRadius: 16,
      padding: "8px 12px",
      fontSize: 14,
      lineHeight: "20px",
      whiteSpace: "pre-line",
      background: isUser ? "#16a34a" : "#ffffff",
      color: isUser ? "#fff" : "#0f172a",
      border: isUser ? "none" : "1px solid #e2e8f0",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    };

    return (
      <div
        key={m.id}
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
        }}
      >
        <div style={bubble}>
          {m.text}
          {m.type === "actions" && Array.isArray(m.actions) && m.actions.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {m.actions.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={a.onClick}
                  style={{
                    width: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 999,
                    border: "1px solid #bbf7d0",
                    background: "#f0fdf4",
                    color: "#166534",
                    padding: "6px 10px",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ui = (
    <>
      {/* Widget */}
      <div
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: zWidget,
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          background: "white",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          ...widgetStyle,
          display: isOpen ? "flex" : "none",
          flexDirection: "column",
          height: WIDGET_HEIGHT,
        }}
      >
        {/* Header */}
        <div
          style={{
            flex: "0 0 auto",
            height: 44,
            background: "#16a34a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
          }}
        >
          <div style={{ color: "white", fontWeight: 900, fontSize: 13 }}>
            MyHealthMate Chat
            <div style={{ fontWeight: 500, fontSize: 11, opacity: 0.9 }}>
              Trợ lý y tế ảo (beta)
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              width: "auto",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "white",
              borderRadius: 999,
              padding: "6px 10px",
              cursor: "pointer",
              fontWeight: 900,
            }}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            background: "#f8fafc",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* Messages */}
          <div
            ref={listRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map(renderMsg)}
            {isAITyping && <TypingIndicator senderName="AI" />}
          </div>

          {/* Quick replies */}
          <div
            style={{
              flex: "0 0 auto",
              padding: "0 12px 10px",
              display: "flex",
              gap: 10,
              overflowX: "auto",
            }}
          >
            {QUICK_REPLIES.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => handleQuick(q.key)}
                style={chipStyle()}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            style={{
              flex: "0 0 auto",
              borderTop: "1px solid #e2e8f0",
              padding: 10,
              background: "white",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                style={{
                  flex: 1,
                  borderRadius: 999,
                  border: "1px solid #e2e8f0",
                  padding: "10px 12px",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: "none",
                  background: "#16a34a",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
                aria-label="Gửi"
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Doctor modal */}
      <DoctorSelectModal
        open={isDoctorModalOpen}
        doctors={DOCTORS}
        onClose={() => setIsDoctorModalOpen(false)}
        onSelect={selectDoctor}
        zIndex={zModal}
      />

      {/* FAB when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Mở chat"
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: zFab,
            width: 52,
            height: 52,
            borderRadius: 999,
            border: "none",
            background: "#0cac07",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
            fontWeight: 900,
          }}
        >
          💬
        </button>
      )}
    </>
  );

  if (!isClient) return null;
  if (typeof document === "undefined" || !document.body) return null;

  return createPortal(ui, document.body);
}
