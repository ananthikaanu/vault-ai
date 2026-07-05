import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { fetchTrash, restoreThought, permanentDeleteThought } from "../store";
import type { Thought } from "../types";

function daysAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function TrashPage() {
  const dispatch = useAppDispatch();
  const trash = useAppSelector((s) => s.thoughts.trash);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTrash());
  }, [dispatch]);

  const handleRestore = (id: string) => {
    dispatch(restoreThought(id));
    toast.success("Thought restored to vault!");
  };

  const handlePermanentDelete = (t: Thought) => {
    if (confirmId === t.id) {
      dispatch(permanentDeleteThought(t.id));
      setConfirmId(null);
      toast("Permanently deleted", { icon: "🗑️" });
    } else {
      setConfirmId(t.id);
    }
  };

  const handleEmptyTrash = () => {
    if (!window.confirm(`Permanently delete all ${trash.length} items from trash? This cannot be undone.`)) return;
    Promise.all(trash.map((t) => dispatch(permanentDeleteThought(t.id)))).then(() => {
      toast("Trash emptied", { icon: "🗑️" });
    });
  };

  return (
    <motion.div
      className="trash-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="trash-header">
        <h3>Trash ({trash.length})</h3>
        {trash.length > 0 && (
          <button className="trash-empty-btn" onClick={handleEmptyTrash}>
            Empty Trash
          </button>
        )}
      </div>

      {/* Empty state */}
      {trash.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-state__emoji">🗑️</div>
          <h3>Trash is empty</h3>
          <p>Deleted thoughts will appear here. You can restore or permanently remove them.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {trash.map((t) => {
            const deletedDate = t.deletedAt;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="trash-item"
              >
                <div className="trash-item__body">
                  <div className="trash-item__title">
                    {t.title || t.content.slice(0, 60)}
                  </div>
                  {t.title && (
                    <div className="trash-item__content">
                      {t.content.slice(0, 100)}{t.content.length > 100 ? "…" : ""}
                    </div>
                  )}
                  <div className="trash-item__time">
                    Deleted {deletedDate ? daysAgo(deletedDate) : "recently"} ·{" "}
                    {t.type} · {t.category}
                  </div>
                </div>

                <div className="trash-item__actions">
                  <button
                    className="trash-restore-btn"
                    onClick={() => handleRestore(t.id)}
                    title="Restore to vault"
                  >
                    <RotateCcw size={12} style={{ marginRight: 4 }} />
                    Restore
                  </button>
                  <button
                    className="trash-perm-btn"
                    onClick={() => handlePermanentDelete(t)}
                    title="Permanently delete"
                    style={confirmId === t.id ? { background: "rgba(239,68,68,0.25)" } : {}}
                  >
                    <Trash2 size={12} style={{ marginRight: 4 }} />
                    {confirmId === t.id ? "Confirm?" : "Delete"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      {trash.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
          Thoughts in trash are kept indefinitely until you delete them permanently.
        </p>
      )}
    </motion.div>
  );
}
