import { useEffect, useRef, useState } from "react";
import FlipCard from "../FlipCard";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";

const SUPPORTED_EXTENSIONS = [".txt", ".md", ".csv"];

export default function FlashcardsBody() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState("browse"); // browse | create | generate
  const [cards, setCards] = useState([]);
  const [examSlug, setExamSlug] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .listFlashcards(token, { examSlug: examSlug || undefined, subjectName: subjectName || undefined })
      .then((data) => setCards(data.cards))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token, examSlug, subjectName]);

  async function handleDelete(id) {
    try {
      await api.deleteFlashcard(token, id);
      setCards((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="pc-tab-switch pc-tab-switch-inline">
        {[["browse", "Browse"], ["create", "Create card"], ["generate", "Generate from notes"]].map(([key, label]) => (
          <button key={key} className={`pc-tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)} type="button">
            {label}
          </button>
        ))}
      </div>

      {error && <div className="pc-form-error">{error}</div>}

      {tab === "browse" && (
        <>
          <div className="pc-filter-bar">
            <input
              className="pc-search-input"
              placeholder="Filter by exam slug (e.g. neet-ug)…"
              value={examSlug}
              onChange={(e) => setExamSlug(e.target.value)}
            />
            <input
              className="pc-search-input"
              placeholder="Filter by subject (e.g. Physics)…"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="pc-card-note">Loading flashcards…</p>
          ) : cards.length === 0 ? (
            <p className="pc-card-note">No flashcards match these filters yet.</p>
          ) : (
            <div className="pc-flip-card-grid">
              {cards.map((card) => (
                <FlipCard
                  key={card._id}
                  question={card.question}
                  answer={card.answer}
                  footer={
                    <div className="pc-flip-card-meta">
                      <span className="pc-badge">{card.source}</span>
                      {card.user === user?._id || (card.user && card.user.toString?.() === user?.id) ? (
                        <button className="pc-link-btn" onClick={() => handleDelete(card._id)}>Delete</button>
                      ) : null}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "create" && <CreateCardForm token={token} onCreated={() => { setTab("browse"); load(); }} />}
      {tab === "generate" && <GenerateFromNotes token={token} onSaved={() => { setTab("browse"); load(); }} />}
    </div>
  );
}

function CreateCardForm({ token, onCreated }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [examSlug, setExamSlug] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question || !answer) {
      setError("Question and answer are both required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.createFlashcard(token, { question, answer, examSlug: examSlug || undefined, subjectName: subjectName || undefined });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pc-card pc-form" style={{ maxWidth: 480 }}>
      <label>Question<input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What is..." /></label>
      <label>Answer<textarea rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="The answer is..." /></label>
      <label>Exam slug (optional)<input value={examSlug} onChange={(e) => setExamSlug(e.target.value)} placeholder="e.g. neet-ug" /></label>
      <label>Subject (optional)<input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Physics" /></label>
      {error && <div className="pc-form-error">{error}</div>}
      <button className="pc-btn pc-btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Save flashcard"}</button>
    </form>
  );
}

function GenerateFromNotes({ token, onSaved }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [generated, setGenerated] = useState(null);
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file type "${ext}". Supported formats: ${SUPPORTED_EXTENSIONS.join(", ")}. (PDF text extraction isn't wired up yet — paste the text directly instead.)`);
      return;
    }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ""));
    reader.readAsText(file);
  }

  async function handleGenerate() {
    setBusy(true);
    setError("");
    try {
      const data = await api.generateFlashcards(token, { text });
      setGenerated(data.generated.map((c) => ({ ...c, keep: true })));
      setMethod(data.method);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function updateCard(i, field, value) {
    setGenerated((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  }

  async function handleSave() {
    setBusy(true);
    setError("");
    try {
      const cards = generated.filter((c) => c.keep).map(({ question, answer }) => ({ question, answer }));
      await api.saveGeneratedFlashcards(token, { cards });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pc-card" style={{ maxWidth: 640 }}>
      <h3>Generate flashcards from notes</h3>
      <p className="pc-card-note">
        Upload a .txt, .md, or .csv file, or paste text below. This uses a <strong>rule-based generator</strong>{" "}
        (pattern matching on term/definition lines) — not AI — so review each card before saving. The backend
        endpoint is structured so a real LLM could replace this logic later.
      </p>

      <input ref={fileInputRef} type="file" accept=".txt,.md,.csv" onChange={handleFile} />
      {fileName && <p className="pc-card-note">Loaded: {fileName}</p>}

      <textarea
        rows={8}
        placeholder="Or paste your notes here — one concept per line works best, e.g.&#10;Mitochondria: the powerhouse of the cell&#10;Photosynthesis: process by which plants convert sunlight into energy"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", marginTop: 10, padding: 10, borderRadius: 10, border: "1px solid var(--pc-border)" }}
      />

      {error && <div className="pc-form-error">{error}</div>}

      <button className="pc-btn pc-btn-primary" style={{ marginTop: 10 }} onClick={handleGenerate} disabled={busy || !text.trim()}>
        {busy ? "Generating…" : "Generate flashcards"}
      </button>

      {generated && (
        <div style={{ marginTop: 20 }}>
          <h4>Review &amp; edit ({generated.filter((c) => c.keep).length} of {generated.length} selected)</h4>
          {generated.map((card, i) => (
            <div key={i} className="pc-generated-card">
              <input type="checkbox" checked={card.keep} onChange={(e) => updateCard(i, "keep", e.target.checked)} />
              <div style={{ flex: 1 }}>
                <input value={card.question} onChange={(e) => updateCard(i, "question", e.target.value)} />
                <input value={card.answer} onChange={(e) => updateCard(i, "answer", e.target.value)} style={{ marginTop: 6 }} />
              </div>
            </div>
          ))}
          <button className="pc-btn pc-btn-primary" style={{ marginTop: 12 }} onClick={handleSave} disabled={busy}>
            {busy ? "Saving…" : `Save ${generated.filter((c) => c.keep).length} flashcards`}
          </button>
        </div>
      )}
    </div>
  );
}
