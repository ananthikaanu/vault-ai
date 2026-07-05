import { motion } from "framer-motion";
import { Image, Mic } from "lucide-react";
import { useAppSelector } from "../hooks/redux";
import type { Thought } from "../types";

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

// Extract image filename from [Image: filename.ext] pattern
function extractImages(content: string): string[] {
  const matches = content.matchAll(/\[Image:\s*([^\]]+)\]/g);
  return [...matches].map((m) => m[1].trim());
}

// Detect voice-transcribed thoughts (content starts with the voice note marker)
function isVoiceNote(thought: Thought): boolean {
  return (
    thought.content.startsWith("[Voice note]") ||
    thought.content.startsWith("Voice note:") ||
    thought.tags?.includes("voice") ||
    thought.tags?.includes("voice-note")
  );
}

interface MediaItem {
  thought: Thought;
  type: "image" | "voice";
  label: string;
}

export function MediaPage() {
  const items = useAppSelector((s) => s.thoughts.items);

  // Collect all media items
  const mediaItems: MediaItem[] = [];

  items.forEach((t) => {
    const images = extractImages(t.content);
    images.forEach((img) => {
      mediaItems.push({ thought: t, type: "image", label: img });
    });
    if (isVoiceNote(t)) {
      mediaItems.push({ thought: t, type: "voice", label: t.title || "Voice note" });
    }
  });

  // Sort by newest first
  mediaItems.sort(
    (a, b) => new Date(b.thought.createdAt).getTime() - new Date(a.thought.createdAt).getTime()
  );

  return (
    <motion.div
      className="media-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          Media &amp; Attachments
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {mediaItems.length} attachment{mediaItems.length !== 1 ? "s" : ""} across your vault
        </p>
      </div>

      {mediaItems.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-state__emoji">📎</div>
          <h3>No media attachments yet</h3>
          <p>
            Use the <strong>Attach</strong> button when capturing thoughts to add images or voice
            notes. They'll appear here for easy browsing.
          </p>
        </motion.div>
      ) : (
        <div className="media-grid">
          {mediaItems.map((item, i) => (
            <motion.div
              key={`${item.thought.id}-${i}`}
              className="media-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              whileHover={{ y: -3 }}
            >
              <div className="media-card__preview">
                {item.type === "image" ? (
                  <Image size={36} color="var(--text-muted)" />
                ) : (
                  <Mic size={36} color="var(--accent)" />
                )}
              </div>
              <div className="media-card__info">
                <div className="media-card__title">{item.label}</div>
                <div className="media-card__meta">
                  {item.type === "image" ? "Image" : "Voice note"} ·{" "}
                  {timeAgo(item.thought.createdAt)}
                </div>
                {item.thought.title && (
                  <div
                    className="media-card__meta"
                    style={{ marginTop: 3, color: "var(--text-secondary)", fontSize: 12 }}
                  >
                    From: {item.thought.title}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
