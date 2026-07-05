import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppSelector } from "../hooks/redux";
import { CATEGORY_CONFIG, TYPE_CONFIG } from "../utils/constants";
import type { Thought, ThoughtCategory, ThoughtType } from "../types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getTypeColor(type: ThoughtType): string {
  return TYPE_CONFIG[type]?.color ?? "#8b7cf8";
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function CalendarPage() {
  const items = useAppSelector((s) => s.thoughts.items);
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(formatDate(today));

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  // Build a map: date string -> thoughts[]
  const thoughtsByDay = new Map<string, Thought[]>();
  items.forEach((t) => {
    const key = formatDate(new Date(t.createdAt));
    if (!thoughtsByDay.has(key)) thoughtsByDay.set(key, []);
    thoughtsByDay.get(key)!.push(t);
  });

  // Calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = formatDate(today);

  // Cells: null = empty offset, number = day
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedThoughts = selectedDay ? (thoughtsByDay.get(selectedDay) ?? []) : [];

  return (
    <motion.div
      className="calendar-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Month navigation */}
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeft size={15} />
        </button>
        <h3>{MONTH_NAMES[month]} {year}</h3>
        <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Next month">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day name headers */}
      <div className="calendar-grid">
        {DAY_NAMES.map((d) => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}

        {/* Day cells */}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="calendar-cell calendar-cell--empty" />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayThoughts = thoughtsByDay.get(dateStr) ?? [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDay;

          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`calendar-cell ${isToday ? "calendar-cell--today" : ""} ${isSelected ? "calendar-cell--selected" : ""}`}
              onClick={() => setSelectedDay(isSelected ? null : dateStr)}
              aria-label={`${MONTH_NAMES[month]} ${day}: ${dayThoughts.length} thoughts`}
            >
              <span className="calendar-cell__num">{day}</span>
              {dayThoughts.length > 0 && (
                <div className="calendar-dots">
                  {dayThoughts.slice(0, 3).map((t, i) => (
                    <span
                      key={i}
                      className="calendar-dot"
                      style={{ background: getTypeColor(t.type as ThoughtType) }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected day panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            key={selectedDay}
            className="calendar-selected-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="calendar-selected-title">
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
              {" "}— {selectedThoughts.length} thought{selectedThoughts.length !== 1 ? "s" : ""}
            </div>

            {selectedThoughts.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "8px 0" }}>
                No thoughts captured this day.
              </p>
            ) : (
              selectedThoughts.map((t) => {
                const cat = CATEGORY_CONFIG[t.category as ThoughtCategory] || CATEGORY_CONFIG.uncategorized;
                const typeInfo = TYPE_CONFIG[t.type as ThoughtType] || TYPE_CONFIG.note;
                return (
                  <div key={t.id} className="calendar-thought-row">
                    <div
                      className="calendar-thought-icon"
                      style={{ background: cat.bg, color: cat.color }}
                    >
                      {typeInfo.icon}
                    </div>
                    <div className="calendar-thought-text">
                      <strong>{t.title || t.content.slice(0, 50)}</strong>
                      {t.title && (
                        <span>{t.content.slice(0, 80)}{t.content.length > 80 ? "…" : ""}</span>
                      )}
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginTop: 2 }}>
                        {timeAgo(t.createdAt)} · {cat.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
