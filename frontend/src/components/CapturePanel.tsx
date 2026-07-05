import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Sparkles, Plus, Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { createThought, fetchThoughts, fetchStats } from "../store";
import { thoughtsApi } from "../utils/api";
import { CATEGORY_CONFIG, TYPE_CONFIG } from "../utils/constants";
import type { ThoughtCategory, ThoughtType } from "../types";

interface FormValues {
  content: string;
  category: ThoughtCategory;
  type: ThoughtType;
  tags: string;
}

export function CapturePanel() {
  const dispatch = useAppDispatch();
  const apiKey = useAppSelector((s) => s.thoughts.apiKey);
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<any[]>([]);
  const [rawDump, setRawDump] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { category: "uncategorized", type: "note" },
  });

  const onManualSubmit = async (data: FormValues) => {
    try {
      await dispatch(createThought({
        content: data.content,
        category: data.category,
        type: data.type,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      })).unwrap();
      dispatch(fetchStats());
      reset();
      toast.success("Thought saved!");
    } catch {
      toast.error("Failed to save thought");
    }
  };

  const onAIDump = async () => {
    if (!rawDump.trim()) return;
    if (!apiKey) {
      toast.error("Please add your Anthropic API key in Settings");
      return;
    }
    setAiLoading(true);
    setAiPreview([]);
    try {
      const result = await thoughtsApi.aiCategorize(rawDump, apiKey);
      setAiPreview(result.thoughts || []);
    } catch {
      toast.error("AI categorization failed. Check your API key.");
    } finally {
      setAiLoading(false);
    }
  };

  const saveAllAI = async () => {
    for (const t of aiPreview) {
      await dispatch(createThought(t)).unwrap();
    }
    dispatch(fetchStats());
    dispatch(fetchThoughts());
    setAiPreview([]);
    setRawDump("");
    toast.success(`${aiPreview.length} thoughts saved!`);
  };

  return (
    <div className="capture-panel">
      <div className="capture-tabs">
        <button
          className={`capture-tab ${!aiMode ? "active" : ""}`}
          onClick={() => setAiMode(false)}
        >
          ✍️ Manual
        </button>
        <button
          className={`capture-tab ${aiMode ? "active" : ""}`}
          onClick={() => setAiMode(true)}
        >
          <Sparkles size={14} /> AI Brain Dump
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!aiMode ? (
          <motion.form
            key="manual"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleSubmit(onManualSubmit)}
            className="capture-form"
          >
            <textarea
              {...register("content", { required: true })}
              placeholder="What's on your mind?"
              className="capture-textarea"
              rows={4}
            />
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <ChevronDown size={14} className={showAdvanced ? "rotated" : ""} />
              Advanced options
            </button>
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="advanced-options"
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select {...register("category")} className="form-select">
                        {Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.emoji} {cfg.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select {...register("type")} className="form-select">
                        {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input {...register("tags")} placeholder="react, work, idea" className="form-input" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button type="submit" disabled={isSubmitting} className="btn btn--primary btn--full">
              {isSubmitting ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
              Save Thought
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="ai"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="ai-dump"
          >
            <p className="ai-hint">Dump everything at once. AI will split, categorize & organize.</p>
            <textarea
              value={rawDump}
              onChange={(e) => setRawDump(e.target.value)}
              placeholder="e.g. Need to ask HR about PF, buy charger, learn Next.js server actions, drink more water..."
              className="capture-textarea"
              rows={5}
            />
            <button
              onClick={onAIDump}
              disabled={aiLoading || !rawDump.trim()}
              className="btn btn--primary btn--full"
            >
              {aiLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
              {aiLoading ? "AI is thinking..." : "Organize with AI"}
            </button>

            <AnimatePresence>
              {aiPreview.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ai-preview"
                >
                  <p className="ai-preview__header">
                    AI found <strong>{aiPreview.length}</strong> thoughts:
                  </p>
                  {aiPreview.map((t, i) => {
                    const cat = CATEGORY_CONFIG[t.category as ThoughtCategory] || CATEGORY_CONFIG.uncategorized;
                    return (
                      <div key={i} className="ai-preview-item">
                        <span className="ai-preview-item__cat" style={{ color: cat.color }}>
                          {cat.emoji} {cat.label}
                        </span>
                        <span className="ai-preview-item__content">{t.content}</span>
                      </div>
                    );
                  })}
                  <button onClick={saveAllAI} className="btn btn--primary btn--full mt-2">
                    Save All {aiPreview.length} Thoughts
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
