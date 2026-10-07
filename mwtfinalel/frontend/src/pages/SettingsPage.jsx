import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api";

export default function SettingsPage() {
  const { user, token } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const [theme, setTheme] = useState(() => localStorage.getItem("prepcycle_theme") || "light");
  const [colorTheme, setColorTheme] = useState(() => localStorage.getItem("prepcycle_color") || "default");
  const [font, setFont] = useState(() => localStorage.getItem("prepcycle_font") || "medium");

  // Profile form state
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    targetExam: user?.targetExam || "GATE CSE",
    college: user?.college || "",
    state: user?.state || "",
    dailyGoalHours: user?.dailyGoalHours || 4,
    bio: user?.bio || "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: "", error: false });

  // Change password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState({ text: "", error: false });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        phone: user.phone || "",
        targetExam: user.targetExam || "GATE CSE",
        college: user.college || "",
        state: user.state || "",
        dailyGoalHours: user.dailyGoalHours || 4,
        bio: user.bio || "",
      });
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("prepcycle_theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.color = colorTheme;
    localStorage.setItem("prepcycle_color", colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    document.documentElement.dataset.font = font;
    localStorage.setItem("prepcycle_font", font);
  }, [font]);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ text: "", error: false });
    try {
      await api.updateProfile(token, profile);
      setProfileMsg({ text: "Profile details saved successfully!", error: false });
    } catch (err) {
      setProfileMsg({ text: err.message || "Failed to update profile.", error: true });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPassMsg({ text: "New password and confirmation do not match.", error: true });
    }
    if (passwords.newPassword.length < 6) {
      return setPassMsg({ text: "Password must be at least 6 characters long.", error: true });
    }
    setPassSaving(true);
    setPassMsg({ text: "", error: false });
    try {
      await api.changePassword(token, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPassMsg({ text: "Password updated successfully!", error: false });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPassMsg({ text: err.message || "Failed to change password.", error: true });
    } finally {
      setPassSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="pc-page">
        <header className="pc-page-header">
          <div>
            <h1>⚙️ {t("settings", "Settings")}</h1>
            <p className="pc-page-subtitle">{t("settingsSubtitle", "Personal preferences, user details, and account security.")}</p>
          </div>
        </header>

        <div style={{ display: "grid", gap: 24, maxWidth: 740 }}>
          {/* DETAILED USER INFORMATION SECTION */}
          <div className="pc-card">
            <h3>👤 {t("account", "Account")} &amp; {t("profileInfo", "Profile Details")}</h3>
            <p className="pc-card-note">Manage your identity, target examination, and daily study schedule.</p>

            <form onSubmit={handleProfileSubmit} className="pc-form" style={{ marginTop: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label>
                  Full Name
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your Full Name"
                  />
                </label>

                <label>
                  Email Address
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    style={{ background: "rgba(0,0,0,0.03)", cursor: "not-allowed" }}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label>
                  Student ID
                  <input
                    type="text"
                    disabled
                    value={user?.studentId || "PC-STU-100001"}
                    style={{ fontWeight: 700, color: "var(--pc-primary)", background: "rgba(0,0,0,0.03)", cursor: "not-allowed" }}
                  />
                </label>

                <label>
                  Contact Phone Number
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label>
                  Target Examination
                  <select
                    value={profile.targetExam}
                    onChange={(e) => setProfile({ ...profile, targetExam: e.target.value })}
                  >
                    <option value="GATE CSE">GATE CSE (Computer Science &amp; IT)</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="NEET UG">NEET UG</option>
                    <option value="UPSC Civil Services">UPSC Civil Services (CSE)</option>
                    <option value="CAT">CAT (Common Admission Test)</option>
                    <option value="SSC CGL">SSC CGL</option>
                    <option value="IBPS PO">IBPS PO</option>
                    <option value="TNPSC Group I">TNPSC Group I</option>
                  </select>
                </label>

                <label>
                  Daily Study Target (Hours)
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={profile.dailyGoalHours}
                    onChange={(e) => setProfile({ ...profile, dailyGoalHours: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label>
                  College / Institution
                  <input
                    type="text"
                    value={profile.college}
                    onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                    placeholder="e.g. Anna University / IIT Madras"
                  />
                </label>

                <label>
                  State / Location
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    placeholder="e.g. Tamil Nadu, India"
                  />
                </label>
              </div>

              <label>
                Bio / Personal Study Motto
                <textarea
                  rows="2"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="e.g. Aiming for AIR under 100 in GATE CSE 2026."
                />
              </label>

              {profileMsg.text && (
                <div className={profileMsg.error ? "pc-form-error" : "pc-badge pc-badge-success"} style={{ padding: "8px 12px" }}>
                  {profileMsg.text}
                </div>
              )}

              <button type="submit" className="pc-btn pc-btn-primary" disabled={profileSaving} style={{ width: "fit-content", marginTop: 4 }}>
                {profileSaving ? "Saving Profile…" : "Save Profile Details"}
              </button>
            </form>
          </div>

          {/* CHANGE PASSWORD SECTION */}
          <div className="pc-card">
            <h3>🔒 Change Password</h3>
            <p className="pc-card-note">Update your account credentials to keep your PrepCycle workspace secure.</p>

            <form onSubmit={handlePasswordSubmit} className="pc-form" style={{ marginTop: 14 }}>
              <label>
                Current Password
                <input
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label>
                  New Password
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                  />
                </label>

                <label>
                  Confirm New Password
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                  />
                </label>
              </div>

              {passMsg.text && (
                <div className={passMsg.error ? "pc-form-error" : "pc-badge pc-badge-success"} style={{ padding: "8px 12px" }}>
                  {passMsg.text}
                </div>
              )}

              <button type="submit" className="pc-btn pc-btn-outline" disabled={passSaving} style={{ width: "fit-content", marginTop: 4 }}>
                {passSaving ? "Updating Password…" : "Update Password"}
              </button>
            </form>
          </div>

          {/* APPEARANCE SECTION */}
          <div className="pc-card pc-form">
            <h3>🎨 {t("appearance", "Appearance")}</h3>
            <label>
              {t("theme", "Theme Mode")}
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">{t("light", "Light Mode")}</option>
                <option value="dark">{t("dark", "Dark Mode")}</option>
              </select>
            </label>

            <label>
              {t("colorTheme", "Color Accent Theme")}
              <select value={colorTheme} onChange={(e) => setColorTheme(e.target.value)}>
                <option value="default">Default PrepCycle Blue</option>
                <option value="blue">Ocean Blue</option>
                <option value="purple">Royal Purple</option>
                <option value="green">Forest Green</option>
                <option value="orange">Sunset Orange</option>
                <option value="rose">Berry Rose</option>
              </select>
            </label>

            <label>
              {t("fontSize", "Application Font Size")}
              <select value={font} onChange={(e) => setFont(e.target.value)}>
                <option value="small">{t("small", "Small (92%)")}</option>
                <option value="medium">{t("medium", "Normal / Default (100%)")}</option>
                <option value="large">{t("large", "Large — High Comfort (118%)")}</option>
                <option value="xlarge">Extra Large — Maximum Visibility (135%)</option>
              </select>
            </label>
          </div>

          {/* LANGUAGE SECTION */}
          <div className="pc-card pc-form">
            <h3>🌐 {t("language", "Language")}</h3>
            <label>
              Application Interface Language
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English (English)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
