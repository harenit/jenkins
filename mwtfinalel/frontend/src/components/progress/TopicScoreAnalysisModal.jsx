import { useLanguage } from "../../context/LanguageContext";

export default function TopicScoreAnalysisModal({ isOpen, onClose, topicName, subjectName, attempts = [], onClearHistory }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const validAttempts = attempts.filter((a) => a && a.score !== undefined);
  const totalAttempts = validAttempts.length;

  const scores = validAttempts.map((a) => a.percent ?? Math.round((a.score / (a.total || 15)) * 100));
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const latestScore = scores.length > 0 ? scores[scores.length - 1] : 0;
  const growth = scores.length > 1 ? latestScore - scores[0] : 0;

  // Chart Dimensions
  const chartWidth = 480;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 30;

  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  const points = validAttempts.map((att, idx) => {
    const x = validAttempts.length === 1 ? chartWidth / 2 : paddingX + (idx / (validAttempts.length - 1)) * plotWidth;
    const pct = att.percent ?? Math.round((att.score / (att.total || 15)) * 100);
    const y = chartHeight - paddingY - (pct / 100) * plotHeight;
    return { x, y, pct, att, idx };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="pc-card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--pc-card, #ffffff)",
          borderRadius: 18,
          padding: "26px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
          border: "1px solid var(--pc-border, #e2e8f0)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <span className="pc-badge pc-badge-primary" style={{ fontSize: "11px", marginBottom: 6 }}>
              {subjectName || "Subject Drill"}
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0 2px" }}>
              📊 {topicName} — Mock Analysis
            </h2>
            <p className="pc-card-note" style={{ margin: 0 }}>
              Performance trajectory across {totalAttempts} recorded mock test attempt{totalAttempts === 1 ? "" : "s"}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="pc-link-btn"
            style={{ fontSize: "18px", color: "var(--pc-text-muted)", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {totalAttempts === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 20px" }}>
            <p className="pc-card-note">No mock attempts recorded yet for this topic.</p>
            <p style={{ fontSize: "13px" }}>Take a practice drill and click "+ Log Mark" to record your scores.</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div style={{ background: "rgba(37,99,235,0.06)", padding: "12px", borderRadius: 10, textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--pc-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Latest
                </span>
                <h3 style={{ margin: "4px 0 0", color: "var(--pc-primary)", fontSize: "18px" }}>{latestScore}%</h3>
              </div>

              <div style={{ background: "rgba(16,185,129,0.08)", padding: "12px", borderRadius: 10, textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--pc-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Best
                </span>
                <h3 style={{ margin: "4px 0 0", color: "#10b981", fontSize: "18px" }}>{bestScore}%</h3>
              </div>

              <div style={{ background: "rgba(245,158,11,0.08)", padding: "12px", borderRadius: 10, textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--pc-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Average
                </span>
                <h3 style={{ margin: "4px 0 0", color: "#f59e0b", fontSize: "18px" }}>{avgScore}%</h3>
              </div>

              <div style={{ background: "rgba(139,92,246,0.08)", padding: "12px", borderRadius: 10, textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--pc-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Growth
                </span>
                <h3 style={{ margin: "4px 0 0", color: growth >= 0 ? "#10b981" : "#ef4444", fontSize: "18px" }}>
                  {growth >= 0 ? `+${growth}%` : `${growth}%`}
                </h3>
              </div>
            </div>

            {/* Performance Trend Graph */}
            <div style={{ marginBottom: 22, background: "rgba(0,0,0,0.02)", borderRadius: 12, padding: "14px", border: "1px solid var(--pc-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>📈 Score Progression Curve</span>
                <span style={{ fontSize: "11px", color: "var(--pc-text-muted)" }}>Target: 80%+ Mastered</span>
              </div>

              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
                {/* Horizontal reference grid lines */}
                {[0, 25, 50, 75, 100].map((level) => {
                  const y = chartHeight - paddingY - (level / 100) * plotHeight;
                  return (
                    <g key={level}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="var(--pc-border, #e2e8f0)"
                        strokeDasharray={level === 80 ? "4 2" : "2 2"}
                        strokeWidth={level === 80 ? 1.5 : 1}
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fontSize="9"
                        fill="var(--pc-text-muted, #94a3b8)"
                        textAnchor="end"
                      >
                        {level}%
                      </text>
                    </g>
                  );
                })}

                {/* Target 80% line label */}
                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY - 0.8 * plotHeight}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY - 0.8 * plotHeight}
                  stroke="#10b981"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Connected Line */}
                {points.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="var(--pc-primary, #2563eb)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />
                )}

                {/* Data Points */}
                {points.map((p) => (
                  <g key={p.idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill={p.pct >= 80 ? "#10b981" : p.pct >= 50 ? "var(--pc-primary, #2563eb)" : "#ef4444"}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={p.x}
                      y={p.y - 9}
                      fontSize="10"
                      fontWeight="bold"
                      fill="var(--pc-text, #1e293b)"
                      textAnchor="middle"
                    >
                      {p.pct}%
                    </text>
                    <text
                      x={p.x}
                      y={chartHeight - 10}
                      fontSize="9"
                      fill="var(--pc-text-muted, #64748b)"
                      textAnchor="middle"
                    >
                      Attempt {p.idx + 1}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Attempt History Table */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>📜 Detailed Attempt History</span>
                {onClearHistory && (
                  <button
                    onClick={onClearHistory}
                    className="pc-link-btn"
                    style={{ fontSize: "11px", color: "#ef4444" }}
                  >
                    Reset History
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid var(--pc-border)", borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.03)", borderBottom: "1px solid var(--pc-border)", textAlign: "left" }}>
                      <th style={{ padding: "8px 10px" }}>Attempt</th>
                      <th style={{ padding: "8px 10px" }}>Date & Time</th>
                      <th style={{ padding: "8px 10px" }}>Raw Score</th>
                      <th style={{ padding: "8px 10px" }}>Accuracy</th>
                      <th style={{ padding: "8px 10px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validAttempts.map((att, idx) => {
                      const pct = att.percent ?? Math.round((att.score / (att.total || 15)) * 100);
                      const dateStr = att.at ? new Date(att.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : `Attempt #${idx + 1}`;
                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--pc-border)" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 600 }}>#{idx + 1}</td>
                          <td style={{ padding: "8px 10px", color: "var(--pc-text-muted)" }}>{dateStr}</td>
                          <td style={{ padding: "8px 10px" }}>{att.score} / {att.total || 15}</td>
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: pct >= 80 ? "#10b981" : pct >= 50 ? "var(--pc-primary)" : "#ef4444" }}>
                            {pct}%
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <span
                              className={`pc-badge ${pct >= 80 ? "pc-badge-success" : pct >= 50 ? "pc-badge-primary" : "pc-badge-warning"}`}
                              style={{ fontSize: "10px", padding: "2px 6px" }}
                            >
                              {pct >= 80 ? "Mastered" : pct >= 50 ? "Proficient" : "Revision Needed"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button className="pc-btn pc-btn-primary pc-btn-small" onClick={onClose}>
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
