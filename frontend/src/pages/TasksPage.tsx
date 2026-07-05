import { useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { createThought, updateThought, trashThought } from "../store";
import type { Thought } from "../types";

type Tab = "all" | "pending" | "done";

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function TasksPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.thoughts.items);
  const [newTask, setNewTask] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const tasks: Thought[] = items.filter((t) => t.type === "task");
  const done = tasks.filter((t) => t.completed);
  const pending = tasks.filter((t) => !t.completed);
  const progressPct = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;

  const filtered =
    tab === "all" ? tasks :
    tab === "pending" ? pending :
    done;

  const handleAddTask = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const text = newTask.trim();
    if (!text) return;
    dispatch(createThought({
      content: text,
      title: text.slice(0, 60),
      type: "task",
      category: "uncategorized",
      tags: [],
    }));
    setNewTask("");
    toast.success("Task added!");
  };

  const handleToggle = (task: Thought) => {
    dispatch(updateThought({ id: task.id, data: { completed: !task.completed } }));
  };

  const handleTrash = (id: string) => {
    dispatch(trashThought(id));
    toast("Moved to Trash", { icon: "🗑️" });
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: tasks.length },
    { key: "pending", label: "Pending", count: pending.length },
    { key: "done", label: "Done", count: done.length },
  ];

  return (
    <motion.div
      className="tasks-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header with progress */}
      <div className="tasks-header">
        <div className="tasks-progress-label">
          <span>
            <strong>{done.length}</strong> of <strong>{tasks.length}</strong> tasks complete
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="tasks-progress-track">
          <motion.div
            className="tasks-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Add task input */}
      <div className="tasks-add">
        <input
          type="text"
          placeholder="Add a new task… press Enter to save"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleAddTask}
        />
        <button
          onClick={() => {
            if (!newTask.trim()) return;
            dispatch(createThought({
              content: newTask.trim(),
              title: newTask.trim().slice(0, 60),
              type: "task",
              category: "uncategorized",
              tags: [],
            }));
            setNewTask("");
            toast.success("Task added!");
          }}
        >
          Add Task
        </button>
      </div>

      {/* Tabs */}
      <div className="tasks-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tasks-tab ${tab === t.key ? "tasks-tab--active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-state__emoji">
            {tab === "done" ? "🎉" : tab === "pending" ? "✅" : "📋"}
          </div>
          <h3>
            {tab === "done"
              ? "No completed tasks yet"
              : tab === "pending"
              ? "All caught up!"
              : "No tasks yet"}
          </h3>
          <p>
            {tab === "done"
              ? "Complete some tasks to see them here."
              : tab === "pending"
              ? "Every task is done. Great work!"
              : "Add your first task above to get started."}
          </p>
        </motion.div>
      ) : (
        <div className="tasks-list">
          <AnimatePresence mode="popLayout">
            {filtered.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`task-item ${task.completed ? "task-item--done" : ""}`}
              >
                {/* Checkbox */}
                <button
                  className={`task-checkbox ${task.completed ? "task-checkbox--checked" : ""}`}
                  onClick={() => handleToggle(task)}
                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {task.completed && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M1.5 5L4 7.5L8.5 2.5"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  )}
                </button>

                {/* Title */}
                <span className="task-title">
                  {task.title || task.content}
                </span>

                {/* Time */}
                <span className="task-time">{timeAgo(task.createdAt)}</span>

                {/* Delete */}
                <button
                  className="task-delete"
                  onClick={() => handleTrash(task.id)}
                  aria-label="Move to trash"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
