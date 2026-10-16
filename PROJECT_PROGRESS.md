# Yahoo Pulse — Project Progress & Architecture Tracker

## 1. Project Overview
- **Name:** Yahoo Pulse
- **Concept:** AI-Powered Personalized News Platform inspired by Yahoo! JAPAN's portal.
- **Repository Pattern:** Decoupled Full-Stack Structure (`client/` for Frontend, `server/` for Backend).

---

## 2. Technology Stack & Environment
- **Node.js:** v24.18.0
- **npm:** v11.16.0
- **Git:** v2.50.1
- **Frontend Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend Stack:** Node.js, Express, TypeScript, Zod, CORS, tsx
- **Database (Planned - Stage 4):** PostgreSQL / Supabase, Prisma ORM
- **External Services (Planned - Stages 3 & 6):** GNews API, Google Gemini API

---

## 3. High-Level Architecture
```
YahooPlus/
├── client/                     # Frontend SPA (Vite + React 19 + TypeScript + Tailwind v4)
│   ├── src/
│   │   ├── App.tsx             # Root component with live API Health Monitor
│   │   ├── index.css           # Tailwind v4 engine directives
│   │   └── main.tsx            # React DOM bootstrap
│   └── vite.config.ts          # Vite build config + /api dev proxy to localhost:5000
├── server/                     # Backend REST API (Express + TypeScript + Zod)
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts          # Strict Zod-validated environment config
│   │   ├── routes/
│   │   │   └── health.routes.ts# GET /api/health with system diagnostics
│   │   ├── app.ts              # Express application, CORS, error handling middleware
│   │   └── server.ts           # HTTP listener & graceful shutdown handlers
│   ├── .env                    # Local environment config
│   └── tsconfig.json           # Strict NodeNext TypeScript config
└── PROJECT_PROGRESS.md         # Continuous project tracking & interview prep notes
```

---

## 4. Milestone & Stage Tracker

- [x] **Pre-flight Assessment:** Checked Node, npm, Git versions and workspace status.
- [x] **Stage 1: Project Foundation (100% COMPLETE)**
  - [x] Directory scaffolding (`client/`, `server/`) & `PROJECT_PROGRESS.md`
  - [x] Initialize Frontend (`client` with Vite, React 19, TypeScript, Tailwind CSS v4, Lucide)
  - [x] Initialize Backend (`server` with Node.js, Express, TypeScript, Zod)
  - [x] Backend Health Check endpoint (`GET /api/health`)
  - [x] Configure Vite Reverse Proxy (`/api` -> `http://localhost:5000`)
  - [x] Connect Frontend to Backend Health Check with live ping & diagnostic metrics
  - [x] Verified zero TypeScript errors across both client and server builds
- [x] **Stage 2: User Interface (Yahoo! JAPAN Inspired Portal) (100% COMPLETE)**
  - [x] Top Header & Search Bar (`Header.tsx`, `SearchBar.tsx`)
  - [x] Service Navigation (`ServiceNavigation.tsx` with 8 core services + AI Pulse)
  - [x] 3-Column Portal Layout (Left Sidebar 18%, Center Main 58%, Right Sidebar 24%)
  - [x] Left Category Navigation Sidebar (`CategorySidebar.tsx` with Top News, Tech, Business, World, Sports, Science, etc.)
  - [x] Quick Category Navigation Tabs (`NewsCategoryTabs.tsx`)
  - [x] Center Featured News Story (`FeaturedNews.tsx` with thumbnail, metadata, and expandable Gemini AI Takeaways)
  - [x] Center High-Density Headline Feed (`HeadlineList.tsx` with comments count, source, timestamp, and bookmark toggle)
  - [x] Right Weather Widget (`WeatherWidget.tsx` with Tokyo radar, temp, rain probability, humidity)
  - [x] Right Ranked Trending Topics (`TrendingTopics.tsx` with top 8 rankings, trend direction icons, keyword filter)
  - [x] Interactive States: Dynamic category switching, real-time keyword search, bookmark toggle & counter, empty states
  - [x] Responsive Design: Full 3-column portal on desktop (`lg`), dual-column on tablet (`md`), single-column on mobile
