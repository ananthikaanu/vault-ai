import type { ThoughtCategory, ThoughtType } from "../types";

export const CATEGORY_CONFIG: Record<
  ThoughtCategory,
  { label: string; color: string; bg: string; emoji: string }
> = {
  work: {
    label: "Work",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
    emoji: "💼",
  },
  personal: {
    label: "Personal",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.12)",
    emoji: "🌸",
  },
  learning: {
    label: "Learning",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    emoji: "📚",
  },
  health: {
    label: "Health",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    emoji: "💪",
  },
  finance: {
    label: "Finance",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    emoji: "💰",
  },
  creative: {
    label: "Creative",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    emoji: "✨",
  },
  uncategorized: {
    label: "Other",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
    emoji: "📌",
  },
};

export const TYPE_CONFIG: Record<
  ThoughtType,
  { label: string; icon: string; color: string; bg: string }
> = {
  task: { label: "Task", icon: "✅", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  idea: { label: "Idea", icon: "💡", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  question: { label: "Question", icon: "❓", color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
  reminder: { label: "Reminder", icon: "🔔", color: "#ec4899", bg: "rgba(236,72,153,0.15)" },
  note: { label: "Note", icon: "📝", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
};

export const ALL_CATEGORIES = ["all", ...Object.keys(CATEGORY_CONFIG)] as const;
