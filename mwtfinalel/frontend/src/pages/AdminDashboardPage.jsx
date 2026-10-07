import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

const TABS = [
  ["overview", "dashboard", "Dashboard"],
  ["exams", "manageExams", "Manage Exams"],
  ["resources", "manageResources", "Manage Resources"],
  ["products", "manageProducts", "Marketplace"],
  ["users", "users", "Users"],
  ["mentors", "mentors", "Mentors & Assignment"],
  ["orders", "orders", "Orders"],
  ["returns", "returns", "Returns / Resale / Donations"],
  ["communications", "communications", "Communication Logs"],
];

export default function AdminDashboardPage() {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";

  function setTab(next) {
    setSearchParams({ tab: next });
  }

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <h1>{t("adminDashboard", "Admin Dashboard")}</h1>
            <p className="pc-page-subtitle">Signed in as {user?.email} (admin)</p>
          </div>
        </header>

        <div className="pc-tab-switch pc-tab-switch-inline" style={{ overflowX: "auto" }}>
          {TABS.map(([key, transKey, label]) => (
            <button
              key={key}
              className={`pc-tab ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
              type="button"
            >
              {t(transKey, label)}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab token={token} />}
        {tab === "exams" && <ExamsTab token={token} />}
        {tab === "resources" && <ResourcesTab token={token} />}
        {tab === "products" && <ProductsTab token={token} />}
        {tab === "users" && <UsersTab token={token} currentUserId={user?._id || user?.id} />}
        {tab === "mentors" && <MentorsTab token={token} />}
        {tab === "orders" && <OrdersTab token={token} />}
        {tab === "returns" && <ReturnsTab token={token} />}
        {tab === "communications" && <CommunicationsTab token={token} />}
      </div>
    </AppLayout>
  );
}

function OverviewTab({ token }) {
  const [overview, setOverview] = useState(null);
  useEffect(() => {
    api.adminOverview(token).then(setOverview).catch(() => {});
  }, [token]);

  if (!overview) return <p className="pc-card-note">Loading overview…</p>;
  return (
    <div className="pc-grid pc-grid-3">
      {Object.entries(overview).map(([key, value]) => (
        <div key={key} className="pc-card">
          <h3>{key[0].toUpperCase() + key.slice(1)}</h3>
          <p className="pc-metric">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ExamsTab({ token }) {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", authority: "", description: "", eligibility: "", officialUrl: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function load() {
    api.adminListExams(token).then((d) => setExams(d.exams || [])).catch((e) => setError(e.message));
  }
  useEffect(load, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.adminCreateExam(token, form);
      setForm({ name: "", category: "", authority: "", description: "", eligibility: "", officialUrl: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(slug) {
    if (!window.confirm(`Delete exam "${slug}"? This cannot be undone.`)) return;
    try {
      await api.adminDeleteExam(token, slug);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = exams.filter((e) =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.slug.includes(search.toLowerCase())
  );
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      {error && <div className="pc-form-error">{error}</div>}
      <form className="pc-card pc-form" onSubmit={handleCreate}>
        <h3>Add new exam</h3>
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. UPSC Prelims" /></label>
        <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. civil-services" /></label>
        <label>Authority<input value={form.authority} onChange={(e) => setForm({ ...form, authority: e.target.value })} placeholder="Conducting authority" /></label>
        <label>Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Exam description" /></label>
        <label>Eligibility<input value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="Eligibility criteria" /></label>
        <label>Official authority portal URL<input required type="url" value={form.officialUrl} onChange={(e) => setForm({ ...form, officialUrl: e.target.value })} placeholder="https://..." /></label>
        <button className="pc-btn pc-btn-primary">Add exam</button>
      </form>

      <div className="pc-card">
        <div className="pc-progress-header">
          <h3>Exams ({exams.length})</h3>
          <input
            className="pc-search-input"
            style={{ maxWidth: 260 }}
            placeholder="Search exams…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <table className="pc-table">
          <thead><tr><th>Name</th><th>Category</th><th>Authority</th><th>Subjects</th><th></th></tr></thead>
          <tbody>
            {visible.map((e) => (
              <tr key={e.slug}>
                <td><strong>{e.name}</strong><br /><small>{e.slug}</small></td>
                <td><span className="pc-badge">{e.category}</span></td>
                <td>{e.authority}</td>
                <td>{e.subjectCount}</td>
                <td><button className="pc-link-btn" onClick={() => handleDelete(e.slug)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > pageSize && (
          <div className="pc-pagination">
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {page} of {Math.ceil(filtered.length / pageSize)}</span>
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page === Math.ceil(filtered.length / pageSize)} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </>
  );
}

function ResourcesTab({ token }) {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ examSlug: "", subjectName: "", type: "pdf", title: "", description: "", url: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function load() {
    api.adminListResources(token).then((d) => setResources(d.resources || [])).catch((e) => setError(e.message));
  }
  useEffect(load, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.adminCreateResource(token, form);
      setForm({ examSlug: "", subjectName: "", type: "pdf", title: "", description: "", url: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.adminDeleteResource(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = resources.filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.examSlug?.includes(search.toLowerCase())
  );
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      {error && <div className="pc-form-error">{error}</div>}
      <form className="pc-card pc-form" onSubmit={handleCreate}>
        <h3>Add resource</h3>
        <label>Exam slug<input required value={form.examSlug} onChange={(e) => setForm({ ...form, examSlug: e.target.value })} placeholder="e.g. gate-cse" /></label>
        <label>Subject<input value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} placeholder="e.g. Theory of Computation" /></label>
        <label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="pdf">PDF</option><option value="video">Video</option><option value="notes">Notes</option><option value="ebook">Ebook</option><option value="practice">Practice</option></select></label>
        <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Resource title" /></label>
        <label>Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief summary" /></label>
        <label>URL<input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></label>
        <button className="pc-btn pc-btn-primary">Add resource</button>
      </form>

      <div className="pc-card">
        <div className="pc-progress-header">
          <h3>Resources ({resources.length})</h3>
          <input
            className="pc-search-input"
            style={{ maxWidth: 260 }}
            placeholder="Search resources…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <table className="pc-table">
          <thead><tr><th>Title</th><th>Exam</th><th>Type</th><th>Source</th><th></th></tr></thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r._id}>
                <td>{r.title}</td>
                <td>{r.examSlug}</td>
                <td><span className="pc-badge">{r.type}</span></td>
                <td>{r.source}</td>
                <td><button className="pc-link-btn" onClick={() => handleDelete(r._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > pageSize && (
          <div className="pc-pagination">
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {page} of {Math.ceil(filtered.length / pageSize)}</span>
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page === Math.ceil(filtered.length / pageSize)} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </>
  );
}

function ProductsTab({ token }) {
  const { t, localizeBookTitle } = useLanguage();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ examSlug: "", subjectName: "", title: "", description: "", category: "", price: "", stock: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function load() {
    api.adminListProducts(token).then((d) => setProducts(d.products || [])).catch((e) => setError(e.message));
  }
  useEffect(load, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.adminCreateProduct(token, form);
      setForm({ examSlug: "", subjectName: "", title: "", description: "", category: "", price: "", stock: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.adminDeleteProduct(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = products.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      {error && <div className="pc-form-error">{error}</div>}
      <form className="pc-card pc-form" onSubmit={handleCreate}>
        <h3>Add product</h3>
        <label>Exam slug<input value={form.examSlug} onChange={(e) => setForm({ ...form, examSlug: e.target.value })} /></label>
        <label>Subject<input value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} /></label>
        <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
        <label>Price (₹)<input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
        <label>Stock<input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
        <button className="pc-btn pc-btn-primary">Add product</button>
      </form>

      <div className="pc-card">
        <div className="pc-progress-header">
          <h3>Products ({products.length})</h3>
          <input
            className="pc-search-input"
            style={{ maxWidth: 260 }}
            placeholder="Search products…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <table className="pc-table">
          <thead><tr><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p._id}>
                <td>{localizeBookTitle(p.title)}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
                <td><button className="pc-link-btn" onClick={() => handleDelete(p._id)}>{t("delete", "Delete")}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > pageSize && (
          <div className="pc-pagination">
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {page} of {Math.ceil(filtered.length / pageSize)}</span>
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page === Math.ceil(filtered.length / pageSize)} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </>
  );
}

function UsersTab({ token, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function load() {
    api.adminListUsers(token).then((d) => setUsers(d.users || [])).catch((e) => setError(e.message));
  }
  useEffect(load, [token]);

  async function toggleRole(u) {
    try {
      const next = u.role === "admin" ? "student" : u.role === "student" ? "delivery" : "admin";
      await api.adminSetUserRole(token, u._id, next);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.adminDeleteUser(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = users
    .filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        String(u.name || "").toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q) ||
        String(u.studentId || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "studentId") return (a.studentId || "").localeCompare(b.studentId || "");
      if (sortBy === "createdAt") return new Date(b.createdAt) - new Date(a.createdAt);
      return (a.name || "").localeCompare(b.name || "");
    });

  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      {error && <div className="pc-form-error">{error}</div>}
      <div className="pc-card">
        <div className="pc-progress-header" style={{ flexWrap: "wrap", gap: 10 }}>
          <h3>Users ({users.length})</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="pc-search-input"
              placeholder="Search by Student ID, name, email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="delivery">Delivery</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="studentId">Sort: Student ID</option>
              <option value="createdAt">Sort: Registration Date</option>
            </select>
          </div>
        </div>
        <table className="pc-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Provider</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u._id}>
                <td><strong>{u.studentId || "—"}</strong></td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`pc-badge ${u.role === "admin" ? "pc-badge-success" : ""}`}>{u.role}</span></td>
                <td>{u.authProvider}</td>
                <td>
                  <button className="pc-link-btn" onClick={() => toggleRole(u)}>
                    {u.role === "admin" ? "Set Student" : u.role === "student" ? "Set Delivery" : "Set Admin"}
                  </button>
                  {" · "}
                  <button className="pc-link-btn" disabled={u._id === currentUserId} onClick={() => handleDelete(u._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > pageSize && (
          <div className="pc-pagination">
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(filtered.length / pageSize)}
            </span>
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page === Math.ceil(filtered.length / pageSize)} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const ORDER_STAGES = ["Confirmed", "Packed", "Dispatched", "In Transit", "Out for Delivery", "Delivered"];

function OrdersTab({ token }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  function load() {
    api.adminListOrders(token).then((d) => setOrders(d.orders || [])).catch((e) => setError(e.message));
  }
  useEffect(load, [token]);

  async function handleStatusChange(id, status) {
    try {
      await api.adminSetOrderStatus(token, id, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = (orders || []).filter((o) => {
    if (!o) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(o.trackingId || "").toLowerCase().includes(q) ||
      String(o.user?.name || "").toLowerCase().includes(q) ||
      String(o.user?.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      {error && <div className="pc-form-error">{error}</div>}
      <div className="pc-card">
        <div className="pc-progress-header" style={{ flexWrap: "wrap", gap: 10 }}>
          <h3>Orders ({orders.length})</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="pc-search-input"
              placeholder="Search by Tracking ID, user…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {ORDER_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="pc-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id}>
                <td><strong>{o.trackingId}</strong></td>
                <td>{o.user?.name} ({o.user?.email})</td>
                <td>₹{o.total}</td>
                <td>{o.paymentMethod}</td>
                <td>
                  <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                    {ORDER_STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ReturnsTab({ token }) {
  const { t, localizeBookTitle } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    return api
      .adminListReturns(token)
      .then((d) => setItems(d?.requests || []))
      .catch((e) => setError(e.message || "Failed to load return requests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  async function update(id, status, notes = "") {
    setUpdatingId(id);
    try {
      await api.adminUpdateReturn(token, id, status, notes);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = (items || []).filter((r) => {
    if (!r) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const tracking = String(r.trackingId || r.order?.trackingId || "").toLowerCase();
    const userName = String(r.user?.name || "").toLowerCase();
    const studentId = String(r.user?.studentId || "").toLowerCase();
    const itemTitle = String(r.item?.title || "").toLowerCase();
    const reasonText = String(r.reason || "").toLowerCase();
    return (
      tracking.includes(q) ||
      userName.includes(q) ||
      studentId.includes(q) ||
      itemTitle.includes(q) ||
      reasonText.includes(q)
    );
  });

  return (
    <div className="pc-card">
      <div className="pc-progress-header" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3>Returns, Resale &amp; Donation Pickups ({items.length})</h3>
          <p className="pc-card-note">Manage product returns, student resale requests, and material donations.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            className="pc-search-input"
            placeholder="Search by student, ID, book…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Request Types</option>
            <option value="return">Returns (Refunds/Exchanges)</option>
            <option value="resell">Sell-back / Buybacks</option>
            <option value="donate">Donations (Free Pickups)</option>
          </select>
          <button type="button" className="pc-btn pc-btn-small pc-btn-outline" onClick={load}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && <div className="pc-form-error">{error}</div>}

      {loading ? (
        <p className="pc-card-note" style={{ padding: "20px 0" }}>Loading return, resale &amp; donation requests…</p>
      ) : filtered.length === 0 ? (
        <p className="pc-card-note" style={{ padding: "20px 0" }}>No matching return or donation requests found.</p>
      ) : (
        <table className="pc-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Student</th>
              <th>Item &amp; Condition</th>
              <th>Reason</th>
              <th>Pickup Address &amp; Contact</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id}>
                <td>
                  <strong>{r.trackingId || r.order?.trackingId || "PC-REQ"}</strong>
                  <div style={{ marginTop: 4 }}>
                    <span className="pc-badge" style={{ textTransform: "uppercase" }}>{r.type}</span>
                  </div>
                </td>
                <td>
                  <strong>{r.user?.name || "Student"}</strong>
                  <br />
                  <small style={{ color: "var(--pc-primary)", fontWeight: 600 }}>{r.user?.studentId || "—"}</small>
                  <br />
                  <small style={{ color: "var(--pc-text-muted)" }}>{r.user?.email}</small>
                </td>
                <td>
                  <strong>{localizeBookTitle(r.item?.title || "Study Material")}</strong>
                  <div style={{ marginTop: 4 }}>
                    <span className="pc-badge" style={{ background: "#eef2ff", color: "#3730a3" }}>
                      Condition: {r.condition || "Gently Used"}
                    </span>
                  </div>
                  {r.expectedValue > 0 && <small style={{ display: "block", marginTop: 4 }}>Value: ₹{r.expectedValue}</small>}
                </td>
                <td>
                  <div style={{ maxWidth: 180, fontSize: "12px" }}>{r.reason || "—"}</div>
                  {r.notes && <small style={{ color: "var(--pc-text-muted)", display: "block" }}>Note: {r.notes}</small>}
                </td>
                <td>
                  <div style={{ maxWidth: 190, fontSize: "12px" }}>{r.pickupAddress || "On file"}</div>
                  <small style={{ color: "var(--pc-primary)", fontWeight: 600 }}>📞 {r.contactPhone || r.user?.phone || "—"}</small>
                </td>
                <td>
                  <span
                    className="pc-badge"
                    style={{
                      background:
                        r.status === "Completed" ? "#dcfce7" :
                        r.status === "Pickup Scheduled" || r.status === "Out for Pickup" ? "#fef3c7" :
                        r.status === "Rejected" ? "#fee2e2" : "#f1f5f9",
                      color:
                        r.status === "Completed" ? "#166534" :
                        r.status === "Pickup Scheduled" || r.status === "Out for Pickup" ? "#92400e" :
                        r.status === "Rejected" ? "#991b1b" : "#334155",
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td>
                  <select
                    disabled={updatingId === r._id}
                    value={r.status}
                    onChange={(e) => update(r._id, e.target.value)}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    {["Requested", "Under Review", "Approved", "Pickup Scheduled", "Out for Pickup", "Received", "Quality Checked", "Completed", "Rejected"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CommunicationsTab({ token }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [testForm, setTestForm] = useState({
    channel: "notification",
    recipient: "all",
    subject: "📢 Study Material & Schedule Notice",
    content: "New GATE & NEET practice tests and peer handwritten notes have just been added to the catalog!",
  });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [lastResult, setLastResult] = useState(null);

  function load() {
    setLoading(true);
    api
      .adminListCommunications(token, { channel, status, search, page, limit: 15 })
      .then((d) => {
        setLogs(d.logs || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, [token, channel, status, page]);

  async function handleSendTest(e) {
    e.preventDefault();
    setSending(true);
    setMsg("");
    setLastResult(null);
    try {
      const res = await api.adminTestCommunication(token, testForm);
      setMsg(`✓ Dispatched successfully via ${testForm.channel.toUpperCase()}! Status: ${res.log?.status || "delivered"}`);
      setLastResult({
        channel: testForm.channel,
        recipient: testForm.recipient,
        subject: testForm.subject,
        content: testForm.content,
        previewUrl: res.log?.previewUrl,
      });
      load();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <form className="pc-card pc-form" onSubmit={handleSendTest} style={{ marginBottom: 20 }}>
        <h3>Broadcast &amp; Send Notifications (In-App Toast / Email / SMS / WhatsApp)</h3>
        <p className="pc-card-note">
          Dispatches alerts via centralized multi-channel communication service. Website notifications trigger instant real-time toasts and notification bell badges for logged-in students.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            Channel
            <select value={testForm.channel} onChange={(e) => setTestForm({ ...testForm, channel: e.target.value })}>
              <option value="notification">Website Notification (In-App Toast &amp; Bell)</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label>
            Recipient (Enter "all" for All Students, or Email / Phone / Student ID)
            <input required value={testForm.recipient} onChange={(e) => setTestForm({ ...testForm, recipient: e.target.value })} placeholder="all or student1@prepcycle.test or +919876543210" />
          </label>
        </div>
        <label>
          Subject / Title
          <input value={testForm.subject} onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })} placeholder="e.g. Schedule Change or New Mock Test Alert" />
        </label>
        <label>
          Message Content
          <textarea rows={2} required value={testForm.content} onChange={(e) => setTestForm({ ...testForm, content: e.target.value })} placeholder="Message text that will appear in student alerts..." />
        </label>
        {msg && <div className="pc-card-note" style={{ fontWeight: 600, color: msg.includes("Error") ? "#dc2626" : "#16a34a" }}>{msg}</div>}

        {/* INTERACTIVE DIRECT ACTION BUTTONS FOR EMAIL / SMS / WHATSAPP */}
        {lastResult && (
          <div style={{ marginTop: 10, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
              Interactive Direct Actions:
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {lastResult.channel === "whatsapp" && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(lastResult.recipient.replace(/[^0-9+]/g, ""))}&text=${encodeURIComponent(lastResult.content)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pc-btn pc-btn-small"
                  style={{ background: "#25D366", color: "#fff", textDecoration: "none", fontWeight: 700 }}
                >
                  📲 Open in WhatsApp Web / App ↗
                </a>
              )}
              {lastResult.channel === "sms" && (
                <a
                  href={`sms:${encodeURIComponent(lastResult.recipient.replace(/[^0-9+]/g, ""))}?body=${encodeURIComponent(lastResult.content)}`}
                  className="pc-btn pc-btn-small pc-btn-outline"
                  style={{ textDecoration: "none", fontWeight: 700 }}
                >
                  💬 Open in Device SMS App ↗
                </a>
              )}
              {lastResult.channel === "email" && (
                <>
                  {lastResult.previewUrl && (
                    <a
                      href={lastResult.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pc-btn pc-btn-small pc-btn-primary"
                      style={{ textDecoration: "none", fontWeight: 700 }}
                    >
                      🌐 View Dispatched Email Preview ↗
                    </a>
                  )}
                  <a
                    href={`mailto:${lastResult.recipient}?subject=${encodeURIComponent(lastResult.subject || "PrepCycle Alert")}&body=${encodeURIComponent(lastResult.content)}`}
                    className="pc-btn pc-btn-small pc-btn-outline"
                    style={{ textDecoration: "none", fontWeight: 700 }}
                  >
                    ✉️ Open in Gmail / Default Mail ↗
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        <button className="pc-btn pc-btn-primary" disabled={sending} style={{ marginTop: 10 }}>
          {sending ? "Processing…" : "Trigger Communication"}
        </button>
      </form>

      <div className="pc-card">
        <div className="pc-progress-header" style={{ flexWrap: "wrap", gap: 10 }}>
          <h3>Communication Logs ({total})</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="pc-search-input"
              placeholder="Search recipient or content…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
            <select value={channel} onChange={(e) => { setChannel(e.target.value); setPage(1); }}>
              <option value="">All Channels</option>
              <option value="notification">Website Notification</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="not_configured">Not Configured</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="pc-card-note">Loading communication logs…</p>
        ) : logs.length === 0 ? (
          <p className="pc-card-note">No communication logs recorded yet.</p>
        ) : (
          <table className="pc-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Channel</th>
                <th>Event Type</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Provider & Message ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td><small>{new Date(l.timestamp).toLocaleString()}</small></td>
                  <td>
                    <span className={`pc-badge ${l.channel === "email" ? "" : l.channel === "whatsapp" ? "pc-badge-success" : ""}`}>
                      {l.channel.toUpperCase()}
                    </span>
                  </td>
                  <td><code>{l.messageType}</code></td>
                  <td>
                    {l.recipient}
                    {l.user?.name && <small><br />({l.user.name} - {l.user.studentId || "Student"})</small>}
                  </td>
                  <td>
                    <strong style={{ color: l.status === "delivered" ? "var(--pc-success)" : l.status === "not_configured" ? "var(--pc-text-muted)" : "var(--pc-danger)" }}>
                      {l.status}
                    </strong>
                  </td>
                  <td>
                    <small>{l.provider || "unconfigured"}</small>
                    {l.providerMessageId && <small><br />{l.providerMessageId}</small>}
                    {l.previewUrl && (
                      <div style={{ marginTop: 2 }}>
                        <a
                          href={l.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--pc-primary)", fontSize: "11px", fontWeight: 700 }}
                        >
                          🌐 View Email Preview ↗
                        </a>
                      </div>
                    )}
                    {l.channel === "whatsapp" && (
                      <div style={{ marginTop: 2 }}>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${encodeURIComponent((l.recipient || "").replace(/[^0-9+]/g, ""))}&text=${encodeURIComponent(l.content || "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#16a34a", fontSize: "11px", fontWeight: 700 }}
                        >
                          📲 Open WhatsApp ↗
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pages > 1 && (
          <div className="pc-pagination">
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button className="pc-btn pc-btn-outline pc-btn-small" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function MentorsTab({ token }) {
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [mentorForm, setMentorForm] = useState({
    name: "",
    email: "",
    password: "",
    whatsappNumber: "",
    bio: "",
  });
  const [submittingMentor, setSubmittingMentor] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedAssignments, setSelectedAssignments] = useState({});

  function load() {
    setLoading(true);
    Promise.all([api.adminListMentors(token), api.adminListUsers(token)])
      .then(([mRes, uRes]) => {
        setMentors(mRes.mentors || []);
        const allStudents = (uRes.users || []).filter((u) => u.role === "student");
        setStudents(allStudents);
        const map = {};
        allStudents.forEach((s) => {
          map[s._id] = s.mentor?._id || "";
        });
        setSelectedAssignments(map);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleCreateMentor(e) {
    e.preventDefault();
    setSubmittingMentor(true);
    setError("");
    try {
      await api.adminCreateMentor(token, mentorForm);
      setSuccess(`Mentor "${mentorForm.name}" created successfully!`);
      setMentorForm({ name: "", email: "", password: "", whatsappNumber: "", bio: "" });
      load();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingMentor(false);
    }
  }

  async function handleAssign(studentId) {
    const mentorId = selectedAssignments[studentId] || "";
    setError("");
    try {
      const res = await api.adminAssignMentor(token, { studentId, mentorId });
      setSuccess(res.message || "Mentor assignment updated!");
      load();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredStudents = students.filter((s) => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.studentId || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      {error && <div className="pc-form-error">{error}</div>}
      {success && (
        <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "10px 16px", borderRadius: 6, marginBottom: 16 }}>
          {success}
        </div>
      )}

      {/* Add New Mentor Card */}
      <form className="pc-card pc-form" onSubmit={handleCreateMentor} style={{ marginBottom: 20 }}>
        <h3>Add New Academic Mentor</h3>
        <p className="pc-card-note">
          Mentors receive instant WhatsApp & Email notifications whenever their assigned students complete a mock test or finish an entire subject.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label>
            Full Name *
            <input
              required
              placeholder="e.g. Dr. Rajesh Sharma"
              value={mentorForm.name}
              onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
            />
          </label>
          <label>
            Email Address *
            <input
              required
              type="email"
              placeholder="mentor@prepcycle.com"
              value={mentorForm.email}
              onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })}
            />
          </label>
          <label>
            Login Password *
            <input
              required
              type="password"
              placeholder="Min 6 characters"
              value={mentorForm.password}
              onChange={(e) => setMentorForm({ ...mentorForm, password: e.target.value })}
            />
          </label>
          <label>
            WhatsApp Phone Number *
            <input
              required
              placeholder="e.g. +91 9876543210"
              value={mentorForm.whatsappNumber}
              onChange={(e) => setMentorForm({ ...mentorForm, whatsappNumber: e.target.value })}
            />
          </label>
        </div>
        <label style={{ marginTop: 10 }}>
          Mentor Bio / Specialization
          <input
            placeholder="e.g. Senior Faculty for GATE CSE, Aptitude & Engineering"
            value={mentorForm.bio}
            onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
          />
        </label>
        <button className="pc-btn pc-btn-primary" disabled={submittingMentor} style={{ marginTop: 12 }}>
          {submittingMentor ? "Creating Mentor…" : "Create Mentor"}
        </button>
      </form>

      {/* Active Mentors Overview */}
      <div className="pc-card" style={{ marginBottom: 20 }}>
        <h3>Registered Mentors ({mentors.length})</h3>
        {mentors.length === 0 ? (
          <p className="pc-card-note">No mentors found. Add a mentor above or check seeded mentors.</p>
        ) : (
          <table className="pc-table">
            <thead>
              <tr>
                <th>Mentor Name</th>
                <th>Email</th>
                <th>WhatsApp / Phone</th>
                <th>Assigned Students</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mentors.map((m) => (
                <tr key={m._id}>
                  <td>
                    <strong>{m.name}</strong>
                    <br />
                    <small style={{ color: "#64748b" }}>{m.bio || "Academic Mentor"}</small>
                  </td>
                  <td>{m.email}</td>
                  <td>
                    <span style={{ color: "#16a34a", fontWeight: "600" }}>
                      📱 {m.whatsappNumber || m.phone || "Not set"}
                    </span>
                  </td>
                  <td>
                    <span className="pc-badge pc-badge-primary">
                      {m.assignedStudents?.length || 0} students assigned
                    </span>
                  </td>
                  <td>
                    <span className="pc-badge pc-badge-success">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Mentors to Students Table */}
      <div className="pc-card">
        <div className="pc-progress-header" style={{ flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <h3>Assign Mentors to Students ({students.length})</h3>
          <input
            className="pc-search-input"
            placeholder="Search students…"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            style={{ maxWidth: 260 }}
          />
        </div>

        <table className="pc-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Target Exam</th>
              <th>Current Assigned Mentor</th>
              <th>Assign / Change Mentor</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s._id}>
                <td><strong>{s.studentId || "—"}</strong></td>
                <td>
                  <strong>{s.name}</strong>
                  <br />
                  <small>{s.email}</small>
                </td>
                <td>
                  <span className="pc-badge">{s.targetExam || "Exam Aspirant"}</span>
                </td>
                <td>
                  {s.mentor ? (
                    <div>
                      <strong style={{ color: "#2563eb" }}>{s.mentor.name}</strong>
                      <br />
                      <small style={{ color: "#16a34a" }}>WhatsApp: {s.mentor.whatsappNumber || s.mentor.phone}</small>
                    </div>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>Unassigned</span>
                  )}
                </td>
                <td>
                  <select
                    value={selectedAssignments[s._id] || ""}
                    onChange={(e) => setSelectedAssignments({ ...selectedAssignments, [s._id]: e.target.value })}
                    style={{ padding: "6px 10px", borderRadius: 4, border: "1px solid #cbd5e1" }}
                  >
                    <option value="">-- No Mentor (Unassign) --</option>
                    {mentors.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.whatsappNumber || m.email})
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="pc-btn pc-btn-primary pc-btn-small"
                    onClick={() => handleAssign(s._id)}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