- [x] **Stage 3: News API Integration & Bilingual Yahoo! JAPAN Portal Replica (100% COMPLETE)**
  - [x] Ingest live news via GNews API with configured API Key
  - [x] 10-minute in-memory caching to safeguard 100 req/day API rate limit
  - [x] Data normalization pipeline mapping third-party schemas into clean `Article` contracts
  - [x] Bilingual Internationalization Engine (`LanguageContext.tsx`) with seamless `EN` ⇋ `JA` toggle
  - [x] Header: Red `YAHOO! PULSE` branding, wide search, notification, bookmarks, and `Taro さん` profile
  - [x] Service Navigation: 12 colorful Japanese portal services (Mail, Shopping, ヤフオク!, PayPay, Travel, Finance, Weather, Sports, Games, Video, Map, More)
  - [x] Left Sidebar: Authentic Japanese category list, My Channels, and Tokyo/Osaka/Nagoya/Fukuoka regional section
  - [x] Hero Section: Split view with featured photo story (Tokyo Tower twilight) + 4 stacked headline cards
  - [x] "あなたにおすすめ": 4-card horizontal carousel with slider button
  - [x] "最新ニュース": 4-card latest news grid with category sub-filters
  - [x] Right Sidebar: Tokyo 2-day weather forecast, Taro-san card with PayPay & 1,230 Points, 1-5 Trending topics with `急上昇` badges, and Autumn Travel editorial banner
- [x] **Stage 4: Database & Prisma Modeling (100% COMPLETE)**
  - [x] Initialized Prisma ORM (v6.19.3) targeting local SQLite (`dev.db`), architected for seamless Supabase PostgreSQL migration
  - [x] Designed relational schemas: `User`, `Article`, `Bookmark`, `ReadingHistory`, `AISummary` with indexes and cascading relations
  - [x] Idempotent database seed script (`prisma/seed.ts`) populating demo user (Taro), news articles, AI summaries, bookmarks, and reading history
  - [x] Prisma client singleton instance (`server/src/db/prisma.ts`) preventing connection leaks during development hot reloading
- [x] **Stage 5: Authentication & User Preferences (100% COMPLETE)**
  - [x] Authentication REST endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - [x] Password hashing with `bcryptjs` and stateless session token signing with `jsonwebtoken`
  - [x] User Preferences endpoint: `PUT /api/user/preferences` (updating region and category preferences)
  - [x] Persistent Bookmarks endpoints: `GET /api/user/bookmarks`, `POST /api/user/bookmarks` (toggle with on-the-fly article caching)
  - [x] Persistent Reading History endpoint: `GET /api/user/history`
  - [x] Interactive Frontend Preferences Modal (`Sliders` icon in sidebar) to customize Tokyo/Osaka/Nagoya/Fukuoka region and favorite categories
  - [x] Client optimistic bookmark sync updating both React state and persistent SQLite database
- [x] **Stage 6: AI Summarization (Gemini API) (100% COMPLETE)**
  - [x] Installed official `@google/genai` SDK and configured `GEMINI_API_KEY`
  - [x] Implemented `server/src/services/gemini.service.ts` enforcing structured JSON outputs (`summary` + `keyPoints` array)
  - [x] Relational database caching via Prisma `AISummary` model to eliminate redundant LLM token costs and latency
  - [x] Exposed `POST /api/news/summarize` with language parameter (`lang=ja|en`)
  - [x] Connected frontend "AI要約" (AI Takeaways) button in `HeroSection.tsx` with animated loading spinner (`Loader2`) and model indicator badge
- [x] **Stage 7: Recommendation Engine (100% COMPLETE)**
  - [x] Designed deterministic, multi-factor ranking algorithm with configurable weights (Interest: 40%, Recency decay: 30%, Popularity: 20%, Read penalty: 50%)
  - [x] Implemented logarithmic popularity scaling and exponential half-life time decay ($e^{-t/180}$)
  - [x] Integrated reading history penalty ($S_{history}$) to eliminate feed fatigue
  - [x] Implemented category diversity balancing to prevent single-category saturation
  - [x] Exposed `GET /api/news/recommended` returning explainable scores and factor breakdowns
  - [x] Connected frontend "あなたへのおすすめ" (For You) channel in sidebar to stream personalized recommendations
