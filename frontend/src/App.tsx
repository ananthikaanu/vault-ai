import { Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { VaultPage } from "./pages/VaultPage";
import { CapturePage } from "./pages/CapturePage";
import { SearchPage } from "./pages/SearchPage";
import { StatsPage } from "./pages/StatsPage";
import { ChatPage } from "./pages/ChatPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { RemindersPage } from "./pages/RemindersPage";
import { CalendarPage } from "./pages/CalendarPage";
import { TasksPage } from "./pages/TasksPage";
import { MediaPage } from "./pages/MediaPage";
import { TrashPage } from "./pages/TrashPage";
import "./App.css";

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface-2)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            fontSize: "13px",
          },
        }}
      />
    </Provider>
  );
}
