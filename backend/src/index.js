import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ─── Thoughts CRUD ────────────────────────────────────────────────────────────

app.get("/api/thoughts", async (req, res) => {
  const { search, category } = req.query;
  let query = supabase
    .from("thoughts")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (category && category !== "all") query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  let result = data;
  if (search) {
    const q = search.toLowerCase();
    result = data.filter(
      (t) =>
        t.content?.toLowerCase().includes(q) ||
        t.title?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }
  res.json(result.map(toClient));
});

app.get("/api/thoughts/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("thoughts")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error || !data) return res.status(404).json({ error: "Not found" });
  res.json(toClient(data));
});

app.post("/api/thoughts", async (req, res) => {
  const { content, category, tags, title, type } = req.body;
  if (!content) return res.status(400).json({ error: "Content is required" });

  const { data, error } = await supabase
    .from("thoughts")
    .insert({
      content,
      title: title || "",
      category: category || "uncategorized",
      tags: tags || [],
      type: type || "note",
      completed: false,
      starred: false,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(toClient(data));
});

app.put("/api/thoughts/:id", async (req, res) => {
  const allowed = ["content", "title", "category", "tags", "type", "completed", "starred"];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("thoughts")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: error?.message || "Not found" });
  res.json(toClient(data));
});

// Soft delete — sets deleted_at
app.delete("/api/thoughts/:id", async (req, res) => {
  const { error } = await supabase
    .from("thoughts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── Trash ────────────────────────────────────────────────────────────────────

app.get("/api/trash", async (req, res) => {
  const { data, error } = await supabase
    .from("thoughts")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(toClient));
});

app.post("/api/thoughts/:id/restore", async (req, res) => {
  const { data, error } = await supabase
    .from("thoughts")
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error || !data) return res.status(404).json({ error: error?.message || "Not found" });
  res.json(toClient(data));
});

app.delete("/api/trash/:id", async (req, res) => {
  const { error } = await supabase.from("thoughts").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ─── Export ───────────────────────────────────────────────────────────────────

app.get("/api/export", async (req, res) => {
  const { format = "markdown" } = req.query;
  const { data: rows, error } = await supabase
    .from("thoughts")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const activeThoughts = rows.map(toClient);

  if (format === "json") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=vault-export.json");
    return res.json(activeThoughts);
  }

  const md = activeThoughts.map((t) => {
    const date = new Date(t.createdAt).toLocaleDateString();
    const tags = t.tags.length > 0 ? `\n> **Tags:** ${t.tags.join(", ")}` : "";
    const status = t.type === "task" ? (t.completed ? " ✅" : " ⬜") : "";
    return `## ${t.title || "Untitled"}${status}\n> **${t.type}** · ${t.category} · ${date}${tags}\n\n${t.content}\n`;
  }).join("\n---\n\n");

  const header = `# Vault AI — Exported Thoughts\n> Exported on ${new Date().toLocaleDateString()} · ${activeThoughts.length} thoughts\n\n---\n\n`;
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=vault-export.md");
  res.send(header + md);
});

// ─── Stats ────────────────────────────────────────────────────────────────────

app.get("/api/stats", async (req, res) => {
  const { data: rows, error } = await supabase
    .from("thoughts")
    .select("*")
    .is("deleted_at", null);
  if (error) return res.status(500).json({ error: error.message });
  const activeThoughts = rows.map(toClient);

  const categories = {}, types = {};
  activeThoughts.forEach((t) => {
    categories[t.category] = (categories[t.category] || 0) + 1;
    types[t.type] = (types[t.type] || 0) + 1;
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const activeDays = new Set(activeThoughts.map((t) => {
    const d = new Date(t.createdAt); d.setHours(0, 0, 0, 0); return d.getTime();
  }));
  let streak = 0;
  const cursor = new Date(today);
  while (activeDays.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  res.json({
    total: activeThoughts.length, categories, types,
    completed: activeThoughts.filter((t) => t.completed).length,
    starred: activeThoughts.filter((t) => t.starred).length,
    streak,
  });
});

// ─── TF-IDF Local Search ──────────────────────────────────────────────────────

const STOP = new Set(["a","an","the","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","can","to","of","in","for","on","with","at","by","from","and","or","but","not","this","that","my","your","its","our","their","i","me","we","you","he","she","it","they","them"]);

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
}

function tfidfSearch(query, allThoughts) {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];
  const N = allThoughts.length;
  const df = {};
  allThoughts.forEach((t) => {
    const terms = new Set(tokenize(`${t.title || ""} ${t.content} ${(t.tags || []).join(" ")} ${t.category} ${t.type}`));
    terms.forEach((term) => { df[term] = (df[term] || 0) + 1; });
  });
  const scored = allThoughts.map((t) => {
    const docText = `${t.title || ""} ${t.title || ""} ${t.content} ${(t.tags || []).join(" ")} ${t.category} ${t.type}`;
    const terms = tokenize(docText);
    const tf = {};
    terms.forEach((w) => { tf[w] = (tf[w] || 0) + 1; });
    let score = 0;
    queryTerms.forEach((term) => {
      const termFreq = (tf[term] || 0) / (terms.length || 1);
      const idf = Math.log((N + 1) / ((df[term] || 0) + 1));
      score += termFreq * idf;
      if ((t.title || "").toLowerCase().includes(term)) score += 0.4;
      if ((t.tags || []).some((tag) => tag.toLowerCase().includes(term))) score += 0.2;
    });
    return { thought: t, score };
  });
  return scored.filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map((r) => r.thought);
}

function generateLocalAnswer(query, matched, total) {
  const q = query.toLowerCase().trim();
  if (matched.length === 0) return `No thoughts found matching "${query}". Try different keywords or capture some notes about this topic first.`;
  if (/\b(summarize|summary|overview|recap|brief)\b/.test(q)) {
    const bullets = matched.slice(0, 3).map((t) => `• ${t.title || t.content.split(/[.\n]/)[0].slice(0, 70)}`).join("\n");
    return `Here's a summary from your vault:\n\n${bullets}`;
  }
  if (/\b(how many|count|total|number)\b/.test(q)) {
    return `You have ${matched.length} thought${matched.length !== 1 ? "s" : ""} related to this out of ${total} total in your vault.`;
  }
  if (/\b(task|todo|to-do|pending|complete|finish)\b/.test(q)) {
    const tasks = matched.filter((t) => t.type === "task");
    const done = tasks.filter((t) => t.completed).length;
    if (tasks.length > 0) return `Found ${tasks.length} task${tasks.length !== 1 ? "s" : ""} — ${tasks.length - done} pending, ${done} completed:`;
  }
  if (/\b(idea|ideas|concept|startup)\b/.test(q)) {
    const ideas = matched.filter((t) => t.type === "idea");
    if (ideas.length > 0) return `You have ${ideas.length} idea${ideas.length !== 1 ? "s" : ""} related to this:`;
  }
  if (/\b(recent|latest|last|new|today)\b/.test(q)) return `Here are your most recent thoughts about "${query}":`;
  const cats = [...new Set(matched.map((t) => t.category).filter((c) => c !== "uncategorized"))];
  if (cats.length > 0) return `Found ${matched.length} thought${matched.length !== 1 ? "s" : ""} in your ${cats.join(" & ")} notes:`;
  return `Found ${matched.length} relevant thought${matched.length !== 1 ? "s" : ""} in your vault:`;
}

// ─── AI Providers ─────────────────────────────────────────────────────────────

const OPENROUTER_MODELS = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemma-2-9b-it:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "deepseek/deepseek-r1-distill-llama-8b:free",
];

async function callOpenRouter(apiKey, prompt, modelIndex = 0) {
  const model = OPENROUTER_MODELS[modelIndex];
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vault-ai-m2l7.vercel.app",
      "X-Title": "Vault AI",
    },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 1024 }),
  });
  const data = await response.json();
  if (data.error) {
    if (modelIndex + 1 < OPENROUTER_MODELS.length) {
      console.log(`Model ${model} failed, trying ${OPENROUTER_MODELS[modelIndex + 1]}`);
      return callOpenRouter(apiKey, prompt, modelIndex + 1);
    }
    throw new Error(data.error.message || "All OpenRouter models failed");
  }
  return data.choices?.[0]?.message?.content || "";
}

