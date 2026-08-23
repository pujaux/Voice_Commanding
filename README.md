# Echo — Voice Command Shopping Assistant

A voice-controlled shopping list with smart suggestions, built for the technical
assessment. Speak naturally ("add milk", "I need bananas", "remove the eggs",
"find toothpaste under $5") and the app parses intent, updates your list, and
proactively suggests seasonal items, substitutes, and restocks.

**Live demo:** _add your deployed URL here_
**Video/GIF:** _optional, add here_

## Stack

- **Frontend:** React + Vite, Web Speech API for voice recognition, no UI
  framework — hand-built dark/amber theme.
- **Backend:** Node.js + Express, in-memory data store (no DB setup required
  to run this in an assessment window).
- **NLP:** a small rule-based parser (`backend/src/nlp.js`) — no paid API key
  needed, works offline, and is easy to audit/extend.

## Architecture: a small multi-agent pipeline

Every voice command flows through `backend/src/agents/orchestrator.js`:

```
voice text
   │
   ▼
Intent Agent (rule-based, instant, free)
   │  confident?  ──yes──▶ Fulfillment / Search Agent ──▶ response
   │
   no
   ▼
Clarification Agent (LLM, only called when Intent Agent can't classify)
   │
   ▼
Fulfillment / Search Agent ──▶ response
```

- **Intent Agent** (`agents/intentAgent.js`) — rule-based classifier, handles
  the large majority of commands with zero latency and no API dependency.
- **Clarification Agent** (`agents/clarificationAgent.js`) — LLM fallback
  (Groq, Llama 3.1 8B) for phrasing the rule-based parser can't confidently
  classify, e.g. "we're out of coffee" or "get rid of the bread." Only
  invoked when the Intent Agent returns `unknown`, so the common case never
  pays for an LLM call. **Fully optional** — with no `GROQ_API_KEY` set, it
  short-circuits to the same "sorry, I didn't understand" fallback the app
  always had, so nothing breaks without a key.
- **Fulfillment Agent** (`agents/fulfillmentAgent.js`) — the only thing that
  writes to the shopping list.
- **Suggestion Agent** (`agents/suggestionAgent.js`) — seasonal / substitute /
  restock reasoning.
- **Search Agent** (`agents/searchAgent.js`) — product lookup with price
  filtering.

To enable the Clarification Agent: get a free key at
[console.groq.com/keys](https://console.groq.com/keys) and set
`GROQ_API_KEY` in `backend/.env`.

## Why rule-based NLP as the *first* pass instead of an LLM for everything?

This domain is a closed set of intents (add / remove / search / quantity).
A regex + keyword parser handles it reliably, with zero latency, no API key
management, and no rate limits — which matters for a live voice demo. The
Clarification Agent adds LLM coverage exactly where it earns its cost: the
minority of commands with unusual phrasing the rule-based layer can't
classify.

## Running locally

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env   # leave VITE_API_URL blank to use the dev proxy
npm install
npm run dev             # http://localhost:5173
```

Open the app in **Chrome or Edge** (Web Speech API support). Other browsers
fall back to the typed-command input below the mic.

## Deployment

- **Backend → Render:** this repo includes `render.yaml`. Connect the repo,
  Render will use `backend` as the root, run `npm install` then `npm start`.
- **Frontend → Vercel:** `frontend/vercel.json` is preconfigured. Set the
  `VITE_API_URL` environment variable to your Render backend URL before
  building.

## Features implemented

- **Voice input:** command recognition via Web Speech API, varied phrasing
  ("add X" / "I need X" / "I want to buy X"), 4-language selector (English,
  Spanish, Hindi, French — recognition language, not translated UI copy).
- **Voice output:** the assistant speaks its response back
  (`SpeechSynthesis`) after every command — "Added 2 × apples," "Found 1
  result," etc. Mute toggle in the header.
- **Multi-agent command pipeline:** see Architecture above — Intent Agent →
  (optional) Clarification Agent (LLM) → Fulfillment/Search Agent.
- **Smart suggestions:** seasonal picks (mocked against current month),
  substitute recommendations per item, "running low" nudges from usage
  history.
- **List management:** add/remove/update quantity by voice, automatic
  category grouping (dairy, produce, pantry, etc.).
- **Voice-activated search:** item search with price-range filtering
  ("toothpaste under $5").
- **UI/UX:** minimalist dark interface, live transcript feedback, loading
  state while a command is processed, inline error banner for mic
  permission/network issues, typed-command fallback for unsupported browsers.

## Project structure

```
backend/
  src/
    data/products.js     # mock catalog: categories, price, season, substitutes
    nlp.js                # rule-based parser used by the Intent Agent
    store.js              # in-memory shopping list + purchase history
    suggestions.js         # suggestion logic used by the Suggestion Agent
    agents/
      intentAgent.js        # rule-based command classifier (first pass)
      clarificationAgent.js  # LLM fallback classifier (Groq, optional)
      fulfillmentAgent.js    # all list writes go through here
      suggestionAgent.js     # seasonal / substitute / restock reasoning
      searchAgent.js          # product search + price filtering
      orchestrator.js          # coordinates the pipeline, called by server.js
    server.js              # Express routes
frontend/
  src/
    components/          # VoiceOrb, ShoppingList, Suggestions, SearchPanel, ...
    useVoice.js            # Web Speech API (recognition) hook
    useSpeech.js           # SpeechSynthesis (voice reply) hook
    api.js                 # backend client
    App.jsx / App.css      # layout + theme
```

## Notes / trade-offs (given the 8-hour scope)

- Data is in-memory and resets on server restart — fine for a demo, would
  move to Postgres/SQLite + auth for multi-user production use.
- "Running low" suggestions are driven by a simple add-count heuristic, not
  real purchase-date tracking.
- Multilingual support covers voice **recognition** language; command
  parsing logic itself is currently English-pattern-based.
