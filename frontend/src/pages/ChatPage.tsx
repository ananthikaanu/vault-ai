import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Plus, Brain, Check, X, Zap } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { fetchThoughts, updateThought } from "../store";
import { thoughtsApi } from "../utils/api";
import toast from "react-hot-toast";
import type { Thought } from "../types";

interface Message {
  role: "user" | "ai" | "error";
  content: string;
  thoughts?: Thought[];
  local?: boolean;
  id: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

function ThoughtAddRow({ thought, onAdd }: { thought: Thought; onAdd: (t: Thought, text: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const submit = async () => {
    if (!text.trim()) return;
    await onAdd(thought, text.trim());
    setOpen(false);
    setText("");
  };
  return (
    <>
      <button className="chat-add-btn" onClick={() => { setOpen((o) => !o); setText(""); }}>
        <Plus size={11} /> Add
      </button>
      {open && (
        <div className="chat-add-input">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type what to add..."
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false); }}
          />
          <button className="chat-add-confirm" onClick={submit}><Check size={12} /></button>
          <button className="chat-add-cancel" onClick={() => setOpen(false)}><X size={12} /></button>
        </div>
      )}
    </>
  );
}

const SUGGESTIONS = [
  "What are my top ideas?",
  "Show me pending tasks",
  "Summarize my thoughts",
  "What did I learn recently?",
];

let msgId = 0;
const nextId = () => String(++msgId);

export function ChatPage() {
  const dispatch = useAppDispatch();
  const { apiKey, items, userName } = useAppSelector((s) => s.thoughts);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { dispatch(fetchThoughts({})); }, [dispatch]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats, loading]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const initials = userName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const newChat = () => {
    const chat: Chat = { id: nextId(), title: "New Chat", messages: [], createdAt: new Date().toISOString() };
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
  };

  const handleSend = async (text?: string) => {
    const q = (text || input).trim();
    if (!q) return;

    let chatId = activeChatId;
    if (!chatId) {
      const chat: Chat = {
        id: nextId(),
        title: q.length > 40 ? q.slice(0, 40) + "..." : q,
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setChats((prev) => [chat, ...prev]);
      chatId = chat.id;
      setActiveChatId(chat.id);
    }

    const userMsg: Message = { role: "user", content: q, id: nextId() };
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, title: c.messages.length === 0 ? (q.length > 40 ? q.slice(0, 40) + "..." : q) : c.title, messages: [...c.messages, userMsg] }
          : c
      )
    );
    setInput("");
    setLoading(true);

    try {
      const res = await thoughtsApi.aiSearch(q, apiKey);
      const aiMsg: Message = {
        role: "ai",
        content: res.answer || "No answer returned.",
        thoughts: res.thoughts,
        local: res.local,
        id: nextId(),
      };
      setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, aiMsg] } : c));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to get response.";
      setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, { role: "error", content: msg, id: nextId() }] } : c));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToThought = async (thought: Thought, text: string) => {
    const updated = thought.content + "\n• " + text;
    await dispatch(updateThought({ id: thought.id, data: { content: updated } }));
    toast.success(`Added to "${thought.title || "thought"}"`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const messages = activeChat?.messages || [];

  return (
    <div className="chat-layout">
      {/* Left: Recent Chats */}
      <div className="chat-sidebar">
        <div className="chat-sidebar__header">
          <h3>Recent Chats</h3>
          <button className="chat-new-btn" onClick={newChat}><Plus size={12} /> New Chat</button>
        </div>
        <div className="chat-history">
          {chats.length === 0 && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", padding: "12px 10px" }}>No chats yet. Ask something!</p>
          )}
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={`chat-history-item ${chat.id === activeChatId ? "chat-history-item--active" : ""}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <span className="chat-history-item__title">{chat.title}</span>
              <span className="chat-history-item__time">{new Date(chat.createdAt).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Chat Area */}
      <div className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-hero">
              <div className="chat-hero__icon"><Brain size={26} /></div>
              <h2>Ask your Vault</h2>
              <p>Search and explore your thoughts using natural language</p>

              <div className="chat-mode-badge">
                {apiKey
                  ? <><Sparkles size={13} /> AI-powered search active</>
                  : <><Zap size={13} /> Smart local search — works without an API key</>}
              </div>

              {items.length === 0 && (
                <div className="chat-no-key">📭 Your vault is empty. Add some thoughts first.</div>
              )}

              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chat-suggestion" onClick={() => handleSend(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`chat-msg chat-msg--${msg.role === "user" ? "user" : "ai"}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="chat-msg__avatar">{msg.role === "user" ? initials : <Sparkles size={14} />}</div>
                <div>
                  <div
                    className="chat-msg__bubble"
                    style={msg.role === "error" ? { background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" } : undefined}
                  >
                    {msg.content}
                    {msg.local && msg.role === "ai" && (
                      <span className="chat-local-badge" title="Using local smart search"><Zap size={10} /> local</span>
                    )}
                  </div>

                  {msg.thoughts && msg.thoughts.length > 0 && (
                    <div className="chat-msg__thoughts">
                      {msg.thoughts.slice(0, 3).map((t) => (
                        <div key={t.id} className="chat-thought-ref">
                          <div className="chat-thought-ref__header">
                            <strong>{t.title || "Thought"}</strong>
                            <ThoughtAddRow thought={t} onAdd={handleAddToThought} />
                          </div>
                          <span className="chat-thought-ref__body">
                            {t.content.length > 90 ? t.content.slice(0, 90) + "..." : t.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="chat-msg chat-msg--ai">
              <div className="chat-msg__avatar"><Sparkles size={14} /></div>
              <div className="chat-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-wrap">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder={apiKey ? "Ask anything about your vault..." : "Search your vault (local smart search)..."}
              value={input}
              rows={1}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              title="Send (Enter)"
            >
              <Send size={14} />
            </button>
          </div>
          {!apiKey && (
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, textAlign: "center" }}>
              <Zap size={10} style={{ display: "inline", marginRight: 3 }} />
              Using local search · Add an OpenRouter or Groq key in Settings for AI-powered answers
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
