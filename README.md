<div align="center">

# 🧠 Vault AI — Your AI Second Brain

**A full-stack thought-capturing app that organises your ideas, tasks, and notes intelligently — powered by AI, or running entirely offline with built-in smart search.**

[![React](https://img.shields.io/badge/React_18-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-764abc?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

> **Live Demo:** [vault-ai.vercel.app](https://vault-ai.vercel.app) &nbsp;·&nbsp; **Backend:** [vault-ai-backend.onrender.com](https://vault-ai-backend.onrender.com)

</div>

---

## ✨ Features

### 📸 Capture
| Feature | Description |
|---------|-------------|
| **Quick Capture** | Type a thought → auto-detects type (task, idea, reminder, question, note) and category (work, personal, health…) using keyword analysis |
| **Voice Notes** | Click "Voice Note" to speak — uses the browser's Web Speech API, no setup needed |
| **File Attachments** | Attach `.txt`, `.md`, or image files; text files load directly into the capture area |
| **Smart Auto-tagging** | Keyword-based detection adds type and category automatically |

### 🤖 AI & Search
| Feature | Description |
|---------|-------------|
| **Local TF-IDF Search** | Built-in TF-IDF algorithm answers queries intelligently — no API key required |
| **AI Chat** | Ask natural-language questions: "What are my pending tasks?", "Summarise my ideas this week" |
| **Groq / OpenRouter** | Supports both free AI providers — auto-detected from key prefix (`gsk_` or `sk-or-`) |
| **Chat + Add** | Search results show matched thoughts; click "+ Add" to append notes directly from chat |

### 🗂️ Organise
| Feature | Description |
|---------|-------------|
| **All Thoughts** | Grid/list view, search, category filters, export as Markdown or JSON |
| **Tasks** | Dedicated task manager — progress bar, All/Pending/Done tabs, animated checkboxes |
| **Calendar** | Monthly grid with coloured dots for each day you captured thoughts; click any day to view |
| **Collections** | Smart auto-collections: Ideas, Tasks, Starred, Questions + auto-grouped by category |
| **Favorites** | Star any thought — persisted to backend, visible in dedicated Favorites page |
| **Trash & Restore** | Soft-delete — trashed thoughts can be restored with one click or permanently removed |

### 📊 Insights
- **Charts** — Activity over time (line chart) + category breakdown (donut chart)
- **Day Streak** — Consecutive days you've captured thoughts
- **Stats** — Total thoughts, tasks completed, favorites count, categories used

### UX & Polish
- 🌙 **Dark / Light mode** — Persistent, polished in both modes
- ⌨️ **Cmd+K / Ctrl+K** — Open search from anywhere in the app
- 💨 **Framer Motion animations** — Page transitions, card entrances, list re-ordering
- 📤 **Export** — Markdown or JSON download of your entire vault

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **State** | Redux Toolkit (createSlice, createAsyncThunk) |
| **Routing** | React Router v6 |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express |
| **AI Search** | TF-IDF (local) · Groq API · OpenRouter API |
| **Persistence** | JSON file (dev) — upgradeable to MongoDB |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+

### 1. Clone
```bash
git clone https://github.com/your-username/vault-ai.git
cd vault-ai
```

### 2. Start backend
```bash
cd backend
npm install
npm run dev          # http://localhost:3001
```

### 3. Start frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Open **http://localhost:5173** — the app works immediately with no configuration.

### 4. Enable AI (optional)
Go to **Settings** in the sidebar and paste a free API key:

| Provider | Get a free key | Key format |
|----------|---------------|-----------|
| **Groq** | [console.groq.com](https://console.groq.com) | `gsk_...` |
| **OpenRouter** | [openrouter.ai](https://openrouter.ai) | `sk-or-...` |

Keys are stored in your browser's `localStorage` only — never sent anywhere except the AI provider.

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env.local`)
```env
# Leave empty for local dev — Vite proxies /api to localhost:3001
# Set to your deployed backend URL in production (Vercel)
VITE_API_URL=
```

### Backend
No environment variables required for local development.

---

## 🌐 Deployment

### Frontend → Vercel

1. Push to GitHub
2. [vercel.com](https://vercel.com) → **New Project** → import repo
3. Set **Root Directory** = `frontend`
4. Add environment variable: `VITE_API_URL` = your Render backend URL (e.g. `https://vault-ai-backend.onrender.com`)
5. Deploy

### Backend → Render

1. [render.com](https://render.com) → **New Web Service** → connect repo
2. Set **Root Directory** = `backend`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add a **Disk** (1 GB, mount path `/opt/render/project/src/backend`) to persist data
6. Deploy → copy the URL → paste into Vercel's `VITE_API_URL`

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/thoughts` | List active thoughts (`?search=&category=`) |
| `POST` | `/api/thoughts` | Create a thought |
| `PUT` | `/api/thoughts/:id` | Update a thought |
| `DELETE` | `/api/thoughts/:id` | Soft-delete (moves to trash) |
| `GET` | `/api/trash` | List trashed thoughts |
| `POST` | `/api/thoughts/:id/restore` | Restore from trash |
| `DELETE` | `/api/trash/:id` | Permanent delete |
| `GET` | `/api/stats` | Aggregated stats + streak |
| `GET` | `/api/export?format=markdown\|json` | Export vault |
| `POST` | `/api/ai/search` | Natural-language search (AI or local TF-IDF) |
| `POST` | `/api/ai/categorize` | AI-powered brain-dump categorisation |

---

## 📁 Project Structure

```
vault-ai/
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout, Sidebar, Header, ThoughtCard, QuickCapture…
│   │   ├── pages/           # HomePage, TasksPage, CalendarPage, ChatPage…
│   │   ├── store/           # Redux slice + async thunks
│   │   ├── hooks/           # Typed useAppDispatch / useAppSelector
│   │   ├── utils/           # Axios API client, constants
│   │   └── types/           # TypeScript interfaces
│   ├── vercel.json          # SPA rewrite rules for Vercel
│   └── vite.config.ts       # Dev proxy config
│
├── backend/
│   └── src/
│       └── index.js         # Express API, TF-IDF engine, AI proxy, soft-delete
│
├── render.yaml              # Render deployment config
└── README.md
```

---

## 🔮 Roadmap

- [ ] PostgreSQL / MongoDB integration for production persistence
- [ ] User authentication (JWT)
- [ ] PWA support (offline mode, installable)
- [ ] Markdown rendering in thought cards
- [ ] Reminders & push notifications
- [ ] Mobile app (React Native)

---

## 📄 License

MIT © [Ananthika](https://github.com/your-username)

---

<div align="center">
  <sub>Built as a personal second-brain tool — and a portfolio project showcasing full-stack React + Node.js skills.</sub>
</div>
