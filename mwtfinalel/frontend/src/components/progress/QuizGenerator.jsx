import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../api";

const EXAM_SUBJECT_MAP = {
  gate: [
    "General Aptitude",
    "Engineering Mathematics",
    "Digital Logic",
    "Computer Organization & Architecture",
    "Programming and Data Structures",
    "Algorithms",
    "Theory of Computation",
    "Compiler Design",
    "Operating Systems",
    "Database Management Systems",
    "Computer Networks",
  ],
  neet: [
    "Biology: Botany",
    "Biology: Zoology",
    "Physics",
    "Chemistry",
  ],
  cat: [
    "Quantitative Aptitude",
    "Data Interpretation & Logical Reasoning",
    "Verbal Ability & Reading Comprehension",
  ],
  jee: [
    "Mathematics",
    "Physics",
    "Chemistry",
  ],
  upsc: [
    "General Studies & Indian Polity",
    "History & Geography",
    "General Science",
    "Quantitative Aptitude",
    "Reasoning Ability",
  ],
  banking: [
    "Quantitative Aptitude",
    "Reasoning Ability",
    "English Language",
    "General Awareness & Banking",
  ],
  ssc: [
    "General Intelligence & Reasoning",
    "General Awareness",
    "Quantitative Aptitude",
    "English Comprehension",
  ],
};

