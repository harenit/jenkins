import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";

function monthMatrix(year, month, activeDaysSet) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const cells = [];

  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, active: activeDaysSet.has(key), key });
  }
  return cells;
}

export default function StudyHeatmapBody() {
  const { token } = useAuth();
  const [activeDays, setActiveDays] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [cursor, setCursor] = useState(() => new Date());
  const [error, setError] = useState("");
  const [logSuccess, setLogSuccess] = useState("");

  function load() {
    api
      .getAnalytics(token)
      .then((data) => {
        setActiveDays(data.activeStudyDays || []);
        setStreak(data.streak || { current: 0, longest: 0 });
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [token]);

  const activeSet = new Set(activeDays);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = monthMatrix(year, month, activeSet);
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  function shiftMonth(delta) {
    setCursor(new Date(year, month + delta, 1));
  }

  // Quick activity logger to turn today active
  async function logTodayActivity() {
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      setActiveDays((prev) => [...new Set([...prev, todayKey])]);
      setStreak((prev) => ({ ...prev, current: prev.current + 1 }));
      setLogSuccess("Today's study activity logged successfully! Your calendar square is now green.");
      setTimeout(() => setLogSuccess(""), 4000);
    } catch {
      //
    }
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {error && <div className="pc-form-error">{error}</div>}
      {logSuccess && (
        <div className="pc-badge pc-badge-success" style={{ padding: "10px 14px", display: "block" }}>
          {logSuccess}
        </div>
      )}

      {/* HEATMAP CALENDAR */}
      <div className="pc-card">
        <div className="pc-progress-header" style={{ flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3>📅 Activity Heatmap — {monthLabel}</h3>
            <p className="pc-card-note">
              🔥 Current streak: <strong>{streak.current}</strong> day(s) · Longest streak: <strong>{streak.longest}</strong> day(s)
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              className="pc-btn pc-btn-primary pc-btn-small"
              onClick={logTodayActivity}
              title="Click to record study hours for today"
            >
              ⚡ Log Today's Study Activity
            </button>
            <div className="pc-cal-nav">
              <button className="pc-cal-nav-btn" onClick={() => shiftMonth(-1)} type="button">‹</button>
              <button className="pc-cal-nav-btn" onClick={() => shiftMonth(1)} type="button">›</button>
            </div>
          </div>
        </div>

        {/* WEEKDAYS */}
        <div className="pc-cal-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* GRID CELLS */}
        <div className="pc-cal-grid">
          {cells.map((cell, i) =>
            cell ? (
              <div
                key={cell.key}
                className={`pc-cal-cell ${cell.active ? "active" : ""}`}
                title={`Date: ${cell.key} | Status: ${cell.active ? "Active Study Day ✓" : "No Activity Logged"}`}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{cell.day}</span>
                {cell.active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 4,
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#166534",
                    }}
                  />
                )}
              </div>
            ) : (
              <div key={`empty-${i}`} className="pc-cal-cell empty" />
            )
          )}
        </div>

        {/* LEGEND */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14, marginTop: 14, fontSize: "11.5px", color: "var(--pc-text-muted)" }}>
          <span>Intensity Legend:</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, border: "1px solid var(--pc-border)", background: "#fff", display: "inline-block" }} />
            <span>No Activity</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: "#e5f6ec", border: "1px solid #bfe0cc", display: "inline-block" }} />
            <span>Active Study Day (Streak Counted)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
