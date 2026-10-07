import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RegisterModal from "../components/RegisterModal";
import Auth3DVisual from "../components/Auth3DVisual";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthErr = params.get("oauth_error");
    if (oauthErr) {
      setError(decodeURIComponent(oauthErr));
      window.history.replaceState({}, "", "/login");
      return;
    }
    const oauthToken = params.get("oauth_token");
    if (!oauthToken) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${oauthToken}` } })
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) return;
        localStorage.setItem("prepcycle_auth", JSON.stringify({ user: d.user, token: oauthToken }));
        window.history.replaceState({}, "", "/login");
        window.location.href =
          d.user.role === "admin" ? "/admin" : d.user.role === "delivery" ? "/delivery" : d.user.role === "mentor" ? "/mentor" : "/exam-explorer";
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter your email and password.");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : user.role === "delivery" ? "/delivery" : user.role === "mentor" ? "/mentor" : "/exam-explorer");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="pc-auth-screen"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
        background: "radial-gradient(ellipse at top left, #1e293b 0%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "1040px",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          zIndex: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Interactive 3D Canvas Visual Section */}
        <div
          style={{
            flex: "1 1 420px",
            minWidth: "320px",
            maxWidth: "480px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#ffffff",
          }}
        >
          <div style={{ width: "100%", height: "380px", position: "relative" }}>
            <Auth3DVisual />
          </div>
          <div style={{ marginTop: "-20px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "0", color: "#f8fafc", letterSpacing: "-0.02em" }}>
              Explore. Prepare. Conquer.
            </h2>
          </div>
        </div>

        {/* Login Form Card */}
        <div
          className="pc-auth-card"
          style={{
            flex: "1 1 380px",
            maxWidth: "420px",
            background: "rgba(30, 41, 59, 0.82)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            color: "#ffffff",
            padding: "32px",
          }}
        >
          <div className="pc-auth-brand" style={{ color: "#ffffff", fontSize: "24px" }}>
            <span className="pc-logo-dot" />
            PrepCycle
          </div>
          <p className="pc-auth-tagline" style={{ color: "#94a3b8", marginBottom: "20px" }}>
            Your complete competitive exam preparation companion.
          </p>

          <form onSubmit={handleSubmit} className="pc-form">
            <label style={{ color: "#cbd5e1", fontSize: "13px" }}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  color: "#ffffff",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
              />
            </label>

            <label style={{ color: "#cbd5e1", fontSize: "13px" }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  color: "#ffffff",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
              />
            </label>

            {error && <div className="pc-form-error">{error}</div>}

            <button
              type="submit"
              className="pc-btn pc-btn-primary pc-btn-full"
              disabled={submitting}
              style={{
                marginTop: "12px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
              }}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="pc-divider" style={{ margin: "20px 0 16px" }}>
            <span style={{ color: "#64748b", background: "transparent" }}>or continue with</span>
          </div>

          <div className="pc-social-row">
            <a
              className="pc-btn pc-btn-outline pc-btn-full"
              href="/api/auth/oauth/google"
              style={{
                background: "#ffffff",
                borderColor: "#e2e8f0",
                color: "#1e293b",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "10px 16px",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                textDecoration: "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span style={{ color: "#1e293b", fontWeight: 600 }}>Continue with Google</span>
            </a>
          </div>

          <p className="pc-auth-footer" style={{ color: "#94a3b8", marginTop: "20px" }}>
            New here?{" "}
            <button
              type="button"
              className="pc-link-btn"
              onClick={() => setShowRegister(true)}
              style={{ color: "#60a5fa", fontWeight: 700 }}
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      {showRegister && (
        <RegisterModal onClose={() => setShowRegister(false)} onRegistered={(em) => setEmail(em)} />
      )}
    </div>
  );
}
