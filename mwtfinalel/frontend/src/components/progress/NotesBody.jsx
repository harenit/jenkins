import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import QuizGenerator from "./QuizGenerator";

export default function NotesBody({ onGenerateFlashcards }) {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api.listNotes(token).then((data) => setNotes(data.notes)).catch((err) => setError(err.message));
  }
  useEffect(load, [token]);

  function selectNote(note) {
    setSelected(note);
    setTitle(note.title);
    setContent(note.content);
  }

  function startNew() {
    setSelected(null);
    setTitle("");
    setContent("");
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Give your note a title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (selected) {
        const { note } = await api.updateNote(token, selected._id, { title, content });
        setNotes((prev) => prev.map((n) => (n._id === note._id ? note : n)));
        setSelected(note);
      } else {
        const { note } = await api.createNote(token, { title, content });
        setNotes((prev) => [note, ...prev]);
        setSelected(note);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await api.deleteNote(token, id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
    if (selected?._id === id) startNew();
  }

  return (
    <div>
      <div className="pc-page-header" style={{ marginBottom: 14 }}>
        <div />
        <button className="pc-btn pc-btn-outline pc-btn-small" onClick={startNew}>+ New note</button>
      </div>

      {error && <div className="pc-form-error">{error}</div>}

      <div className="pc-notes-layout">
        <div className="pc-notes-list">
          {notes.length === 0 && <p className="pc-card-note">No notes yet.</p>}
          {notes.map((note) => (
            <button
              key={note._id}
              className={`pc-notes-list-item ${selected?._id === note._id ? "active" : ""}`}
              onClick={() => selectNote(note)}
              type="button"
            >
              <div className="pc-notes-list-title">{note.title}</div>
              <div className="pc-notes-list-preview">{note.content?.slice(0, 60) || "Empty note"}</div>
            </button>
          ))}
        </div>

        <div className="pc-card pc-notes-editor">
          <input
            className="pc-notes-title-input"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            rows={12}
            placeholder="Write your note here…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="pc-notes-editor-actions">
            <button className="pc-btn pc-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save note"}
            </button>
            {selected && (
              <>
                <button className="pc-btn pc-btn-outline" onClick={() => onGenerateFlashcards?.()}>
                  Generate flashcards from this note
                </button>
                <button className="pc-btn pc-btn-ghost" onClick={() => handleDelete(selected._id)}>Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
      {selected && <QuizGenerator notesText={selected.content || ""} />}
    </div>
  );
}
