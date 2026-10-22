# Samagra 1000 — A Complete Python Coding & Scholarship Platform

> **"1,000 Questions. One Journey. Earn Your Samagra Seat."**  
> *"Your effort is your investment. Your skills are your reward."*

Built for **Samagra**, an educational program associated with **ANNAM.AI Foundation** and **Vicharanashala Lab for Education Design** ([https://samagra.annam.ai/](https://samagra.annam.ai/)).

---

## 🎯 Product Overview

Samagra 1000 is a full-stack, progressive Python coding and scholarship qualification platform. Students begin at Problem #1, solve progressively harder Python algorithmic challenges, pass automated test cases in an isolated execution sandbox, track their verified progress on a live leaderboard, and upon completing all 1,000 problems, automatically qualify for a 100% free Samagra scholarship seat.

### Core Guarantees:
- **Zero Hidden Caps:** Every student who completes all 1,000 verified problems earns a seat.
- **No Discretionary Interviews:** Passing the test suites is the sole qualification metric.
- **₹0 Cost:** Free participation. The ₹1,000 challenge value is an assigned educational benchmark.
- **Private Test Isolation:** Private test inputs and expected outputs are evaluated exclusively server-side and never exposed to the client.
- **Strict Sequential Progression:** Problem $N+1$ unlocks strictly upon verified completion of Problem $N$.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide Icons, React Router DOM |
| **Backend API** | Node.js, Express, TypeScript, Isolated Python Subprocess Runner (`python 3.15` sandbox) |
| **Database** | Supabase PostgreSQL, Row Level Security (RLS) policies, atomic idempotent qualification routines, local dual-mode fallback engine |
| **Specification** | OpenSpec Standard (`openspec/changes/samagra-1000-platform/`) |
| **Testing** | Vitest (19 automated unit & integration test suites covering Progression, Judge, Leaderboard, Scholarship, and Auth) |

---

## 📊 Question Bank Distribution (Exactly 1,000 Questions)

| Tier | Questions | Stages | Stage Range | Topics Covered | Points/Q |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Easy** | **300** | 10 | Stages 1–10 (30 Qs each) | Variables, Arithmetic, Conditionals, Loops, Strings, Lists, Dicts, Sets, Functions, Basic Recursion | 10 pts |
| **Medium** | **400** | 10 | Stages 11–20 (40 Qs each) | Two Pointers, Sliding Window, HashMaps, Binary Search, Stacks, Queues, Prefix Sums, Backtracking, Binary Trees, Greedy | 20 pts |
| **Hard** | **300** | 10 | Stages 21–30 (30 Qs each) | Dynamic Programming, Graphs, Shortest Path, Advanced Trees, Trie, Segment Trees, Bitmasking, Hard Combinatorics | 30 pts |
| **TOTAL** | **1,000** | **30** | **All 30 Stages** | **Comprehensive Python Problem Bank** | **19,000 pts** |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js v18+ (tested on Node.js v24.20.0, npm 11.19.0)
- Python 3.8+ installed and available on system PATH (`python` or `python3`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate & Validate Question Bank
```bash
# Generate the complete 1,000 question bank
npm run generate:bank

# Verify integrity, difficulty distribution, and test case compliance
npm run validate:bank
```

### 4. Run Automated Tests
```bash
npm test
```
Runs 19 Vitest tests across:
- `tests/progression.test.ts` (Sequential unlocking, anti-duplicate completion rules)
- `tests/judge.test.ts` (Sandbox execution, TLE, syntax error, private test isolation)
- `tests/leaderboard.test.ts` (Deterministic tie-breaking, privacy enforcement)
- `tests/scholarship.test.ts` (999 vs 1,000 completions, idempotent qualification)
- `tests/auth.test.ts` (Display name customization, account verification)

### 5. Start Development Server
```bash
# Concurrently launches Express API on :3001 and Vite client on :5173
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Isolated Judge Execution

The Python execution engine (`server/src/judge/python-isolated-runner.ts`) features:
1. **Isolated Ephemeral Sandbox:** Runs inside temporary OS directories created with `fs.mkdtempSync` and purged after evaluation.
2. **Resource Constraints:** Time limit strictly capped at 2.5 seconds (per-test timeout kills hanging processes to prevent infinite loop exploits). Memory limit capped at 128 MB.
3. **Restricted Command Pattern Filter:** Prohibits hazardous system calls (`shutil.rmtree`, `os.system`, destructive subprocess operations).
4. **Output Trimming:** Truncates excessive stdout/stderr at 64 KB to mitigate output bomb attacks.
5. **Private Test Secrecy:** Private test inputs and expected outputs are never returned in public API payloads.

---

## 🗄️ Database Schema & Supabase Migrations

The database migration is located in `supabase/migrations/20261022000001_initial_schema.sql` and includes:
- `profiles` (with RLS for user data and privacy protection)
- `problems` (1,000 problems with stage, difficulty, constraints)
- `test_cases` (visibility: 'public' | 'private')
- `submissions` (historical audit trail)
- `problem_completions` (authoritative completion records with uniqueness constraint `(user_id, problem_id)`)
- `student_progress` (rebuildable aggregate view)
- `scholarship_qualifications` (atomic record with unique token)
- `achievements` and `user_achievements`
- `admin_audit_logs`

### Applying Migrations to Supabase:
```bash
# If using Supabase CLI:
supabase db push
# Or copy and paste supabase/migrations/20261022000001_initial_schema.sql into the Supabase SQL Editor.
```

---

## 📦 Production Build & Deployment

### Build Command:
```bash
npm run build
```
Builds both the backend (`server/dist`) and the frontend bundle (`client/dist`).

### Environment Variables:
Copy `.env.example` to `.env` and configure:
```env
PORT=3001
NODE_ENV=production
VITE_API_URL=/api

# Optional: Supabase Production PostgreSQL Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Administrative Secret Key
ADMIN_SECRET_KEY=samagra_admin_secret_key_prod_2026
```

### Hosting Options:
- **Frontend:** Deploy `client/dist` to Vercel, Netlify, or Cloudflare Pages.
- **Backend API:** Deploy `server/` to Render, Railway, AWS ECS, or Fly.io (with Python runtime installed in the container).

---

## 📜 OpenSpec Specification

This project follows OpenSpec for transparent architecture and capability evolution.
View specifications in `openspec/changes/samagra-1000-platform/`:
- `proposal.md` — Product vision and core business rules
- `design.md` — System architecture, isolated judge, data models
- `tasks.md` — Implementation tracking checklist
- `specs/` — Capability specifications for `core-challenge`, `isolated-judge`, and `scholarship-qualification`

Validate specifications at any time with:
```bash
openspec validate samagra-1000-platform
```

---

## 🤝 Contact & Official Affiliation

- **Samagra Platform:** [https://samagra.annam.ai/](https://samagra.annam.ai/)
- **Organization:** ANNAM.AI Foundation & Vicharanashala Lab for Education Design
