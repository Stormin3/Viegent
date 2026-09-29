# Viegent

An AI agent operations console — one dark-themed dashboard to run an AI-powered business: monitor revenue and agent activity, forge brand assets, manage a print-on-demand store, and chat with AI, all behind a single login.

Live demo: https://ai.studio/apps/d91da48b-cce8-4503-961c-dff7d13e4550

## Features

- **Dashboard** — MRR, active orders, agent uptime, escalations, financial trajectory charts, live activity feed, and top stores
- **BrandForge** — describe a brand asset and have AI generate it
- **PODPilot** — print-on-demand store ops: new designs, listing optimization, store revenue growth, and distribution-center lookup
- **Agents** — manage your fleet of AI agents from one view
- **Neural Terminal** — conversational AI terminal for ad-hoc tasks and queries
- **Command palette + sidebar** — keyboard-driven navigation across every view
- **Login gate** — Firebase authentication guards the whole console

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Start the dev server:
   `npm run dev`
4. Open http://localhost:3000

Other scripts: `npm run build` (production build), `npm run preview` (preview the build), `npm run lint` (typecheck with `tsc --noEmit`)

## Tech Stack

React 19 · Vite 6 · Tailwind CSS 4 · Firebase (Auth) · Express 4 · better-sqlite3 · Google Gemini API · Recharts · React Markdown · Motion · Lucide icons

## Views

| View | What it does |
|------|--------------|
| Dashboard | MRR, active orders, agent uptime, escalations, live feed |
| BrandForge | AI brand-asset generator |
| PODPilot | Print-on-demand store operations |
| Agents | AI agent fleet management |
| Terminal | Conversational AI terminal |

## Project Structure

```
src/
  components/   Dashboard, BrandForge, PODPilot, Agents, NeuralTerminal,
                Sidebar, CommandPalette, Login
  contexts/     AuthContext (Firebase auth state)
```
