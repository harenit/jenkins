import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function RegisterModal({ onClose, onRegistered }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pc-modal-backdrop" onClick={onClose}>
      <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pc-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {success ? (
          <div className="pc-modal-success">
            <div className="pc-success-icon">✓</div>
            <h2>Account created!</h2>
            <p>Your PrepCycle account is ready. You can log in now.</p>
            <button
              className="pc-btn pc-btn-primary"
              onClick={() => {
                onRegistered?.(form.email);
                onClose();
              }}
            >
              Go to login
            </button>
          </div>
        ) : (
          <>
            <h2>Create your account</h2>
            <p className="pc-modal-subtitle">Start your exam prep journey with PrepCycle.</p>

            <form onSubmit={handleSubmit} className="pc-form">
              <label>
                Full name
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ananya Sharma"
                  autoComplete="name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </label>

              {error && <div className="pc-form-error">{error}</div>}

              <button type="submit" className="pc-btn pc-btn-primary pc-btn-full" disabled={submitting}>
                {submitting ? "Creating account…" : "Create Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
