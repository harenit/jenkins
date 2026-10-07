import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

const RESOURCE_TABS = [
  ["all", "All Resources"],
  ["shared-pdfs", "📄 Shared Materials & PDFs (₹0)"],
  ["pdf", "PDF Documents"],
  ["notes", "Handwritten Notes"],
  ["practice", "Official Sources"],
  ["video", "Video Tutorials"],
  ["ebook", "Ebooks"],
];

export default function ResourcesPage() {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [examSlug, setExamSlug] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Modal for uploading softcopy notes / e-resources
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({
    title: "",
    examSlug: "",
    subjectName: "",
    type: "notes",
    url: "",
    description: "",
    fileName: "",
    fileSize: "",
  });
  const [sharing, setSharing] = useState(false);
  const [readingFile, setReadingFile] = useState(false);

  function load() {
    setLoading(true);
    api
      .listResources(token, {
        search,
        examSlug: examSlug || undefined,
        subjectName: subjectName || undefined,
        type: type === "all" ? undefined : type,
      })
      .then((data) => setResources(data.resources || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api.listExams(token).then((data) => setExams(data.exams || [])).catch(() => {});
  }, [token]);

  useEffect(() => {
    const selectedExam = exams.find((e) => e.slug === examSlug);
    setSubjects(selectedExam?.subjects?.map((s) => s.name) || []);
    if (subjectName && !(selectedExam?.subjects || []).some((s) => s.name === subjectName)) {
      setSubjectName("");
    }
  }, [examSlug, exams]);

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, examSlug, subjectName, type]);

  async function handleBookmark(id) {
    try {
      const { bookmarked } = await api.toggleBookmark(token, id);
      setResources((prev) => prev.map((r) => (r._id === id ? { ...r, bookmarked } : r)));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError("File exceeds 20MB limit. Please upload a smaller document.");
      return;
    }

    setReadingFile(true);
    setError("");

    const sizeStr = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
      : Math.round(file.size / 1024) + " KB";

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result || "";
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const autoTitle = shareForm.title || baseName;
      const detectedType = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "notes";

      setShareForm((prev) => ({
        ...prev,
        title: autoTitle,
        url: dataUrl,
        fileName: file.name,
        fileSize: sizeStr,
        type: prev.type || detectedType,
      }));
      setReadingFile(false);
    };

    reader.onerror = () => {
      setError("Failed to read the selected softcopy file.");
      setReadingFile(false);
    };

    reader.readAsDataURL(file);
  }

  function handleClearFile() {
    setShareForm((prev) => ({
      ...prev,
      fileName: "",
      fileSize: "",
      url: "",
    }));
  }

  async function handleShareSubmit(e) {
    e.preventDefault();
    if (!shareForm.title) {
      setError("Please provide a title for this study resource.");
      return;
    }
    if (!shareForm.url) {
      setError("Please select a softcopy file to upload or enter a resource link.");
      return;
    }
    setSharing(true);
    setError("");
    try {
      await api.shareResource(token, {
        title: shareForm.title,
        examSlug: shareForm.examSlug,
        subjectName: shareForm.subjectName,
        url: shareForm.url,
        description: shareForm.description,
        type: shareForm.type || "notes",
        fileName: shareForm.fileName,
      });
      setShowShareModal(false);
      setShareForm({ title: "", examSlug: "", subjectName: "", type: "notes", url: "", description: "", fileName: "", fileSize: "" });
      setSuccessMsg("Your softcopy notes / e-resource has been uploaded successfully!");
      setType(shareForm.type === "pdf" ? "pdf" : "notes");
      load();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to upload softcopy notes.");
    } finally {
      setSharing(false);
    }
  }

  function handleDownloadOrView(r) {
    if (r.url?.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = r.url;
      const ext = r.url.includes("data:application/pdf") ? ".pdf" : (r.url.includes("data:text") ? ".txt" : ".pdf");
      a.download = (r.title || "notes").replace(/[^a-zA-Z0-9_-]/g, "_") + ext;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(r.url, "_blank", "noopener,noreferrer");
    }
  }

  const sortedResources = [...resources].sort((a, b) => {
    if (sort === "title") return (a.title || "").localeCompare(b.title || "");
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  const paginated = sortedResources.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <h1>{t("resourceLibrary", "Resource Library & Shared Materials")}</h1>
            <p className="pc-page-subtitle">
              Official examination notices, free community-shared PDFs (₹0), formula handbooks, and past papers.
            </p>
          </div>
          <button
            type="button"
            className="pc-btn pc-btn-primary"
            onClick={() => setShowShareModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            📤 {t("uploadSoftcopy", "Upload Softcopy Notes / E-Resource")}
          </button>
        </header>

        {/* Informative banner for Shared PDFs & Community Materials */}
        {type === "shared-pdfs" && (
          <div
            className="pc-card pc-inner-card"
            style={{
              background: "linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 100%)",
              border: "1px solid #bbf7d0",
              marginBottom: 16,
            }}
          >
            <h3 style={{ color: "#166534", margin: "0 0 4px" }}>
              📄 {t("sharedMaterialsHeader", "Community Shared PDFs & Notes (₹0 / Free)")}
            </h3>
            <p className="pc-card-note" style={{ color: "#166534", margin: 0 }}>
              Curated lecture notes, formula sheets, and past year question papers shared by toppers and aspirants. Add
              them to your cart or library for <strong>₹0 / Free</strong> or download them directly.
            </p>
          </div>
        )}

        <div className="pc-filter-bar">
          <input
            className="pc-search-input"
            placeholder={t("searchResources", "Search resources, shared PDFs, subjects, notes…")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="pc-search-input"
            value={examSlug}
            onChange={(e) => setExamSlug(e.target.value)}
          >
            <option value="">All exams</option>
            {exams.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.name}
              </option>
            ))}
          </select>
          <select
            className="pc-search-input"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            disabled={!examSlug}
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="newest">Sort: Newest</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>

        <div className="pc-tab-switch pc-tab-switch-inline" style={{ overflowX: "auto", marginBottom: 16 }}>
          {RESOURCE_TABS.map(([key, label]) => (
            <button
              key={key}
              className={`pc-tab ${type === key ? "active" : ""}`}
              onClick={() => { setType(key); setPage(1); }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {error && <div className="pc-form-error">{error}</div>}
        {successMsg && (
          <div
            className="pc-badge pc-badge-success"
            style={{ display: "block", padding: "10px 14px", margin: "10px 0", fontSize: "13px" }}
          >
            ✓ {successMsg}
          </div>
        )}

        {loading ? (
          <p className="pc-card-note">Loading study materials…</p>
        ) : paginated.length === 0 ? (
          <div className="pc-card pc-phase-note" style={{ textAlign: "center", padding: "30px 20px" }}>
            <p>No resources found matching these filters. Try clearing your search or changing the exam filter.</p>
          </div>
        ) : (
          <div className="pc-grid pc-grid-3">
            {paginated.map((r) => {
              const isPdfOrNote = r.type === "pdf" || r.type === "notes" || r.source === "user";

              return (
                <div
                  key={r._id}
                  className="pc-card"
                  style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div className="pc-exam-card-top" style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                        <span className="pc-badge">
                          {r.source === "user" ? "Community Shared" : r.type?.toUpperCase()}
                        </span>
                        {isPdfOrNote && (
                          <span className="pc-badge pc-badge-success" style={{ fontSize: "11px" }}>
                            ₹0 · Free Access
                          </span>
                        )}
                      </div>
                      <button className="pc-bookmark-btn" onClick={() => handleBookmark(r._id)} title="Bookmark">
                        {r.bookmarked ? "★" : "☆"}
                      </button>
                    </div>

                    <h3 style={{ margin: "4px 0 6px", fontSize: "16px" }}>
                      {isPdfOrNote ? "📄 " : "🔗 "}
                      {r.title}
                    </h3>
                    <p className="pc-card-note" style={{ margin: "0 0 4px", fontWeight: 600 }}>
                      {r.subjectName || "General"} · {r.examSlug?.toUpperCase()}
                    </p>
                    {r.sharedBy && (
                      <p className="pc-card-note" style={{ margin: "0 0 6px", color: "var(--pc-primary)" }}>
                        Shared by: <strong>{r.sharedBy}</strong>
                      </p>
                    )}
                    <p className="pc-card-note pc-clamp-2" style={{ margin: "4px 0 12px" }}>
                      {r.description || "Comprehensive verified preparation material for candidates."}
                    </p>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="pc-btn pc-btn-primary pc-btn-small"
                      style={{ width: "100%", padding: "8px 12px", fontSize: "12.5px" }}
                      onClick={() => handleDownloadOrView(r)}
                    >
                      {r.url?.startsWith("data:")
                        ? "📥 Download / Open Softcopy ↗"
                        : (isPdfOrNote ? "📥 Read / Download PDF ↗" : "Open Resource Portal ↗")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sortedResources.length > pageSize && (
          <div className="pc-pagination">
            <button
              className="pc-btn pc-btn-outline pc-btn-small"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(sortedResources.length / pageSize)}
            </span>
            <button
              className="pc-btn pc-btn-outline pc-btn-small"
              disabled={page === Math.ceil(sortedResources.length / pageSize)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}

        {/* Modal: Upload Softcopy Notes / E-Resource */}
        {showShareModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: "rgba(15, 23, 42, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setShowShareModal(false)}
          >
            <div
              className="pc-card"
              style={{
                maxWidth: "560px",
                width: "100%",
                background: "var(--pc-card, #ffffff)",
                borderRadius: 16,
                padding: "24px",
                border: "1px solid var(--pc-border)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>📤 Upload Softcopy Notes / E-Resource</h3>
                <button
                  type="button"
                  className="pc-link-btn"
                  onClick={() => setShowShareModal(false)}
                  style={{ fontSize: "18px", color: "var(--pc-text-muted)" }}
                >
                  ✕
                </button>
              </div>

              <p className="pc-card-note" style={{ marginBottom: 16 }}>
                Upload your handwritten or typed notes as a softcopy (PDF, TXT, DOCX, or scans) so other aspirants can learn from your e-resource.
              </p>

              <form onSubmit={handleShareSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* File Upload Box */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: 4 }}>
                    Softcopy Notes File (.pdf, .txt, .md, .doc, .docx, images) *
                  </label>
                  
                  {shareForm.fileName ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "20px" }}>📄</span>
                        <div>
                          <strong style={{ fontSize: "13px", color: "#065f46", display: "block" }}>
                            {shareForm.fileName}
                          </strong>
                          <span style={{ fontSize: "11px", color: "#047857" }}>
                            {shareForm.fileSize} · Ready for upload
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="pc-btn pc-btn-outline pc-btn-small"
                        onClick={handleClearFile}
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                      >
                        ✕ Change
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: "2px dashed var(--pc-border, #cbd5e1)",
                        borderRadius: 8,
                        padding: "16px",
                        textAlign: "center",
                        background: "#f8fafc",
                        cursor: "pointer",
                      }}
                      onClick={() => document.getElementById("softcopy-file-input")?.click()}
                    >
                      <input
                        id="softcopy-file-input"
                        type="file"
                        accept=".pdf,.txt,.md,.doc,.docx,image/*"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                      <div style={{ fontSize: "26px", marginBottom: 4 }}>📁</div>
                      <strong style={{ fontSize: "13px", color: "var(--pc-text-main, #1e293b)", display: "block" }}>
                        {readingFile ? "Reading softcopy file..." : "Click or browse to select your Softcopy file"}
                      </strong>
                      <span style={{ fontSize: "11.5px", color: "var(--pc-text-muted, #64748b)" }}>
                        Supports PDF, TXT, Markdown, Word, and scanned images (Max 20MB)
                      </span>
                    </div>
                  )}
                </div>

                {/* Alternative URL Link */}
                <div style={{ borderTop: "1px solid var(--pc-border, #e2e8f0)", paddingTop: 10 }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: 4 }}>
                    Or Document / Cloud URL (if hosted on Google Drive / Dropbox)
                  </label>
                  <input
                    type="url"
                    className="pc-search-input"
                    style={{ width: "100%" }}
                    placeholder="https://drive.google.com/... or https://..."
                    value={shareForm.fileName ? "" : shareForm.url}
                    disabled={!!shareForm.fileName}
                    onChange={(e) => setShareForm({ ...shareForm, url: e.target.value })}
                  />
                  {shareForm.fileName && (
                    <span style={{ fontSize: "11px", color: "var(--pc-text-muted)" }}>
                      (Using attached softcopy file above)
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: 4 }}>
                    Resource Title *
                  </label>
                  <input
                    className="pc-search-input"
                    style={{ width: "100%" }}
                    placeholder="e.g. Complete Operating Systems Handwritten Notes & Formula Sheet"
                    value={shareForm.title}
                    onChange={(e) => setShareForm({ ...shareForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: 4 }}>
                      Resource Type
                    </label>
                    <select
                      className="pc-search-input"
                      style={{ width: "100%" }}
                      value={shareForm.type}
                      onChange={(e) => setShareForm({ ...shareForm, type: e.target.value })}
                    >
                      <option value="notes">Handwritten Notes (Softcopy)</option>
                      <option value="pdf">PDF Document / Notes</option>
                      <option value="ebook">Ebook / Reference Material</option>
                      <option value="practice">Formula Sheet / Practice</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: 4 }}>
                      Target Exam
                    </label>
                    <select
                      className="pc-search-input"
                      style={{ width: "100%" }}
                      value={shareForm.examSlug}
                      onChange={(e) => setShareForm({ ...shareForm, examSlug: e.target.value })}
                    >
                      <option value="">Select Exam</option>
                      {exams.map((e) => (
                        <option key={e.slug} value={e.slug}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: 4 }}>
                    Subject / Topic
                  </label>
                  <input
                    className="pc-search-input"
                    style={{ width: "100%" }}
                    placeholder="e.g. Operating Systems / Memory Management"
                    value={shareForm.subjectName}
                    onChange={(e) => setShareForm({ ...shareForm, subjectName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: 4 }}>
                    Notes Description / Summary
                  </label>
                  <textarea
                    className="pc-search-input"
                    style={{ width: "100%", minHeight: 60, resize: "vertical" }}
                    placeholder="Summarize key chapters, topics, or formulas included in this softcopy..."
                    value={shareForm.description}
                    onChange={(e) => setShareForm({ ...shareForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    className="pc-btn pc-btn-outline pc-btn-small"
                    onClick={() => setShowShareModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="pc-btn pc-btn-primary pc-btn-small"
                    disabled={sharing || readingFile}
                  >
                    {sharing ? "Uploading Softcopy…" : "✓ Upload E-Resource"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
