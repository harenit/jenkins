import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Chatbot() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const recognition = useRef(null);
  const [listening, setListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    return () => {
      recognition.current?.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  if (!user) return null;

  function speak(value) {
    if (!speechEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Remove markdown asterisks and hash tags for smoother speech
      const cleanText = value.replace(/[*#_`$]/g, "").slice(0, 300);
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = "en-IN";
      window.speechSynthesis.speak(utter);
    } catch {
      // Speech synthesis error fallback
    }
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setMessages(m => [...m, { role: "assistant", text: "Voice input is not supported by this browser." }]);
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const r = new SR();
    recognition.current = r;
    r.lang = "en-IN";
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setText(spoken);
    };
    r.start();
  }

  async function send(customText) {
    const value = (customText || text).trim();
    if (!value || busy) return;
    setText("");
    setMessages(m => [...m, { role: "user", text: value }]);
    setBusy(true);
    try {
      const d = await api.chat(token, value);
      setMessages(m => [...m, { role: "assistant", text: d.reply, sources: d.sources }]);
      speak(d.reply);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: e.message || "Failed to reach assistant." }]);
    } finally {
      setBusy(false);
    }
  }

  const SUGGESTIONS = [
    "How is my syllabus progress looking?",
    "Explain Paging and Virtual Memory in OS",
    "What is the Chomsky Hierarchy in TOC?",
    "High-scoring strategy for GATE CSE",
  ];

  return (
    <>
      <button className="pc-chat-fab" onClick={() => setOpen(v => !v)} aria-label="Open PrepCycle AI chatbot">
        🤖
      </button>

      {open && (
        <div className="pc-chat-widget">
          <div className="pc-chat-widget-head">
            <div>
              <strong>PrepCycle AI Tutor</strong>
              <small>Real-time subject help + notes + roadmap</small>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setSpeechEnabled(s => !s)}
                title={speechEnabled ? "Voice Output Active" : "Voice Output Muted"}
                style={{ fontSize: "16px" }}
              >
                {speechEnabled ? "🔊" : "🔇"}
              </button>
              <button type="button" onClick={() => setOpen(false)} style={{ fontSize: "20px" }}>×</button>
            </div>
          </div>

          <div className="pc-chat-widget-body">
            {messages.length === 0 ? (
              <div className="pc-empty-chat" style={{ padding: "40px 16px" }}>
                <div className="pc-empty-icon">🦉</div>
                <h4 style={{ margin: "10px 0 6px" }}>How can I help you study today?</h4>
                <p style={{ fontSize: "12px", color: "var(--pc-text-muted)" }}>
                  Ask about your notes, syllabus roadmap, weak chapters, or concept clarifications.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 16 }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="pc-btn pc-btn-outline pc-btn-small"
                      style={{ textAlign: "left", fontSize: "11.5px", padding: "6px 10px" }}
                      onClick={() => send(s)}
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`pc-chat-message ${m.role}`}>
                  <div className="pc-chat-bubble" style={{ whiteSpace: "pre-wrap" }}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
            {busy && (
              <div className="pc-chat-message assistant">
                <div className="pc-chat-bubble" style={{ fontStyle: "italic", color: "var(--pc-text-muted)" }}>
                  Thinking &amp; analyzing your study context…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="pc-chat-widget-input">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask anything about your syllabus…"
              disabled={busy}
            />
            <button
              type="button"
              onClick={startVoice}
              title="Voice Input"
              style={{ background: listening ? "#fee2e2" : undefined }}
            >
              {listening ? "⏹" : "🎙️"}
            </button>
            <button type="button" onClick={() => send()} disabled={busy || !text.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
