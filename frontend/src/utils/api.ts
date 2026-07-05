import axios from "axios";
import type {
  Thought,
  Stats,
  AISearchResult,
  AICategorizeResult,
} from "../types";

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";
const api = axios.create({ baseURL: BASE });

export const thoughtsApi = {
  getAll: (params?: { search?: string; category?: string }) =>
    api.get<Thought[]>("/thoughts", { params }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Thought>(`/thoughts/${id}`).then((r) => r.data),

  create: (data: Partial<Thought>) =>
    api.post<Thought>("/thoughts", data).then((r) => r.data),

  update: (id: string, data: Partial<Thought>) =>
    api.put<Thought>(`/thoughts/${id}`, data).then((r) => r.data),

  // Soft delete — sets deletedAt on the backend
  delete: (id: string) =>
    api.delete(`/thoughts/${id}`).then((r) => r.data),

  getStats: () => api.get<Stats>("/stats").then((r) => r.data),

  // ─── Trash operations ───────────────────────────────────────────────
  getTrash: () =>
    api.get<Thought[]>("/trash").then((r) => r.data),

  restore: (id: string) =>
    api.post(`/thoughts/${id}/restore`).then((r) => r.data),

  permanentDelete: (id: string) =>
    api.delete(`/trash/${id}`).then((r) => r.data),

  // ─── AI ─────────────────────────────────────────────────────────────
  aiCategorize: (text: string, apiKey: string) =>
    api
      .post<AICategorizeResult>("/ai/categorize", { text, apiKey })
      .then((r) => r.data),

  aiSearch: (query: string, apiKey: string) =>
    api
      .post<AISearchResult>("/ai/search", { query, apiKey: apiKey || undefined })
      .then((r) => r.data),

  exportVault: (format: "markdown" | "json" = "markdown") => {
    window.open(`/api/export?format=${format}`, "_blank");
  },
};
