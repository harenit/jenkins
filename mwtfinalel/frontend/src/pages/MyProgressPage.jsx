import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import AnalyticsBody from "../components/progress/AnalyticsBody";
import StudyHeatmapBody from "../components/progress/StudyHeatmapBody";
import FlashcardsBody from "../components/progress/FlashcardsBody";
import NotesBody from "../components/progress/NotesBody";
import ChapterPerformance from "../components/progress/ChapterPerformance";
import QuizGenerator from "../components/progress/QuizGenerator";
import SyllabusMockTests from "../components/progress/SyllabusMockTests";
import TopicScoreAnalysisModal from "../components/progress/TopicScoreAnalysisModal";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

function ProgressBar({ percent }) {
  return (
    <div className="pc-progress-bar">
      <div className="pc-progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

// Detailed subject descriptions as specified for GATE CSE syllabus
const GATE_SUBJECT_SUMMARIES = {
  "General Aptitude": "Includes Verbal, Quantitative, Analytical, and Spatial Aptitude.",
  "Engineering Mathematics": "Covers Discrete Mathematics, Linear Algebra, Calculus, Probability, and Statistics.",
  "Digital Logic": "Boolean algebra, K-maps, design of combinational/sequential circuits, and number representation.",
  "Computer Organization and Architecture (COA)": "Machine instructions, ALU/processor design, pipelining, memory hierarchy, and I/O interfaces.",
  "Computer Organization and Architecture": "Machine instructions, ALU/processor design, pipelining, memory hierarchy, and I/O interfaces.",
  "Programming and Data Structures": "Programming in C, arrays, stacks, queues, linked lists, trees, and graphs.",
  "Algorithms": "Searching, sorting, hashing, asymptotic complexity, greedy algorithms, dynamic programming, and graph algorithms.",
  "Theory of Computation (TOC)": "Automata theory, regular and context-free languages, and Turing machines.",
  "Theory of Computation": "Automata theory, regular and context-free languages, and Turing machines.",
  "Compiler Design": "Compiler phases (lexical analysis, parsing, intermediate code) and code optimization.",
  "Operating Systems (OS)": "Process management, synchronization, deadlocks, virtual memory, and file systems.",
  "Operating Systems": "Process management, synchronization, deadlocks, virtual memory, and file systems.",
  "Databases (DBMS)": "ER/relational models, normalization, indexing, transactions, and concurrency control.",
  "Computer Networks (CN)": "OSI/TCP-IP stacks, data link, network, transport, and application layers.",
  "Computer Networks": "OSI/TCP-IP stacks, data link, network, transport, and application layers.",
};

// Exam-specific official mock portal definitions (Strictly scoped per exam)
function getExamMockConfig(slug = "") {
  const s = String(slug || "").toLowerCase();
  if (s.includes("gate")) {
    return {
      examType: "GATE",
      name: "GATE (IISc / IITs)",
      portalName: "GATE Official CBT Simulator & Virtual Calculator",
      portalUrl: "https://gate2024.iisc.ac.in/",
      prefix: "GATE CBT Drill",
    };
  }
  if (s.includes("cat")) {
    return {
      examType: "CAT",
      name: "CAT (IIMs)",
      portalName: "CAT Official Mock Test & Sectional Interface",
      portalUrl: "https://iimcat.ac.in/",
      prefix: "CAT CBT Sectional Drill",
    };
  }
  if (s.includes("neet")) {
    return {
      examType: "NEET UG",
      name: "NEET UG (NTA)",
      portalName: "National Testing Agency (NTA) Official Mock Practice",
      portalUrl: "https://nta.ac.in/Quiz",
      prefix: "NEET Official CBT Drill",
    };
  }
  if (s.includes("jee")) {
    return {
      examType: "JEE Main",
      name: "JEE Main (NTA)",
      portalName: "NTA JEE Main CBT Practice Simulator",
      portalUrl: "https://nta.ac.in/Quiz",
      prefix: "JEE Main CBT Practice Drill",
    };
  }
  if (s.includes("upsc")) {
    return {
      examType: "UPSC CSE",
      name: "UPSC Civil Services",
      portalName: "UPSC Official Examination Papers Portal",
      portalUrl: "https://upsc.gov.in/examinations/previous-question-papers",
      prefix: "UPSC Standard Practice Drill",
    };
  }
  if (s.includes("ssc")) {
    return {
      examType: "SSC CGL",
      name: "Staff Selection Commission",
      portalName: "SSC Official Practice Test Portal",
      portalUrl: "https://ssc.gov.in/",
      prefix: "SSC Tier-I/II Practice Drill",
    };
  }
  if (s.includes("ibps") || s.includes("banking") || s.includes("sbi")) {
    return {
      examType: "Banking",
      name: "IBPS / SBI Banking",
      portalName: "IBPS Candidate Practice Interface",
      portalUrl: "https://www.ibps.in/",
      prefix: "Banking CBT Speed Drill",
    };
  }
  return {
    examType: "Competitive Exam",
    name: "Official Examination Authority",
    portalName: "Official Candidate Practice Interface",
    portalUrl: "https://nta.ac.in/Quiz",
    prefix: "Sectional Practice Drill",
  };
}

export default function MyProgressPage() {
  const { token, user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [summaries, setSummaries] = useState([]);
  const [activeSlug, setActiveSlug] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyTopic, setBusyTopic] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [subTab, setSubTab] = useState("syllabus");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [quizTopic, setQuizTopic] = useState("");
  const [searchParams] = useSearchParams();

  // Topic Mock Test Scores state & logger
  const [topicScores, setTopicScores] = useState({});
  const [activeScoreTopicId, setActiveScoreTopicId] = useState(null);
  const [scoreInput, setScoreInput] = useState(14);
  const [scoreTotal, setScoreTotal] = useState(15);
  const [savingScore, setSavingScore] = useState(false);
  const [analysisModalData, setAnalysisModalData] = useState(null);

  function getTopicAttempts(topicId) {
    const val = topicScores[topicId];
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (val.attempts && Array.isArray(val.attempts)) return val.attempts;
    if (typeof val === "object" && val.score !== undefined) return [val];
    return [];
  }

  const SUB_TABS = [
    ["syllabus", t("syllabus", "Syllabus & Mock Tests")],
    ["calendar", t("studyHeatmap", "Study Heatmap")],
    ["analytics", t("analytics", "Analytics & Progress Graphs")],
    ["flashcards", t("flashcards", "Flashcards")],
    ["notes", t("notes", "Notes")],
    ["quiz", t("quizGenerator", "Quiz Generator")],
  ];

  useEffect(() => {
    api
      .getAllProgress(token)
      .then((data) => {
        const list = data.summaries || [];
        setSummaries(list);
        if (list.length > 0) {
          const requestedExam = searchParams.get("exam");
          const match = list.find((s) => s.examSlug === requestedExam);
          setActiveSlug(match?.examSlug || list[0].examSlug);
        } else {
          setActiveSlug(null);
          setRoadmap(null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, searchParams, user?.registeredExams]);

  useEffect(() => {
    if (!activeSlug) return;
    try {
      const stored = JSON.parse(localStorage.getItem(`prepcycle_topic_scores_${activeSlug}`) || "{}");
      setTopicScores(stored);
    } catch {}

    api
      .getRoadmap(token, activeSlug)
      .then((data) => {
        setRoadmap(data);
        const chapterId = searchParams.get("chapter");
        if (chapterId) {
          for (const subject of data.subjects) {
            const chapter = subject.chapters.find((c) => c.id === chapterId);
            if (chapter) {
              setSelectedChapter({ subject, chapter });
              break;
            }
          }
        }
        if (searchParams.get("quiz")) setSubTab("quiz");
      })
      .catch((err) => setError(err.message));
  }, [activeSlug, token, searchParams]);

  async function handleUnregisterExam(slug) {
    if (!window.confirm("Are you sure you want to remove this exam from your registered list?")) return;
    try {
      const res = await api.unregisterExam(token, slug);
      if (res?.user && updateUser) updateUser(res.user);
      const data = await api.getAllProgress(token);
      const list = data.summaries || [];
      setSummaries(list);
      if (list.length > 0) {
        setActiveSlug(list[0].examSlug);
      } else {
        setActiveSlug(null);
        setRoadmap(null);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function setStatus(topicId, status) {
    setBusyTopic(topicId);
    try {
      const updated = await api.setTopicStatus(token, activeSlug, topicId, status);
      setRoadmap(updated);
      api.getAllProgress(token).then((data) => setSummaries(data.summaries));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyTopic(null);
    }
  }

  async function handleSaveTopicScore(e, subject, topic) {
    e.preventDefault();
    setSavingScore(true);
    const scoreVal = Number(scoreInput) || 0;
    const totalVal = Number(scoreTotal) || 15;
    const currentAttempts = getTopicAttempts(topic.id);
    const newEntry = {
      attemptNumber: currentAttempts.length + 1,
      score: scoreVal,
      total: totalVal,
      percent: Math.round((scoreVal / totalVal) * 100),
      at: new Date().toISOString(),
    };
    const nextScores = { ...topicScores, [topic.id]: [...currentAttempts, newEntry] };
    setTopicScores(nextScores);
    try {
      localStorage.setItem(`prepcycle_topic_scores_${activeSlug}`, JSON.stringify(nextScores));
      if (token) {
        // Find which chapter this topic belongs to
        const chapterForTopic = subject.chapters?.find((c) => c.topics?.some((t) => t.id === topic.id));

        await Promise.all([
          api.saveQuizAttempt(token, {
            examSlug: activeSlug,
            subjectName: subject.name,
            chapterName: chapterForTopic?.name || "",
            topic: topic.name,
            quizTitle: `${topic.name} Mock Drill`,
            sourceType: "mock-test",
            totalQuestions: totalVal,
            score: scoreVal,
            percentage: Math.round((scoreVal / totalVal) * 100),
            questions: [],
          }),
          chapterForTopic
            ? api.recordMockAttempt(token, activeSlug, chapterForTopic.id, {
                subjectId: subject.id,
                mockId: topic.id,
                mockName: `${topic.name} Mock Drill`,
                questionsAttended: totalVal,
                marks: scoreVal,
                maxMarks: totalVal,
              })
            : Promise.resolve(),
        ]);

        // Refresh roadmap so streaks and daily logs update instantly
        const updatedRoadmap = await api.getRoadmap(token, activeSlug);
        setRoadmap(updatedRoadmap);
      }
    } catch {
      // Local recovery
    } finally {
      setSavingScore(false);
      setActiveScoreTopicId(null);
    }
  }

  function openChapter(subject, chapter) {
    setSelectedChapter({ subject, chapter });
    api
      .recordRecentlyAccessed(token, {
        type: "chapter",
        title: chapter.name,
        subtitle: subject.name,
        target: `/my-progress?exam=${activeSlug}&chapter=${chapter.id}`,
      })
      .catch(() => {});
  }

  function toggleCollapsed(chapterId) {
    setCollapsed((c) => ({ ...c, [chapterId]: !c[chapterId] }));
  }

  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (token) {
      api.getRecentlyAccessed(token).then((d) => setRecent(d.items || [])).catch(() => {});
    }
  }, [token, activeSlug]);

  const examMockConfig = getExamMockConfig(activeSlug);

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <h1>{t("myProgress", "My Progress")}</h1>
            <p className="pc-page-subtitle">
              {t("myProgressSub", "Track consistency across your registered exams, subjects, mock tests, and daily revision.")}
            </p>
          </div>
          {activeSlug && (
            <button
              type="button"
              className="pc-btn pc-btn-small pc-btn-outline"
              style={{ color: "var(--pc-danger)", borderColor: "rgba(214,69,69,0.35)" }}
              onClick={() => handleUnregisterExam(activeSlug)}
            >
              🗑️ {t("unregisterExam", "Remove / Unregister Exam")}
            </button>
          )}
        </header>

        {/* RECENTLY ACCESSED BAR */}
        {recent.length > 0 && (
          <div className="pc-card pc-recent-card" style={{ marginBottom: 16, padding: "12px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--pc-primary)", letterSpacing: "0.3px" }}>
                ⏱️ {t("recentlyAccessed", "Recently Accessed")}
              </span>
            </div>
            <div className="pc-recent-list" style={{ gap: 10 }}>
              {recent.slice(0, 5).map((item) => (
                <Link key={item._id || item.target} to={item.target || "/my-progress"} className="pc-recent-item" style={{ padding: "8px 14px" }}>
                  <strong style={{ fontSize: "13px" }}>{item.title}</strong>
                  <span style={{ fontSize: "11px" }}>{item.subtitle}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {error && <div className="pc-form-error">{error}</div>}

        {loading ? (
          <p className="pc-card-note">Loading your progress…</p>
        ) : summaries.length === 0 ? (
          <div className="pc-card pc-phase-note">
            <h3>No registered exams yet</h3>
            <p>
              Head to <Link to="/exam-explorer">Exam Explorer</Link> and register for an exam — a full roadmap
              and subject mock tests will be generated for you automatically, right here.
            </p>
          </div>
        ) : (
          <>
            <div className="pc-tab-switch pc-tab-switch-wrap">
              {summaries.map((s) => (
                <button
                  key={s.examSlug}
                  className={`pc-tab ${activeSlug === s.examSlug ? "active" : ""}`}
                  onClick={() => setActiveSlug(s.examSlug)}
                  type="button"
                >
                  {s.examName} — {s.completion.percent}%
                </button>
              ))}
            </div>

            <div className="pc-tab-switch pc-tab-switch-inline">
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

            {subTab === "syllabus" && roadmap && roadmap.exam.slug === activeSlug && (
              <>
                {selectedChapter && (
                  <ChapterPerformance
                    examSlug={activeSlug}
                    subject={selectedChapter.subject}
                    chapter={selectedChapter.chapter}
                    onClose={() => setSelectedChapter(null)}
                  />
                )}

                <div className="pc-card">
                  <div className="pc-progress-header">
                    <div>
                      <h3>{roadmap.exam.name} — {t("overallProgress", "Overall Progress")}</h3>
                      <p className="pc-card-note">
                        {roadmap.completion.completed} / {roadmap.completion.total} {t("topicsCompleted", "topics complete")}
                      </p>
                    </div>
                    <div className="pc-progress-percent">{roadmap.completion.percent}%</div>
                  </div>
                  <ProgressBar percent={roadmap.completion.percent} />

                  {/* Consistency Streaks & Automated Daily Logs */}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--pc-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ background: "rgba(234, 88, 12, 0.1)", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(234, 88, 12, 0.3)" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#ea580c" }}>
                          🔥 {t("currentStreak", "Current Streak")}: {roadmap.streak.current} {roadmap.streak.current === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <span className="pc-card-note">
                        🏆 {t("longestStreak", "Longest Streak")}: <strong>{roadmap.streak.longest}</strong> days
                      </span>
                    </div>
                    <span className="pc-badge pc-badge-success" style={{ fontSize: "11px" }}>
                      ✓ Streaks &amp; Logs Auto-Synced
                    </span>
                  </div>

                  {/* Automated Daily Activity Logs Timeline */}
                  {roadmap.dailyLogs && roadmap.dailyLogs.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px dashed var(--pc-border)" }}>
                      <details>
                        <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "13px", color: "var(--pc-primary)" }}>
                          📋 View Recent Daily Activity Logs ({roadmap.dailyLogs.length} events recorded)
                        </summary>
                        <div style={{ marginTop: 10, display: "grid", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                          {roadmap.dailyLogs.map((log, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "var(--pc-bg)", borderRadius: 6, fontSize: "12px", border: "1px solid var(--pc-border)" }}>
                              <div>
                                <strong>{log.action}</strong>
                                {log.details && <span style={{ color: "var(--pc-text-muted)", marginLeft: 6 }}>— {log.details}</span>}
                              </div>
                              <span style={{ fontSize: "11px", color: "var(--pc-text-muted)" }}>
                                {log.date} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>

                {/* 11 SUBJECTS DETAILED SYLLABUS & TOPIC MOCK TESTS */}
                {roadmap.subjects.map((subject) => (
                  <div key={subject.id} className="pc-card">
                    <div className="pc-progress-header">
                      <div>
                        <h3 style={{ margin: 0 }}>{subject.name}</h3>
                        {GATE_SUBJECT_SUMMARIES[subject.name] && (
                          <p className="pc-card-note" style={{ color: "var(--pc-primary)", fontWeight: 600, margin: "4px 0 0", fontSize: "13px" }}>
                            📖 {GATE_SUBJECT_SUMMARIES[subject.name]}
                          </p>
                        )}
                      </div>
                      <div className="pc-progress-percent pc-progress-percent-small">{subject.completion.percent}%</div>
                    </div>
                    <ProgressBar percent={subject.completion.percent} />

                    <div className="pc-chapter-list" style={{ marginTop: 14 }}>
                      {subject.chapters.map((chapter) => (
                        <div key={chapter.id} className="pc-chapter">
                          <div
                            className="pc-chapter-header"
                            onClick={() => toggleCollapsed(chapter.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") toggleCollapsed(chapter.id);
                            }}
                          >
                            <span>{collapsed[chapter.id] ? "▸" : "▾"} {chapter.name}</span>
                            <span className="pc-chapter-meta">
                              <span className={`pc-badge pc-badge-weightage-${chapter.weightage?.toLowerCase()}`}>
                                {chapter.weightage}
                              </span>
                              {chapter.completion.completed}/{chapter.completion.total}
                              <button
                                className="pc-btn pc-btn-small pc-btn-outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openChapter(subject, chapter);
                                }}
                                type="button"
                              >
                                {t("analysis", "Analysis")}
                              </button>
                            </span>
                          </div>

                          {!collapsed[chapter.id] && (
                            <ul className="pc-topic-list">
                              {chapter.topics.map((topic) => (
                                <li key={topic.id} className={`pc-topic pc-topic-${topic.status}`} style={{ display: "block", padding: "12px 14px", borderBottom: "1px solid var(--pc-border)" }}>
                                  {/* Top Row: Topic Name & Learning Status Actions */}
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                                    <span style={{ fontWeight: 600, fontSize: "14px" }}>{topic.name}</span>
                                    <span className="pc-topic-actions">
                                      {topic.status !== "completed" && (
                                        <button
                                          className="pc-btn pc-btn-small pc-btn-outline"
                                          disabled={busyTopic === topic.id}
                                          onClick={() =>
                                            setStatus(topic.id, topic.status === "in_progress" ? "completed" : "in_progress")
                                          }
                                        >
                                          {topic.status === "in_progress" ? t("complete", "Complete") : t("start", "Start")}
                                        </button>
                                      )}
                                      <button
                                        className="pc-btn pc-btn-small pc-btn-ghost"
                                        type="button"
                                        onClick={() => {
                                          setQuizTopic(topic.name);
                                          setSubTab("quiz");
                                        }}
                                      >
                                        {t("quiz", "Quiz")}
                                      </button>
                                      {topic.status === "completed" && (
                                        <button
                                          className="pc-btn pc-btn-small pc-btn-ghost"
                                          disabled={busyTopic === topic.id}
                                          onClick={() => setStatus(topic.id, "pending")}
                                        >
                                          {t("reset", "Reset")}
                                        </button>
                                      )}
                                    </span>
                                  </div>

                                  {/* MOCK TEST LINKS & MARKS ENTRY DIRECTLY UNDER TOPIC NAME */}
                                  <div
                                    style={{
                                      marginTop: 8,
                                      padding: "8px 12px",
                                      background: "var(--pc-bg)",
                                      borderRadius: 8,
                                      border: "1px solid var(--pc-border)",
                                    }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--pc-primary)" }}>
                                          🎯 {examMockConfig.prefix}:
                                        </span>
                                        <a
                                          href={examMockConfig.portalUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ fontSize: "12px", color: "var(--pc-primary)", textDecoration: "underline", fontWeight: 600 }}
                                        >
                                          {examMockConfig.name} Official CBT Portal ↗
                                        </a>
                                        <button
                                          type="button"
                                          className="pc-link-btn"
                                          style={{ fontSize: "12px" }}
                                          onClick={() => {
                                            setQuizTopic(topic.name);
                                            setSubTab("quiz");
                                          }}
                                        >
                                          ⚡ Take Practice Mock Drill
                                        </button>
                                      </div>

                                      {/* Marks Logged Display & Action Controls */}
                                      {(() => {
                                        const attempts = getTopicAttempts(topic.id);
                                        const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
                                        return (
                                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                            {latest ? (
                                              <span className="pc-badge pc-badge-success" style={{ fontSize: "11px" }}>
                                                ⭐ Latest: {latest.score}/{latest.total || 15} ({latest.percent}%) • {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"}
                                              </span>
                                            ) : (
                                              <span style={{ fontSize: "11px", color: "var(--pc-text-muted)" }}>
                                                No mock score logged
                                              </span>
                                            )}

                                            <button
                                              type="button"
                                              className="pc-btn pc-btn-small pc-btn-outline"
                                              style={{ padding: "3px 8px", fontSize: "11px" }}
                                              onClick={() => {
                                                if (activeScoreTopicId === topic.id) {
                                                  setActiveScoreTopicId(null);
                                                } else {
                                                  setActiveScoreTopicId(topic.id);
                                                  setScoreInput(14);
                                                  setScoreTotal(15);
                                                }
                                              }}
                                            >
                                              {activeScoreTopicId === topic.id ? t("cancel", "Cancel") : "+ Add Mark / Attempt"}
                                            </button>

                                            {attempts.length > 0 && (
                                              <button
                                                type="button"
                                                className="pc-btn pc-btn-small"
                                                style={{
                                                  padding: "3px 8px",
                                                  fontSize: "11px",
                                                  background: "rgba(37,99,235,0.1)",
                                                  color: "var(--pc-primary)",
                                                  border: "1px solid var(--pc-primary)",
                                                  fontWeight: 600,
                                                }}
                                                onClick={() => {
                                                  setAnalysisModalData({
                                                    topicName: topic.name,
                                                    subjectName: subject.name,
                                                    attempts,
                                                    topicId: topic.id,
                                                  });
                                                }}
                                              >
                                                📊 Analysis Graph
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    {/* Inline Score Entry Form */}
                                    {activeScoreTopicId === topic.id && (
                                      <form
                                        onSubmit={(e) => handleSaveTopicScore(e, subject, topic)}
                                        style={{
                                          marginTop: 8,
                                          paddingTop: 8,
                                          borderTop: "1px dashed var(--pc-border)",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 10,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <span style={{ fontSize: "12px", fontWeight: 600 }}>Log Mock Score:</span>
                                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px" }}>
                                          Marks Scored:
                                          <input
                                            type="number"
                                            min={0}
                                            max={scoreTotal}
                                            value={scoreInput}
                                            onChange={(e) => setScoreInput(e.target.value)}
                                            style={{ width: 60, padding: "3px 6px", borderRadius: 6, border: "1px solid var(--pc-border)" }}
                                            required
                                          />
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px" }}>
                                          Out of:
                                          <input
                                            type="number"
                                            min={1}
                                            value={scoreTotal}
                                            onChange={(e) => setScoreTotal(e.target.value)}
                                            style={{ width: 60, padding: "3px 6px", borderRadius: 6, border: "1px solid var(--pc-border)" }}
                                            required
                                          />
                                        </label>
                                        <button
                                          type="submit"
                                          className="pc-btn pc-btn-primary pc-btn-small"
                                          style={{ padding: "4px 10px", fontSize: "11px" }}
                                          disabled={savingScore}
                                        >
                                          {savingScore ? "Saving…" : "Save Score"}
                                        </button>
                                      </form>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* DEDICATED MOCK TEST ANALYTICS GRAPH & CBT PORTALS (FILTERED STRICTLY TO ACTIVE EXAM) */}
                <SyllabusMockTests
                  examSlug={activeSlug}
                  subjects={roadmap.subjects || []}
                  onLaunchQuiz={(topic) => {
                    setQuizTopic(topic);
                    setSubTab("quiz");
                  }}
                />
              </>
            )}

            {subTab === "calendar" && <StudyHeatmapBody />}
            {subTab === "analytics" && <AnalyticsBody />}
            {subTab === "flashcards" && <FlashcardsBody />}
            {subTab === "notes" && <NotesBody onGenerateFlashcards={() => setSubTab("flashcards")} />}
            {subTab === "quiz" && <QuizGenerator defaultExamSlug={activeSlug} defaultTopic={quizTopic} />}
          </>
        )}

        {/* TOPIC MOCK ANALYSIS GRAPH & HISTORY MODAL */}
        {analysisModalData && (
          <TopicScoreAnalysisModal
            isOpen={true}
            onClose={() => setAnalysisModalData(null)}
            topicName={analysisModalData.topicName}
            subjectName={analysisModalData.subjectName}
            attempts={getTopicAttempts(analysisModalData.topicId)}
            onClearHistory={() => {
              const nextScores = { ...topicScores };
              delete nextScores[analysisModalData.topicId];
              setTopicScores(nextScores);
              try {
                localStorage.setItem(`prepcycle_topic_scores_${activeSlug}`, JSON.stringify(nextScores));
              } catch {}
              setAnalysisModalData(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}
