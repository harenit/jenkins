import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function ExamDetailPage() {
  const { slug } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getExam(token, slug)
      .then((data) => {
        setExam(data.exam);
        setIsRegistered(data.isRegistered);
      })
      .catch((err) => setError(err.message));
  }, [slug, token]);

  async function handleRegister() {
    setBusy(true);
    try {
      await api.registerExam(token, slug);
      setIsRegistered(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnregister() {
    if (!window.confirm("Are you sure you want to remove this exam from your registered list?")) return;
    setBusy(true);
    try {
      await api.unregisterExam(token, slug);
      setIsRegistered(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <AppLayout>
        <div className="pc-page">
          <div className="pc-form-error">{error}</div>
        </div>
      </AppLayout>
    );
  }
  if (!exam) {
    return (
      <AppLayout>
        <div className="pc-page">
          <p className="pc-card-note">Loading exam details…</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <Link to="/exam-explorer" className="pc-link-btn">← Back to Exam Explorer</Link>
            <h1 style={{ marginTop: 8 }}>{exam.name}</h1>
            <p className="pc-page-subtitle">{exam.authority}</p>
          </div>
          {isRegistered ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="pc-btn pc-btn-primary" onClick={() => navigate("/my-progress")}>
                View My Progress
              </button>
              <button
                className="pc-btn pc-btn-outline"
                style={{ color: "var(--pc-danger)", borderColor: "rgba(214,69,69,0.35)" }}
                onClick={handleUnregister}
                disabled={busy}
              >
                {busy ? "Removing…" : "Remove / Unregister"}
              </button>
            </div>
          ) : (
            <button className="pc-btn pc-btn-primary" onClick={handleRegister} disabled={busy}>
              {busy ? "Registering…" : "Register for this exam"}
            </button>
          )}
        </header>

        <div className="pc-card">
          <h3>Overview</h3>
          <p className="pc-card-note">{exam.description}</p>
          <p className="pc-card-note"><strong>Eligibility:</strong> {exam.eligibility}</p>
          <p className="pc-card-note">
            <strong>Official portal:</strong>{" "}
            {exam.officialUrl ? (
              <div><a href={exam.applicationUrl || exam.officialUrl} target="_blank" rel="noreferrer">Official application / exam portal ↗</a><div className="pc-card-note">Official source: {exam.officialUrl}</div><div className="pc-card-note">Source checked: {exam.sourceVerifiedAt || "Current authority portal"}</div></div>
            ) : "Not available"}

          </p>
        </div>

        {exam.timeline && (
          <div className="pc-card">
            <h3>Timeline</h3>
            <div className="pc-timeline-grid">
              {["notification", "registrationStart", "registrationEnd", "correction", "admitCard", "examDate", "answerKey", "result"]
                .filter((k) => exam.timeline[k])
                .map((k) => (
                  <div key={k} className="pc-timeline-item">
                    <div className="pc-timeline-label">{k.replace(/([A-Z])/g, " $1")}</div>
                    <div>{exam.timeline[k]}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {exam.applicationProcedure?.length > 0 && (
          <div className="pc-card">
            <h3>Application Procedure</h3>
            <ol className="pc-procedure-list">
              {exam.applicationProcedure.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        )}

        {exam.examPattern && (
          <div className="pc-card">
            <h3>Exam Pattern</h3>
            <div className="pc-pattern-grid">
              {exam.examPattern.subjectsCovered?.length > 0 && <div><strong>Subjects:</strong> {exam.examPattern.subjectsCovered.join(", ")}</div>}
              {exam.examPattern.sections?.length > 0 && <div><strong>Sections:</strong> {exam.examPattern.sections.join(", ")}</div>}
              {exam.examPattern.questionType && <div><strong>Question type:</strong> {exam.examPattern.questionType}</div>}
              {exam.examPattern.duration && <div><strong>Duration:</strong> {exam.examPattern.duration}</div>}
              {exam.examPattern.marking && <div><strong>Marking:</strong> {exam.examPattern.marking}</div>}
              {exam.examPattern.mode && <div><strong>Mode:</strong> {exam.examPattern.mode}</div>}
            </div>
          </div>
        )}

        {exam.dressCode?.length > 0 && (
          <div className="pc-card">
            <h3>Exam-Day / Dress Guidance</h3>
            <ul className="pc-procedure-list">
              {exam.dressCode.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}

        <div className="pc-card pc-phase-note">
          <h3>Official Update Watch</h3>
          <p>{exam.updatesNote}</p>
        </div>

        {exam.subjects?.length > 0 && (
          <div className="pc-card">
            <h3>Syllabus</h3>
            <p className="pc-card-note">
              {exam.subjects.map((s) => s.name).join(" · ")} — register to unlock the full topic-by-topic roadmap in My Progress.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
