import { useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle, Layers, Star, Flame } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchStats } from "../store";
import { CATEGORY_CONFIG } from "../utils/constants";
import type { ThoughtCategory } from "../types";

export function StatsView() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector((s) => s.thoughts.stats);

  useEffect(() => { dispatch(fetchStats()); }, [dispatch]);

  if (!stats) return <div className="loading-state">Loading stats...</div>;

  const cards = [
    { label: "Total Thoughts", value: stats.total, icon: <Brain size={20} />, color: "#6366f1" },
    { label: "Tasks Completed", value: stats.completed, icon: <CheckCircle size={20} />, color: "#10b981" },
    { label: "Day Streak", value: stats.streak ?? 0, icon: <Flame size={20} />, color: "#f59e0b", suffix: stats.streak === 1 ? "day" : "days" },
    { label: "Favorites", value: stats.starred ?? 0, icon: <Star size={20} />, color: "#ec4899" },
    { label: "Categories Used", value: Object.keys(stats.categories).length, icon: <Layers size={20} />, color: "#06b6d4" },
  ];

  const maxCat = Math.max(...Object.values(stats.categories), 1);

  return (
    <div className="stats-view">
      <h2 className="stats-title">Your Mind Map</h2>

      <div className="stats-grid">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
            style={{ "--stat-color": card.color } as React.CSSProperties}
          >
            <div className="stat-card__icon">{card.icon}</div>
            <div className="stat-card__value">
              {card.value}
              {"suffix" in card && card.value > 0 && <span className="stat-card__suffix"> {card.suffix}</span>}
            </div>
            <div className="stat-card__label">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="stats-breakdown">
        <h3>Thoughts by Category</h3>
        <div className="category-bars">
          {Object.entries(stats.categories).map(([cat, count], i) => {
            const cfg = CATEGORY_CONFIG[cat as ThoughtCategory] || CATEGORY_CONFIG.uncategorized;
            const pct = Math.round((count / maxCat) * 100);
            return (
              <motion.div
                key={cat}
                className="cat-bar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="cat-bar__label">
                  <span>{cfg.emoji} {cfg.label}</span>
                  <span className="cat-bar__count">{count}</span>
                </div>
                <div className="cat-bar__track">
                  <motion.div
                    className="cat-bar__fill"
                    style={{ background: cfg.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.06 + 0.2, duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {Object.keys(stats.types).length > 0 && (
        <div className="stats-breakdown">
          <h3>Thoughts by Type</h3>
          <div className="type-pills">
            {Object.entries(stats.types).map(([type, count]) => (
              <div key={type} className="type-pill">
                <span className="type-pill__count">{count}</span>
                <span className="type-pill__label">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
