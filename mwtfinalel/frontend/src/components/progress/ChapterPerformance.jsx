import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

function pct(a) { return Number.isFinite(a.scorePercent) ? a.scorePercent : (a.maxMarks ? Math.round((a.marks / a.maxMarks) * 100) : 0); }

export default function ChapterPerformance({ examSlug, subject, chapter, onClose }) {
  const { token } = useAuth();
  const [data, setData] = useState({ mocks: [], summary: { totalAttempts: 0, average: 0, best: 0 }, attempts: [] });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ mockName: "Mock Test 1", mockUrl: "", questionsAttended: "", marks: "", maxMarks: "100" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try { setData(await api.getChapterAttempts(token, examSlug, chapter.id)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [examSlug, chapter.id]);

  const trend = useMemo(() => data.attempts || [], [data.attempts]);
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      await api.recordMockAttempt(token, examSlug, chapter.id, { subjectId: subject.id, mockId: form.mockName.toLowerCase().replace(/[^a-z0-9]+/g, "-"), ...form, questionsAttended: Number(form.questionsAttended), marks: Number(form.marks), maxMarks: Number(form.maxMarks) });
      setForm({ ...form, questionsAttended: "", marks: "" });
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const [showManualForm, setShowManualForm] = useState(false);
  const maxTrend = Math.max(...trend.map(x => pct(x)), 100);

  return (
    <div className="pc-card pc-chapter-performance">
      <div className="pc-progress-header">
        <div>
          <button className="pc-link-btn" type="button" onClick={onClose}>← Back to syllabus</button>
          <h3 style={{ marginTop: 8 }}>{chapter.name}</h3>
          <p className="pc-card-note">{subject.name} · Mock test scores and website practice quizzes sync here automatically.</p>
        </div>
        <div className="pc-performance-stats">
          <span><strong>{data.summary.totalAttempts}</strong> attempts</span>
          <span><strong>{data.summary.average}%</strong> avg</span>
          <span><strong>{data.summary.best}%</strong> best</span>
        </div>
      </div>
      {error && <div className="pc-form-error">{error}</div>}

      {/* 1. COMBINED CHAPTER ANALYSIS & PERFORMANCE GRAPH (AT TOP) */}
      <div className="pc-card pc-inner-card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <h4 style={{ margin: 0 }}>📊 Combined Chapter Performance &amp; Improvement Trend</h4>
          <span className="pc-badge pc-badge-success" style={{ fontSize: "11px" }}>
            ✓ Auto-Synced from Topic Mocks &amp; Site Quizzes
          </span>
        </div>

        {loading ? (
          <p className="pc-card-note">Loading attempts and quiz history…</p>
        ) : trend.length === 0 ? (
          <div style={{ padding: "20px 10px", textAlign: "center", color: "var(--pc-text-muted)" }}>
            <p style={{ margin: 0, fontWeight: 600 }}>No mock attempts or quizzes logged for this chapter yet.</p>
            <p className="pc-card-note" style={{ marginTop: 4 }}>
              Attempt a mock drill in the syllabus or take a practice quiz — your scores and improvement graph will automatically appear here!
            </p>
          </div>
        ) : (
          <>
            <div className="pc-line-chart" aria-label="Attempt score trend">
              {trend.map((a, i) => (
                <div className="pc-chart-point" key={i}>
                  <div className="pc-chart-bar" style={{ height: `${Math.max(14, (pct(a) / maxTrend) * 150)}px` }}>
                    <span>{pct(a)}%</span>
                  </div>
                  <small title={a.mockName || `Attempt ${i + 1}`}>
                    A{i + 1}
                  </small>
                </div>
              ))}
            </div>

            <div className="pc-attempt-history" style={{ marginTop: 14 }}>
              {[...data.mocks].filter(m => m.attempts?.length > 0).map((m) => (
                <div key={m.mockId} className="pc-mock-history">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{m.mockName}</strong>
                    <span className="pc-badge" style={{ fontSize: "10.5px" }}>
                      {m.type === "quiz" ? "⚡ Practice Quiz" : "🎯 Mock Test Drill"}
                    </span>
                  </div>
                  {m.attempts.map((a, i) => (
                    <div className="pc-attempt-row" key={a._id || i}>
                      <span>Attempt {i + 1}</span>
                      <span>{a.questionsAttended} questions ({a.marks}/{a.maxMarks})</span>
                      <strong style={{ color: pct(a) >= 70 ? "#16a34a" : pct(a) >= 40 ? "#ca8a04" : "#dc2626" }}>
                        {pct(a)}%
                      </strong>
                      <time>{new Date(a.attemptedAt).toLocaleDateString()}</time>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. TOPICS & AVAILABLE PRACTICE LINKS */}
      <div className="pc-grid pc-grid-2" style={{ marginTop: 14 }}>
        <div className="pc-card pc-inner-card">
          <h4>Topics in this Chapter</h4>
          <div className="pc-topic-grid" style={{ marginTop: 8 }}>
            {chapter.topics.map((t) => (
              <span className="pc-badge" key={t.id}>{t.name}</span>
            ))}
          </div>
        </div>

        <div className="pc-card pc-inner-card">
          <h4>Practice Drills &amp; CBT Links</h4>
          {data.mocks.length === 0 ? (
            <p className="pc-card-note">No practice links are available for this chapter yet.</p>
          ) : (
            data.mocks.map((m) => (
              <div className="pc-mock-row" key={m.mockId}>
                <div>
                  <strong>{m.mockName}</strong>
                  <div className="pc-card-note">
                    {m.attempts.length} attempt(s) · {m.attempts.length ? `Best ${Math.max(...m.attempts.map((a) => pct(a)))}%` : "Not attempted"}
                  </div>
                </div>
                {m.mockUrl && (
                  <a className="pc-btn pc-btn-outline pc-btn-small" href={m.mockUrl} target="_blank" rel="noreferrer">
                    Open ↗
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. OPTIONAL COLLAPSIBLE MANUAL ATTEMPT ENTRY */}
      <div className="pc-card pc-inner-card" style={{ marginTop: 14, background: "var(--pc-bg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px" }}>Taking an External / Offline Paper Test?</h4>
            <p className="pc-card-note" style={{ margin: "2px 0 0" }}>
              Online quizzes and topic drills log automatically above. You can optionally log offline paper tests here.
            </p>
          </div>
          <button
            type="button"
            className="pc-btn pc-btn-outline pc-btn-small"
            onClick={() => setShowManualForm(!showManualForm)}
          >
            {showManualForm ? "Hide Form" : "+ Log External Paper Test"}
          </button>
        </div>

        {showManualForm && (
          <form className="pc-form pc-attempt-form" onSubmit={submit} style={{ marginTop: 12 }}>
            <label>
              Mock test name
              <input value={form.mockName} onChange={(e) => setForm({ ...form, mockName: e.target.value })} required />
            </label>
            <label>
              Mock test link (Optional)
              <input type="url" placeholder="https://…" value={form.mockUrl} onChange={(e) => setForm({ ...form, mockUrl: e.target.value })} />
            </label>
            <label>
              Questions attended
              <input type="number" min="0" value={form.questionsAttended} onChange={(e) => setForm({ ...form, questionsAttended: e.target.value })} required />
            </label>
            <label>
              Marks obtained
              <input type="number" min="0" step="0.01" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} required />
            </label>
            <label>
              Maximum marks
              <input type="number" min="1" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} required />
            </label>
            <button className="pc-btn pc-btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save attempt"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
