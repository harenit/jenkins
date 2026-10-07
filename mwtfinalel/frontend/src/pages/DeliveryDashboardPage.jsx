import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

const STAGES = ["Dispatched", "In Transit", "Out for Delivery", "Delivered"];

export default function DeliveryDashboardPage() {
  const { token, user, logout } = useAuth();
  const { lang, setLang, t, supportedLanguages, localizeBookTitle } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview"); // overview, assigned, pickups, history
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmOtpModal, setConfirmOtpModal] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [orderOtps, setOrderOtps] = useState({});
  const [pickupOtps, setPickupOtps] = useState({});

  const load = () => {
    setLoading(true);
    Promise.all([api.deliveryOrders(token), api.deliveryReturns(token)])
      .then(([a, b]) => {
        setOrders(a.orders || []);
        setReturns(b.requests || []);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [token]);

  async function setOrderStatus(id, status, otp = "") {
    try {
      await api.deliverySetStatus(token, id, status, otp);
      setActionSuccess(`Order status updated to "${status}" successfully!`);
      setTimeout(() => setActionSuccess(""), 3500);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDirectOtpDelivery(order, otp) {
    if (!otp || !otp.trim()) {
      setError(`Please enter the 4-digit OTP provided by ${order.user?.name || "customer"} to verify delivery.`);
      return;
    }
    setError("");
    try {
      await api.deliverySetStatus(token, order._id, "Delivered", otp.trim());
      setActionSuccess(`✓ Order #${order.trackingId} verified with OTP and marked as Delivered!`);
      setOrderOtps((prev) => ({ ...prev, [order._id]: "" }));
      setTimeout(() => setActionSuccess(""), 4000);
      load();
    } catch (e) {
      setError(e.message || "Failed to verify delivery. Check OTP with student and try again.");
    }
  }

  async function updatePickupStatus(id, status, otp = "") {
    try {
      await api.deliveryUpdateReturn(token, id, status, otp);
      setActionSuccess(`Pickup status updated to "${status}"!`);
      setTimeout(() => setActionSuccess(""), 3500);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDirectOtpPickup(request, otp) {
    if (!otp || !otp.trim()) {
      setError(`Please enter the 4-digit OTP provided by ${request.user?.name || "student"} to verify pickup.`);
      return;
    }
    setError("");
    try {
      await api.deliveryUpdateReturn(token, request._id, "Received", otp.trim());
      setActionSuccess(`✓ Pickup #${request.trackingId || "PC-PICKUP"} verified with OTP and marked as Received!`);
      setPickupOtps((prev) => ({ ...prev, [request._id]: "" }));
      setTimeout(() => setActionSuccess(""), 4000);
      load();
    } catch (e) {
      setError(e.message || "Failed to verify pickup OTP. Check code and try again.");
    }
  }

  async function handleDeliveryOtpConfirm(e) {
    e.preventDefault();
    if (!confirmOtpModal) return;
    try {
      await api.deliverySetStatus(token, confirmOtpModal._id, "Delivered", enteredOtp.trim());
      setActionSuccess(`✓ Order #${confirmOtpModal.trackingId} verified with OTP and marked as Delivered!`);
      setTimeout(() => setActionSuccess(""), 4000);
      setConfirmOtpModal(null);
      setEnteredOtp("");
      load();
    } catch (e) {
      setError(e.message || "Incorrect OTP entered. Please obtain code from student.");
    }
  }

  // Filtered lists
  const activeOrders = orders.filter((o) => o.status !== "Delivered");
  const completedOrders = orders.filter((o) => o.status === "Delivered");
  const pendingPickups = returns.filter((r) => !["Completed", "Rejected"].includes(r.status));
  const completedPickups = returns.filter((r) => ["Completed", "Received"].includes(r.status));

  const filterByQuery = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (item) =>
        item.trackingId?.toLowerCase().includes(q) ||
        item.user?.name?.toLowerCase().includes(q) ||
        item.user?.studentId?.toLowerCase().includes(q) ||
        item.deliveryAddress?.toLowerCase().includes(q) ||
        item.pickupAddress?.toLowerCase().includes(q) ||
        item.item?.title?.toLowerCase().includes(q)
    );
  };

  return (
    <div className="pc-app-shell">
      {/* SIDEBAR */}
      <aside className="pc-sidebar">
        <div className="pc-sidebar-brand">
          <span className="pc-logo-dot" />PrepCycle
        </div>

        <div className="pc-sidebar-nav">
          <button
            type="button"
            className={`pc-sidebar-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            🚚 Dashboard Overview
          </button>
          <button
            type="button"
            className={`pc-sidebar-link ${activeTab === "assigned" ? "active" : ""}`}
            onClick={() => setActiveTab("assigned")}
          >
            📦 Assigned Orders {activeOrders.length > 0 && `(${activeOrders.length})`}
          </button>
          <button
            type="button"
            className={`pc-sidebar-link ${activeTab === "pickups" ? "active" : ""}`}
            onClick={() => setActiveTab("pickups")}
          >
            ↩️ Return &amp; Donation Pickups {pendingPickups.length > 0 && `(${pendingPickups.length})`}
          </button>
          <button
            type="button"
            className={`pc-sidebar-link ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            ✅ Completed Task History
          </button>
        </div>

        <div className="pc-sidebar-language" style={{ padding: "0 16px 12px" }}>
          <label htmlFor="pc-delivery-language" style={{ fontSize: "12px", display: "block", marginBottom: 4 }}>
            {t("language", "Language")}
          </label>
          <select
            id="pc-delivery-language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--pc-border)" }}
          >
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pc-sidebar-footer">
          <div className="pc-sidebar-user">
            <div className="pc-avatar">{user?.name?.[0] || "D"}</div>
            <div>
              <div className="pc-sidebar-user-name">{user?.name || "Delivery Agent"}</div>
              <div className="pc-sidebar-user-role">Delivery Partner · {user?.studentId || "PARTNER-01"}</div>
            </div>
          </div>
          <button className="pc-btn pc-btn-ghost pc-btn-small" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pc-main">
        <div className="pc-page">
          <header className="pc-page-header">
            <div>
              <h1>
                {activeTab === "overview" && "🚚 Delivery Partner Console"}
                {activeTab === "assigned" && "📦 Assigned Book Deliveries"}
                {activeTab === "pickups" && "↩️ Return & Donation Pickups"}
                {activeTab === "history" && "✅ Completed Delivery & Pickup Log"}
              </h1>
              <p className="pc-page-subtitle">
                Live delivery management, customer doorstep pickups, and package fulfillment for PrepCycle.
              </p>
            </div>
            <button className="pc-btn pc-btn-outline pc-btn-small" onClick={load} disabled={loading}>
              {loading ? "Refreshing…" : "🔄 Refresh Tasks"}
            </button>
          </header>

          {error && <div className="pc-form-error">{error}</div>}
          {actionSuccess && (
            <div className="pc-badge pc-badge-success" style={{ padding: "10px 14px", display: "block", marginBottom: 14 }}>
              {actionSuccess}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <div className="pc-grid pc-grid-4">
                <div className="pc-card">
                  <div style={{ fontSize: "24px", marginBottom: 6 }}>📦</div>
                  <h3 style={{ fontSize: "14px", color: "var(--pc-text-muted)" }}>Active Deliveries</h3>
                  <p className="pc-metric" style={{ fontSize: "28px", margin: "6px 0" }}>{activeOrders.length}</p>
                  <button className="pc-link-btn" onClick={() => setActiveTab("assigned")}>View assigned orders →</button>
                </div>

                <div className="pc-card">
                  <div style={{ fontSize: "24px", marginBottom: 6 }}>↩️</div>
                  <h3 style={{ fontSize: "14px", color: "var(--pc-text-muted)" }}>Pickups Scheduled</h3>
                  <p className="pc-metric" style={{ fontSize: "28px", margin: "6px 0" }}>{pendingPickups.length}</p>
                  <button className="pc-link-btn" onClick={() => setActiveTab("pickups")}>View pickup tasks →</button>
                </div>

                <div className="pc-card">
                  <div style={{ fontSize: "24px", marginBottom: 6 }}>✅</div>
                  <h3 style={{ fontSize: "14px", color: "var(--pc-text-muted)" }}>Completed Deliveries</h3>
                  <p className="pc-metric" style={{ fontSize: "28px", margin: "6px 0", color: "var(--pc-success)" }}>
                    {completedOrders.length}
                  </p>
                  <span className="pc-card-note">Verified fulfillment</span>
                </div>

                <div className="pc-card">
                  <div style={{ fontSize: "24px", marginBottom: 6 }}>💰</div>
                  <h3 style={{ fontSize: "14px", color: "var(--pc-text-muted)" }}>Daily Payout Estimate</h3>
                  <p className="pc-metric" style={{ fontSize: "28px", margin: "6px 0" }}>
                    ₹{(completedOrders.length * 45) + (completedPickups.length * 35)}
                  </p>
                  <span className="pc-card-note">₹45/drop · ₹35/pickup</span>
                </div>
              </div>

              {/* QUICK TASKS PREVIEW */}
              <div className="pc-card" style={{ marginTop: 20 }}>
                <div className="pc-progress-header">
                  <h3>Immediate Delivery Tasks ({activeOrders.length})</h3>
                  <button className="pc-link-btn" onClick={() => setActiveTab("assigned")}>View All</button>
                </div>
                {activeOrders.length === 0 ? (
                  <p className="pc-card-note">All assigned orders have been fulfilled! Great job.</p>
                ) : (
                  activeOrders.slice(0, 3).map((o) => (
                    <div key={o._id} className="pc-cart-row" style={{ padding: "12px 0", borderBottom: "1px solid var(--pc-border)" }}>
                      <div>
                        <strong>Order #{o.trackingId}</strong>
                        <div style={{ fontSize: "12px", color: "var(--pc-text-muted)", marginTop: 2 }}>
                          {o.user?.name} · {o.deliveryAddress}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span className="pc-badge">{o.status}</span>
                        <button className="pc-btn pc-btn-outline pc-btn-small" onClick={() => setActiveTab("assigned")}>
                          Open Task →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* TAB 2: ASSIGNED ORDERS */}
          {activeTab === "assigned" && (
            <>
              <div className="pc-filter-bar">
                <input
                  className="pc-search-input"
                  placeholder="Search by Tracking ID, customer, address…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {filterByQuery(activeOrders).length === 0 ? (
                <div className="pc-card pc-phase-note">
                  <p>No active deliveries currently match your criteria.</p>
                </div>
              ) : (
                filterByQuery(activeOrders).map((o) => {
                  const stageIdx = STAGES.indexOf(o.status);
                  const nextStage = STAGES[stageIdx + 1];

                  return (
                    <div className="pc-card" key={o._id}>
                      <div className="pc-progress-header" style={{ flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <h3>Order #{o.trackingId}</h3>
                          <p className="pc-card-note">
                            Customer: <strong>{o.user?.name}</strong> · Student ID: {o.user?.studentId || "—"}
                          </p>
                          <p className="pc-card-note">
                            📍 Delivery Address: <strong>{o.deliveryAddress}</strong>
                          </p>
                          <p className="pc-card-note">
                            Payment: {o.paymentMethod} ({o.paymentStatus}) · Order Total: ₹{o.total}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className="pc-badge pc-badge-success">{o.status}</span>
                          <div style={{ marginTop: 6 }}>
                            {o.user?.phone && (
                              <a
                                href={`tel:${o.user.phone}`}
                                className="pc-btn pc-btn-outline pc-btn-small"
                                style={{ display: "inline-block", textDecoration: "none" }}
                              >
                                📞 Call Customer ({o.user.phone})
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* STAGE TIMELINE */}
                      <div className="pc-order-timeline" style={{ margin: "16px 0" }}>
                        {STAGES.map((s, i) => (
                          <div key={s} className={`pc-order-stage ${stageIdx >= i ? "done" : ""}`}>
                            <div className="pc-order-stage-dot" />
                            <div className="pc-order-stage-label">{s}</div>
                          </div>
                        ))}
                      </div>

                      {/* ITEMS */}
                      <div className="pc-order-items" style={{ background: "rgba(0,0,0,0.02)", padding: 10, borderRadius: 10 }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: 6 }}>Package Contents:</div>
                        {o.items.map((it, i) => (
                          <div key={i} className="pc-cart-row">
                            <span style={{ fontSize: "13px" }}>📖 {localizeBookTitle(it.title)} × {it.quantity}</span>
                            <span style={{ fontSize: "13px" }}>₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* DOORSTEP OTP VERIFICATION CARD */}
                      <div
                        style={{
                          marginTop: 14,
                          padding: "12px 16px",
                          background: "#f0fdf4",
                          border: "1.5px dashed #22c55e",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>
                            🔐 Customer Handover Verification OTP
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#15803d", marginTop: 2 }}>
                            Ask the student for their 4-digit OTP to confirm delivery handover
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="text"
                            maxLength="6"
                            placeholder="4-digit OTP"
                            value={orderOtps[o._id] || ""}
                            onChange={(e) => setOrderOtps({ ...orderOtps, [o._id]: e.target.value })}
                            style={{
                              width: "120px",
                              padding: "7px 10px",
                              fontWeight: 800,
                              letterSpacing: "2px",
                              textAlign: "center",
                              border: "1.5px solid #86efac",
                              borderRadius: 6,
                              fontSize: "15px",
                              fontFamily: "monospace",
                            }}
                          />
                          <button
                            type="button"
                            className="pc-btn pc-btn-primary pc-btn-small"
                            style={{ background: "#16a34a", padding: "8px 14px", fontWeight: 700 }}
                            onClick={() => handleDirectOtpDelivery(o, orderOtps[o._id])}
                          >
                            ✓ Confirm Delivered
                          </button>
                        </div>
                      </div>

                      {/* DELIVERY STATUS ACTIONS */}
                      <div className="pc-actions-row" style={{ marginTop: 14, justifyContent: "flex-end", gap: 10 }}>
                        {nextStage && nextStage !== "Delivered" && (
                          <button
                            className="pc-btn pc-btn-outline pc-btn-small"
                            onClick={() => setOrderStatus(o._id, nextStage)}
                          >
                            Advance to {nextStage}
                          </button>
                        )}
                        <button
                          className="pc-btn pc-btn-primary pc-btn-small"
                          style={{ background: "var(--pc-success)" }}
                          onClick={() => setConfirmOtpModal(o)}
                        >
                          🔑 Enter OTP via Dialog
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 3: RETURN & DONATION PICKUPS */}
          {activeTab === "pickups" && (
            <>
              <div className="pc-filter-bar">
                <input
                  className="pc-search-input"
                  placeholder="Search pickups by ID, student, book…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {filterByQuery(pendingPickups).length === 0 ? (
                <div className="pc-card pc-phase-note">
                  <p>No pending return or donation pickups right now.</p>
                </div>
              ) : (
                filterByQuery(pendingPickups).map((r) => (
                  <div className="pc-card" key={r._id}>
                    <div className="pc-progress-header" style={{ flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <h3>Pickup #{r.trackingId || "PC-PICKUP"}</h3>
                          <span className="pc-badge" style={{ textTransform: "uppercase" }}>{r.type}</span>
                        </div>
                        <p className="pc-card-note">
                          Student: <strong>{r.user?.name}</strong> ({r.user?.studentId || "Student"})
                        </p>
                        <p className="pc-card-note">
                          📍 Pickup Address: <strong>{r.pickupAddress || "Student hostel / address"}</strong>
                        </p>
                        <p className="pc-card-note">
                          Item: <strong>{localizeBookTitle(r.item?.title || "Study Material")}</strong>
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span className="pc-badge pc-badge-success">{r.status}</span>
                        <div style={{ marginTop: 6 }}>
                          {r.contactPhone && (
                            <a
                              href={`tel:${r.contactPhone}`}
                              className="pc-btn pc-btn-outline pc-btn-small"
                              style={{ display: "inline-block", textDecoration: "none" }}
                            >
                              📞 Call Student ({r.contactPhone})
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12, background: "rgba(0,0,0,0.02)", padding: 12, borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--pc-text-muted)" }}>Declared Condition:</div>
                        <span className="pc-badge" style={{ background: "#eef2ff", color: "#3730a3", marginTop: 4 }}>
                          {r.condition || "Gently Used"}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--pc-text-muted)" }}>Reason for Return / Submission:</div>
                        <div style={{ fontSize: "13px", fontWeight: 600, marginTop: 4 }}>{r.reason || "—"}</div>
                      </div>
                    </div>

                    {/* DOORSTEP OTP VERIFICATION CARD FOR PICKUPS */}
                    <div
                      style={{
                        marginTop: 14,
                        padding: "12px 16px",
                        background: "#f0fdf4",
                        border: "1.5px dashed #22c55e",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>
                          🔐 Doorstep Handover Verification OTP
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#15803d", marginTop: 2 }}>
                          Enter student's 4-digit OTP to authenticate item collection
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="text"
                          maxLength="6"
                          placeholder="4-digit OTP"
                          value={pickupOtps[r._id] || ""}
                          onChange={(e) => setPickupOtps({ ...pickupOtps, [r._id]: e.target.value })}
                          style={{
                            width: "120px",
                            padding: "7px 10px",
                            fontWeight: 800,
                            letterSpacing: "2px",
                            textAlign: "center",
                            border: "1.5px solid #86efac",
                            borderRadius: 6,
                            fontSize: "15px",
                            fontFamily: "monospace",
                          }}
                        />
                        <button
                          type="button"
                          className="pc-btn pc-btn-primary pc-btn-small"
                          style={{ background: "#16a34a", padding: "8px 14px", fontWeight: 700 }}
                          onClick={() => handleDirectOtpPickup(r, pickupOtps[r._id])}
                        >
                          ✓ Confirm Collected
                        </button>
                      </div>
                    </div>

                    <div className="pc-actions-row" style={{ marginTop: 14, justifyContent: "flex-end", gap: 10 }}>
                      {r.status === "Pickup Scheduled" && (
                        <button
                          className="pc-btn pc-btn-outline pc-btn-small"
                          onClick={() => updatePickupStatus(r._id, "Out for Pickup")}
                        >
                          🚗 Out for Doorstep Pickup
                        </button>
                      )}
                      <button
                        className="pc-btn pc-btn-primary pc-btn-small"
                        onClick={() => updatePickupStatus(r._id, "Received")}
                      >
                        📦 Collect Item
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* TAB 4: COMPLETED HISTORY */}
          {activeTab === "history" && (
            <div className="pc-card">
              <h3>Fulfilled Tasks History ({completedOrders.length + completedPickups.length})</h3>
              <p className="pc-card-note">Verified book deliveries and completed doorstep pickups.</p>

              <table className="pc-table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Type</th>
                    <th>Customer / Student</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.map((o) => (
                    <tr key={o._id}>
                      <td><strong>{o.trackingId}</strong></td>
                      <td><span className="pc-badge" style={{ background: "#dcfce7", color: "#166534" }}>Delivery</span></td>
                      <td>{o.user?.name} ({o.user?.studentId || "—"})</td>
                      <td>{o.items.length} book(s) · ₹{o.total}</td>
                      <td><span className="pc-badge pc-badge-success">{o.status}</span></td>
                      <td>{new Date(o.updatedAt || o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {completedPickups.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.trackingId || "PC-RET"}</strong></td>
                      <td><span className="pc-badge">{p.type}</span></td>
                      <td>{p.user?.name} ({p.user?.studentId || "—"})</td>
                      <td>{p.item?.title} (Condition: {p.condition || "Gently Used"})</td>
                      <td><span className="pc-badge pc-badge-success">{p.status}</span></td>
                      <td>{new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* OTP CONFIRMATION MODAL */}
      {confirmOtpModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 16,
          }}
        >
          <div className="pc-card" style={{ maxWidth: 420, width: "100%" }}>
            <div className="pc-progress-header">
              <h3>Confirm Delivery Completion</h3>
              <button
                type="button"
                onClick={() => setConfirmOtpModal(null)}
                style={{ border: 0, background: "none", fontSize: 22, cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <p className="pc-card-note">Order #{confirmOtpModal.trackingId} for {confirmOtpModal.user?.name}</p>

            <form onSubmit={handleDeliveryOtpConfirm} className="pc-form" style={{ marginTop: 14 }}>
              <label>
                Customer Handover OTP / Confirmation Code
                <input
                  type="text"
                  required
                  placeholder="Enter 4-digit OTP or 'PASS'"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                />
              </label>

              <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="pc-btn pc-btn-ghost"
                  onClick={() => setConfirmOtpModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="pc-btn pc-btn-primary">
                  Confirm Handover &amp; Mark Delivered
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
