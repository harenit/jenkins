import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function CommunityPage() {
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState("discussions");
  const [discussions, setDiscussions] = useState([]);
  const [people, setPeople] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [replies, setReplies] = useState({});
  const messagesEndRef = useRef(null);

  const load = () =>
    api
      .listDiscussions()
      .then((d) => setDiscussions(d.discussions || []))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
    api
      .listPeople(token)
      .then((d) => {
        const usersList = d.users || [];
        setPeople(usersList);
        const targetUser = searchParams.get("user") || searchParams.get("chat");
        if (targetUser) {
          setTab("people");
          const found = usersList.find((u) => u._id === targetUser);
          if (found) setSelected(found);
        }
      })
      .catch((e) => setError(e.message));
  }, [token, searchParams]);

  // Live polling of conversation every 2.5 seconds when chat is open
  useEffect(() => {
    if (!selected) return;
    const fetchChat = () => {
      api
        .getConversation(token, selected._id)
        .then((d) => setMessages(d.messages || []))
        .catch(() => {});
    };
    fetchChat();
    const interval = setInterval(fetchChat, 2500);
    return () => clearInterval(interval);
  }, [selected, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function post(e) {
    e.preventDefault();
    try {
      await api.createDiscussion(token, { title, body });
      setTitle("");
      setBody("");
      setShowNew(false);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function reply(id) {
    const text = replies[id];
    if (!text?.trim()) return;
    try {
      const d = await api.replyToDiscussion(token, id, text);
      setDiscussions((x) => x.map((v) => (v._id === id ? d.discussion : v)));
      setReplies((x) => ({ ...x, [id]: "" }));
    } catch (e) {
      setError(e.message);
    }
  }

  async function send() {
    if (!message.trim() || !selected) return;
    const sentText = message;
    setMessage("");
    try {
      const d = await api.sendMessage(token, selected._id, sentText);
      setMessages((x) => [...x, d.message]);
    } catch (e) {
      setError(e.message);
      setMessage(sentText);
    }
  }

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <h1>Community & Aspirant Chat</h1>
            <p className="pc-page-subtitle">
              Learn with other aspirants, ask doubt questions, and message peer study partners directly with instant notifications.
            </p>
          </div>
        </header>

        {error && <div className="pc-form-error">{error}</div>}

        <div className="pc-tab-switch pc-tab-switch-inline">
          <button
            className={`pc-tab ${tab === "discussions" ? "active" : ""}`}
            onClick={() => setTab("discussions")}
            type="button"
          >
            Discussion Board
          </button>
          <button
            className={`pc-tab ${tab === "people" ? "active" : ""}`}
            onClick={() => setTab("people")}
            type="button"
          >
            Study Community & Peer Chat
          </button>
        </div>

        {tab === "discussions" && (
          <>
            <button
              type="button"
              className="pc-btn pc-btn-primary"
              onClick={() => setShowNew((v) => !v)}
              style={{ marginBottom: 16 }}
            >
              {showNew ? "Cancel" : "+ New Discussion"}
            </button>

            {showNew && (
              <form className="pc-card pc-form" onSubmit={post} style={{ marginBottom: 16 }}>
                <label>
                  Title
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. How to tackle GATE CS Operating Systems deadlocks?"
                    required
                  />
                </label>
                <label>
                  Details
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    placeholder="Describe your doubt or preparation strategy question in detail…"
                    required
                  />
                </label>
                <button type="submit" className="pc-btn pc-btn-primary">
                  Post Discussion
                </button>
              </form>
            )}

            {discussions.map((d) => (
              <div className="pc-card" key={d._id} style={{ marginBottom: 16 }}>
                <div className="pc-discussion-header">
                  <div>
                    <h3>{d.title}</h3>
                    <p className="pc-card-note">Posted by {d.userName || "Community member"}</p>
                    <p style={{ marginTop: 8, lineHeight: 1.5 }}>{d.body}</p>
                  </div>
                </div>

                <div className="pc-replies" style={{ marginTop: 12 }}>
                  {d.replies?.map((r) => (
                    <div className={`pc-reply ${r.isBest ? "best" : ""}`} key={r._id}>
                      <strong>{r.userName}</strong>
                      {r.isBest && <span className="pc-badge pc-badge-success">Best answer</span>}
                      <p>{r.body}</p>
                    </div>
                  ))}
                </div>

                <div className="pc-reply-form" style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <input
                    value={replies[d._id] || ""}
                    onChange={(e) => setReplies({ ...replies, [d._id]: e.target.value })}
                    placeholder="Ask a follow-up or share your advice…"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="pc-btn pc-btn-outline pc-btn-small"
                    onClick={() => reply(d._id)}
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "people" && (
          <div className="pc-community-grid">
            <div className="pc-card" style={{ padding: "16px" }}>
              <h3 style={{ margin: "0 0 12px" }}>Aspirants & Peers ({people.length})</h3>
              {people.length === 0 ? (
                <p className="pc-card-note">No other student accounts found.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {people.map((p) => (
                    <button
                      className={`pc-person-row ${selected?._id === p._id ? "active" : ""}`}
                      key={p._id}
                      onClick={() => setSelected(p)}
                      type="button"
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: selected?._id === p._id ? "var(--pc-surface, #e0e7ff)" : "transparent",
                      }}
                    >
                      <span className="pc-avatar" style={{ background: "var(--pc-primary)", color: "#fff" }}>
                        {p.name?.[0]?.toUpperCase()}
                      </span>
                      <span style={{ textAlign: "left" }}>
                        <strong>{p.name}</strong>
                        <small>{p.studentId || "Student"}</small>
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--pc-primary)", fontWeight: 600 }}>
                        Message →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pc-card pc-chat-card" style={{ display: "flex", flexDirection: "column", height: "600px" }}>
              {!selected ? (
                <div className="pc-empty-chat" style={{ margin: "auto" }}>
                  <div className="pc-empty-icon">💬</div>
                  <p>Select another student to ask questions, request advice, or discuss preparation.</p>
                </div>
              ) : (
                <>
                  <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--pc-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="pc-avatar" style={{ background: "#2563eb", color: "#fff" }}>
                        {selected.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "16px" }}>{selected.name}</h3>
                        <p className="pc-card-note" style={{ margin: 0 }}>
                          ID: {selected.studentId || "Student"} · Direct Live Messaging
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pc-chat-messages" style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
                    {messages.length === 0 ? (
                      <p className="pc-card-note" style={{ textAlign: "center", marginTop: 20 }}>
                        No messages yet with {selected.name}. Send a greeting to start collaborating!
                      </p>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.from === user?._id || m.from?._id === user?._id || m.from?.toString() === user?._id;
                        return (
                          <div
                            key={m._id}
                            className={`pc-chat-message ${isMe ? "user" : ""}`}
                            style={{
                              display: "flex",
                              justifyContent: isMe ? "flex-end" : "flex-start",
                              margin: "8px 0",
                            }}
                          >
                            <div
                              className="pc-chat-bubble"
                              style={{
                                background: isMe ? "#2563eb" : "var(--pc-surface, #f1f5f9)",
                                color: isMe ? "#ffffff" : "var(--pc-text, #1e293b)",
                                borderRadius: 14,
                                padding: "10px 14px",
                                maxWidth: "75%",
                                fontSize: "13.5px",
                                wordBreak: "break-word",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              }}
                            >
                              {m.body}
                              <div
                                style={{
                                  fontSize: "10px",
                                  marginTop: 4,
                                  textAlign: "right",
                                  opacity: 0.75,
                                }}
                              >
                                {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="pc-chat-input" style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--pc-border)" }}>
                    <input
                      className="pc-search-input"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder={`Type a message to ${selected.name}…`}
                      style={{ flex: 1 }}
                    />
                    <button type="button" className="pc-btn pc-btn-primary" onClick={send}>
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
