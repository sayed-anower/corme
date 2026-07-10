# 🚀 SideHustle Smoke-Test

An AI-powered diagnostic workspace designed for **developers and creators** to run a sardonically honest, highly realistic reality check on their passionate, late-night, 2 A.M. side-project ideas before they spend money on domains or days on boilerplate setup.

This project was built for the **[DEV.to #DevWeekend Challenge (Passion Edition)](https://dev.to/devteam/join-our-dev-weekend-challenge-passion-edition-1000-in-prizes-across-five-winners-submissions-10j5)**.

---

## 💡 The Problem & The Idea

We've all been there: It's 2 A.M., the caffeine is peaking, and you have a "genius" side-project idea. You immediately spend 3 days:
1. Setting up Webpack, Docker, or custom Kubernetes clusters.
2. Buying 3 premium domain names you'll never use.
3. Over-engineering a scalable PostgreSQL architecture for a hypothetical 10 million users.

Then, the hype wears off, reality hits, and you abandon it. 

**SideHustle Smoke-Test** is your immediate AI reality check. You feed your raw, messy, unstructured thoughts into the engine, and Google Gemini analyzes the concept through the lens of a **startup veteran, seasoned tech architect, and venture builder**.

It delivers:
- **📊 Passion vs. Feasibility Matrix**: A calculated rating balancing how easy it is to build against how much willpower is required to sustain it.
- **🎯 Beachhead Market Analysis**: Key target demographic definitions and current market macro trends.
- **⚔️ Competitor Reality Grid**: Clear identification of actual competitors and alternatives, alongside your specific **10x Differentiation Angle**.
- **🏗️ Technical Blueprint**: A lightweight, rapid dev stack (avoiding over-engineering) and estimated MVP build times.
- **💰 Monetization Strategies**: High-viability business models with difficulty ratings.
- **🗺️ Lean Growth Roadmap**: A 3-phase action-item checklist starting with a landing page smoke-test.
- **🤔 Tough Reality-Check Questions**: 3 critical questions you must answer honestly.

---

## 🎨 Design & Theme: "2 A.M. Developer"

The UI is styled with a custom **Late-Night Developer Glow** theme:
- Deep indigo/slate dark-mode canvas (`bg-slate-950`).
- Sleek glowing card borders, retro-futuristic gauges, and progress indicators.
- Typography pairings: **Space Grotesk** for display headers paired with **JetBrains Mono** for technical stats, tags, and console logs.
- Animated loader mimicking real-world compilation cycles (scanning GitHub, cleaning exaggeration, calculating CAC).

---

## 🛠️ Architecture

This is a robust **full-stack Express + React/Vite** application designed for optimal security and performance:
- **Server-Side Security**: All calls to the Google Gemini API are proxied securely through the Node.js/Express backend (`/api/analyze`), keeping your `GEMINI_API_KEY` safe and hidden from the client browser.
- **Vite Middleware Integration**: In development mode, Express integrates Vite as middleware for instant hot reloads. In production mode, Express serves compiled static files seamlessly.
- **Structured Data Engine**: Uses the latest `@google/genai` SDK schema parameters to force highly predictable JSON payloads from Gemini.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Configure Secrets
Create a `.env` file in the project root (you can copy `.env.example` as a starter) and add your Gemini API Key:

```env
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
```

*Note: You can get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).*

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:3000` to access your workspace.

### 4. Build for Production
```bash
npm run build
npm start
```
This compiles the client asset bundle to `/dist/` and compiles the TypeScript server to a self-contained `/dist/server.cjs` file, ready for seamless Docker/Cloud Run container deployment.

---

*Happy dev, and let's build products with legs!*
