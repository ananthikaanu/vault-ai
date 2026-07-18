import { useState, useRef } from "react";
import { Plus, Mic, Paperclip, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch } from "../hooks/redux";
import { createThought } from "../store";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { ThoughtType, ThoughtCategory } from "../types";

function detectType(text: string): ThoughtType {
  const t = text.toLowerCase();
  if (/\b(buy|get|pick up|order|need to|should|to-?do|task|finish|complete|prepare|remind)\b/.test(t)) return "task";
  if (/\b(idea|what if|concept|startup|build|create|imagine|could|propose|innovate)\b/.test(t)) return "idea";
  if (/\b(remind|don't forget|remember|schedule|alarm|deadline|meeting|appointment)\b/.test(t)) return "reminder";
  if (/\b(why|how|what|when|curious|wonder|question|unclear|understand|confusing)\b/.test(t)) return "question";
  return "note";
}

function detectCategory(text: string): ThoughtCategory {
  const t = text.toLowerCase();
  if (/\b(work|project|meeting|client|boss|job|career|interview|office|salary|promotion|resume)\b/.test(t)) return "work";
  if (/\b(feel|feeling|friend|family|happy|sad|grateful|emotion|personal|mood|life|love)\b/.test(t)) return "personal";
  if (/\b(learn|study|course|read|book|tutorial|skill|practice|research|class|training)\b/.test(t)) return "learning";
  if (/\b(health|exercise|gym|workout|diet|sleep|food|water|medical|doctor|fitness)\b/.test(t)) return "health";
  if (/\b(money|budget|invest|save|expense|income|finance|tax|payment|bill|crypto|stock)\b/.test(t)) return "finance";
  if (/\b(art|design|music|creative|write|draw|paint|photo|video|story|poem)\b/.test(t)) return "creative";
  return "uncategorized";
}

function extractTitle(text: string): string {
  const first = text.split(/[.\n]/)[0].trim();
  // Don't create a title if it's identical to the full content
  if (first === text.trim()) return "";
  return first.length > 60 ? first.slice(0, 57) + "..." : first;
}

export function QuickCapture() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => {
      setRecording(false);
      toast.error("Microphone error — check browser permissions.");
    };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      setContent(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleAttach = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
        const text = await file.text();
        setContent((prev) => (prev ? prev + "\n\n" + text : text));
        setAttachedFiles((prev) => [...prev, file.name]);
        toast.success(`Loaded "${file.name}"`);
      } else if (file.type.startsWith("image/")) {
        setContent((prev) => (prev ? prev + "\n" : "") + `[Image: ${file.name}]`);
        setAttachedFiles((prev) => [...prev, file.name]);
        toast.success(`Attached "${file.name}"`);
      } else {
        toast.error(`Unsupported file type: ${file.name}`);
      }
    }
    e.target.value = "";
  };

  const removeAttachment = (name: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f !== name));
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
    }
    setSaving(true);
    try {
      await dispatch(
        createThought({
          content: content.trim(),
          title: extractTitle(content.trim()),
          type: detectType(content.trim()),
          category: detectCategory(content.trim()),
        })
      );
      setContent("");
      setAttachedFiles([]);
      toast.success("Thought added to vault!");
    } catch {
      toast.error("Failed to save thought");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
  };

  return (
    <motion.div
      className="quick-capture"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="qc-header">
        <div className="qc-header__text">
          <h3>What's on your mind?</h3>
          <p>Write anything. AI will organize it for you.</p>
        </div>
        <div className="qc-illustration" aria-hidden>
          <span>🧠</span>
          <span className="qc-sparkle qc-sparkle--1">✦</span>
          <span className="qc-sparkle qc-sparkle--2">✦</span>
          <span className="qc-sparkle qc-sparkle--3">+</span>
        </div>
      </div>

      {/* Recording indicator */}
      {recording && (
        <div className="qc-recording-bar">
          <span className="qc-recording-dot" />
          Listening… speak now. Click <strong>Voice Note</strong> again to stop.
        </div>
      )}

      <textarea
        className="qc-textarea"
        placeholder={recording ? "Transcribing your voice..." : "Type your thought here..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
      />

      {/* Attached files */}
      {attachedFiles.length > 0 && (
        <div className="qc-attachments">
          {attachedFiles.map((name) => (
            <span key={name} className="qc-attachment-chip">
              <Paperclip size={10} />
              {name}
              <button onClick={() => removeAttachment(name)}><X size={10} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,text/*,image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="qc-footer">
        <div className="qc-actions">
          <button
            className={`qc-action-btn ${recording ? "qc-action-btn--active" : ""}`}
            onClick={handleVoice}
            title={recording ? "Click to stop recording" : "Start voice note"}
          >
            <Mic size={13} />
            {recording ? "Stop" : "Voice Note"}
          </button>
          <button className="qc-action-btn" onClick={handleAttach} title="Attach a file">
            <Paperclip size={13} /> Attach
          </button>
          <button className="qc-action-btn" onClick={() => navigate("/chat")}>
            <Sparkles size={13} /> Ask AI
          </button>
        </div>
        <button
          className="btn btn--primary btn--sm"
          onClick={handleSave}
          disabled={!content.trim() || saving}
        >
          <Plus size={13} />
          {saving ? "Saving..." : "Add to Vault"}
        </button>
      </div>
    </motion.div>
  );
}
