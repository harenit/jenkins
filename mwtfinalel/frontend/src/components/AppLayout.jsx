import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import OwlMascot from "./Mascot/OwlMascot";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

export default function AppLayout({ children }) {
  const { user, token } = useAuth();
  const { lang, setLang, supportedLanguages, t } = useLanguage();
  const navigate = useNavigate();
  const [font, setFont] = useState(() => localStorage.getItem("prepcycle_font") || "medium");

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const prevNotifIdsRef = useRef(new Set());
  const notifMenuRef = useRef(null);

  const changeFont = (size) => {
    setFont(size);
    document.documentElement.dataset.font = size;
    localStorage.setItem("prepcycle_font", size);
  };

  useEffect(() => {
    document.documentElement.dataset.font = font;
  }, [font]);

  // Real-time notification polling (every 3.5s)
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const pollNotifications = () => {
      api
        .getNotifications(token)
        .then((data) => {
          if (!isMounted) return;
          const list = data.notifications || [];
          setNotifications(list);
          setUnreadCount(data.unreadCount || 0);

          // Check if there is a new unread message/notification not seen in previous poll
          const unreadList = list.filter((n) => !n.read);
          const newItems = unreadList.filter((n) => !prevNotifIdsRef.current.has(n._id));

          if (newItems.length > 0 && prevNotifIdsRef.current.size > 0) {
            // Trigger toast notification popup for the newest notification
            const newest = newItems[0];
            setActiveToast(newest);
            // Auto-hide toast after 7 seconds
            setTimeout(() => {
              setActiveToast((cur) => (cur?._id === newest._id ? null : cur));
            }, 7000);
          }

          // Update tracked IDs
          list.forEach((n) => prevNotifIdsRef.current.add(n._id));
        })
        .catch(() => {});
    };

    pollNotifications();
    const interval = setInterval(pollNotifications, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token]);

  // Close notification menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNotificationClick(notif) {
    if (!notif.read) {
      await api.markNotificationRead(token, notif._id).catch(() => {});
      setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setShowNotifMenu(false);
    setActiveToast(null);
    if (notif.link) {
      navigate(notif.link);
    }
  }

  async function handleMarkAllRead() {
    await api.markAllNotificationsRead(token).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  return (
    <div className="pc-app-shell">
      <Sidebar />
      <main className="pc-main" style={{ position: "relative" }}>
        {/* REAL-TIME NOTIFICATION POPUP TOAST BANNER */}
        {activeToast && (
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 24,
              zIndex: 999999,
              maxWidth: "380px",
              width: "calc(100vw - 48px)",
              background: "var(--pc-card, #ffffff)",
              border: "2px solid #3b82f6",
              borderRadius: 16,
              boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.35)",
              padding: "16px 18px",
              animation: "pcSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#dbeafe",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              💬
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "14px", color: "var(--pc-text, #0f172a)" }}>
                  {activeToast.title}
                </strong>
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    color: "var(--pc-text-muted, #94a3b8)",
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              <p
                style={{
                  fontSize: "13px",
                  color: "var(--pc-text-muted, #475569)",
                  margin: "4px 0 10px",
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                }}
              >
                {activeToast.body}
              </p>

              <button
                type="button"
                className="pc-btn pc-btn-primary pc-btn-small"
                onClick={() => handleNotificationClick(activeToast)}
                style={{ padding: "5px 12px", fontSize: "12px", fontWeight: 700 }}
              >
                Open Message →
              </button>
            </div>
          </div>
        )}

        {/* Top Global Utility Bar: Language, Font Controls, and Notifications */}
        <div
          data-tour="top-utility-bar"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
            padding: "8px 16px",
            background: "var(--pc-surface)",
            borderRadius: 12,
            border: "1px solid var(--pc-border)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          {/* Notification Bell & Dropdown */}
          <div ref={notifMenuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowNotifMenu((s) => !s)}
              className="pc-btn pc-btn-outline pc-btn-small"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                height: 28,
                padding: "4px 10px",
                fontSize: "13px",
              }}
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "10.5px",
                    fontWeight: 800,
                    padding: "1px 6px",
                    borderRadius: "10px",
                    lineHeight: "14px",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "36px",
                  right: 0,
                  width: "340px",
                  maxHeight: "420px",
                  background: "var(--pc-card, #ffffff)",
                  borderRadius: "14px",
                  border: "1px solid var(--pc-border, #e2e8f0)",
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.25)",
                  zIndex: 99999,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--pc-border, #e2e8f0)",
                    background: "var(--pc-surface, #f8fafc)",
                  }}
                >
                  <strong style={{ fontSize: "14px", color: "var(--pc-text)" }}>
                    Notifications {unreadCount > 0 ? `(${unreadCount} new)` : ""}
                  </strong>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="pc-link-btn"
                      onClick={handleMarkAllRead}
                      style={{ fontSize: "11.5px", color: "var(--pc-primary)", fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                  {notifications.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--pc-text-muted)", fontSize: "13px", padding: "24px 16px", margin: 0 }}>
                      No notifications right now.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: "10px 16px",
                          borderBottom: "1px solid var(--pc-border, #f1f5f9)",
                          cursor: "pointer",
                          background: n.read ? "transparent" : "rgba(37, 99, 235, 0.05)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", fontWeight: n.read ? 600 : 700, color: "var(--pc-text)" }}>
                            {n.title}
                          </span>
                          {!n.read && (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#3b82f6",
                                display: "inline-block",
                              }}
                            />
                          )}
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--pc-text-muted)", margin: "4px 0 0", lineHeight: 1.4 }}>
                          {n.body}
                        </p>
                        <small style={{ fontSize: "10px", color: "var(--pc-text-muted)", opacity: 0.7 }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Font Size Quick Toggles */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--pc-text-muted)" }}>
              {t("fontSize", "Font Size")}:
            </span>
            {[
              ["small", "A-", "Small"],
              ["medium", "A", "Normal"],
              ["large", "A+", "Large"],
              ["xlarge", "A++", "Extra Large"],
            ].map(([val, label, title]) => (
              <button
                key={val}
                type="button"
                title={title}
                onClick={() => changeFont(val)}
                className={`pc-btn pc-btn-small ${font === val ? "pc-btn-primary" : "pc-btn-outline"}`}
                style={{ padding: "4px 9px", fontSize: "11px", minWidth: 28, height: 28 }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Global Language Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "14px" }}>🌐</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                border: "1px solid var(--pc-border)",
                fontSize: "12.5px",
                background: "var(--pc-bg)",
                color: "var(--pc-text)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {children}
      </main>
      {user?.role === "student" && <OwlMascot />}
    </div>
  );
}
