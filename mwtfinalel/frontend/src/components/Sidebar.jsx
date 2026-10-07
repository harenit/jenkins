import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const STUDENT_LINKS = [
  { to: "/exam-explorer", key: "exams", label: "Exams", icon: "🧭" },
  { to: "/my-progress", key: "myProgress", label: "My Progress", icon: "📈" },
  { to: "/marketplace", key: "marketplace", label: "Marketplace", icon: "📚" },
  { to: "/orders", key: "ordersTracking", label: "Orders & Tracking", icon: "🚚" },
  { to: "/resources", key: "resources", label: "Resources", icon: "🗂️" },
  { to: "/community", key: "community", label: "Community", icon: "💬" },
  { to: "/study-planner", key: "studyPlanner", label: "Study Planner", icon: "📅" },
  { to: "/settings", key: "settings", label: "Settings", icon: "⚙️" },
];

const ADMIN_LINKS = [
  { to: "/admin?tab=overview", tabValue: "overview", key: "dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin?tab=exams", tabValue: "exams", key: "manageExams", label: "Manage Exams", icon: "🧭" },
  { to: "/admin?tab=resources", tabValue: "resources", key: "manageResources", label: "Manage Resources", icon: "🗂️" },
  { to: "/admin?tab=products", tabValue: "products", key: "manageProducts", label: "Marketplace", icon: "📚" },
  { to: "/admin?tab=users", tabValue: "users", key: "users", label: "Users", icon: "👥" },
  { to: "/admin?tab=orders", tabValue: "orders", key: "orders", label: "Orders", icon: "🚚" },
  { to: "/admin?tab=returns", tabValue: "returns", key: "returns", label: "Returns / Resale", icon: "♻️" },
  { to: "/admin?tab=communications", tabValue: "communications", key: "communications", label: "Communication Logs", icon: "📨" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t, supportedLanguages } = useLanguage();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";
  const links = isAdmin ? ADMIN_LINKS : STUDENT_LINKS;
  const activeAdminTab = new URLSearchParams(location.search).get("tab") || "overview";

  if (isDelivery) {
    return (
      <aside className="pc-sidebar">
        <div className="pc-sidebar-brand"><span className="pc-logo-dot" />PrepCycle</div>
        <nav className="pc-sidebar-nav">
          <NavLink to="/delivery" className="pc-sidebar-link active">
            <span className="pc-sidebar-icon">🚚</span>{t("deliveryDashboard", "Delivery Dashboard")}
          </NavLink>
        </nav>
        <div className="pc-sidebar-language">
          <label htmlFor="pc-language">{t("language", "Language")}</label>
          <select id="pc-language" value={lang} onChange={(e) => setLang(e.target.value)}>
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pc-sidebar-footer">
          <div className="pc-sidebar-user">
            <div className="pc-avatar">{user?.name?.[0]?.toUpperCase() || "D"}</div>
            <div>
              <div className="pc-sidebar-user-name">{user?.name}</div>
              <div className="pc-sidebar-user-role">Delivery Partner</div>
            </div>
          </div>
          <button className="pc-btn pc-btn-ghost pc-btn-small" onClick={logout}>
            {t("logOut", "Log out")}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="pc-sidebar">
      <div className="pc-sidebar-brand">
        <span className="pc-logo-dot" />
        PrepCycle
      </div>

      <nav className="pc-sidebar-nav">
        {isAdmin
          ? links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-tour={`nav-${link.key}`}
                className={`pc-sidebar-link${activeAdminTab === link.tabValue ? " active" : ""}`}
              >
                <span className="pc-sidebar-icon">{link.icon}</span>
                {t(link.key, link.label)}
              </Link>
            ))
          : links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                data-tour={`nav-${link.key}`}
                className={({ isActive }) => `pc-sidebar-link${isActive ? " active" : ""}`}
              >
                <span className="pc-sidebar-icon">{link.icon}</span>
                {t(link.key, link.label)}
              </NavLink>
            ))}
      </nav>

      <div className="pc-sidebar-language">
        <label htmlFor="pc-language">{t("language", "Language")}</label>
        <select id="pc-language" value={lang} onChange={(e) => setLang(e.target.value)}>
          {supportedLanguages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pc-sidebar-footer">
        <div className="pc-sidebar-user">
          <div className="pc-avatar">{user?.name?.[0]?.toUpperCase() || "?"}</div>
          <div>
            <div className="pc-sidebar-user-name">{user?.name}</div>
            <div className="pc-sidebar-user-role">
              {user?.role === "student" ? (user?.studentId || "Student") : user?.role === "admin" ? "Admin" : "Delivery"}
            </div>
          </div>
        </div>
        <button className="pc-btn pc-btn-ghost pc-btn-small" onClick={logout}>
          {t("logOut", "Log out")}
        </button>
      </div>
    </aside>
  );
}
