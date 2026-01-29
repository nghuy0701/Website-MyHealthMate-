import React from "react";

export default function DoctorSelectModal({
  open,
  doctors,
  onClose,
  onSelect,
  zIndex = 10001,
}) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          right: 24,
          bottom: 24 + 56 + 10,
          width: 360,
          zIndex: zIndex + 1,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 900, color: "#0f172a" }}>Kết nối bác sĩ</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "auto",
              border: "none",
              background: "#f1f5f9",
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

        {/* List */}
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {doctors.map((d) => {
            const disabled = !d.online;

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => !disabled && onSelect(d)}
                disabled={disabled}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 12,
                  background: disabled ? "#f8fafc" : "white",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.6 : 1,
                }}
                aria-disabled={disabled}
                title={disabled ? "Bác sĩ đang offline" : "Chọn để tư vấn"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 900, color: "#0f172a" }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{d.spec}</div>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: d.online ? "#16a34a" : "#94a3b8",
                      alignSelf: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: d.online ? "#22c55e" : "#cbd5e1",
                        display: "inline-block",
                      }}
                    />
                    {d.online ? "Online" : "Offline"}
                  </div>
                </div>

                {/* Hint nhỏ */}
                {!disabled && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#166534", fontWeight: 800 }}>
                    Nhấn để chuyển sang trang Tư vấn
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
