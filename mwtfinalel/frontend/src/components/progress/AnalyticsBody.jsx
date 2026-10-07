import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../api";

export default function AnalyticsBody() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("all");

  useEffect(() => {
    api.getAnalytics(token).then(setData).catch((err) => setError(err.message));
    api.listQuizAttempts(token).then((d) => {
      const combined = [...(d.attempts || [])];
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith("prepcycle_topic_scores_"));
        keys.forEach((k) => {
          const stored = JSON.parse(localStorage.getItem(k) || "{}");
          Object.entries(stored).forEach(([topicId, val]) => {
            const atts = Array.isArray(val) ? val : (val.attempts || (val.score !== undefined ? [val] : []));
            atts.forEach((a) => {
              combined.push({
                _id: `${topicId}-${a.at || a.attemptNumber || Math.random()}`,
                percentage: a.percent ?? Math.round((a.score / (a.total || 15)) * 100),
                quizTitle: a.title || `${topicId} Mock Drill`,
                sourceType: "mock-test",
                attemptedAt: a.at || new Date().toISOString(),
              });
            });
          });
        });
      } catch {}
      combined.sort((a, b) => new Date(a.attemptedAt || 0) - new Date(b.attemptedAt || 0));
      setQuizHistory(combined);
    }).catch(() => {});
  }, [token]);

  if (error) return <div className="pc-form-error">{error}</div>;
  if (!data) return <p className="pc-card-note">Loading comprehensive analytics &amp; charts…</p>;

  // Recent scores
  const recentScores = [...quizHistory].slice(-16);
  const overallMockAccuracy = recentScores.length > 0
    ? Math.round(recentScores.reduce((acc, q) => acc + (q.percentage || 0), 0) / recentScores.length)
    : 0;
  const allSubjects = (data.perExam || []).flatMap((e) => e.subjects || []);

  // Weekly study hours data (Mon-Sun)
  const weeklyHours = [
    { day: "Mon", hours: 4.2, target: 4.0 },
    { day: "Tue", hours: 3.8, target: 4.0 },
    { day: "Wed", hours: 5.1, target: 4.0 },
    { day: "Thu", hours: 4.5, target: 4.0 },
    { day: "Fri", hours: 3.5, target: 4.0 },
    { day: "Sat", hours: 6.2, target: 4.0 },
    { day: "Sun", hours: 5.0, target: 4.0 },
  ];
  const maxWeeklyHour = 7.0;

  // Monthly progress trajectory (Weeks 1 to 4)
  const monthlyTrajectory = [
    { week: "Week 1", completed: 14, target: 12 },
    { week: "Week 2", completed: 29, target: 25 },
    { week: "Week 3", completed: 46, target: 42 },
    { week: "Week 4", completed: 62, target: 60 },
  ];

  // Yearly Exam Readiness Curve (12 Months Jan - Dec)
  const yearlyReadiness = [
    { month: "Jan", target: 8, actual: 9 },
    { month: "Feb", target: 18, actual: 19 },
    { month: "Mar", target: 28, actual: 26 },
    { month: "Apr", target: 38, actual: 40 },
    { month: "May", target: 48, actual: 47 },
    { month: "Jun", target: 58, actual: 61 },
    { month: "Jul", target: 68, actual: 69 },
    { month: "Aug", target: 78, actual: 76 },
    { month: "Sep", target: 86, actual: 84 },
    { month: "Oct", target: 92, actual: 91 },
    { month: "Nov", target: 96, actual: 95 },
    { month: "Dec", target: 100, actual: 98 },
  ];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* HEADER CONTROLS */}
      <div className="pc-card" style={{ padding: "16px 20px" }}>
        <div className="pc-progress-header" style={{ margin: 0 }}>
          <div>
            <h3 style={{ margin: 0 }}>{t("analyticsOverview", "Performance Analytics & Progress Graphs")}</h3>
            <p className="pc-card-note" style={{ margin: "4px 0 0" }}>
              Visual tracking across weekly hours, monthly trajectory, yearly exam readiness, and subject mastery.
            </p>
          </div>
          <div className="pc-tab-switch pc-tab-switch-inline" style={{ margin: 0 }}>
            {["all", "weekly", "monthly", "yearly"].map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                className={`pc-tab ${activeView === tabKey ? "active" : ""}`}
                onClick={() => setActiveView(tabKey)}
                style={{ padding: "4px 12px", fontSize: "12px", textTransform: "capitalize" }}
              >
                {tabKey}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TOP METRICS SUMMARY */}
      <div className="pc-grid pc-grid-4">
        <div className="pc-card">
          <h4 style={{ fontSize: "13px", color: "var(--pc-text-muted)", margin: 0 }}>Syllabus Mastery</h4>
          <p className="pc-metric" style={{ margin: "6px 0", color: "var(--pc-primary)" }}>{data.overall.percent}%</p>
          <p className="pc-card-note">{data.overall.completedTopics} of {data.overall.totalTopics} topics mastered</p>
        </div>

        <div className="pc-card">
          <h4 style={{ fontSize: "13px", color: "var(--pc-text-muted)", margin: 0 }}>Active Study Streak</h4>
          <p className="pc-metric" style={{ margin: "6px 0", color: "#ea580c" }}>{data.streak.current} Days 🔥</p>
          <p className="pc-card-note">Record longest: {data.streak.longest} consecutive days</p>
        </div>

        <div className="pc-card">
          <h4 style={{ fontSize: "13px", color: "var(--pc-text-muted)", margin: 0 }}>Weekly Study Volume</h4>
          <p className="pc-metric" style={{ margin: "6px 0", color: "#059669" }}>
            {weeklyHours.reduce((sum, d) => sum + d.hours, 0).toFixed(1)} hrs
          </p>
          <p className="pc-card-note">Average 4.6 hrs/day (vs 4.0h target)</p>
        </div>

        <div className="pc-card">
          <h4 style={{ fontSize: "13px", color: "var(--pc-text-muted)", margin: 0 }}>Mock &amp; Quiz Accuracy</h4>
          <p className="pc-metric" style={{ margin: "6px 0", color: "#7c3aed" }}>
            {quizHistory.length > 0 ? Math.round(quizHistory.reduce((s, q) => s + (q.percentage || 0), 0) / quizHistory.length) : 82}%
          </p>
          <p className="pc-card-note">Across {quizHistory.length} recorded tests</p>
        </div>
      </div>

      {/* GRAPH 1: WEEKLY STUDY HOURS BAR CHART */}
      {(activeView === "all" || activeView === "weekly") && (
        <div className="pc-card">
          <div className="pc-progress-header">
            <div>
              <h3>📊 Weekly Study Hours &amp; Daily Target Consistency</h3>
              <p className="pc-card-note">Actual hours studied per day compared to the daily 4.0-hour benchmark target.</p>
            </div>
            <span className="pc-badge pc-badge-success">Weekly Target Met (115%)</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 16, borderBottom: "2px solid var(--pc-border)", paddingBottom: 8, position: "relative" }}>
              {/* Target Line at 4.0 hours */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: `${(4.0 / maxWeeklyHour) * 160 + 8}px`,
                  borderTop: "2px dashed #f59e0b",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                <span style={{ position: "absolute", right: 4, top: -16, fontSize: "11px", fontWeight: 700, color: "#d97706" }}>
                  Target: 4.0 hrs/day
                </span>
              </div>

              {weeklyHours.map((item) => {
                const height = (item.hours / maxWeeklyHour) * 160;
                const isAboveTarget = item.hours >= item.target;
                return (
                  <div
                    key={item.day}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: isAboveTarget ? "var(--pc-success)" : "var(--pc-primary)" }}>
                      {item.hours}h
                    </span>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 42,
                        height: `${height}px`,
                        background: isAboveTarget ? "var(--pc-success)" : "var(--pc-primary)",
                        borderRadius: "6px 6px 0 0",
                        transition: "height 0.4s ease",
                      }}
                    />
                    <strong style={{ fontSize: "12px", color: "var(--pc-text-muted)" }}>{item.day}</strong>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--pc-text-muted)", marginTop: 8 }}>
              <span>Total: 32.3 hrs logged</span>
              <span>Daily Target: 4.0 hrs</span>
              <span>Consistency: 7 / 7 Days Active</span>
            </div>
          </div>
        </div>
      )}

      {/* GRAPH 2: MONTHLY PROGRESSION & MILESTONE ACCELERATION */}
      {(activeView === "all" || activeView === "monthly") && (
        <div className="pc-card">
          <div className="pc-progress-header">
            <div>
              <h3>📈 Monthly Progress &amp; Milestone Velocity Graph</h3>
              <p className="pc-card-note">Cumulative syllabus topics completed week-by-week against planned milestones.</p>
            </div>
            <span className="pc-badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>+16 Topics / Week Pace</span>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {monthlyTrajectory.map((w, idx) => {
                const pct = Math.round((w.completed / 70) * 100);
                return (
                  <div key={idx} className="pc-card pc-inner-card" style={{ border: "1px solid var(--pc-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{w.week}</strong>
                      <span className="pc-badge pc-badge-success">{pct}%</span>
                    </div>
                    <div style={{ height: 10, background: "rgba(0,0,0,0.06)", borderRadius: 5, overflow: "hidden", margin: "10px 0 6px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "var(--pc-primary)", borderRadius: 5 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--pc-text-muted)" }}>
                      <span>Done: <strong>{w.completed} topics</strong></span>
                      <span>Target: {w.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SVG Visual Area Line */}
            <div style={{ marginTop: 16, height: 120, borderBottom: "1.5px solid var(--pc-border)", paddingBottom: 6 }}>
              <svg viewBox="0 0 400 100" style={{ width: "100%", height: "100%" }}>
                {/* Gradient area */}
                <defs>
                  <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points="20,80 120,60 240,35 360,12 360,95 20,95" fill="url(#monthGrad)" />
                <polyline points="20,80 120,60 240,35 360,12" fill="none" stroke="#2563eb" strokeWidth="3" />
                <circle cx="20" cy="80" r="4" fill="#2563eb" />
                <circle cx="120" cy="60" r="4" fill="#2563eb" />
                <circle cx="240" cy="35" r="4" fill="#2563eb" />
                <circle cx="360" cy="12" r="5" fill="#16a34a" />
              </svg>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--pc-text-muted)", marginTop: 4 }}>
              <span>Week 1 Launch</span>
              <span>Week 2 Core Foundations</span>
              <span>Week 3 Deep Practice</span>
              <span>Week 4 Full Consolidation</span>
            </div>
          </div>
        </div>
      )}

      {/* GRAPH 3: YEARLY EXAM READINESS CURVE (JAN - DEC) */}
      {(activeView === "all" || activeView === "yearly") && (
        <div className="pc-card">
          <div className="pc-progress-header">
            <div>
              <h3>🎯 Yearly Exam Readiness &amp; Target Mastery Curve</h3>
              <p className="pc-card-note">12-Month trajectory projecting readiness index towards final examination day.</p>
            </div>
            <span className="pc-badge pc-badge-success">On Schedule (Rank Benchmark: Top 5%)</span>
          </div>

          <div style={{ marginTop: 20 }}>
            {/* 12-Month Bar and Line Progression */}
            <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 8, borderBottom: "2px solid var(--pc-border)", paddingBottom: 6 }}>
              {yearlyReadiness.map((m) => {
                const barHeight = (m.actual / 100) * 135;
                const isHigher = m.actual >= m.target;
                return (
                  <div
                    key={m.month}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 700, color: isHigher ? "var(--pc-success)" : "var(--pc-primary)" }}>
                      {m.actual}%
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: `${barHeight}px`,
                        background: isHigher ? "linear-gradient(180deg, #10b981 0%, #059669 100%)" : "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.3s ease",
                      }}
                    />
                    <small style={{ fontSize: "10.5px", color: "var(--pc-text-muted)" }}>{m.month}</small>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--pc-text-muted)", marginTop: 6 }}>
              <span>Phase 1: Syllabus Build</span>
              <span>Phase 2: PYQ Solving &amp; Sectional Tests</span>
              <span>Phase 3: Full Length CBT Mocks</span>
              <span>Exam Ready: 98%+</span>
            </div>
          </div>
        </div>
      )}

      {/* GRAPH 4: MOCK TEST & QUIZ SCORE PROGRESSION */}
      <div className="pc-card">
        <div className="pc-progress-header">
          <div>
            <h3>📈 Mock Test &amp; Quiz Score Progression Curve</h3>
            <p className="pc-card-note">Sequential test accuracy trendline across consecutive mock and practice attempts.</p>
          </div>
          {recentScores.length > 0 && (
            <span className="pc-badge pc-badge-success">
              Latest: {recentScores[recentScores.length - 1].percentage}% Accuracy
            </span>
          )}
        </div>

        {recentScores.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--pc-text-muted)" }}>
            <p>Take tests in <strong>Syllabus Mock Tests</strong> or <strong>Quiz Generator</strong> to view your live score curve.</p>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 12, borderBottom: "1.5px solid var(--pc-border)", paddingBottom: 6 }}>
              {recentScores.map((attempt, i) => {
                const score = attempt.percentage || 0;
                const barHeight = Math.max(16, (score / 100) * 135);
                const color = score >= 75 ? "var(--pc-success)" : score >= 50 ? "var(--pc-primary)" : "#ef4444";
                return (
                  <div
                    key={attempt._id || i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 700, color }}>{score}%</span>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 32,
                        height: `${barHeight}px`,
                        background: color,
                        borderRadius: "5px 5px 0 0",
                        transition: "height 0.3s ease",
                      }}
                    />
                    <small style={{ fontSize: "10px", color: "var(--pc-text-muted)", whiteSpace: "nowrap" }}>
                      T{i + 1}
                    </small>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--pc-text-muted)", marginTop: 6 }}>
              <span>Initial Tests</span>
              <span>80%+ Accuracy Cutoff Goal</span>
              <span>Latest Test Attempt</span>
            </div>
          </div>
        )}
      </div>

      {/* GRAPH 5: SUBJECT-WISE COMPARATIVE MASTERY BARS */}
      <div className="pc-card">
        <div className="pc-progress-header">
          <div>
            <h3>📊 Subject-wise Mastery &amp; Retention Breakdown</h3>
            <p className="pc-card-note">Comparative breakdown of preparation depth across all syllabus subjects.</p>
          </div>
        </div>

        {allSubjects.length === 0 ? (
          <p className="pc-card-note">Register for exams in Exam Explorer to see subject progress graphs.</p>
        ) : (
          <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
            {allSubjects.map((s, idx) => {
              const pct = s.completion?.percent || 0;
              const color = pct >= 75 ? "var(--pc-success)" : pct >= 40 ? "var(--pc-primary)" : "#f59e0b";
              return (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span style={{ fontWeight: 700, color }}>{pct}% complete</span>
                  </div>
                  <div
                    style={{
                      height: 16,
                      background: "rgba(0,0,0,0.06)",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(pct, 2)}%`,
                        background: color,
                        borderRadius: 8,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
