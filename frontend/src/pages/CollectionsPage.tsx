import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAppSelector } from "../hooks/redux";
import { CATEGORY_CONFIG } from "../utils/constants";
import { HomeThoughtCard } from "../components/HomeThoughtCard";
import type { Thought, ThoughtCategory } from "../types";

interface Collection {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bg: string;
  thoughts: Thought[];
  lastUpdated: string | null;
  description: string;
}

function getLastUpdated(thoughts: Thought[]): string | null {
  if (thoughts.length === 0) return null;
  return thoughts.reduce((latest, t) =>
    new Date(t.updatedAt) > new Date(latest.updatedAt) ? t : latest
  ).updatedAt;
}

function formatLastUpdated(date: string | null): string {
  if (!date) return "Empty";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 7) return `Updated ${days}d ago`;
  return `Updated ${Math.floor(days / 7)}w ago`;
}

export function CollectionsPage() {
  const items = useAppSelector((s) => s.thoughts.items);
  const [selected, setSelected] = useState<Collection | null>(null);

  // ── Category collections ────────────────────────────────────────────
  const categoryCollections: Collection[] = (Object.entries(CATEGORY_CONFIG) as [ThoughtCategory, typeof CATEGORY_CONFIG[ThoughtCategory]][])
    .map(([cat, cfg]) => {
      const filtered = items.filter((t) => t.category === cat);
      return {
        id: `cat-${cat}`,
        name: cfg.label,
        emoji: cfg.emoji,
        color: cfg.color,
        bg: cfg.bg,
        thoughts: filtered,
        lastUpdated: getLastUpdated(filtered),
        description: `All thoughts in the ${cfg.label} category`,
      };
    })
    .filter((c) => c.thoughts.length > 0);

  // ── Smart collections ───────────────────────────────────────────────
  const smartCollections: Collection[] = [
    {
      id: "smart-ideas",
      name: "Ideas",
      emoji: "💡",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      thoughts: items.filter((t) => t.type === "idea"),
      lastUpdated: getLastUpdated(items.filter((t) => t.type === "idea")),
      description: "All your captured ideas",
    },
    {
      id: "smart-tasks",
      name: "Tasks",
      emoji: "✅",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      thoughts: items.filter((t) => t.type === "task"),
      lastUpdated: getLastUpdated(items.filter((t) => t.type === "task")),
      description: "All tasks across every category",
    },
    {
      id: "smart-starred",
      name: "Starred",
      emoji: "⭐",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      thoughts: items.filter((t) => t.starred),
      lastUpdated: getLastUpdated(items.filter((t) => t.starred)),
      description: "Your starred / favourite thoughts",
    },
    {
      id: "smart-questions",
      name: "Questions",
      emoji: "❓",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.12)",
      thoughts: items.filter((t) => t.type === "question"),
      lastUpdated: getLastUpdated(items.filter((t) => t.type === "question")),
      description: "Open questions and things to explore",
    },
  ].filter((c) => c.thoughts.length > 0);

  // ── Detail view ─────────────────────────────────────────────────────
  if (selected) {
    return (
      <motion.div
        className="collection-detail"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div className="collection-detail__header">
          <button className="collection-back" onClick={() => setSelected(null)}>
            <ArrowLeft size={13} style={{ marginRight: 4 }} />
            Collections
          </button>
          <div
            className="collection-card__icon"
            style={{ background: selected.bg, color: selected.color, fontSize: 22, width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {selected.emoji}
          </div>
          <div className="collection-detail__title">
            <h3>{selected.name}</h3>
            <p>{selected.thoughts.length} thought{selected.thoughts.length !== 1 ? "s" : ""} · {selected.description}</p>
          </div>
        </div>

        {selected.thoughts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__emoji">🗂️</div>
            <h3>Nothing here yet</h3>
            <p>Capture some thoughts to populate this collection.</p>
          </div>
        ) : (
          <div className="home-cards-grid">
            {selected.thoughts.map((t, i) => (
              <HomeThoughtCard key={t.id} thought={t} delay={i * 0.04} />
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // ── Grid view ───────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <motion.div
        className="empty-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="empty-state__emoji">🗂️</div>
        <h3>No collections yet</h3>
        <p>Start capturing thoughts — they'll automatically appear in relevant collections.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="collections-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Smart Collections */}
      {smartCollections.length > 0 && (
        <div>
          <div className="collections-section-title">Smart Collections</div>
          <div className="collections-grid">
            <AnimatePresence>
              {smartCollections.map((col, i) => (
                <CollectionCard key={col.id} collection={col} index={i} onSelect={setSelected} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* By Category */}
      {categoryCollections.length > 0 && (
        <div>
          <div className="collections-section-title">By Category</div>
          <div className="collections-grid">
            <AnimatePresence>
              {categoryCollections.map((col, i) => (
                <CollectionCard key={col.id} collection={col} index={i} onSelect={setSelected} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CollectionCard({
  collection,
  index,
  onSelect,
}: {
  collection: Collection;
  index: number;
  onSelect: (c: Collection) => void;
}) {
  return (
    <motion.button
      className="collection-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={{ y: -3 }}
      onClick={() => onSelect(collection)}
    >
      <div
        className="collection-card__icon"
        style={{ background: collection.bg, color: collection.color }}
      >
        {collection.emoji}
      </div>
      <div className="collection-card__name">{collection.name}</div>
      <div className="collection-card__count">
        {collection.thoughts.length} thought{collection.thoughts.length !== 1 ? "s" : ""}
      </div>
      <div className="collection-card__count" style={{ fontSize: 11 }}>
        {formatLastUpdated(collection.lastUpdated)}
      </div>
    </motion.button>
  );
}
