import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import { CATEGORY_CONFIG } from "../utils/constants";
import type { ThoughtCategory } from "../types";

const MOOD_OPTIONS = [
  { key: "happy", emoji: "😊", label: "Happy" },
  { key: "neutral", emoji: "😐", label: "Neutral" },
  { key: "stressed", emoji: "😤", label: "Stressed" },
  { key: "excited", emoji: "🤩", label: "Excited" },
];

function getMoodData(): Record<string, number> {
  try {
    const raw = localStorage.getItem("tv_moods");
    if (!raw) return {};
    const arr: { date: string; mood: string }[] = JSON.parse(raw);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const counts: Record<string, number> = {};
    arr
      .filter((e) => new Date(e.date).getTime() > weekAgo)
      .forEach((e) => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
    return counts;
  } catch { return {}; }
}

function saveMood(mood: string) {
  try {
    const raw = localStorage.getItem("tv_moods");
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ date: new Date().toISOString(), mood });
    localStorage.setItem("tv_moods", JSON.stringify(arr.slice(-100)));
  } catch {}
}

export function RightPanel() {
  const navigate = useNavigate();
  const { stats, items } = useAppSelector((s) => s.thoughts);
  const [moodCounts, setMoodCounts] = useState<Record<string, number>>(getMoodData);

  const handleMood = (mood: string) => {
    saveMood(mood);
    setMoodCounts(getMoodData());
  };

  const categories = Object.entries(stats?.categories || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const total = categories.reduce((s, [, v]) => s + v, 0) || 1;

  const topCats = categories.slice(0, 2).map(([k]) =>
    CATEGORY_CONFIG[k as ThoughtCategory]?.label || k
  );

  const thisWeek = items.filter((t) => {
    const d = new Date(t.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  const totalMoodCount = Object.values(moodCounts).reduce((s, v) => s + v, 0);
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <aside className="right-panel">
      {/* AI Summary */}
      <div className="rp-section">
        <div className="rp-section__header">
          <h3>
            <Sparkles size={14} /> AI Summary
          </h3>
          <button className="rp-link" onClick={() => navigate("/stats")}>
            View all insights <ArrowRight size={12} />
          </button>
        </div>
        <p className="rp-summary-text">
          {thisWeek > 0
            ? `You've added ${thisWeek} thought${thisWeek !== 1 ? "s" : ""} this week.${topCats.length ? ` Most are about ${topCats.join(" and ")}.` : ""}`
            : "Start capturing thoughts to see your AI summary here."}
        </p>
        {categories.length > 0 && (
          <div className="rp-bars">
            {categories.map(([cat, count], i) => {
              const cfg = CATEGORY_CONFIG[cat as ThoughtCategory] || CATEGORY_CONFIG.uncategorized;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="rp-bar">
                  <div className="rp-bar__label">
                    <span>
                      <span
                        className="rp-bar__dot"
                        style={{ background: cfg.color }}
                      />
                      {cfg.label}
                    </span>
                    <span className="rp-bar__pct">{pct}%</span>
                  </div>
                  <div className="rp-bar__track">
                    <div
                      className="rp-bar__fill"
                      style={{ width: `${pct}%`, background: cfg.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Collections */}
      <div className="rp-section">
        <div className="rp-section__header">
          <h3>AI Collections</h3>
          <button className="rp-link" onClick={() => navigate("/vault")}>
            View all
          </button>
        </div>
        {categories.length === 0 ? (
          <p className="rp-empty">No collections yet. Add some thoughts!</p>
        ) : (
          <div className="rp-collections">
            {categories.map(([cat, count]) => {
              const cfg = CATEGORY_CONFIG[cat as ThoughtCategory] || CATEGORY_CONFIG.uncategorized;
              return (
                <button
                  key={cat}
                  className="rp-collection"
                  onClick={() => navigate("/vault")}
                >
                  <div
                    className="rp-collection__icon"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.emoji}
                  </div>
                  <div className="rp-collection__text">
                    <span className="rp-collection__name">{cfg.label}</span>
                    <span className="rp-collection__count">{count} thoughts</span>
                  </div>
                  <ArrowRight size={13} className="rp-collection__arrow" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mood Tracker */}
      <div className="rp-section">
        <div className="rp-section__header">
          <h3>Mood Tracker</h3>
          <button className="rp-link">
            This Week <ChevronDown size={12} />
          </button>
        </div>
        <div className="rp-moods">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.key}
              className="rp-mood"
              onClick={() => handleMood(m.key)}
              title={`Log ${m.label} mood`}
            >
              <span className="rp-mood__emoji">{m.emoji}</span>
              <span className="rp-mood__label">{m.label}</span>
              <span className="rp-mood__count">{moodCounts[m.key] || 0}</span>
            </button>
          ))}
        </div>
        <div className="rp-mood-tip">
          <Sparkles size={12} />
          <p>
            {totalMoodCount === 0
              ? "Log your mood daily to see patterns over time."
              : dominantMood === "happy" || dominantMood === "excited"
              ? "Your mood seems great this week! Keep capturing your thoughts!"
              : "Keep journaling — it helps with clarity and balance."}
          </p>
        </div>
      </div>
    </aside>
  );
}