- [x] **Stage 8: Search & Trending Engine (100% COMPLETE)**
  - [x] Created `server/src/services/trending.service.ts` calculating trending topics by combining engagement momentum with real-time velocity
  - [x] Implemented velocity boosting endpoint `POST /api/trending/hit` that dynamically updates trending rankings when users search
  - [x] Exposed `GET /api/trending` returning top 5 trending keywords with velocity scores and `急上昇` (Surging) flags
  - [x] Built 300ms debounced input in `SearchBar.tsx` to group keystrokes and reduce server query pressure
  - [x] Connected `TrendingTopics.tsx` to load live trending topics from backend and filter articles on click
- [x] **Stage 9: A/B Testing Framework (100% COMPLETE)**
  - [x] Designed deterministic session/user hashing algorithm for 50/50 bucket assignment (`Variant A: Recency-First` vs `Variant B: Personalized-First`)
  - [x] Implemented telemetry service (`server/src/services/abtest.service.ts`) with unique impression & click tracking via deduplicated Sets
  - [x] Created REST endpoints: `GET /api/ab/variant`, `POST /api/ab/track`, and `GET /api/ab/metrics` calculating live Click-Through Rates (CTR)
  - [x] Connected frontend `App.tsx` with automatic impression logging on news load and click telemetry on article interactions
  - [x] Built interactive "A/B Test Inspector" floating widget in client footer allowing live inspection of active variant, real-time CTR metric graphs, and instant cohort switching
- [x] **Stage 10: Performance, Caching (Memory TTL), & Reliability (100% COMPLETE)**
  - [x] Built in-memory TTL Cache Service (`server/src/services/cache.service.ts`) with automatic background eviction, hits, misses, and hit ratio tracking
  - [x] Layered recommendation caching speeding up repeat queries from 1019ms to 0.30ms (over 3,300x speedup) with `X-Cache: HIT/MISS` and HTTP `Cache-Control` headers
  - [x] Created W3C compliant `Server-Timing` and `X-Response-Time` middleware (`server/src/middleware/timing.ts`) for browser DevTools latency profiling
  - [x] Implemented sliding-window Rate Limiter middleware (`server/src/middleware/rateLimiter.ts`) with RFC `RateLimit-*` headers, protecting `/api` (120 req/min), `/api/auth` (10 req/min brute force protection), and `/api/news/summarize` (10 req/min AI quota protection) returning `429 Too Many Requests`
  - [x] Upgraded `GET /api/health` with SQLite database ping latency measurement, memory allocation breakdown, and live cache statistics
  - [x] Added interactive System Diagnostics & Health modal in client footer displaying live DB latency, cache hit ratio, and observability telemetry
- [x] **Stage 11: Deployment & Portfolio Polish (100% COMPLETE)**
  - [x] Created multi-stage production `Dockerfile` with automated `HEALTHCHECK` probe and alpine base
  - [x] Configured `docker-compose.yml` with persistent SQLite volume and environment variable mapping
  - [x] Implemented root `package.json` workspace orchestration (`npm run build`, `npm run start`)
  - [x] Added production static asset serving with SPA routing fallback directly inside Express backend
  - [x] Authored comprehensive portfolio `README.md` featuring architecture diagrams, mathematical ranking formulas, defense-in-depth security overview, and LINE Yahoo interview talking points

---

## 5. Current Implementation Stage
- **Current Status:** 🏆 **ALL 11 STAGES 100% COMPLETE**
- **Summary:** Yahoo Pulse is fully production-ready, featuring an authentic Yahoo! JAPAN bilingual portal design, multi-factor deterministic recommendation engine, A/B testing framework with live CTR telemetry, in-memory TTL caching with a 3,300x speedup, sliding-window rate limiting, and Gemini 2.5 Flash AI summarization.

---

## 6. How to Run the Application

### 1. Run the Backend (`server/`)
```powershell
cd c:\Users\ASUS\Desktop\YahooPlus\server
npm run dev
```
* Runs Express on `http://localhost:5000` with hot-reloading via `tsx watch`.
* Endpoints:
  - Health check & diagnostics: `http://localhost:5000/api/health`
  - Live News: `http://localhost:5000/api/news?lang=ja`
  - Current User: `http://localhost:5000/api/auth/me`
  - Bookmarks: `http://localhost:5000/api/user/bookmarks`
  - Preferences: `PUT http://localhost:5000/api/user/preferences`
  - A/B Variant: `GET http://localhost:5000/api/ab/variant`
  - A/B Metrics: `GET http://localhost:5000/api/ab/metrics`

