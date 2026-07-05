import { useNavigate, useLocation } from "react-router-dom";
import {
  Brain,
  BarChart2,
  Settings,
  X,
  Home,
  MessageSquare,
  FolderOpen,
  Star,
  Bell,
  ChevronDown,
  Calendar,
  CheckSquare,
  Image,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { setApiKey, setUserName } from "../store";
import { useState } from "react";

interface Props {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { apiKey, items, userName } = useAppSelector((s) => s.thoughts);
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [nameInput, setNameInput] = useState(userName);

  const navItems = [
    { to: "/", label: "Home", icon: <Home size={16} />, exact: true },
    { to: "/vault", label: "All Thoughts", icon: <Brain size={16} />, badge: items.length || undefined },
    { to: "/chat", label: "AI Chat", icon: <MessageSquare size={16} /> },
    { to: "/collections", label: "Collections", icon: <FolderOpen size={16} /> },
    { to: "/favorites", label: "Favorites", icon: <Star size={16} /> },
    { to: "/stats", label: "Insights", icon: <BarChart2 size={16} /> },
    { to: "/calendar", label: "Calendar", icon: <Calendar size={16} /> },
    { to: "/tasks", label: "Tasks", icon: <CheckSquare size={16} /> },
    { to: "/media", label: "Media", icon: <Image size={16} /> },
    { to: "/trash", label: "Trash", icon: <Trash2 size={16} /> },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to;

  const go = (to: string) => {
    navigate(to);
    onClose?.();
  };

  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className={`sidebar ${mobile ? "sidebar--mobile" : ""}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="logo-icon-wrap">
          <Brain size={17} color="#7c6af7" />
        </div>
        <div>
          <h1 className="logo-title">Vault AI</h1>
          <p className="logo-sub">Your AI Second Brain</p>
        </div>
        {mobile && (
          <button onClick={onClose} className="sidebar__close">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <button
              key={item.to}
              onClick={() => go(item.to)}
              className={`nav-item ${active ? "nav-item--active" : ""}`}
            >
              <span className="nav-item__icon">{item.icon}</span>
              <span className="nav-item__label">{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="nav-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar__bottom">
        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`nav-item ${showSettings ? "nav-item--settings-open" : ""}`}
        >
          <span className="nav-item__icon"><Settings size={16} /></span>
          <span className="nav-item__label">Settings</span>
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div className="settings-panel">
                <label className="settings-label">Your Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  className="form-input"
                />
                <label className="settings-label" style={{ marginTop: 10 }}>
                  AI API Key <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-or-v1-... or gsk_..."
                  className="form-input"
                />
                <button
                  onClick={() => {
                    dispatch(setApiKey(keyInput));
                    dispatch(setUserName(nameInput));
                    setShowSettings(false);
                  }}
                  className="btn btn--primary btn--sm btn--full mt-1"
                >
                  Save
                </button>
                <div className="settings-providers">
                  <p className="settings-hint" style={{ marginBottom: 4 }}>Free providers (no credit card):</p>
                  <div className="settings-provider-row">
                    <span>🟢 <strong>Groq</strong></span>
                    <span style={{ color: "var(--text-muted)", fontSize: 11 }}>console.groq.com</span>
                  </div>
                  <div className="settings-provider-row">
                    <span>🔵 <strong>OpenRouter</strong></span>
                    <span style={{ color: "var(--text-muted)", fontSize: 11 }}>openrouter.ai</span>
                  </div>
                  <p className="settings-hint" style={{ marginTop: 6 }}>Works without a key using smart local search.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User profile */}
        <div className="sidebar__profile">
          <div className="sidebar__avatar">{initials}</div>
          <div className="sidebar__profile-text">
            <span className="sidebar__profile-name">{userName} ✨</span>
            <span className="sidebar__profile-sub">Free Plan</span>
          </div>
          <ChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
