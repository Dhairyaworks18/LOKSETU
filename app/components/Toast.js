"use client";

import { useState, useEffect } from "react";

const VARIANT_STYLES = {
    warning: { borderColor: "#e8521a", icon: "⚠️", progressColor: "#e8521a" },
    success: { borderColor: "#0f4a35", icon: "✅", progressColor: "#0f4a35" },
    error: { borderColor: "#dc2626", icon: "❌", progressColor: "#dc2626" },
    info: { borderColor: "#2563eb", icon: "ℹ️", progressColor: "#2563eb" },
};

export function Toast({ id, type = "info", title, message, onClose }) {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);
    const variant = VARIANT_STYLES[type] || VARIANT_STYLES.info;

    useEffect(() => {
        // Trigger slide-in animation
        const show = setTimeout(() => setVisible(true), 10);

        // Progress bar countdown
        const start = Date.now();
        const duration = 4000;
        const tick = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining === 0) clearInterval(tick);
        }, 30);

        return () => {
            clearTimeout(show);
            clearInterval(tick);
        };
    }, []);

    return (
        <div
            style={{
                position: "relative",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                borderLeft: `4px solid ${variant.borderColor}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                padding: "16px 16px 20px",
                minWidth: "320px",
                maxWidth: "400px",
                overflow: "hidden",
                transform: visible ? "translateX(0)" : "translateX(110%)",
                opacity: visible ? 1 : 0,
                transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
            }}
        >
            {/* Icon */}
            <span style={{ fontSize: "20px", lineHeight: 1, flexShrink: 0, marginTop: "1px" }}>
                {variant.icon}
            </span>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: "0 0 4px 0",
                    fontFamily: '"Syne", "font-sora", sans-serif',
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#111827",
                    lineHeight: 1.3,
                }}>
                    {title}
                </p>
                <p style={{
                    margin: 0,
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 400,
                    fontSize: "13px",
                    color: "#4b5563",
                    lineHeight: 1.5,
                }}>
                    {message}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: "16px",
                    padding: "0",
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: "1px",
                    transition: "color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#374151")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}
                aria-label="Close notification"
            >
                ✕
            </button>

            {/* Progress Bar */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: "3px",
                backgroundColor: "#f3f4f6",
                right: 0,
            }}>
                <div style={{
                    height: "100%",
                    width: `${progress}%`,
                    backgroundColor: variant.borderColor,
                    transition: "width 0.03s linear",
                    borderRadius: "0 0 0 12px",
                }} />
            </div>
        </div>
    );
}

export function ToastContainer({ toasts, onRemove }) {
    return (
        <div style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "flex-end",
            pointerEvents: "none",
        }}>
            {toasts.map((t) => (
                <div key={t.id} style={{ pointerEvents: "auto" }}>
                    <Toast {...t} onClose={() => onRemove(t.id)} />
                </div>
            ))}
        </div>
    );
}
