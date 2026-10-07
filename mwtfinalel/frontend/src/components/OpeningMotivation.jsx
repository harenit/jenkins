import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import "./OpeningMotivation.css";

export default function OpeningMotivation() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "student") return;

    const key = `prepcycle_daily_brief_${user._id || user.email}`;
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(key) === today) return;

    Promise.all([
      api.getAllProgress(token).catch(() => ({ summaries: [] })),
      api.getTodaysPlan(token).catch(() => ({ plan: [] })),
      api.getAnalytics(token).catch(() => null),
    ])
      .then(([p, planner, analytics]) => {
        const first = p.summaries?.[0];
        const nextTask = planner.plan?.[0];
        const weakSubject = analytics?.subjectPerformance?.find((s) => s.accuracy < 60);

        const examName = first?.examName || (nextTask?.examName ? nextTask.examName : "Registered Examination");
        const percent = first?.completion?.percent || 0;
        const streak = first?.streak?.current || (analytics?.studyHabits?.streak || 1);

        const focusSubject = nextTask?.subjectName || first?.subjects?.find((s) => s.completion.percent < 100)?.name || "Primary Subject";
        const focusChapter = nextTask?.chapterName || "Core Foundations";
        const pendingTopic = nextTask?.topicName ? `${nextTask.topicName} revision` : "Upcoming concepts";

        let recommendedAction = "Take one mock test to validate your retention";
        if (weakSubject) {
          recommendedAction = `Review weak area: ${weakSubject.subjectName} and take a chapter practice quiz`;
        } else if (percent > 80) {
          recommendedAction = "Take a full-length mock test and review error log";
        }

        setData({
          streak,
          examName,
          percent,
          focusSubject,
          focusChapter,
          pendingTopic,
          recommendedAction,
        });
        setVisible(true);
      })
      .catch(() => {});
  }, [user, token]);

  if (!visible || !data) return null;

  function close() {
    localStorage.setItem(`prepcycle_daily_brief_${user._id || user.email}`, new Date().toISOString().slice(0, 10));
    setVisible(false);
  }

  return (
    <div className="pc-opening-overlay">
      <div className="pc-opening-card">
        <button className="pc-opening-close" onClick={close} aria-label="Close dialog">
          ×
        </button>
        <div className="pc-opening-owl">🦉</div>
        <h2>Good morning!</h2>
        <p className="pc-opening-lead">{data.streak}-day study streak</p>

        <div className="pc-opening-stats">
          <span>📚 {data.examName}</span>
          <span>📈 {data.percent}% syllabus completed</span>
        </div>

        <div className="pc-opening-focus">
          <small>TODAY'S FOCUS</small>
          <strong>
            {data.focusSubject} → {data.focusChapter}
          </strong>
        </div>

        <div className="pc-opening-pending" style={{ margin: "10px 0", fontSize: "13px" }}>
          <div style={{ color: "var(--pc-text-muted)" }}>Pending:</div>
          <strong>{data.pendingTopic}</strong>
        </div>

        <div className="pc-opening-rec" style={{ margin: "10px 0", fontSize: "13px" }}>
          <div style={{ color: "var(--pc-text-muted)" }}>Recommended:</div>
          <span style={{ color: "var(--pc-primary)", fontWeight: 600 }}>{data.recommendedAction}</span>
        </div>

        <button className="pc-btn pc-btn-primary pc-btn-full" style={{ marginTop: 16 }} onClick={close}>
          START TODAY'S PLAN
        </button>
      </div>
    </div>
  );
}
