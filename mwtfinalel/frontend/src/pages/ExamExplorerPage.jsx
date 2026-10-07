import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import GuidedTour from "../components/GuidedTour";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

export default function ExamExplorerPage() {
  const { token, updateUser } = useAuth();
  const { t } = useLanguage();
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tab, setTab] = useState("registered"); // registered | unregistered
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState(null);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState([]);
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [showTour, setShowTour] = useState(false);
  const pageSize = 9;

  async function load() {
    setLoading(true);
    try {
      const [examsRes, catRes] = await Promise.all([
        api.listExams(token, { search, category }),
        categories.length ? Promise.resolve({ categories }) : api.examCategories(),
      ]);
      setExams(examsRes.exams);
      if (!categories.length) setCategories(catRes.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.getRecentlyAccessed(token).then((d) => setRecent(d.items || [])).catch(() => {});
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  async function handleRegister(slug) {
    setBusySlug(slug);
    try {
      const res = await api.registerExam(token, slug);
      if (res?.user && updateUser) updateUser(res.user);
      setExams((prev) => prev.map((e) => (e.slug === slug ? { ...e, isRegistered: true } : e)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusySlug(null);
    }
  }

  async function handleUnregister(slug) {
    if (!window.confirm("Are you sure you want to remove this exam from your registered list?")) return;
    setBusySlug(slug);
    try {
      const res = await api.unregisterExam(token, slug);
      if (res?.user && updateUser) updateUser(res.user);
      setExams((prev) => prev.map((e) => (e.slug === slug ? { ...e, isRegistered: false } : e)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusySlug(null);
    }
  }

  const filtered = exams
    .filter((e) => (tab === "registered" ? e.isRegistered : !e.isRegistered))
    .sort((a, b) => (sort === "authority" ? a.authority.localeCompare(b.authority) : a.name.localeCompare(b.name)));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AppLayout>
      <div className="pc-page">
        {/* HERO BANNER & GUIDED TOUR TRIGGER */}
        <div
          className="pc-card"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)",
            color: "#ffffff",
            padding: "24px 26px",
            borderRadius: 18,
            marginBottom: 20,
            boxShadow: "0 10px 30px rgba(30, 58, 138, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: 8,
              }}
            >
              🌟 PrepCycle Ecosystem
            </span>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 8px", color: "#ffffff", lineHeight: 1.25 }}>
              Preparing for competitive exams? Leave it to us.
            </h1>
            <p style={{ fontSize: "14px", lineHeight: 1.5, opacity: 0.95, margin: 0 }}>
              Your complete companion for end-to-end syllabus tracking, official topic mock test links with instant mark logging, adaptive AI quizzes, peer textbook marketplace, and performance analytics.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="pc-btn"
              onClick={() => setShowTour(true)}
              style={{
                background: "#ffffff",
                color: "#1e3a8a",
                fontWeight: 700,
                padding: "10px 18px",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🎯 Start Guided Tour
            </button>
          </div>
        </div>

        {/* GUIDED FEATURE TOUR MODAL */}
        <GuidedTour isOpen={showTour} onClose={() => setShowTour(false)} />

        <header className="pc-page-header">
          <div>
            <h1>{t("exams", "Exam Explorer")}</h1>
            <p className="pc-page-subtitle">{exams.length} exams available — search, filter, and register.</p>
          </div>
        </header>

        {/* RECENTLY ACCESSED (Always present and responsive) */}
        {recent.length > 0 && (
          <div className="pc-card pc-recent-card" data-tour="recent-accessed" style={{ marginBottom: 20 }}>
            <div className="pc-progress-header">
              <div>
                <h3 style={{ margin: 0 }}>⏱️ {t("recentlyAccessed", "Recently Accessed")}</h3>
                <p className="pc-card-note">{t("recentlyAccessedNote", "Continue where you left off across your target exams and topics.")}</p>
              </div>
            </div>
            <div className="pc-recent-list">
              {recent.slice(0, 6).map((item) => (
                <Link key={item._id || item.target} to={item.target || "/my-progress"} className="pc-recent-item">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="pc-filter-bar" data-tour="exam-search">
          <input
            className="pc-search-input"
            placeholder="Search exams (e.g. NEET, GATE, CAT, banking, SSC)…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="name">Sort: Name</option>
            <option value="authority">Sort: Authority</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="pc-tab-switch pc-tab-switch-inline">
            {[
              ["registered", t("registeredExams", "Registered Exams")],
              ["unregistered", t("unregisteredExams", "Unregistered Exams")],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`pc-tab ${tab === key ? "active" : ""}`}
                onClick={() => setTab(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="pc-form-error">{error}</div>}

        {loading ? (
          <p className="pc-card-note">Loading exams…</p>
        ) : filtered.length === 0 ? (
          <div className="pc-card pc-phase-note" style={{ textAlign: "center", padding: "30px 20px" }}>
            <p>
              {tab === "registered"
                ? "You haven't registered for any exams yet. Switch to 'Unregistered Exams' above to browse and register!"
                : "No exams match your search filters."}
            </p>
          </div>
        ) : (
          <div className="pc-grid pc-grid-3" data-tour="exam-cards">
            {visible.map((exam) => (
              <div key={exam.slug} className="pc-card pc-exam-card">
                <div className="pc-exam-card-top">
                  <h3>{exam.name}</h3>
                  {exam.isRegistered && <span className="pc-badge pc-badge-success">Registered</span>}
                </div>
                <p className="pc-card-note">{exam.authority}</p>
                <p className="pc-card-note pc-clamp-2">{exam.description}</p>
                <div className="pc-exam-card-actions">
                  <Link
                    className="pc-btn pc-btn-outline pc-btn-small"
                    to={`/exam-explorer/${exam.slug}`}
                    onClick={() =>
                      api
                        .recordRecentlyAccessed(token, {
                          type: "exam",
                          title: exam.name,
                          subtitle: exam.authority,
                          target: `/exam-explorer/${exam.slug}`,
                        })
                        .catch(() => {})
                    }
                  >
                    View details
                  </Link>

                  {exam.isRegistered ? (
                    <button
                      className="pc-btn pc-btn-small pc-btn-outline"
                      style={{ color: "var(--pc-danger)", borderColor: "rgba(214,69,69,0.35)" }}
                      onClick={() => handleUnregister(exam.slug)}
                      disabled={busySlug === exam.slug}
                    >
                      {busySlug === exam.slug ? "Removing…" : t("unregisterExam", "Remove / Unregister")}
                    </button>
                  ) : (
                    <button
                      className="pc-btn pc-btn-primary pc-btn-small"
                      onClick={() => handleRegister(exam.slug)}
                      disabled={busySlug === exam.slug}
                    >
                      {busySlug === exam.slug ? "Registering…" : "Register"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > pageSize && (
          <div className="pc-pagination">
            <button
              className="pc-btn pc-btn-outline pc-btn-small"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {pageCount}
            </span>
            <button
              className="pc-btn pc-btn-outline pc-btn-small"
              disabled={page === pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
