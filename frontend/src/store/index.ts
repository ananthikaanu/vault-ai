import { configureStore, createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Thought, Stats, ViewMode, ActiveView } from "../types";
import { thoughtsApi } from "../utils/api";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchThoughts = createAsyncThunk(
  "thoughts/fetchAll",
  async (params?: { search?: string; category?: string }) => {
    return thoughtsApi.getAll(params);
  }
);

export const createThought = createAsyncThunk(
  "thoughts/create",
  async (data: Partial<Thought>) => {
    return thoughtsApi.create(data);
  }
);

export const updateThought = createAsyncThunk(
  "thoughts/update",
  async ({ id, data }: { id: string; data: Partial<Thought> }) => {
    return thoughtsApi.update(id, data);
  }
);

export const deleteThought = createAsyncThunk(
  "thoughts/delete",
  async (id: string) => {
    await thoughtsApi.delete(id);
    return id;
  }
);

// Soft-delete: removes from active items (backend sets deletedAt)
export const trashThought = createAsyncThunk(
  "thoughts/trash",
  async (id: string) => {
    await thoughtsApi.delete(id);
    return id;
  }
);

export const fetchStats = createAsyncThunk("thoughts/stats", async () => {
  return thoughtsApi.getStats();
});

// ─── Trash Thunks ─────────────────────────────────────────────────────────────

export const fetchTrash = createAsyncThunk("thoughts/fetchTrash", async () => {
  return thoughtsApi.getTrash();
});

export const restoreThought = createAsyncThunk(
  "thoughts/restore",
  async (id: string) => {
    const restored = await thoughtsApi.restore(id);
    return { id, restored };
  }
);

export const permanentDeleteThought = createAsyncThunk(
  "thoughts/permanentDelete",
  async (id: string) => {
    await thoughtsApi.permanentDelete(id);
    return id;
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

interface ThoughtsState {
  items: Thought[];
  trash: Thought[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  activeView: ActiveView;
  selectedCategory: string;
  apiKey: string;
  searchQuery: string;
  userName: string;
}

const initialState: ThoughtsState = {
  items: [],
  trash: [],
  stats: null,
  loading: false,
  error: null,
  viewMode: "grid",
  activeView: "vault",
  selectedCategory: "all",
  apiKey: localStorage.getItem("tv_apikey") || "",
  searchQuery: "",
  userName: localStorage.getItem("tv_username") || "Ananthika",
};

const thoughtsSlice = createSlice({
  name: "thoughts",
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
    },
    setActiveView(state, action: PayloadAction<ActiveView>) {
      state.activeView = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setApiKey(state, action: PayloadAction<string>) {
      state.apiKey = action.payload;
      localStorage.setItem("tv_apikey", action.payload);
    },
    setUserName(state, action: PayloadAction<string>) {
      state.userName = action.payload;
      localStorage.setItem("tv_username", action.payload);
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchThoughts
      .addCase(fetchThoughts.pending, (state) => { state.loading = true; })
      .addCase(fetchThoughts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchThoughts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch";
      })
      // createThought
      .addCase(createThought.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // updateThought
      .addCase(updateThought.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      // deleteThought (legacy hard delete — keep for compatibility)
      .addCase(deleteThought.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      // trashThought (soft delete — remove from active items)
      .addCase(trashThought.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      // fetchStats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // fetchTrash
      .addCase(fetchTrash.fulfilled, (state, action) => {
        state.trash = action.payload;
      })
      // restoreThought — remove from trash, add back to items
      .addCase(restoreThought.fulfilled, (state, action) => {
        state.trash = state.trash.filter((t) => t.id !== action.payload.id);
        if (action.payload.restored) {
          state.items.unshift(action.payload.restored);
        }
      })
      // permanentDeleteThought
      .addCase(permanentDeleteThought.fulfilled, (state, action) => {
        state.trash = state.trash.filter((t) => t.id !== action.payload);
      });
  },
});

export const {
  setViewMode,
  setActiveView,
  setSelectedCategory,
  setApiKey,
  setUserName,
  setSearchQuery,
  clearError,
} = thoughtsSlice.actions;

export const store = configureStore({
  reducer: { thoughts: thoughtsSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
