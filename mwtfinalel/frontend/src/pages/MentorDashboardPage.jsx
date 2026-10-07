import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function MentorDashboardPage() {
  const { token, user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("students"); // "students" | "alerts" | "settings"

  // Message modal state
  const [messageModal, setMessageModal] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Profile update state
  const [phoneInput, setPhoneInput] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.mentorGetStudents(token), api.mentorGetProfile(token)])
      .then(([stuRes, profRes]) => {
        setStudents(stuRes.students || []);
        setProfile(profRes.mentor || null);
        if (profRes.mentor) {
          setPhoneInput(profRes.mentor.phone || "");
          setWhatsappInput(profRes.mentor.whatsappNumber || profRes.mentor.phone || "");
          setBioInput(profRes.mentor.bio || "");
        }
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // live polling for test & subject alerts
    return () => clearInterval(interval);
  }, [token]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    try {
      const res = await api.mentorUpdateProfile(token, {
        phone: phoneInput.trim(),
        whatsappNumber: whatsappInput.trim(),
        bio: bioInput.trim(),
      });
      setProfile(res.mentor);
      setSuccess("WhatsApp number and Mentor profile updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!messageModal || !messageText.trim()) return;
    setSendingMessage(true);
    setError("");
    try {
      const res = await api.mentorSendMessage(token, {
        studentId: messageModal._id,
        message: messageText.trim(),
        channel: "whatsapp",
      });
      setSuccess(`Message sent to ${messageModal.name}!`);
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
      }
      setMessageModal(null);
      setMessageText("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingMessage(false);
    }
  }

  const filteredStudents = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.studentId || "").toLowerCase().includes(q) ||
      (s.targetExam || "").toLowerCase().includes(q)
    );
  });

  // Collect all mock attempts across students for the live alerts feed
  const allMockAlerts = [];
  students.forEach((s) => {
    (s.recentMocks || []).forEach((m) => {
      allMockAlerts.push({
        studentName: s.name,
        studentId: s.studentId,
        studentPhone: s.phone || s.whatsappNumber,
        ...m,
      });
    });
  });
  allMockAlerts.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));

  // Collect completed subjects across students
  const allSubjectCompletions = [];
  students.forEach((s) => {
    (s.progress?.completedSubjects || []).forEach((cs) => {
      allSubjectCompletions.push({
        studentName: s.name,
        studentId: s.studentId,
        studentPhone: s.phone || s.whatsappNumber,
        exam: cs.exam,
        subject: cs.subject,
      });
    });
  });

  return (
    <div className="pc-app-layout" style={{ minHeight: "100vh", backgroundColor: "var(--bg-main, #f8fafc)" }}>
      {/* Top Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 32px",
          backgroundColor: "#1e1e2d",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              backgroundColor: "#2563eb",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            PC
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "19px", fontWeight: "700" }}>PrepCycle Mentor Portal</h2>
            <small style={{ color: "#94a3b8" }}>
              Academic Guidance & Student Performance Monitoring
            </small>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>{user?.name || "Mentor"}</div>
            <div style={{ fontSize: "12px", color: "#38bdf8" }}>
              📱 WhatsApp: {profile?.whatsappNumber || profile?.phone || "Not configured"}
            </div>
          </div>
          <button
            onClick={logout}
            className="pc-btn"
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "7px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1200, margin: "24px auto", padding: "0 20px" }}>
        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #f87171",
              color: "#991b1b",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #4ade80",
              color: "#166534",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: 16,
            }}
          >
            {success}
          </div>
        )}

        {/* Status & KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div className="pc-card" style={{ padding: 20, borderRadius: 10, backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <span style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Assigned Students</span>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#2563eb", marginTop: 4 }}>{students.length}</div>
            <small style={{ color: "#64748b" }}>Active exam aspirants under your mentorship</small>
          </div>

          <div className="pc-card" style={{ padding: 20, borderRadius: 10, backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <span style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Mock Test Submissions</span>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginTop: 4 }}>{allMockAlerts.length}</div>
            <small style={{ color: "#64748b" }}>Tests evaluated & logged</small>
          </div>

          <div className="pc-card" style={{ padding: 20, borderRadius: 10, backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <span style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Completed Subjects</span>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#8b5cf6", marginTop: 4 }}>{allSubjectCompletions.length}</div>
            <small style={{ color: "#64748b" }}>100% syllabus milestones completed</small>
          </div>

          <div className="pc-card" style={{ padding: 20, borderRadius: 10, backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <span style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase" }}>Notification Service</span>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#16a34a", marginTop: 8 }}>
              🟢 WhatsApp & In-App Alerts
            </div>
            <small style={{ color: "#64748b" }}>Active on {profile?.whatsappNumber || "configured phone"}</small>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 12, borderBottom: "2px solid #e2e8f0", marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab("students")}
            style={{
              padding: "10px 20px",
              fontWeight: "600",
              border: "none",
              borderBottom: activeTab === "students" ? "3px solid #2563eb" : "none",
              backgroundColor: "transparent",
              color: activeTab === "students" ? "#2563eb" : "#64748b",
              cursor: "pointer",
            }}
          >
            👥 My Assigned Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            style={{
              padding: "10px 20px",
              fontWeight: "600",
              border: "none",
              borderBottom: activeTab === "alerts" ? "3px solid #2563eb" : "none",
              backgroundColor: "transparent",
              color: activeTab === "alerts" ? "#2563eb" : "#64748b",
              cursor: "pointer",
            }}
          >
            🔔 Live Alerts Feed ({allMockAlerts.length + allSubjectCompletions.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            style={{
              padding: "10px 20px",
              fontWeight: "600",
              border: "none",
              borderBottom: activeTab === "settings" ? "3px solid #2563eb" : "none",
              backgroundColor: "transparent",
              color: activeTab === "settings" ? "#2563eb" : "#64748b",
              cursor: "pointer",
            }}
          >
            ⚙️ Mentor WhatsApp Settings
          </button>
        </div>

        {/* TAB 1: Assigned Students */}
        {activeTab === "students" && (
          <div className="pc-card" style={{ padding: 24, backgroundColor: "#fff", borderRadius: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ margin: 0 }}>Assigned Students & Progress</h3>
              <input
                type="text"
                className="pc-search-input"
                placeholder="Search students by name, ID, or target exam…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #cbd5e1", minWidth: 280 }}
              />
            </div>

            {loading ? (
              <p>Loading students…</p>
            ) : filteredStudents.length === 0 ? (
              <p style={{ color: "#64748b" }}>No students matching your search criteria.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="pc-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left", fontSize: "13px" }}>
                      <th style={{ padding: "12px 16px" }}>Student</th>
                      <th style={{ padding: "12px 16px" }}>Target Exam</th>
                      <th style={{ padding: "12px 16px" }}>Syllabus Progress</th>
                      <th style={{ padding: "12px 16px" }}>Completed Subjects</th>
                      <th style={{ padding: "12px 16px" }}>Latest Mock Score</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Mentor Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => {
                      const latestMock = s.recentMocks?.[0];
                      const pct = s.progress?.overallPercent || 0;
                      return (
                        <tr key={s._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px 16px" }}>
                            <strong>{s.name}</strong>
                            <br />
                            <small style={{ color: "#64748b" }}>{s.studentId || s.email}</small>
                            <br />
                            <small style={{ color: "#0284c7" }}>📞 {s.phone || "No phone registered"}</small>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span className="pc-badge" style={{ backgroundColor: "#e0e7ff", color: "#3730a3", padding: "4px 8px", borderRadius: 4 }}>
                              {s.targetExam || "GATE CSE"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", minWidth: 160 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: 4 }}>
                              <span>{s.progress?.completedTopics || 0}/{s.progress?.totalTopics || 0} topics</span>
                              <strong>{pct}%</strong>
                            </div>
                            <div style={{ height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", backgroundColor: pct > 75 ? "#10b981" : pct > 35 ? "#3b82f6" : "#f59e0b" }} />
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {s.progress?.completedSubjects?.length > 0 ? (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {s.progress.completedSubjects.map((cs, idx) => (
                                  <span key={idx} style={{ fontSize: "11px", backgroundColor: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: 4 }}>
                                    ✓ {cs.subject}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: "12px" }}>In progress</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {latestMock ? (
                              <div>
                                <span style={{ fontWeight: "700", color: latestMock.percentage >= 70 ? "#16a34a" : "#ca8a04" }}>
                                  {latestMock.score}/{latestMock.maxMarks} ({latestMock.percentage}%)
                                </span>
                                <br />
                                <small style={{ color: "#64748b" }}>{latestMock.mockName}</small>
                              </div>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: "12px" }}>No attempts yet</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              {s.studentWhatsAppLink ? (
                                <a
                                  href={s.studentWhatsAppLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pc-btn"
                                  style={{
                                    backgroundColor: "#25D366",
                                    color: "#fff",
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    textDecoration: "none",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  💬 WhatsApp
                                </a>
                              ) : null}
                              <button
                                onClick={() => {
                                  setMessageModal(s);
                                  setMessageText(`Hi ${s.name}, keep up the great effort on your exam preparation! Let me know if you need help on any topics.`);
                                }}
                                className="pc-btn"
                                style={{
                                  backgroundColor: "#2563eb",
                                  color: "#fff",
                                  padding: "6px 12px",
                                  borderRadius: 6,
                                  border: "none",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                              >
                                Send Guidance
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Live Alerts Feed */}
        {activeTab === "alerts" && (
          <div className="pc-card" style={{ padding: 24, backgroundColor: "#fff", borderRadius: 10 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Live Student Submissions & Milestone Events</h3>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Every time a student takes a mock test or finishes a subject, notifications are dispatched to your WhatsApp number (<strong>{profile?.whatsappNumber || "Not configured"}</strong>).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {allMockAlerts.length === 0 && allSubjectCompletions.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No recent student attempts recorded yet.</p>
              ) : (
                allMockAlerts.map((att, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 18px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "18px" }}>📝</span>
                        <strong>{att.studentName}</strong> ({att.studentId || "Student"}) completed <strong>{att.mockName}</strong>
                      </div>
                      <div style={{ fontSize: "13px", color: "#475569", marginTop: 4 }}>
                        Subject: {att.subjectName} &bull; Score: <strong style={{ color: att.percentage >= 60 ? "#16a34a" : "#ea580c" }}>{att.score}/{att.maxMarks} ({att.percentage}%)</strong> &bull; Date: {new Date(att.attemptedAt).toLocaleString()}
                      </div>
                    </div>
                    {att.studentPhone ? (
                      <a
                        href={`https://wa.me/${att.studentPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${att.studentName}, great job on attempting ${att.mockName}! You scored ${att.score}/${att.maxMarks} (${att.percentage}%). Let's review the questions you found tricky.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pc-btn"
                        style={{
                          backgroundColor: "#25D366",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: 6,
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        WhatsApp Feedback
                      </a>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Settings & WhatsApp Number */}
        {activeTab === "settings" && (
          <div className="pc-card" style={{ padding: 24, backgroundColor: "#fff", borderRadius: 10, maxWidth: 600 }}>
            <h3 style={{ marginTop: 0 }}>Mentor WhatsApp & Notification Preferences</h3>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Update your contact number to receive real-time notifications via WhatsApp when students take mock tests or finish subjects.
            </p>
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", fontSize: "13px", marginBottom: 6 }}>
                  WhatsApp Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                />
                <small style={{ color: "#64748b" }}>
                  Notifications will be sent to this WhatsApp contact.
                </small>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", fontSize: "13px", marginBottom: 6 }}>
                  Alternative Phone (for SMS)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", fontSize: "13px", marginBottom: 6 }}>
                  Mentor Bio & Subjects Expertise
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Senior Faculty for GATE CSE & Competitive Mathematics"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="pc-btn"
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {savingProfile ? "Saving…" : "Save Contact & Preferences"}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Direct Guidance Message Modal */}
      {messageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div style={{ backgroundColor: "#fff", padding: 24, borderRadius: 10, maxWidth: 500, width: "90%" }}>
            <h3 style={{ marginTop: 0 }}>Send Guidance to {messageModal.name}</h3>
            <p style={{ color: "#64748b", fontSize: "13px" }}>
              Target: {messageModal.targetExam || "Exam Aspirant"} &bull; WhatsApp: {messageModal.phone || "N/A"}
            </p>
            <form onSubmit={handleSendMessage}>
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your feedback, advice, or motivational note here…"
                style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #cbd5e1", marginBottom: 16 }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setMessageModal(null)}
                  style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {sendingMessage ? "Sending…" : "Send & Open WhatsApp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