### 2. Run the Frontend (`client/`)
```powershell
cd c:\Users\ASUS\Desktop\YahooPlus\client
npm run dev
```
* Runs Vite on `http://localhost:5173` (or `http://localhost:5174`).
* Switch languages at any time using the `JA / EN` toggle button in the header.
* Click **"設定・興味の変更"** in the left sidebar to open the Preferences & Region customization modal.
* Click **"A/B Test Group X (CTR)"** in the bottom-right footer to inspect active cohort and CTR analytics.
* Click **"Diagnostics (DB: Xms)"** in the bottom-right footer to inspect real-time database latency and cache metrics.

---

## 7. Verification & Change Log
| Date | Milestone / Change | Verified Command / Test | Status |
| :--- | :--- | :--- | :--- |
| Initial Setup | Initial assessment & folder scaffolding | `node -v`, `npm -v`, `git --version`, directory check | Passed |
| Stage 1 - Step 2 | Frontend initialized with Vite, React 19, TS, Tailwind v4, Lucide | `npm run build` (tsc -b && vite build in 377ms) | Passed |
| Stage 1 - Step 3 | Backend initialized with Express, TS, Zod env config | `npm run build` (tsc with strict NodeNext target) | Passed |
| Stage 1 - Step 4 | Health Check endpoint (`GET /api/health`) | `Invoke-RestMethod http://localhost:5000/api/health` (Uptime, memory, env returned) | Passed |
| Stage 1 - Step 5 | Connected Frontend to Backend via Vite Proxy | `client` fetches `/api/health`, displays ping latency, uptime & diagnostics | Passed |
| Stage 2 - Step 1 | Top Header, SearchBar, ServiceNavigation & core types | `npm run build` (tsc -b && vite build in 380ms) | Passed |
| Stage 2 - Step 2 | Complete 3-Column Portal UI (Sidebar, Tabs, Featured, Headlines, Weather, Trends) | `npm run build` (Clean production bundle in 394ms, 0 type errors) | Passed |
| Stage 3 - Complete | GNews live integration, in-memory cache, bilingual EN/JA engine, pixel-perfect screenshot UI replica | `npm run build` (Client built in 402ms, live `/api/news?lang=ja` returning GNews payload) | Passed |
| Stage 4 - Database | Prisma ORM schema synced (`dev.db`), models for User, Article, Bookmark, History, AISummary | `npx prisma db push`, `npx tsx prisma/seed.ts` (Seeded Taro, articles, relations) | Passed |
| Stage 5 - Auth & Prefs | Authentication, preferences modal, and persistent bookmarks API | `Invoke-RestMethod /api/auth/me` & `/api/user/bookmarks`, client build passed in 892ms | Passed |
| Stage 6 - Gemini AI | Google GenAI SDK integration with Prisma database caching | `POST /api/news/summarize` returned structured JSON, client build in 442ms | Passed |
| Stage 7 - Recommendation | Multi-factor deterministic ranking with recency decay, popularity, read-penalty & diversity | `GET /api/news/recommended` returns ranked list with scoring breakdowns, client build 409ms | Passed |
| Stage 8 - Search & Trending | 300ms debouncing, dynamic trending velocity engine, velocity boosting API | `GET /api/trending?lang=ja` returned top 5 with surging tags, client build 391ms | Passed |
| Stage 9 - A/B Testing | Deterministic user hashing, telemetry ingestion, CTR analytics API & frontend inspector modal | `GET /api/ab/metrics`, `POST /api/ab/track`, client build 390ms | Passed |
| Stage 10 - Perf & Caching | In-memory TTL cache (3,300x speedup), rate limiters (429 verified), Server-Timing & DB ping | `GET /api/health` (7.2ms DB ping, 0.30ms cache hit), client build 393ms | Passed |
| Quality Pass & Cleanup | Fixed broken images with onError fallbacks, synced categories & tabs, removed unused files | `npm run build` client (654ms) & server (0 errors), DB ping 0.74ms | Passed |
| Dynamic Grids Upgrade | Made 'Recommended for You' (live multi-factor scoring + carousel pagination) & 'Latest News' (live category sub-filters) fully functional | `GET /api/news/recommended` & `GET /api/news?category=...`, client build 455ms | Passed |
| Stage 11 - Deployment | Multi-stage Dockerfile, docker-compose, root package.json orchestration, and portfolio README.md | `npm run build` (433ms), Docker build files created, README.md published | Passed |
