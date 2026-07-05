import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { fetchThoughts } from "../store";
import { thoughtsApi } from "../utils/api";
import { ThoughtCard } from "./ThoughtCard";
import type { Thought } from "../types";

export function AISearch() {
  const dispatch = useAppDispatch();
  const apiKey = useAppSelector((s) => s.thoughts.apiKey);
  const totalThoughts = useAppSelector((s) => s.thoughts.items.length);

  useEffect(() => {
    dispatch(fetchThoughts());
  }, [dispatch]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<Thought[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (!apiKey) {
      toast.error("Add your OpenRouter API key in Settings first");
      return;
    }
    setLoading(true);
    setSearched(false);
    setError("");
    try {
      const res = await thoughtsApi.aiSearch(query, apiKey);
      setAnswer(res.answer || "No answer returned.");
      setResults(res.thoughts || []);
      setSearched(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Search failed. Check your API key.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "What React-related ideas did I save?",
    "Show me all my pending tasks",
    "What were my learning goals?",
  ];

  const canSearch = !loading && query.trim().length > 0 && !!apiKey;

  return (
    <div className="ai-search">
      <div className="ai-search__hero">
        <div className="ai-search__icon-wrap">
          <Sparkles size={28} />
        </div>
        <h2>Ask Your Second Brain</h2>
        <p>Search across all your thoughts using natural language</p>
      </div>

      {/* Warn if vault is empty */}
      {totalThoughts === 0 && (
        <div className="ai-search__warning">
          ⚠️ Your vault is empty! Go to <strong>Capture</strong> and save some thoughts first, then come back to search.
        </div>
      )}

      {/* Warn if no API key */}
      {!apiKey && (
        <div className="ai-search__warning">
          🔑 No API key set. Click <strong>Settings</strong> in the sidebar and add your OpenRouter API key (free at openrouter.ai).
        </div>
      )}

      <div className="ai-search__input-wrap">
        <Search size={18} className="ai-search__icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSearch && handleSearch()}
          placeholder='e.g. "What were my React ideas last week?"'
          className="ai-search__input"
        />
        <button
          onClick={handleSearch}
          disabled={!canSearch}
          className="btn btn--primary"
        >
          {loading ? <Loader2 size={16} className="spin" /> : "Ask"}
        </button>
      </div>

      <div className="ai-search__examples">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setQuery(ex)}
            className="example-chip"
          >
            {ex}
          </button>
        ))}
      </div>

      {error && (
        <div className="ai-search__error">❌ {error}</div>
      )}

      <AnimatePresence>
        {searched && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ai-search__results"
          >
            <div className="ai-answer">
              <Sparkles size={14} />
              <p>{answer}</p>
            </div>

            {results.length > 0 && (
              <>
                <p className="results-label">Related thoughts ({results.length})</p>
                <div className="thoughts-grid">
                  {results.map((t) => (
                    <ThoughtCard key={t.id} thought={t} viewMode="grid" />
                  ))}
                </div>
              </>
            )}

            {results.length === 0 && (
              <p className="results-label">No matching thoughts found for this query.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}