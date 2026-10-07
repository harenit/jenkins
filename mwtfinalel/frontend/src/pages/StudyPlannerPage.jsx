import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

const PLAN_DURATIONS = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 Days" },
  { days: 14, label: "14 Days" },
  { days: 30, label: "30 Days (1 Month)" },
  { days: 60, label: "60 Days (2 Months)" },
  { days: 90, label: "90 Days (3 Months)" },
  { days: 180, label: "180 Days (6 Months)" },
  { days: 365, label: "365 Days (1 Year)" },
];

export default function StudyPlannerPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedExam, setSelectedExam] = useState("");
  const [registeredExams, setRegisteredExams] = useState([]);
  const [customDaysInput, setCustomDaysInput] = useState("");
  const [plan, setPlan] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [phases, setPhases] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [totalIncomplete, setTotalIncomplete] = useState(0);
  const [totalEstimatedHours, setTotalEstimatedHours] = useState(0);
  const [viewMode, setViewMode] = useState("phases"); // "phases" | "weeks" | "days"
  const [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    api
      .getTodaysPlan(token, { days: selectedDuration, ...(selectedExam ? { exam: selectedExam } : {}) })
      .then((data) => {
        setPlan(data.plan || []);
        setSchedule(data.schedule || []);
        setPhases(data.phases || []);
        setWeeks(data.weeks || []);
        setTotalIncomplete(data.totalIncomplete || 0);
        setTotalEstimatedHours(data.totalEstimatedHours || 0);
        if (data.registeredExams) setRegisteredExams(data.registeredExams);
        if (data.phases && data.phases.length > 0) {
          setViewMode("phases");
        } else {
          setViewMode("days");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token, selectedDuration, selectedExam]);

  function handleCustomDaysSubmit(e) {
    e.preventDefault();
    const days = parseInt(customDaysInput, 10);
    if (!isNaN(days) && days >= 1 && days <= 730) {
      setSelectedDuration(days);
    }
  }

  async function markDone(task) {
    setBusyId(task.topicId);
    try {
      await api.setTopicStatus(token, task.examSlug, task.topicId, "completed");
      setPlan((prev) => prev.filter((t) => t.topicId !== task.topicId));
      setSchedule((prev) =>
        prev.map((day) => ({
          ...day,
          tasks: (day.tasks || []).filter((t) => t.topicId !== task.topicId),
        }))
      );
      setPhases((prev) =>
        prev.map((phase) => ({
          ...phase,
          tasks: (phase.tasks || []).filter((t) => t.topicId !== task.topicId),
          taskCount: Math.max(0, phase.taskCount - (phase.tasks?.some((t) => t.topicId === task.topicId) ? 1 : 0)),
        }))
      );
      setWeeks((prev) =>
        prev.map((wk) => ({
          ...wk,
          days: (wk.days || []).map((day) => ({
            ...day,
            tasks: (day.tasks || []).filter((t) => t.topicId !== task.topicId),
          })),
        }))
      );
      setTotalIncomplete((n) => Math.max(0, n - 1));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const matchesFilter = (task) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      task.topicName?.toLowerCase().includes(q) ||
      task.subjectName?.toLowerCase().includes(q) ||
      task.chapterName?.toLowerCase().includes(q) ||
      task.examName?.toLowerCase().includes(q)
    );
  };

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <h1>📅 {t("studyPlanner", "Study Planner & Roadmap")}</h1>
            <p className="pc-page-subtitle">
              Adaptive, detailed multi-subject preparation roadmap structured for your exams with phased milestones, chapter weightages, and weak area mastery.
            </p>
          </div>
        </header>

        {/* Duration & Registered Exam Selection Bar */}
        <div className="pc-card" style={{ marginBottom: 20 }}>
          {/* Registered Exam Filter Selector */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--pc-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--pc-text)" }}>
                🎯 Filter by Registered Exam:
              </span>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--pc-primary)", background: "var(--pc-bg)", fontSize: "13px", fontWeight: 600, color: "var(--pc-primary)" }}
              >
                <option value="">All Registered Exams ({registeredExams.length})</option>
                {registeredExams.map((ex) => (
                  <option key={ex.slug} value={ex.slug}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedExam && (
              <span className="pc-badge pc-badge-success" style={{ fontSize: "11.5px" }}>
                Active: Showing Plan strictly for {registeredExams.find(e => e.slug === selectedExam)?.name || selectedExam}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
                ⏱️ How many days do you have to prepare?
              </label>
              <div className="pc-tab-switch pc-tab-switch-wrap" style={{ margin: 0 }}>
                {PLAN_DURATIONS.map((dur) => (
                  <button
                    key={dur.days}
                    type="button"
                    className={`pc-tab ${selectedDuration === dur.days ? "active" : ""}`}
                    onClick={() => {
                      setSelectedDuration(dur.days);
                      setCustomDaysInput("");
                    }}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCustomDaysSubmit} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                min="1"
                max="730"
                placeholder="Custom days (e.g. 180)"
                value={customDaysInput}
                onChange={(e) => setCustomDaysInput(e.target.value)}
                className="pc-input"
                style={{ width: 170 }}
              />
              <button type="submit" className="pc-btn pc-btn-primary pc-btn-small">
                Generate Plan
              </button>
            </form>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--pc-text-muted)" }}>
            <span>🎯 <strong>{totalIncomplete}</strong> total topics remaining</span>
            <span>⏳ Approx <strong>{totalEstimatedHours}</strong> study hours</span>
            <span>📆 Duration: <strong>{selectedDuration}</strong> day(s) {selectedDuration === 180 ? "(6 Months)" : selectedDuration === 365 ? "(1 Year)" : ""}</span>
          </div>
        </div>

        {error && <div className="pc-form-error">{error}</div>}

        {loading ? (
          <p className="pc-card-note">{t("loading", "Building your detailed plan…")}</p>
        ) : totalIncomplete === 0 ? (
          <div className="pc-card pc-phase-note">
            <h3>🎉 Nothing pending — awesome job!</h3>
            <p>
              Register for exams in <Link to="/exam-explorer">Exam Explorer</Link> or keep working through your{" "}
              <Link to="/my-progress">My Progress</Link> roadmap to populate your study plan.
            </p>
          </div>
        ) : selectedDuration === 1 ? (
          /* Single-Day View */
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p className="pc-card-note" style={{ margin: 0 }}>
                Showing top priority {plan.length} of {totalIncomplete} incomplete topics for today.
              </p>
            </div>
            <div className="pc-planner-list">
              {plan.map((task, i) => (
                <div key={task.topicId} className="pc-card pc-planner-item" style={task.isWeakArea ? { borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.02)" } : {}}>
                  <div className="pc-planner-index">{i + 1}</div>
                  <div className="pc-planner-body">
                    <div className="pc-planner-title">
                      {task.examName} — {task.subjectName} — {task.chapterName}
                    </div>
                    <div className="pc-card-note">
                      Topic: <strong>{task.topicName}</strong> · Suggested time: {task.suggestedMinutes} minutes
                      {task.isWeakArea && (
                        <span className="pc-badge" style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700, marginLeft: 8, fontSize: "11px" }}>
                          ⚠️ Weak Area ({task.weakScore !== undefined ? `${task.weakScore}%` : "Needs Focus"})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`pc-badge pc-badge-weightage-${task.weightage?.toLowerCase()}`}>
                    {task.weightage}
                  </span>
                  <Link
                    to={`/my-progress?exam=${task.examSlug}&chapter=${task.chapterId}&quiz=1`}
                    className="pc-btn pc-btn-ghost pc-btn-small"
                  >
                    Quiz
                  </Link>
                  <button
                    className="pc-btn pc-btn-primary pc-btn-small"
                    disabled={busyId === task.topicId}
                    onClick={() => markDone(task)}
                  >
                    {busyId === task.topicId ? "Saving…" : t("markComplete", "Mark complete")}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Multi-Day Detailed Roadmap View (e.g. 6 Months, 30 Days, etc.) */
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div className="pc-tab-switch pc-tab-switch-inline" style={{ margin: 0 }}>
                {phases.length > 0 && (
                  <button
                    type="button"
                    className={`pc-tab ${viewMode === "phases" ? "active" : ""}`}
                    onClick={() => setViewMode("phases")}
                  >
                    🎯 Phased Roadmap ({phases.length} Phases)
                  </button>
                )}
                {weeks.length > 0 && (
                  <button
                    type="button"
                    className={`pc-tab ${viewMode === "weeks" ? "active" : ""}`}
                    onClick={() => setViewMode("weeks")}
                  >
                    📅 Weekly Breakdown ({weeks.length} Weeks)
                  </button>
                )}
                <button
                  type="button"
                  className={`pc-tab ${viewMode === "days" ? "active" : ""}`}
                  onClick={() => setViewMode("days")}
                >
                  📋 Daily Schedule ({schedule.length} Days)
                </button>
              </div>

              <input
                type="text"
                placeholder="Search subjects or topics…"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pc-input"
                style={{ width: 220, padding: "6px 12px", fontSize: 13 }}
              />
            </div>

            {/* View 1: Phased Roadmap */}
            {viewMode === "phases" && phases.length > 0 && (
              <div className="pc-phases-container">
                {phases.map((phase) => {
                  const filteredPhaseTasks = (phase.tasks || []).filter(matchesFilter);
                  return (
                    <div key={phase.phaseNumber} className="pc-card" style={{ marginBottom: 20 }}>
                      <div className="pc-progress-header" style={{ marginBottom: 8 }}>
                        <div>
                          <h3 style={{ margin: 0, color: "var(--pc-accent)" }}>{phase.title}</h3>
                          <div style={{ fontSize: 13, color: "var(--pc-text-muted)", marginTop: 4 }}>
                            🗓️ <strong>{phase.dayRange}</strong> · 🎯 <strong>{filteredPhaseTasks.length}</strong> topics
                          </div>
                        </div>
                        <span className="pc-badge pc-badge-primary">Phase {phase.phaseNumber}</span>
                      </div>
                      <p style={{ fontSize: 14, margin: "6px 0 14px", fontStyle: "italic", color: "var(--pc-text)" }}>
                        Goal: {phase.milestone}
                      </p>

                      <div className="pc-planner-list">
                        {filteredPhaseTasks.slice(0, 10).map((task, idx) => (
                          <div key={task.topicId} className="pc-planner-item" style={{ borderBottom: "1px solid var(--pc-border)" }}>
                            <div className="pc-planner-index">{idx + 1}</div>
                            <div className="pc-planner-body">
                              <div className="pc-planner-title">
                                {task.examName} · <strong>{task.subjectName}</strong> · {task.chapterName}
                              </div>
                              <div className="pc-card-note">
                                Topic: <strong>{task.topicName}</strong> ({task.suggestedMinutes} min)
                                {task.isWeakArea && (
                                  <span style={{ color: "var(--pc-danger, #d64545)", fontWeight: 600, marginLeft: 6 }}>
                                    [Weak Area Priority]
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`pc-badge pc-badge-weightage-${task.weightage?.toLowerCase()}`}>
                              {task.weightage}
                            </span>
                            <button
                              className="pc-btn pc-btn-primary pc-btn-small"
                              disabled={busyId === task.topicId}
                              onClick={() => markDone(task)}
                            >
                              {busyId === task.topicId ? "Saving…" : "Done"}
                            </button>
                          </div>
                        ))}
                        {filteredPhaseTasks.length > 10 && (
                          <p className="pc-card-note" style={{ textAlign: "center", marginTop: 8 }}>
                            + {filteredPhaseTasks.length - 10} more topics in this phase.
                          </p>
                        )}
                        {filteredPhaseTasks.length === 0 && (
                          <p className="pc-card-note">No topics matching filter in this phase.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View 2: Weekly Breakdown */}
            {viewMode === "weeks" && weeks.length > 0 && (
              <div className="pc-weeks-container">
                {weeks.map((wk) => {
                  const filteredDays = (wk.days || []).map((d) => ({
                    ...d,
                    tasks: (d.tasks || []).filter(matchesFilter),
                  })).filter((d) => d.tasks.length > 0 || d.isRevisionDay);

                  return (
                    <div key={wk.weekNumber} className="pc-card" style={{ marginBottom: 16 }}>
                      <div className="pc-progress-header" style={{ marginBottom: 10 }}>
                        <h3 style={{ margin: 0 }}>{wk.title}</h3>
                        <span className="pc-card-note">
                          {wk.taskCount} topics · Est. {Math.round(wk.totalMinutes / 60)} hrs total
                        </span>
                      </div>
                      <div className="pc-planner-list">
                        {filteredDays.map((day) => (
                          <div
                            key={day.dayNumber}
                            style={{
                              padding: "10px 12px",
                              marginBottom: 8,
                              borderRadius: "var(--pc-radius-sm)",
                              backgroundColor: day.isRevisionDay ? "rgba(var(--pc-accent-rgb, 40, 167, 69), 0.08)" : "transparent",
                              border: day.isRevisionDay ? "1px solid var(--pc-accent)" : "1px solid var(--pc-border)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <strong style={{ fontSize: 14 }}>{day.title}</strong>
                              <span className="pc-card-note">{day.totalMinutes} mins</span>
                            </div>
                            {day.isRevisionDay && (
                              <p style={{ margin: "4px 0", fontSize: 13, color: "var(--pc-text-muted)" }}>
                                💡 {day.note}
                              </p>
                            )}
                            {day.tasks.map((task) => (
                              <div
                                key={task.topicId}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: 13,
                                  padding: "4px 0",
                                  borderTop: "1px dashed var(--pc-border)",
                                }}
                              >
                                <span>
                                  <strong>{task.subjectName}:</strong> {task.topicName} ({task.chapterName})
                                </span>
                                <button
                                  className="pc-btn pc-btn-ghost pc-btn-small"
                                  disabled={busyId === task.topicId}
                                  onClick={() => markDone(task)}
                                  style={{ padding: "2px 8px", fontSize: 12 }}
                                >
                                  {busyId === task.topicId ? "…" : "Done"}
                                </button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View 3: Day-by-Day Schedule */}
            {viewMode === "days" && (
              <div className="pc-schedule-view">
                {schedule
                  .map((d) => ({ ...d, tasks: (d.tasks || []).filter(matchesFilter) }))
                  .filter((d) => d.tasks.length > 0 || d.isRevisionDay)
                  .slice(0, 45) // Paginate first 45 active days to keep DOM light and smooth
                  .map((day) => (
                    <div
                      key={day.dayNumber}
                      className="pc-card"
                      style={{
                        marginBottom: 16,
                        borderLeft: day.isRevisionDay ? "4px solid var(--pc-accent)" : "4px solid var(--pc-primary)",
                      }}
                    >
                      <div className="pc-progress-header" style={{ marginBottom: 10 }}>
                        <h3 style={{ margin: 0 }}>{day.title}</h3>
                        <span className="pc-card-note">Est. {day.totalMinutes} mins</span>
                      </div>
                      {day.isRevisionDay && (
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--pc-text-muted)" }}>
                          💡 {day.note}
                        </p>
                      )}
                      <div className="pc-planner-list">
                        {day.tasks.map((task, idx) => (
                          <div key={task.topicId} className="pc-planner-item" style={{ borderBottom: "1px solid var(--pc-border)" }}>
                            <div className="pc-planner-index">{idx + 1}</div>
                            <div className="pc-planner-body">
                              <div className="pc-planner-title">
                                {task.examName} · <strong>{task.subjectName}</strong> · {task.chapterName}
                              </div>
                              <div className="pc-card-note">
                                Topic: <strong>{task.topicName}</strong> ({task.suggestedMinutes} min)
                                {task.isWeakArea && (
                                  <span style={{ color: "var(--pc-danger, #d64545)", fontWeight: 600, marginLeft: 6 }}>
                                    [Weak Area]
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`pc-badge pc-badge-weightage-${task.weightage?.toLowerCase()}`}>
                              {task.weightage}
                            </span>
                            <button
                              className="pc-btn pc-btn-primary pc-btn-small"
                              disabled={busyId === task.topicId}
                              onClick={() => markDone(task)}
                            >
                              {busyId === task.topicId ? "Saving…" : "Done"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                {schedule.length > 45 && (
                  <p className="pc-card-note" style={{ textAlign: "center", marginTop: 16 }}>
                    Showing first 45 scheduled days. Switch to <strong>Phased Roadmap</strong> or <strong>Weekly Breakdown</strong> to explore all {selectedDuration} days!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
