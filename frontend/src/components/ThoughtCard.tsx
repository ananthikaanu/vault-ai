import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit3, Check, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch } from "../hooks/redux";
import { updateThought, trashThought } from "../store";
import { CATEGORY_CONFIG, TYPE_CONFIG } from "../utils/constants";
import { extractBP, classifyBP } from "../utils/bp";
import type { Thought } from "../types";

interface Props {
  thought: Thought;
  viewMode: "grid" | "list";
}

export function ThoughtCard({ thought, viewMode }: Props) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(thought.content);

  const cat = CATEGORY_CONFIG[thought.category] || CATEGORY_CONFIG.uncategorized;
  const typeInfo = TYPE_CONFIG[thought.type] || TYPE_CONFIG.note;
  const bpReadings = extractBP(thought.content + " " + (thought.title || ""));

  const handleToggleComplete = () => {
    dispatch(updateThought({ id: thought.id, data: { completed: !thought.completed } }));
  };

  const handleDelete = () => {
    dispatch(trashThought(thought.id));
    toast("Moved to Trash", { icon: "🗑️" });
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      dispatch(updateThought({ id: thought.id, data: { content: editContent } }));
    }
    setIsEditing(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`thought-card ${viewMode === "list" ? "thought-card--list" : ""} ${thought.completed ? "thought-card--done" : ""}`}
      style={{ "--cat-color": cat.color, "--cat-bg": cat.bg } as React.CSSProperties}
    >
      <div className="thought-card__header">
        <div className="thought-card__meta">
          <span className="thought-card__cat-badge" style={{ background: cat.bg, color: cat.color }}>
            {cat.emoji} {cat.label}
          </span>
          <span className="thought-card__type">{typeInfo.icon} {typeInfo.label}</span>
        </div>
        <div className="thought-card__actions">
          <button onClick={handleToggleComplete} className={`action-btn ${thought.completed ? "action-btn--active" : ""}`} title="Toggle complete">
            <Check size={14} />
          </button>
          <button onClick={() => setIsEditing(!isEditing)} className="action-btn" title="Edit">
            <Edit3 size={14} />
          </button>
          <button onClick={handleDelete} className="action-btn action-btn--danger" title="Move to Trash">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {thought.title && (
        <h3 className="thought-card__title">{thought.title}</h3>
      )}

      {isEditing ? (
        <div className="thought-card__edit">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-textarea"
            rows={3}
            autoFocus
          />
          <div className="edit-actions">
            <button onClick={handleSaveEdit} className="btn btn--sm btn--primary">Save</button>
            <button onClick={() => setIsEditing(false)} className="btn btn--sm btn--ghost">Cancel</button>
          </div>
        </div>
      ) : (
        <p className="thought-card__content">{thought.content}</p>
      )}

      {thought.tags.length > 0 && (
        <div className="thought-card__tags">
          <Tag size={11} />
          {thought.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {bpReadings.length > 0 && (
        <div className="bp-badges">
          {bpReadings.map((r, i) => {
            const s = classifyBP(r.systolic, r.diastolic);
            return (
              <span
                key={i}
                className="bp-badge"
                style={{ background: s.bg, color: s.color, borderColor: s.color + "44" }}
                title={`${r.systolic}/${r.diastolic} mmHg — ${s.label}`}
              >
                {s.emoji} {r.raw} <strong>{s.label}</strong>
              </span>
            );
          })}
        </div>
      )}

      <div className="thought-card__footer">
        <span className="thought-card__time">{timeAgo(thought.createdAt)}</span>
      </div>
    </motion.div>
  );
}
