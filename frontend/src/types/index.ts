export type ThoughtCategory =
  | "work"
  | "personal"
  | "learning"
  | "health"
  | "finance"
  | "creative"
  | "uncategorized";

export type ThoughtType = "task" | "idea" | "question" | "reminder" | "note";

export interface Thought {
  id: string;
  content: string;
  title: string;
  category: ThoughtCategory;
  type: ThoughtType;
  tags: string[];
  completed: boolean;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Stats {
  total: number;
  categories: Record<string, number>;
  types: Record<string, number>;
  completed: number;
  starred: number;
  streak: number;
}

export interface AISearchResult {
  answer: string;
  thoughts: Thought[];
  local?: boolean;
}

export interface AICategorizeResult {
  thoughts: Omit<Thought, "id" | "completed" | "createdAt" | "updatedAt">[];
}

export type ViewMode = "grid" | "list";
export type ActiveView = "vault" | "capture" | "search" | "stats";
