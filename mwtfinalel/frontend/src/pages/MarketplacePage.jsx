import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

export default function MarketplacePage() {
  const { token, user } = useAuth();
  const { t, localizeBookTitle } = useLanguage();
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState("buy");
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [error, setError] = useState("");

  const SUB_TABS = [
    ["buy", t("buyBooks", "Buy Books")],
    ["notes-pdfs", t("notesAndPdfs", "Handwritten Notes & Shared PDFs")],
    ["donated", t("freeDonatedBooks", "Free Donated Books (₹0)")],
    ["my-sales", t("myBooksForSale", "My Books for Sale")],
    ["my-donations", t("myDonatedBooks", "My Donated Books")],
    ["sell", t("sellOrDonate", "Sell or Donate a Book")],
  ];

  function loadCart() {
    if (token) {
      api.getCart(token).then(setCart).catch((err) => setError(err.message));
    }
  }
  useEffect(loadCart, [token]);

  async function updateQty(productId, quantity) {
    try {
      await api.updateCartItem(token, productId, quantity);
      loadCart();
    } catch (err) {
      setError(err.message);
    }
  }
  async function removeItem(productId) {
    try {
      await api.removeFromCart(token, productId);
      loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <h1>{t("marketplace", "Marketplace")}</h1>
            <p className="pc-page-subtitle">
              {t("marketplaceSub", "Buy textbooks, claim free student-donated materials, sell completed books, or donate to aspirants.")}
            </p>
          </div>
          <button className="pc-btn pc-btn-outline" onClick={() => setShowCart((s) => !s)}>
            🛒 {t("cart", "Cart")} {cart.items.length > 0 && `(${cart.items.length})`}
          </button>
        </header>

        {error && <div className="pc-form-error">{error}</div>}

        {showCart ? (
          <div className="pc-card">
            <h3>{t("yourCart", "Your Cart")}</h3>
            {cart.items.length === 0 ? (
              <p className="pc-card-note">{t("cartEmpty", "Your cart is empty.")}</p>
            ) : (
              <>
                {cart.items.map((item) => (
                  <div key={item.product.id} className="pc-cart-row">
                    <span className="pc-cart-title">{localizeBookTitle(item.product.title)}</span>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQty(item.product.id, Number(e.target.value))}
                      className="pc-cart-qty"
                    />
                    <span>₹{item.subtotal}</span>
                    <button className="pc-link-btn" onClick={() => removeItem(item.product.id)}>
                      {t("remove", "Remove")}
                    </button>
                  </div>
                ))}
                <div className="pc-cart-total">{t("total", "Total")}: ₹{cart.total}</div>
                <button className="pc-btn pc-btn-primary" onClick={() => navigate("/checkout")}>
                  {t("proceedToCheckout", "Proceed to checkout")}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="pc-tab-switch pc-tab-switch-inline" style={{ overflowX: "auto" }}>
              {SUB_TABS.map(([key, label]) => (
                <button
                  key={key}
                  className={`pc-tab ${subTab === key ? "active" : ""}`}
                  onClick={() => setSubTab(key)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            {subTab === "buy" && <BuyBooksTab token={token} onCartChange={loadCart} />}
            {subTab === "notes-pdfs" && <NotesAndPdfsTab token={token} onCartChange={loadCart} />}
            {subTab === "donated" && <FreeDonatedBooksTab token={token} user={user} onClaimSuccess={() => setSubTab("my-donations")} />}
            {subTab === "my-sales" && <MyBooksForSaleTab token={token} />}
            {subTab === "my-donations" && <MyDonatedBooksTab token={token} />}
            {subTab === "sell" && <SellOrDonateForm token={token} onListed={() => setSubTab("my-sales")} onDonated={() => setSubTab("my-donations")} />}
          </>
        )}
      </div>
    </AppLayout>
  );
}

/* TAB 1: BUY BOOKS FOR SALE */
function BuyBooksTab({ token, onCartChange }) {
  const { localizeBookTitle, t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [examSlug, setExamSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("title");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  function load() {
    setLoading(true);
    api
      .listProducts({ search, examSlug: examSlug || undefined })
      .then((data) => setProducts(data.products || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, examSlug]);

  async function addToCart(productId) {
    try {
      await api.addToCart(token, productId, 1);
      onCartChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="pc-filter-bar">
        <input
          className="pc-search-input"
          placeholder={t("searchBooks", "Search books by title, author, or subject…")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="pc-search-input"
          placeholder="Filter by exam (e.g. gate-cse, neet-ug)"
          value={examSlug}
          onChange={(e) => setExamSlug(e.target.value)}
        />
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          <option value="title">Sort: Title</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </div>

      {error && <div className="pc-form-error">{error}</div>}

      {loading ? (
        <p className="pc-card-note">Loading marketplace catalog…</p>
      ) : products.length === 0 ? (
        <div className="pc-card pc-phase-note" style={{ textAlign: "center", padding: "30px 20px" }}>
          <p>No books currently available matching your search criteria.</p>
        </div>
      ) : (
        <div className="pc-grid pc-grid-3">
          {[...products]
            .sort((a, b) =>
              sort === "priceLow"
                ? a.price - b.price
                : sort === "priceHigh"
                ? b.price - a.price
                : (a.title || "").localeCompare(b.title || "")
            )
            .slice((page - 1) * pageSize, page * pageSize)
            .map((p) => (
              <div key={p._id} className="pc-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="pc-badge">{p.category || "Textbook"}</span>
                    {p.condition && (
                      <span className="pc-badge" style={{ background: "#eef2ff", color: "#3730a3" }}>
                        {p.condition}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: "10px 0 6px" }}>{localizeBookTitle(p.title)}</h3>
                  <p className="pc-card-note pc-clamp-2">{p.description || "Essential study resource for comprehensive exam preparation."}</p>
                  {p.listedBy && <p className="pc-card-note" style={{ color: "var(--pc-primary)", fontWeight: 600 }}>Listed by {p.listedBy}</p>}
                  <p className="pc-card-note">
                    ★ {p.rating || "4.5"} ({p.reviewsCount || 12} reviews) · {p.stock > 0 ? "In stock" : "Out of stock"}
                  </p>
                </div>

                <div className="pc-exam-card-actions" style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--pc-border)" }}>
                  <span className="pc-price">₹{p.price}</span>
                  <button
                    className="pc-btn pc-btn-primary pc-btn-small"
                    onClick={() => addToCart(p._id)}
                    disabled={p.stock <= 0}
                  >
                    {t("addToCart", "Add to Cart")}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {products.length > pageSize && (
        <div className="pc-pagination">
          <button
            className="pc-btn pc-btn-outline pc-btn-small"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {Math.ceil(products.length / pageSize)}</span>
          <button
            className="pc-btn pc-btn-outline pc-btn-small"
            disabled={page === Math.ceil(products.length / pageSize)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

/* TAB 2: FREE DONATED BOOKS (FELLOW STUDENTS CLAIM FOR ₹0) */
function FreeDonatedBooksTab({ token, user, onClaimSuccess }) {
  const { localizeBookTitle, t } = useLanguage();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  function load() {
    setLoading(true);
    api
      .listDonatedProducts({ search })
      .then((data) => setDonations(data.donations || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [search]);

  async function handleClaim(product) {
    if (!window.confirm(`Claim "${product.title}" for free (₹0)? Our logistics partner will deliver it to your address.`)) {
      return;
    }
    setClaimingId(product._id);
    setError("");
    try {
      const res = await api.claimDonatedProduct(token, product._id, {
        deliveryAddress: user?.address || "Campus / Hostel Address",
      });
      setSuccessMsg(res.message || "Book claimed successfully! Tracking created in Orders.");
      load();
      setTimeout(() => {
        setSuccessMsg("");
        if (onClaimSuccess) onClaimSuccess();
      }, 2500);
    } catch (e) {
      setError(e.message || "Failed to claim book.");
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <>
      <div className="pc-card pc-inner-card" style={{ background: "linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 100%)", border: "1px solid #bbf7d0", marginBottom: 16 }}>
        <h3 style={{ color: "#166534", margin: 0 }}>🎁 {t("freeDonatedBooks", "Free Donated Books & Resources")}</h3>
        <p className="pc-card-note" style={{ color: "#166534", margin: "4px 0 0" }}>
          Generously donated by fellow aspirants who completed their exams. Available to claim for <strong>₹0 / Free</strong> with doorstep courier delivery!
        </p>
      </div>

      <div className="pc-filter-bar">
        <input
          className="pc-search-input"
          placeholder="Search donated books by title or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="pc-form-error">{error}</div>}
      {successMsg && (
        <div className="pc-badge pc-badge-success" style={{ display: "block", padding: "10px 14px", margin: "10px 0" }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <p className="pc-card-note">Loading free donated books…</p>
      ) : donations.length === 0 ? (
        <div className="pc-card pc-phase-note" style={{ textAlign: "center", padding: "30px 20px" }}>
          <h4>No free donated books in queue right now</h4>
          <p className="pc-card-note">Check back soon or donate books you have completed to help fellow students.</p>
        </div>
      ) : (
        <div className="pc-grid pc-grid-3">
          {donations.map((p) => (
            <div key={p._id} className="pc-card" style={{ border: "1.5px solid #86efac", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="pc-badge pc-badge-success">FREE DONATION</span>
                  <span className="pc-badge" style={{ background: "#eef2ff", color: "#3730a3" }}>
                    Condition: {p.condition || "Gently Used"}
                  </span>
                </div>
                <h3 style={{ margin: "10px 0 6px" }}>{localizeBookTitle(p.title)}</h3>
                <p className="pc-card-note pc-clamp-2">{p.description || "Donated to support students preparing for competitive exams."}</p>
                {p.listedBy && <p className="pc-card-note" style={{ color: "#166534", fontWeight: 600 }}>Donated by fellow student: {p.listedBy}</p>}
              </div>

              <div className="pc-exam-card-actions" style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--pc-border)" }}>
                <span className="pc-price" style={{ color: "#16a34a", fontSize: "16px" }}>₹0 (FREE)</span>
                <button
                  type="button"
                  className="pc-btn pc-btn-primary pc-btn-small"
                  disabled={claimingId === p._id}
                  onClick={() => handleClaim(p)}
                  style={{ background: "#16a34a" }}
                >
                  {claimingId === p._id ? "Claiming…" : "Claim for Free 🎁"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* TAB 3: MY BOOKS FOR SALE */
function MyBooksForSaleTab({ token }) {
  const { localizeBookTitle, t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      setLoading(true);
      api
        .listMyListings(token)
        .then((data) => setListings(data.listings || []))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [token]);

  return (
    <div className="pc-card">
      <div className="pc-progress-header">
        <div>
          <h3>📚 {t("myBooksForSale", "My Books for Sale")} ({listings.length})</h3>
          <p className="pc-card-note">List of textbooks and study materials you have put up for sale in the Marketplace.</p>
        </div>
      </div>

      {error && <div className="pc-form-error">{error}</div>}

      {loading ? (
        <p className="pc-card-note">Loading your listed books…</p>
      ) : listings.length === 0 ? (
        <div className="pc-card pc-phase-note" style={{ textAlign: "center", padding: "24px" }}>
          <p>You have not listed any books for sale yet.</p>
          <p className="pc-card-note">Go to <strong>Sell or Donate a Book</strong> tab to list your completed books and earn cash.</p>
        </div>
      ) : (
        <table className="pc-table" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Exam / Category</th>
              <th>Condition</th>
              <th>Asking Price</th>
              <th>Status</th>
              <th>Date Listed</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((item) => (
              <tr key={item._id}>
                <td><strong>{localizeBookTitle(item.title)}</strong></td>
                <td>{item.examSlug || item.category || "General"}</td>
                <td><span className="pc-badge">{item.condition || "Gently Used"}</span></td>
                <td><strong>₹{item.price}</strong></td>
                <td>
                  <span className={`pc-badge ${item.stock > 0 ? "pc-badge-success" : ""}`}>
                    {item.stock > 0 ? "Active for Sale" : "Sold"}
                  </span>
                </td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* TAB 4: MY DONATED BOOKS & DONATION JOURNEY */
function MyDonatedBooksTab({ token }) {
  const { localizeBookTitle, t } = useLanguage();
  const [data, setData] = useState({ returnDonations: [], productDonations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      setLoading(true);
      api
        .listMyDonations(token)
        .then((res) => setData(res))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [token]);

  const allDonations = [...(data.returnDonations || []), ...(data.productDonations || [])];

  return (
    <div className="pc-card">
      <div className="pc-progress-header">
        <div>
          <h3>🎁 {t("myDonatedBooks", "My Donated Books & Resources")} ({allDonations.length})</h3>
          <p className="pc-card-note">
            Track the books you generously donated, from delivery partner doorstep pickup to handover to fellow aspirants.
          </p>
        </div>
      </div>

      {error && <div className="pc-form-error">{error}</div>}

      {loading ? (
        <p className="pc-card-note">Loading your donation records…</p>
      ) : allDonations.length === 0 ? (
        <div className="pc-card pc-phase-note" style={{ textAlign: "center", padding: "24px" }}>
          <p>You haven't donated any study resources yet.</p>
          <p className="pc-card-note">Help fellow aspirants by donating books you have finished studying!</p>
        </div>
      ) : (
        <table className="pc-table" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Resource / Title</th>
              <th>Condition</th>
              <th>Doorstep Pickup Status</th>
              <th>Recipient Student Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(data.returnDonations || []).map((r) => (
              <tr key={r._id}>
                <td><strong>{r.trackingId || "PC-DON-REQ"}</strong></td>
                <td>{localizeBookTitle(r.item?.title || "Donated Book")}</td>
                <td><span className="pc-badge">{r.condition || "Gently Used"}</span></td>
                <td>
                  <span className="pc-badge pc-badge-success">{r.status}</span>
                  {r.assignedDeliveryPartner && (
                    <small style={{ display: "block", color: "var(--pc-primary)", marginTop: 2 }}>
                      Courier: {r.assignedDeliveryPartner.name}
                    </small>
                  )}
                </td>
                <td>
                  <span className="pc-badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                    {r.status === "Completed" ? "Handed over to Aspirant" : "In Logistics Transit"}
                  </span>
                </td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {(data.productDonations || []).map((p) => (
              <tr key={p._id}>
                <td><strong>{p._id.slice(-8).toUpperCase()}</strong></td>
                <td>{localizeBookTitle(p.title)}</td>
                <td><span className="pc-badge">{p.condition || "Gently Used"}</span></td>
                <td><span className="pc-badge pc-badge-success">Picked Up</span></td>
                <td>
                  <span className="pc-badge" style={{ background: p.claimedBy ? "#dcfce7" : "#fef3c7", color: p.claimedBy ? "#166534" : "#92400e" }}>
                    {p.claimedBy ? `Claimed by Student (${p.claimedBy.studentId || p.claimedBy.name})` : "Available in Free Catalog"}
                  </span>
                </td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* TAB 5: UNIFIED SELL OR DONATE A BOOK FORM */
function SellOrDonateForm({ token, onListed, onDonated }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState("sell"); // 'sell' or 'donate'
  const [form, setForm] = useState({
    title: "",
    examSlug: "",
    category: "Resale",
    condition: "Like New",
    price: "250",
    description: "",
    pickupAddress: "",
    contactPhone: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) {
      setError("Book title is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMsg("");

    try {
      if (mode === "sell") {
        await api.createListing(token, {
          title: form.title,
          examSlug: form.examSlug,
          category: form.category,
          condition: form.condition,
          price: Number(form.price) || 100,
          description: form.description,
        });
        setMsg("Your book has been successfully listed in the Marketplace!");
        setTimeout(onListed, 1500);
      } else {
        // Donate mode
        await api.createCommerceRequest(token, {
          type: "donate",
          title: form.title,
          condition: form.condition,
          pickupAddress: form.pickupAddress || "Campus / Home Address",
          contactPhone: form.contactPhone || "+91 9876543210",
          notes: `Exam: ${form.examSlug}. Notes: ${form.notes}`,
        });
        setMsg("Thank you for your generous donation! A delivery partner will pick it up from your doorstep.");
        setTimeout(onDonated, 1500);
      }
    } catch (err) {
      setError(err.message || "Failed to submit listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="pc-card pc-form" style={{ maxWidth: 540 }} onSubmit={handleSubmit}>
      <div className="pc-progress-header">
        <div>
          <h3>{mode === "sell" ? "💰 Sell a Book for Cash" : "🎁 Donate Study Material for Free"}</h3>
          <p className="pc-card-note">
            {mode === "sell"
              ? "List your used books in the Marketplace and earn cash from fellow students."
              : "Donate books to aspirants in need. We arrange free doorstep pickup directly from you."}
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="pc-tab-switch pc-tab-switch-inline" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className={`pc-tab ${mode === "sell" ? "active" : ""}`}
          onClick={() => setMode("sell")}
        >
          💰 Sell for Cash
        </button>
        <button
          type="button"
          className={`pc-tab ${mode === "donate" ? "active" : ""}`}
          onClick={() => setMode("donate")}
        >
          🎁 Donate for Free
        </button>
      </div>

      <label>
        Book / Resource Title
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Operating System Concepts (Silberschatz) or Made Easy Notes"
        />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>
          Target Exam Slug
          <input
            value={form.examSlug}
            onChange={(e) => setForm({ ...form, examSlug: e.target.value })}
            placeholder="e.g. gate-cse, neet-ug"
          />
        </label>
        <label>
          Condition
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
            <option value="Brand New">Brand New (Mint)</option>
            <option value="Like New">Like New (Clean pages)</option>
            <option value="Gently Used">Gently Used (Minor markings)</option>
            <option value="Worn Out">Worn Out (All pages intact)</option>
            <option value="Damaged / Marked">Damaged / Marked (Readable)</option>
          </select>
        </label>
      </div>

      {mode === "sell" ? (
        <>
          <label>
            Asking Price (₹)
            <input
              required
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="e.g. 250"
            />
          </label>
          <label>
            Short Description / Edition
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. 10th edition, includes all chapters and CD practice sets."
            />
          </label>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              Doorstep Pickup Address
              <input
                required
                value={form.pickupAddress}
                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                placeholder="Hostel / Room / Street, City"
              />
            </label>
            <label>
              Contact Phone
              <input
                required
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </label>
          </div>
          <label>
            Special Pickup Notes
            <textarea
              rows="2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Preferred pickup timings, landmarks, etc."
            />
          </label>
        </>
      )}

      {error && <div className="pc-form-error">{error}</div>}
      {msg && <div className="pc-badge pc-badge-success" style={{ display: "block", padding: "10px" }}>{msg}</div>}

      <button className="pc-btn pc-btn-primary pc-btn-full" disabled={submitting}>
        {submitting ? "Processing…" : mode === "sell" ? "List Book for Sale" : "Confirm Free Pickup Schedule"}
      </button>
    </form>
  );
}

/* TAB 2: HANDWRITTEN NOTES & SHARED PDFS (PAID MATERIALS WITH ADD TO CART) */
function NotesAndPdfsTab({ token, onCartChange }) {
  const { localizeBookTitle, t } = useLanguage();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [examSlug, setExamSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState([]);
  const [sort, setSort] = useState("title");

  function load() {
    setLoading(true);
    api
      .listProducts({ search, examSlug: examSlug || undefined })
      .then((data) => {
        const all = data.products || [];
        // Filter for notes, PDFs, or show all when searching
        const filtered = all.filter(
          (p) =>
            p.category === "Handwritten Notes" ||
            p.category === "Shared PDF" ||
            (p.title && (p.title.includes("Notes") || p.title.includes("PDF") || p.title.includes("Sheet") || p.title.includes("Booklet")))
        );
        setItems(filtered.length > 0 ? filtered : all.slice(0, 15));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search, examSlug]);

  async function handleAddToCart(product) {
    setAddingId(product._id);
    setError("");
    try {
      if (token) {
        await api.addToCart(token, product._id, 1);
        setAddedIds((prev) => [...prev, product._id]);
        if (onCartChange) onCartChange();
      }
    } catch (err) {
      setError(err.message || "Failed to add to cart.");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <>
      <div
        className="pc-card pc-inner-card"
        style={{
          background: "linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)",
          border: "1px solid #bfdbfe",
          marginBottom: 16,
        }}
      >
        <h3 style={{ color: "#1e40af", margin: "0 0 4px" }}>
          📝 {t("handwrittenNotesHeader", "Aspirant Handwritten Notes & Curated PDFs")}
        </h3>
        <p className="pc-card-note" style={{ color: "#1e3a8a", margin: 0 }}>
          High-yield formula books, AIR ranker handwritten notebooks, and topic cheat sheets. Affordable pricing (₹29–₹99) with instant Add to Cart. Free donated materials can be claimed in the Free Donated Books tab (₹0).
        </p>
      </div>

      <div className="pc-filter-bar">
        <input
          className="pc-search-input"
          placeholder="Search handwritten notes, formula cheat sheets, PDFs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="pc-search-input"
          placeholder="Filter by exam (e.g. gate-cse, neet-ug)"
          value={examSlug}
          onChange={(e) => setExamSlug(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="title">Sort: Title</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </div>

      {error && <div className="pc-form-error">{error}</div>}

      {loading ? (
        <p className="pc-card-note">Loading notes and PDFs…</p>
      ) : items.length === 0 ? (
        <div className="pc-card pc-phase-note" style={{ textAlign: "center", padding: "30px 20px" }}>
          <p>No handwritten notes or PDFs match your search filters.</p>
        </div>
      ) : (
        <div className="pc-grid pc-grid-3">
          {[...items]
            .sort((a, b) =>
              sort === "priceLow"
                ? a.price - b.price
                : sort === "priceHigh"
                ? b.price - a.price
                : (a.title || "").localeCompare(b.title || "")
            )
            .map((p) => {
              const inCart = addedIds.includes(p._id);
              const isFree = p.price === 0;

              return (
                <div
                  key={p._id}
                  className="pc-card"
                  style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span className="pc-badge">{p.category || "Study Material"}</span>
                      <span className="pc-badge" style={{ background: isFree ? "#dcfce7" : "#e0e7ff", color: isFree ? "#166534" : "#3730a3", fontWeight: 700 }}>
                        {isFree ? "₹0 · Free Donation" : `₹${p.price}`}
                      </span>
                    </div>

                    <h3 style={{ margin: "4px 0 6px", fontSize: "16px" }}>
                      📝 {localizeBookTitle(p.title)}
                    </h3>
                    <p className="pc-card-note" style={{ margin: "0 0 6px" }}>
                      {p.subjectName} · {p.examSlug?.toUpperCase()}
                    </p>
                    <p className="pc-card-note pc-clamp-2" style={{ margin: "0 0 10px" }}>
                      {p.description || "Comprehensive handwritten notes and study PDF."}
                    </p>
                    <p className="pc-card-note">
                      ★ {p.rating || "4.8"} ({p.reviewsCount || 18} reviews) · {p.stock > 0 ? "Digital & Print Ready" : "Available"}
                    </p>
                  </div>

                  <div className="pc-exam-card-actions" style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--pc-border)" }}>
                    <span className="pc-price" style={{ fontSize: "17px", fontWeight: 800 }}>
                      {isFree ? "Free" : `₹${p.price}`}
                    </span>
                    <button
                      type="button"
                      className="pc-btn pc-btn-primary pc-btn-small"
                      onClick={() => handleAddToCart(p)}
                      disabled={addingId === p._id}
                    >
                      {inCart ? "✓ In Cart" : addingId === p._id ? "Adding…" : isFree ? "Claim (₹0)" : "🛒 Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </>
  );
}