export default function QuizGenerator({ defaultExamSlug = "", defaultTopic = "", notesText = "" }) {
  const { token, user } = useAuth();
  const { lang, t } = useLanguage();
  const [source, setSource] = useState(notesText ? "notes" : "topic");

  const [allExams, setAllExams] = useState([]);
  const [registeredExams, setRegisteredExams] = useState([]);
  const [selectedExamSlug, setSelectedExamSlug] = useState(defaultExamSlug || "");

  // Load exams and filter strictly to user's registered exams
  useEffect(() => {
    if (token) {
      api.listExams(token).then((data) => {
        const exams = data.exams || [];
        setAllExams(exams);

        const regSlugs = user?.registeredExams || [];
        const filtered = exams.filter((e) =>
          regSlugs.some(
            (slug) =>
              slug.toLowerCase() === e.slug.toLowerCase() ||
              e.slug.toLowerCase().includes(slug.toLowerCase()) ||
              slug.toLowerCase().includes(e.slug.toLowerCase())
          )
        );

        const activeList = filtered.length > 0
          ? filtered
          : (defaultExamSlug ? exams.filter((e) => e.slug.toLowerCase().includes(defaultExamSlug.toLowerCase())) : exams.slice(0, 1));

        setRegisteredExams(activeList);

        if (!selectedExamSlug || !activeList.some((e) => e.slug === selectedExamSlug)) {
          const match = activeList.find((e) => defaultExamSlug && e.slug.toLowerCase().includes(defaultExamSlug.toLowerCase())) || activeList[0];
          if (match) setSelectedExamSlug(match.slug);
        }
      }).catch(() => {});
    }
  }, [token, user?.registeredExams, defaultExamSlug]);

  const selectedExamObj = registeredExams.find((e) => e.slug === selectedExamSlug) || allExams.find((e) => e.slug === selectedExamSlug);
  const examKey = Object.keys(EXAM_SUBJECT_MAP).find((k) => (selectedExamSlug || "").toLowerCase().includes(k)) || "gate";
  const availableSubjects = selectedExamObj?.subjects?.length > 0
    ? selectedExamObj.subjects.map((s) => s.name)
    : (EXAM_SUBJECT_MAP[examKey] || EXAM_SUBJECT_MAP.gate);

  const [topic, setTopic] = useState(defaultTopic || availableSubjects[0]);
  const [text, setText] = useState(notesText);
  const [questionCount, setQuestionCount] = useState(10);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [fileName, setFileName] = useState("");
  const [readingFile, setReadingFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (defaultTopic) {
      setTopic(defaultTopic);
    } else {
      if (!availableSubjects.includes(topic)) {
        setTopic(availableSubjects[0] || "General");
      }
    }
  }, [selectedExamSlug, availableSubjects, defaultTopic]);

  useEffect(() => {
    if (topic && token) {
      api.listQuizAttempts(token, { topic }).then((d) => setRecentAttempts(d.attempts || [])).catch(() => {});
    }
  }, [topic, token]);

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setReadingFile(true);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || "";
      setText(content);
      setReadingFile(false);
    };
    reader.onerror = () => {
      setError("Failed to read the uploaded notes file.");
      setReadingFile(false);
    };
    reader.readAsText(file);
  }

  async function generate() {
    setBusy(true);
    setError("");
    setSubmitted(false);
    setAnswers({});
    try {
      const payload = source === "notes"
        ? { sourceType: "notes", text, count: questionCount, lang }
        : { sourceType: "topic", topic: topic || "Operating Systems", examSlug: selectedExamSlug || defaultExamSlug, count: questionCount, lang };
      const res = await api.generateQuiz(token, payload);
      setQuiz(res);
    } catch (e) {
      setError(e.message || "Failed to generate quiz.");
    } finally {
      setBusy(false);
    }
  }

  const score = quiz ? quiz.questions.reduce((n, q, i) => n + (Number(answers[i]) === q.answerIndex ? 1 : 0), 0) : 0;

  async function handleSubmit() {
    setSubmitted(true);
    if (!quiz) return;

    setSavingAttempt(true);
    try {
      const questionsData = quiz.questions.map((q, i) => ({
        question: q.question,
        options: q.options,
        selectedAnswer: answers[i] !== undefined ? Number(answers[i]) : -1,
        correctAnswer: q.answerIndex,
        isCorrect: Number(answers[i]) === q.answerIndex,
        explanation: q.explanation || "",
      }));

      const res = await api.saveQuizAttempt(token, {
        examSlug: selectedExamSlug || defaultExamSlug,
        examName: selectedExamObj?.name || quiz.examName || "",
        subjectName: quiz.subjectName || "",
        chapterName: quiz.chapterName || "",
        topic: source === "notes" ? "Notes" : topic,
        quizTitle: quiz.title,
        sourceType: source,
        totalQuestions: quiz.questions.length,
        score,
        questions: questionsData,
      });

      if (res.attempt) {
        setRecentAttempts((prev) => [res.attempt, ...prev]);
      }
    } catch {
      // Score displayed locally
    } finally {
      setSavingAttempt(false);
    }
  }

  return (
    <div className="pc-card pc-quiz-generator">
      <div className="pc-progress-header">
        <div>
          <h3>{t("quizGenerator", "Practice Quiz Generator")}</h3>
          <p className="pc-card-note">
            Generates topic-specific practice drills with step-by-step explanations, randomized options, and performance logging.
          </p>
        </div>
        {lang === "ta" && <span className="pc-badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>தமிழ் வினாடி வினா</span>}
      </div>

      <div className="pc-tab-switch pc-tab-switch-inline" style={{ marginTop: 10 }}>
        <button
          type="button"
          className={`pc-tab ${source === "topic" ? "active" : ""}`}
          onClick={() => setSource("topic")}
        >
          {t("fromTopic", "From Syllabus Topic")}
        </button>
        <button
          type="button"
          className={`pc-tab ${source === "notes" ? "active" : ""}`}
          onClick={() => setSource("notes")}
        >
          {t("fromNotes", "Upload & Generate from Notes")}
        </button>
      </div>

      <div className="pc-form" style={{ marginTop: 14 }}>
        {source === "topic" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 12 }}>
            <label>
              Target Registered Exam
              <select
                value={selectedExamSlug}
                onChange={(e) => setSelectedExamSlug(e.target.value)}
                style={{ marginTop: 4 }}
              >
                {registeredExams.length === 0 ? (
                  <option value="">No registered exams</option>
                ) : (
                  registeredExams.map((e) => (
                    <option key={e.slug} value={e.slug}>
                      {e.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label>
              {t("topicOrSubject", "Syllabus Subject / Specific Topic")}
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ marginTop: 4 }}
              >
                {availableSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t("numberOfQuestions", "Number of Questions")}
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                style={{ marginTop: 4 }}
              >
                <option value={5}>5 Questions (Quick Check)</option>
                <option value={10}>10 Questions (Standard Quiz)</option>
                <option value={15}>15 Questions (Deep Drill)</option>
                <option value={20}>20 Questions (Comprehensive Test)</option>
              </select>
            </label>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ border: "2px dashed var(--pc-border)", borderRadius: 8, padding: "16px", textAlign: "center", background: "rgba(0,0,0,0.01)" }}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".txt,.md,.json,.pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="pc-btn pc-btn-outline pc-btn-small"
                onClick={() => fileInputRef.current?.click()}
                disabled={readingFile}
              >
                📁 {readingFile ? "Reading File…" : "Upload Notes File (.txt, .md, .pdf)"}
              </button>
              {fileName && (
                <p style={{ marginTop: 8, fontSize: "12px", color: "var(--pc-primary)", fontWeight: 600 }}>
                  ✓ Uploaded: {fileName} ({Math.round(text.length / 1024)} KB)
                </p>
              )}
            </div>

            <label>
              {t("notesContent", "Notes Text (Pasted or Auto-loaded from Upload)")}
              <textarea
                rows="4"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste key notes, theorems, formulas, or summaries to synthesize questions from..."
              />
            </label>

            <label style={{ width: "fit-content" }}>
              {t("numberOfQuestions", "Number of Questions")}:{" "}
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                style={{ marginLeft: 6 }}
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </label>
          </div>
        )}

        <button
          className="pc-btn pc-btn-primary"
          type="button"
          disabled={busy || (source === "topic" && !topic) || (source === "notes" && !text)}
          onClick={generate}
          style={{ width: "fit-content", marginTop: 6 }}
        >
          {busy ? "Generating Quiz…" : `🎲 Generate ${questionCount} Questions on ${source === "notes" ? "Uploaded Notes" : topic}`}
        </button>
      </div>

      {error && <div className="pc-form-error" style={{ marginTop: 14 }}>{error}</div>}

      {/* QUIZ QUESTIONS */}
      {quiz && (
        <div style={{ marginTop: 24, borderTop: "1px solid var(--pc-border)", paddingTop: 16 }}>
          <div className="pc-progress-header" style={{ marginBottom: 14 }}>
            <h4>{quiz.title}</h4>
            <span className="pc-badge">{quiz.questions.length} Questions</span>
          </div>

          {quiz.questions.map((q, i) => (
            <div key={q.id || i} className="pc-quiz-question" style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 10px 0" }}>
                <strong>{i + 1}. {q.question}</strong>
              </p>
              {q.options.map((option, oi) => (
                <label className="pc-quiz-option" key={oi} style={{ display: "flex", gap: 8, padding: "6px 0", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name={`q-${i}`}
                    disabled={submitted}
                    checked={Number(answers[i]) === oi}
                    onChange={() => setAnswers({ ...answers, [i]: oi })}
                  />
                  <span>{option}</span>
                </label>
              ))}

              {submitted && (
                <div style={{ marginTop: 10 }}>
                  <div
                    className={`pc-quiz-feedback ${
                      Number(answers[i]) === q.answerIndex ? "correct" : "incorrect"
                    }`}
                  >
                    {Number(answers[i]) === q.answerIndex
                      ? "✓ Correct Answer!"
                      : `✗ Incorrect. Correct: Option ${q.answerIndex + 1} (${q.options[q.answerIndex]})`}
                  </div>

                  {q.explanation && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: "8px 12px",
                        background: "rgba(0,0,0,0.03)",
                        borderLeft: "3px solid var(--pc-primary)",
                        borderRadius: "0 6px 6px 0",
                        fontSize: "12.5px",
                        lineHeight: 1.4,
                      }}
                    >
                      <strong>💡 Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {!submitted && (
            <button
              className="pc-btn pc-btn-primary"
              type="button"
              disabled={Object.keys(answers).length !== quiz.questions.length}
              onClick={handleSubmit}
            >
              Submit &amp; View Explanations ({Object.keys(answers).length}/{quiz.questions.length} answered)
            </button>
          )}

          {submitted && (
            <div className="pc-card pc-inner-card" style={{ marginTop: 14, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <h4 style={{ color: "#166534", margin: 0 }}>
                🎯 Final Score: {score} / {quiz.questions.length} ({Math.round((score / quiz.questions.length) * 100)}%)
              </h4>
              <p style={{ fontSize: "12px", color: "#166534", margin: "4px 0 0" }}>
                {savingAttempt ? "Saving attempt to your performance record…" : "Attempt recorded to your history and progress heatmap."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* PAST ATTEMPTS */}
      {recentAttempts.length > 0 && (
        <div className="pc-attempt-history" style={{ marginTop: 24, borderTop: "1px solid var(--pc-border)", paddingTop: 16 }}>
          <h4>📜 Past Quiz Attempts for {topic || "this topic"}</h4>
          <table className="pc-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Topic / Title</th>
                <th>Score</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {recentAttempts.slice(0, 5).map((att) => (
                <tr key={att._id}>
                  <td>{new Date(att.attemptedAt).toLocaleDateString()}</td>
                  <td>{att.quizTitle || att.topic}</td>
                  <td>{att.score} / {att.totalQuestions}</td>
                  <td><strong>{att.percentage}%</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
