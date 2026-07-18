import { useState } from "react";
import { MoreHorizontal, Star, Trash2, Check } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAppDispatch } from "../hooks/redux";
import { updateThought, trashThought } from "../store";
import { CATEGORY_CONFIG, TYPE_CONFIG } from "../utils/constants";
import type { Thought } from "../types";

interface Props {
  thought: Thought;
  delay?: number;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function HomeThoughtCard({ thought, delay = 0 }: Props) {
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [starred, setStarred] = useState(thought.starred ?? false);

  const cat = CATEGORY_CONFIG[thought.category] || CATEGORY_CONFIG.uncategorized;
  const typeInfo = TYPE_CONFIG[thought.type] || TYPE_CONFIG.note;

  // Use type-based color/icon when uncategorized so each card looks distinct
  const isUncategorized = thought.category === "uncategorized";
  const iconColor = isUncategorized ? typeInfo.color : cat.color;
  const iconBg = isUncategorized ? typeInfo.bg : cat.bg;
  const iconEmoji = isUncategorized ? typeInfo.icon : cat.emoji;
  const accentColor = isUncategorized ? typeInfo.color : cat.color;

  const handleTrash = () => {
    dispatch(trashThought(thought.id));
    setMenuOpen(false);
    toast("Moved to Trash", { icon: "🗑️" });
  };

  return (
    <motion.div
      className={`home-card ${thought.completed ? "home-card--done" : ""}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{ "--cat-color": accentColor } as React.CSSProperties}
    >
      <div className="home-card__top">
        <div className="home-card__icon" style={{ background: iconBg, color: iconColor }}>
          <span>{iconEmoji}</span>
        </div>
        <button
          className={`home-card__star ${starred ? "home-card__star--active" : ""}`}
          onClick={() => {
            const next = !starred;
            setStarred(next);
            dispatch(updateThought({ id: thought.id, data: { starred: next } }));
          }}
        >
          <Star size={14} fill={starred ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="home-card__body">
        {thought.title && (
          <h4 className="home-card__title">{thought.title}</h4>
        )}
        {thought.content.trim() !== thought.title?.trim() && (
          <p className="home-card__content">
            {thought.content.length > 100
              ? `${thought.content.slice(0, 100)}...`
              : thought.content}
          </p>
        )}
      </div>

      {thought.tags.length > 0 && (
        <div className="home-card__tags">
          {thought.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="home-card__tag"
              style={{ background: `${accentColor}18`, color: accentColor }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="home-card__footer">
        <span className="home-card__time">{timeAgo(thought.createdAt)}</span>
        <div className="home-card__menu-wrap">
          <button
            className="home-card__menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="home-card__dropdown">
              <button
                onClick={() => {
                  dispatch(updateThought({ id: thought.id, data: { completed: !thought.completed } }));
                  setMenuOpen(false);
                }}
              >
                <Check size={13} /> {thought.completed ? "Unmark" : "Complete"}
              </button>
              <button
                className="danger"
                onClick={handleTrash}
              >
                <Trash2 size={13} /> Move to Trash
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
