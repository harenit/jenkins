import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function CheckoutPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api.getCart(token).then(setCart).catch((err) => setError(err.message));
  }, [token]);

  async function handlePlaceOrder() {
    if (!address.trim()) {
      setError("Enter a delivery address.");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const { order } = await api.checkout(token, { paymentMethod, deliveryAddress: address });
      navigate("/orders", { state: { justPlaced: order._id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <h1>Checkout</h1>
            <p className="pc-page-subtitle">Choose your payment method and delivery details.</p>
          </div>
        </header>

        <div className="pc-card">
          <h3>Order summary</h3>
          {cart.items.map((item) => (
            <div key={item.product.id} className="pc-cart-row">
              <span className="pc-cart-title">{item.product.title} × {item.quantity}</span>
              <span>₹{item.subtotal}</span>
            </div>
          ))}
          <div className="pc-cart-total">Total: ₹{cart.total}</div>
        </div>

        <div className="pc-card pc-form" style={{ maxWidth: 480 }}>
          <h3>Delivery information</h3>
          <label>
            Delivery address
            <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat, street, city, PIN code" />
          </label>
          <label>
            Payment method
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option>Cash on Delivery</option>
              <option>UPI</option>
              <option>Google Pay</option>
              <option>Credit / Debit Card</option>
              <option>Net Banking</option>
            </select>
          </label>
          {error && <div className="pc-form-error">{error}</div>}
          <button className="pc-btn pc-btn-primary pc-btn-full" onClick={handlePlaceOrder} disabled={placing || cart.items.length === 0}>
            {placing ? "Placing order…" : `Place order — ₹${cart.total}`}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
