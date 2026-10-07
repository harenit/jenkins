import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

const PURCHASE_STAGES = ["Confirmed", "Packed", "Dispatched", "In Transit", "Out for Delivery", "Delivered"];

const DONATION_JOURNEY_STAGES = [
  "Donation Request Placed",
  "Delivery Partner Assigned",
  "Doorstep Pickup Completed",
  "Quality Checked at Hub",
  "Matched with Recipient Aspirant",
  "Out for Delivery to Student",
  "Delivered to Recipient",
];

function mapDonationToStageIndex(status = "") {
  const s = status.toLowerCase();
  if (s.includes("completed") || s.includes("delivered")) return 6;
  if (s.includes("out for delivery") || s.includes("transit")) return 5;
  if (s.includes("matched") || s.includes("claimed")) return 4;
  if (s.includes("checked") || s.includes("received")) return 3;
  if (s.includes("out for pickup") || s.includes("picked")) return 2;
  if (s.includes("scheduled") || s.includes("partner") || s.includes("approved")) return 1;
  return 0;
}

export default function OrdersPage() {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "donations" | "returns"

  // Return modal state
  const [activeModalOrder, setActiveModalOrder] = useState(null);
  const [requestType, setRequestType] = useState("return");
  const [reason, setReason] = useState("Course / Exam Completed");
  const [condition, setCondition] = useState("Gently Used");
  const [pickupAddress, setPickupAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState("");

  function load() {
    setLoading(true);
    Promise.all([api.listOrders(token), api.listCommerceRequests(token)])
      .then(([ordersData, reqsData]) => {
        setOrders(ordersData?.orders || []);
        setRequests(reqsData?.requests || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [token]);

  // Filter donations separately
  const donationPickups = requests.filter((r) => r.type === "donate");
  const otherReturns = requests.filter((r) => r.type !== "donate");

  function openReturnModal(order, type = "return") {
    setActiveModalOrder(order);
    setRequestType(type);
    setReason("Course / Exam Completed");
    setCondition("Gently Used");
    setPickupAddress(order.deliveryAddress || user?.address || "Campus Address");
    setContactPhone(user?.phone || "+91 9876543210");
    setNotes("");
    setModalSuccess("");
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    if (!activeModalOrder) return;
    setSubmitting(true);
    setError("");
    try {
      await api.createCommerceRequest(token, {
        orderId: activeModalOrder._id,
        productId: activeModalOrder.items?.[0]?.product?._id || activeModalOrder.items?.[0]?.product,
        type: requestType,
        reason,
        condition,
        pickupAddress,
        contactPhone,
        notes,
      });
      setModalSuccess(`Your ${requestType} request has been logged. Delivery team notified for doorstep pickup.`);
      load();
      setTimeout(() => {
        setActiveModalOrder(null);
        setModalSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <h1>{t("ordersTracking", "Orders & Tracking")}</h1>
            <p className="pc-page-subtitle">
              Live step-by-step tracking for your marketplace purchases and full doorstep-to-recipient journey for donated books.
            </p>
          </div>
        </header>

        {error && <div className="pc-form-error">{error}</div>}

        {/* TAB FILTER SWITCHER */}
        <div style={{ display: "flex", gap: 10, margin: "18px 0 24px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`pc-btn ${activeTab === "orders" ? "pc-btn-primary" : "pc-btn-outline"}`}
            onClick={() => setActiveTab("orders")}
            style={{ fontWeight: 600, padding: "8px 18px", fontSize: "14px" }}
          >
            📦 Orders Tracking ({orders.length})
          </button>
          <button
            type="button"
            className={`pc-btn ${activeTab === "donations" ? "pc-btn-primary" : "pc-btn-outline"}`}
            onClick={() => setActiveTab("donations")}
            style={{ fontWeight: 600, padding: "8px 18px", fontSize: "14px" }}
          >
            🎁 Donations Tracking ({donationPickups.length})
          </button>
          <button
            type="button"
            className={`pc-btn ${activeTab === "returns" ? "pc-btn-primary" : "pc-btn-outline"}`}
            onClick={() => setActiveTab("returns")}
            style={{ fontWeight: 600, padding: "8px 18px", fontSize: "14px" }}
          >
            ↩️ Return &amp; Resale Tracking ({otherReturns.length})
          </button>
        </div>

        {/* 1. ORDERS TRACKING TAB */}
        {activeTab === "orders" && (
          <div>
            <h2 style={{ fontSize: "18px", color: "var(--pc-text-dark)", marginBottom: 12 }}>
              📦 Purchase Orders &amp; Material Tracking ({orders.length})
            </h2>

            {loading ? (
              <p className="pc-card-note">Loading order tracking records…</p>
            ) : orders.length === 0 ? (
              <div className="pc-card pc-phase-note">
                <p>No orders placed yet. Browse the Marketplace to buy books or claim free donated materials.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 18 }}>
                {orders.map((order) => {
                  const stageIdx = PURCHASE_STAGES.indexOf(order.status);
                  const isFinal = stageIdx === PURCHASE_STAGES.length - 1;
                  return (
                    <div key={order._id} className="pc-card">
                      <div className="pc-progress-header">
                        <div>
                          <h3>Order #{order.trackingId}</h3>
                          <p className="pc-card-note">
                            Placed {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s) · Total: <strong>₹{order.total}</strong>
                          </p>
                          <p className="pc-card-note">
                            Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus}) · Carrier: <strong>{order.carrier}</strong> · ETA: <strong>{order.eta}</strong>
                          </p>
                        </div>
                        <span className="pc-badge pc-badge-success">{order.status}</span>
                      </div>

                      {/* Handover Verification OTP Card */}
                      <div
                        style={{
                          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                          border: "1.5px dashed #22c55e",
                          borderRadius: 10,
                          padding: "12px 18px",
                          marginTop: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.5px" }}>
                            🔐 Handover Verification OTP
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#166534" }}>
                            Share this secret 4-digit OTP with your delivery executive at doorstep to authenticate package delivery.
                          </p>
                        </div>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: 800,
                            letterSpacing: "4px",
                            color: "#15803d",
                            background: "#ffffff",
                            padding: "6px 14px",
                            borderRadius: 8,
                            border: "1px solid #86efac",
                            fontFamily: "monospace",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          }}
                        >
                          {order.verificationOtp || "4829"}
                        </div>
                      </div>

                      {/* Delivery Partner Contact Card */}
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: "12px 16px",
                          marginTop: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--pc-text-dark)" }}>
                            🚚 Delivery Partner: <strong>{order.deliveryPartnerName || "Ramesh Kumar (PrepCycle Logistics)"}</strong>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--pc-text-muted)", marginTop: 2 }}>
                            Vehicle: <strong>{order.deliveryPartnerVehicle || "TN 09 BX 4521 (Electric Van)"}</strong> · Destination: <strong>{order.deliveryAddress}</strong>
                          </div>
                        </div>
                        <a
                          href={`tel:${(order.deliveryPartnerPhone || "+919876543210").replace(/\s+/g, "")}`}
                          className="pc-btn pc-btn-small pc-btn-primary"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", fontWeight: 600 }}
                        >
                          📞 Call Delivery Partner ({order.deliveryPartnerPhone || "+91 98765 43210"})
                        </a>
                      </div>

                      {/* Visual Stage Timeline */}
                      <div className="pc-order-timeline" style={{ marginTop: 14 }}>
                        {PURCHASE_STAGES.map((stage, i) => (
                          <div key={stage} className={`pc-order-stage ${i <= stageIdx ? "done" : ""}`}>
                            <div className="pc-order-stage-dot" />
                            <div className="pc-order-stage-label">{stage}</div>
                          </div>
                        ))}
                      </div>

                      <div className="pc-order-items" style={{ marginTop: 12 }}>
                        {order.items.map((item, i) => (
                          <div key={i} className="pc-cart-row">
                            <span className="pc-cart-title">{item.title} × {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {!isFinal && <p className="pc-card-note" style={{ marginTop: 8 }}>Tracking updates live automatically.</p>}

                      {/* Return Request Button */}
                      {stageIdx >= 2 && (
                        <div className="pc-actions-row" style={{ marginTop: 12 }}>
                          <button
                            className="pc-btn pc-btn-outline pc-btn-small"
                            onClick={() => openReturnModal(order, "return")}
                          >
                            ↩️ Request Return / Exchange
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. DONATIONS TRACKING TAB */}
        {activeTab === "donations" && (
          <div>
            <h2 style={{ fontSize: "18px", color: "var(--pc-text-dark)", marginBottom: 12 }}>
              🎁 Donation Journey Tracking (Doorstep to Recipient) ({donationPickups.length})
            </h2>

            {donationPickups.length === 0 ? (
              <div className="pc-card pc-phase-note">
                <p>No active donation requests found. You can donate extra exam books via the Marketplace to support peer aspirants.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {donationPickups.map((don) => {
                  const stageIdx = mapDonationToStageIndex(don.status);
                  return (
                    <div key={don._id} className="pc-card" style={{ border: "1.5px solid #86efac", background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)" }}>
                      <div className="pc-progress-header">
                        <div>
                          <h3 style={{ color: "#166534" }}>
                            Donation Tracking #{don.trackingId || "PC-DON-REQ"}
                          </h3>
                          <p className="pc-card-note">
                            Item: <strong>{don.item?.title || "Study Material"}</strong> · Condition: <strong>{don.condition}</strong>
                          </p>
                          <p className="pc-card-note">
                            Pickup Address: <strong>{don.pickupAddress}</strong> · Contact: <strong>{don.contactPhone}</strong>
                          </p>
                        </div>
                        <span className="pc-badge pc-badge-success">{don.status}</span>
                      </div>

                      {/* Handover Verification OTP Card */}
                      <div
                        style={{
                          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                          border: "1.5px dashed #22c55e",
                          borderRadius: 10,
                          padding: "12px 18px",
                          marginTop: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.5px" }}>
                            🔐 Doorstep Handover Verification OTP
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#166534" }}>
                            Share this secret 4-digit code with the courier volunteer during doorstep pickup inspection.
                          </p>
                        </div>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: 800,
                            letterSpacing: "4px",
                            color: "#15803d",
                            background: "#ffffff",
                            padding: "6px 14px",
                            borderRadius: 8,
                            border: "1px solid #86efac",
                            fontFamily: "monospace",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          }}
                        >
                          {don.verificationOtp || "7392"}
                        </div>
                      </div>

                      {/* Delivery Executive Contact Card */}
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #bbf7d0",
                          borderRadius: 10,
                          padding: "12px 16px",
                          marginTop: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#166534" }}>
                            🚚 Assigned Logistics Officer: <strong>{don.deliveryPartnerName || "Ramesh Kumar (PrepCycle Logistics)"}</strong>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--pc-text-muted)", marginTop: 2 }}>
                            Vehicle: <strong>{don.deliveryPartnerVehicle || "TN 09 BX 4521 (Electric Van)"}</strong> · Role: <strong>PrepCycle Doorstep Verification Officer</strong>
                          </div>
                        </div>
                        <a
                          href={`tel:${(don.deliveryPartnerPhone || "+919876543210").replace(/\s+/g, "")}`}
                          className="pc-btn pc-btn-small pc-btn-primary"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", fontWeight: 600 }}
                        >
                          📞 Call Delivery Partner ({don.deliveryPartnerPhone || "+91 98765 43210"})
                        </a>
                      </div>

                      {/* Step-by-Step Donation Timeline */}
                      <div className="pc-order-timeline" style={{ marginTop: 16, overflowX: "auto" }}>
                        {DONATION_JOURNEY_STAGES.map((st, i) => (
                          <div key={st} className={`pc-order-stage ${i <= stageIdx ? "done" : ""}`}>
                            <div className="pc-order-stage-dot" />
                            <div className="pc-order-stage-label" style={{ fontSize: "10.5px" }}>{st}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#166534" }}>
                        <span>
                          🚚 Delivery courier: <strong>{don.deliveryPartnerName || "PrepCycle Student Logistics Volunteer"}</strong>
                        </span>
                        <span>
                          Recipient status: <strong>{stageIdx >= 4 ? "Matched with Aspirant in Need" : "In Pickup/Hub Verification"}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. RETURN & RESALE TRACKING TAB */}
        {activeTab === "returns" && (
          <div>
            <h2 style={{ fontSize: "18px", color: "var(--pc-text-dark)", marginBottom: 12 }}>
              ↩️ Return &amp; Resale Requests ({otherReturns.length})
            </h2>

            {otherReturns.length === 0 ? (
              <div className="pc-card pc-phase-note">
                <p>No active return or resale requests found. Eligible delivered orders can be submitted for return from the Orders Tracking tab.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {otherReturns.map((r) => (
                  <div key={r._id} className="pc-card">
                    <div className="pc-progress-header">
                      <div>
                        <h3>Request #{r.trackingId || "PC-RET"}</h3>
                        <p className="pc-card-note">
                          Type: <strong style={{ textTransform: "uppercase" }}>{r.type}</strong> · Item: <strong>{r.item?.title || "Item"}</strong> · Condition: <strong>{r.condition}</strong>
                        </p>
                        <p className="pc-card-note">
                          Reason: <strong>{r.reason}</strong> {r.expectedValue > 0 ? `· Expected Value: ₹${r.expectedValue}` : ""}
                        </p>
                      </div>
                      <span className="pc-badge pc-badge-success">{r.status}</span>
                    </div>

                    {/* Handover Verification OTP Card */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                        border: "1.5px dashed #22c55e",
                        borderRadius: 10,
                        padding: "12px 18px",
                        marginTop: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.5px" }}>
                          🔐 Handover Verification OTP
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#166534" }}>
                          Share this secret 4-digit code with the courier executive when handing over the book for return / resale inspection.
                        </p>
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: 800,
                          letterSpacing: "4px",
                          color: "#15803d",
                          background: "#ffffff",
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: "1px solid #86efac",
                          fontFamily: "monospace",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        {r.verificationOtp || "5813"}
                      </div>
                    </div>

                    {/* Delivery Partner Contact Card */}
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "12px 16px",
                        marginTop: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--pc-text-dark)" }}>
                          🚚 Pickup Partner: <strong>{r.deliveryPartnerName || "Ramesh Kumar (PrepCycle Logistics)"}</strong>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--pc-text-muted)", marginTop: 2 }}>
                          Vehicle: <strong>{r.deliveryPartnerVehicle || "TN 09 BX 4521 (Electric Van)"}</strong> · Pickup Address: <strong>{r.pickupAddress || "On file"}</strong>
                        </div>
                      </div>
                      <a
                        href={`tel:${(r.deliveryPartnerPhone || "+919876543210").replace(/\s+/g, "")}`}
                        className="pc-btn pc-btn-small pc-btn-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", fontWeight: 600 }}
                      >
                        📞 Call Delivery Partner ({r.deliveryPartnerPhone || "+91 98765 43210"})
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RETURN MODAL */}
        {activeModalOrder && (
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
            <div className="pc-card" style={{ maxWidth: 520, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
              <div className="pc-progress-header">
                <h3>↩️ Request Return or Exchange</h3>
                <button
                  type="button"
                  onClick={() => setActiveModalOrder(null)}
                  style={{ border: 0, background: "none", fontSize: 22, cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              {modalSuccess ? (
                <div className="pc-badge pc-badge-success" style={{ padding: "16px", display: "block", textAlign: "center", margin: "16px 0" }}>
                  {modalSuccess}
                </div>
              ) : (
                <form className="pc-form" onSubmit={handleModalSubmit}>
                  <label>
                    Item to Return
                    <input
                      readOnly
                      value={activeModalOrder.items?.[0]?.title || "Study Material"}
                      style={{ background: "#f8fafc" }}
                    />
                  </label>

                  <label>
                    Reason for Return
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="Course / Exam Completed">Course / Exam Completed</option>
                      <option value="Wrong Book / Edition Received">Wrong Book / Edition Received</option>
                      <option value="Physical Damage / Missing Pages">Physical Damage / Missing Pages</option>
                      <option value="Changed Exam Focus">Changed Exam Focus</option>
                      <option value="Other / Duplicate Material">Other / Duplicate Material</option>
                    </select>
                  </label>

                  <label>
                    Item Condition
                    <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                      <option value="Brand New">Brand New (Unused)</option>
                      <option value="Like New">Like New (Clean pages)</option>
                      <option value="Gently Used">Gently Used (Minor highlights)</option>
                      <option value="Worn Out">Worn Out (Readable)</option>
                      <option value="Damaged">Damaged / Missing Content</option>
                    </select>
                  </label>

                  <label>
                    Doorstep Pickup Address
                    <input
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                    />
                  </label>

                  <label>
                    Contact Phone
                    <input
                      required
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </label>

                  <label>
                    Additional Return Notes
                    <textarea
                      rows="2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Please arrange pickup after 4 PM."
                    />
                  </label>

                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button type="submit" className="pc-btn pc-btn-primary" disabled={submitting}>
                      {submitting ? "Submitting…" : "Schedule Pickup"}
                    </button>
                    <button
                      type="button"
                      className="pc-btn pc-btn-outline"
                      onClick={() => setActiveModalOrder(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