async function callGroq(apiKey, prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }], max_tokens: 1024 }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "Groq request failed");
  return data.choices?.[0]?.message?.content || "";
}

async function callAI(apiKey, prompt) {
  if (apiKey.startsWith("gsk_")) return callGroq(apiKey, prompt);
  return callOpenRouter(apiKey, prompt);
}

// ─── AI Routes ────────────────────────────────────────────────────────────────

app.post("/api/ai/categorize", async (req, res) => {
  const { text, apiKey } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  if (!apiKey) return res.status(400).json({ error: "API key is required for AI categorization" });

  const prompt = `You are a smart thought organizer. The user gives you a raw brain dump.
Split into individual thoughts, then for each:
- category: work | personal | learning | health | finance | creative | uncategorized
- type: task | idea | question | reminder | note
- title: short title (max 6 words)
- tags: max 3 relevant tags

Return ONLY this JSON, no markdown, no backticks:
{"thoughts":[{"content":"text","title":"title","category":"work","type":"task","tags":["tag"]}]}

Brain dump:
${text}`;

  try {
    const raw = await callAI(apiKey, prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(cleaned));
  } catch (err) {
    console.error("Categorize error:", err.message);
    res.status(500).json({ error: "AI categorization failed: " + err.message });
  }
});

app.post("/api/ai/search", async (req, res) => {
  const { query, apiKey } = req.body;
  if (!query) return res.status(400).json({ error: "query is required" });

  const { data: rows, error } = await supabase
    .from("thoughts")
    .select("*")
    .is("deleted_at", null);
  if (error) return res.status(500).json({ error: error.message });
  const activeThoughts = rows.map(toClient);

  if (activeThoughts.length === 0) {
    return res.json({ answer: "Your vault is empty. Start capturing thoughts to search them!", thoughts: [], local: true });
  }

  if (!apiKey) {
    const matched = tfidfSearch(query, activeThoughts);
    return res.json({ answer: generateLocalAnswer(query, matched, activeThoughts.length), thoughts: matched, local: true });
  }

  const allText = activeThoughts.map((t, i) => `[${i}] (${t.category}/${t.type}) ${t.title || ""}: ${t.content}`).join("\n");
  const prompt = `You are a personal knowledge assistant. The user has these thoughts saved:
${allText}

Question: "${query}"

Answer conversationally based on their thoughts. Return ONLY this JSON:
{"answer":"conversational answer","indices":[0,1,2]}

If nothing matches: {"answer":"I couldn't find thoughts related to that.","indices":[]}`;

  try {
    const raw = await callAI(apiKey, prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const matchedThoughts = (parsed.indices || []).map((i) => activeThoughts[i]).filter(Boolean);
    res.json({ answer: parsed.answer, thoughts: matchedThoughts });
  } catch (err) {
    console.error("AI search failed, using TF-IDF fallback:", err.message);
    const matched = tfidfSearch(query, activeThoughts);
    res.json({ answer: generateLocalAnswer(query, matched, activeThoughts.length), thoughts: matched, local: true });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convert snake_case DB row → camelCase for the frontend
function toClient(row) {
  return {
    id: row.id,
    title: row.title || "",
    content: row.content,
    category: row.category,
    type: row.type,
    tags: row.tags || [],
    completed: row.completed,
    starred: row.starred,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.deleted_at ? { deletedAt: row.deleted_at } : {}),
  };
}

app.listen(PORT, () => {
  console.log(`🧠 Vault AI backend running on http://localhost:${PORT}`);
});
