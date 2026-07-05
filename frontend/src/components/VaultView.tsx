import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, List, Search, SlidersHorizontal, Download } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchThoughts, setViewMode, setSelectedCategory } from "../store";
import { ThoughtCard } from "./ThoughtCard";
import { CATEGORY_CONFIG } from "../utils/constants";
import { thoughtsApi } from "../utils/api";
import type { ThoughtCategory } from "../types";

export function VaultView() {
  const dispatch = useAppDispatch();
  const { items, loading, viewMode, selectedCategory } = useAppSelector(
    (s) => s.thoughts
  );
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    dispatch(fetchThoughts());
  }, [dispatch]);

  const handleCategoryChange = (cat: string) => {
    dispatch(setSelectedCategory(cat));
    dispatch(fetchThoughts(cat !== "all" ? { category: cat } : undefined));
  };

  const filtered = localSearch
    ? items.filter(
        (t) =>
          t.content.toLowerCase().includes(localSearch.toLowerCase()) ||
          t.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
          t.tags?.some((tag) =>
            tag.toLowerCase().includes(localSearch.toLowerCase())
          )
      )
    : items;

  const categories = ["all", ...Object.keys(CATEGORY_CONFIG)] as const;

  return (
    <div className="vault-view">
      <div className="vault-toolbar">
        <div className="vault-search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search thoughts..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="vault-search"
          />
        </div>
        <div className="vault-controls">
          <SlidersHorizontal size={16} />
          <button onClick={() => dispatch(setViewMode("grid"))} className={`icon-btn ${viewMode === "grid" ? "icon-btn--active" : ""}`}><Grid size={16} /></button>
          <button onClick={() => dispatch(setViewMode("list"))} className={`icon-btn ${viewMode === "list" ? "icon-btn--active" : ""}`}><List size={16} /></button>
          <div className="vault-export-wrap">
            <button className="icon-btn vault-export-btn" title="Export vault">
              <Download size={16} />
            </button>
            <div className="vault-export-menu">
              <button onClick={() => thoughtsApi.exportVault("markdown")}>Export as Markdown</button>
              <button onClick={() => thoughtsApi.exportVault("json")}>Export as JSON</button>
            </div>
          </div>
        </div>
      </div>

      <div className="category-filter">
        {categories.map((cat) => {
          const cfg = cat === "all" ? null : CATEGORY_CONFIG[cat as ThoughtCategory];
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`filter-chip ${selectedCategory === cat ? "filter-chip--active" : ""}`}
            >
              {cfg ? `${cfg.emoji} ${cfg.label}` : "All"}
            </button>
          );
        })}
      </div>

      {loading && items.length === 0 ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading thoughts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state"
        >
          <span className="empty-state__emoji">🧠</span>
          <h3>Your vault is empty</h3>
          <p>Start capturing your thoughts to build your second brain</p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className={`thoughts-container ${viewMode === "list" ? "thoughts-container--list" : "thoughts-grid"}`}
        >
          <AnimatePresence>
            {filtered.map((thought) => (
              <ThoughtCard key={thought.id} thought={thought} viewMode={viewMode} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
