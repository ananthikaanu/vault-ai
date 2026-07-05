import { useState, useEffect, useRef } from "react";
import { Search, Sun, Moon, Bell, X, Plus } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { fetchThoughts } from "../store";
import { useNavigate } from "react-router-dom";
import { CATEGORY_CONFIG } from "../utils/constants";
import type { ThoughtCategory } from "../types";

export function Header() {
  const { userName, items } = useAppSelector((s) => s.thoughts);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("tv_theme") !== "light");
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const firstName = userName.split(" ")[0];

  // Apply theme on mount and change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Close notif panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cmd+K / Ctrl+K shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
        setQuery("");
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("tv_theme", next ? "dark" : "light");
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      navigate("/vault");
      dispatch(fetchThoughts({ search: query }));
      setQuery("");
      setSearchOpen(false);
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
      setQuery("");
    }
  };

  const recent5 = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="app-header">
      <div className="header-left">
        <h2 className="header-greeting">
          {greeting}, {firstName} 👋
        </h2>
        <p className="header-subtitle">Capture your thoughts, AI will organize the rest.</p>
      </div>

      <div className="header-right">
        {searchOpen ? (
          <div className="header-search header-search--active">
            <Search size={15} className="search-icon" />
            <input
              autoFocus
              className="header-search__input"
              placeholder="Search your vault..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button className="search-close" onClick={() => { setSearchOpen(false); setQuery(""); }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button className="header-search" onClick={() => setSearchOpen(true)}>
            <Search size={15} className="search-icon" />
            <span className="header-search__placeholder">Search your vault...</span>
            <kbd className="search-kbd">⌘K</kbd>
          </button>
        )}

        {/* Dark/Light toggle */}
        <button
          className="header-icon-btn"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Bell / Notifications */}
        <div className="notif-wrap" ref={notifRef}>
          <button
            className="header-icon-btn header-icon-btn--notif"
            title="Notifications"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Bell size={16} />
            {items.length > 0 && (
              <span className="notif-badge">{Math.min(items.length, 9)}</span>
            )}
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-dropdown__header">
                <span>Recent Activity</span>
                <button className="notif-dropdown__clear" onClick={() => setShowNotifs(false)}>
                  Close
                </button>
              </div>
              {recent5.length === 0 ? (
                <p className="notif-empty">No thoughts yet. Start capturing!</p>
              ) : (
                recent5.map((t) => {
                  const cat = CATEGORY_CONFIG[t.category as ThoughtCategory] || CATEGORY_CONFIG.uncategorized;
                  return (
                    <div
                      key={t.id}
                      className="notif-item"
                      onClick={() => { navigate("/vault"); setShowNotifs(false); }}
                    >
                      <div className="notif-item__dot" style={{ background: cat.color }} />
                      <div className="notif-item__text">
                        <span className="notif-item__title">{t.title || t.content}</span>
                        <span className="notif-item__time">{timeAgo(t.createdAt)} · {cat.label}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* New Thought button */}
        <button
          className="btn btn--primary btn--sm"
          onClick={() => navigate("/capture")}
          style={{ gap: 5 }}
        >
          <Plus size={14} /> New Thought
        </button>
      </div>
    </div>
  );
}
