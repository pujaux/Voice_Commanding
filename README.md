# Echo — Voice Command Shopping Assistant

A voice-controlled shopping list with smart suggestions, built for the technical
assessment. Speak naturally ("add milk", "I need bananas", "remove the eggs",
"find toothpaste under $5") and the app parses intent, updates your list, and
proactively suggests seasonal items, substitutes, and restocks.

## Live Demo

- **Frontend:** https://voice-commanding-l4nxthfej-puja-rani-bhuyan-s-projects.vercel.app/
- **Backend API:** https://voice-commanding-my7y.vercel.app/
## Demo
<img width="1827" height="904" alt="image" src="https://github.com/user-attachments/assets/d6945cce-303a-4f1a-ad26-c0bd566f921b" />




https://github.com/user-attachments/assets/fd6a4c20-311b-4b91-b4d9-de19799e535f





## Stack

- **Frontend:** React + Vite, Web Speech API for voice recognition, no UI
  framework — hand-built dark/amber theme.
- **Backend:** Node.js + Express, in-memory data store (no DB setup required
  to run this in an assessment window).
- **NLP:** a small rule-based parser (`backend/src/nlp.js`) — no paid API key
  needed, works offline, and is easy to audit/extend.
## Architecture: Multi-Agent Command Pipeline

Echo uses a **tiered multi-agent architecture** designed to prioritize speed, reliability, and graceful degradation.

Simple commands are handled locally using rule-based NLP. The LLM is used only when the user's intent cannot be confidently determined.

```text
                         ┌──────────────────────┐
                         │         User         │
                         │ "we're out of coffee"│
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Orchestrator      │
                         │  Central Coordinator │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Intent Agent      │
                         │      nlp.js          │
                         │ Rule-based NLP       │
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                    Intent Known          Intent Unknown
                         │                     │
                         │                     ▼
                         │          ┌──────────────────────┐
                         │          │ Clarification Agent  │
                         │          │      Groq LLM         │
                         │          │      (Optional)       │
                         │          └──────────┬───────────┘
                         │                     │
                         │                     ▼
                         │              Resolved Intent
                         │                     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Orchestrator      │
                         │   Route by Intent    │
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
          ┌─────────────────────┐       ┌─────────────────────┐
          │  Fulfillment Agent  │       │    Search Agent     │
          │                     │       │                     │
          │ Add / Remove items  │       │ Product lookup      │
          │ Update quantities   │       │ Price filtering     │
          │ Validate mutations  │       │ Product details     │
          └──────────┬──────────┘       └──────────┬──────────┘
                     │                             │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Suggestion Agent   │
                         │  Optional suggestions│
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Response       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Voice Output      │
                         └──────────────────────┘
```


### Why This Design?

**Tier 1: Rule-Based Intent Agent**
- Handles ~90% of commands instantly (add milk, remove eggs, find toothpaste)
- Zero latency, no API calls, works offline
- Uses regex + keyword patterns for add/remove/search intents

**Tier 2: LLM Clarification Agent (Optional)**
- Only invoked when Intent Agent can't classify with confidence
- Handles indirect phrasing: "we're out of coffee" → add coffee
- Uses Groq's free-tier API (openai/gpt-oss-20b)
- **Fully optional**: app degrades gracefully without `GROQ_API_KEY`

**Fulfillment Layer**
- Single point of entry for all list mutations
- Enforces invariants (no duplicates, min quantity = 1)
- Suggestion Agent suggests next (seasonal picks, substitutes, restocks)
- Search Agent provides product lookup with price filtering

### Key Properties

| Property | Benefit |
|----------|---------|
| **Layered** | Intent Agent handles common case; LLM used only when needed |
| **Offline-first** | Core shopping works without network or API key |
| **Swappable** | Each agent is independent; can upgrade Intent or swap LLM provider |
| **Graceful** | If Groq fails or key missing, falls back to "sorry, I didn't understand" |
| **Fast** | ~100ms for rule-based, ~2s for LLM-augmented (Groq is fast) |

### Agent Breakdown

**Intent Agent** (`agents/intentAgent.js`)

Input:
"add 2 apples"

Output:
{
  intent: "add",
  item: "apples",
  quantity: 2
}


**Clarification Agent** (`agents/clarificationAgent.js`)
Input:
"we're out of coffee"

Intent Agent:
unknown

Output:
{
  intent: "add",
  item: "coffee",
  quantity: 1
}
(via Groq LLM)


**Fulfillment Agent** (`agents/fulfillmentAgent.js`)
Executes the resolved intent → updates list → triggers suggestions refresh

**Suggestion Agent** (`agents/suggestionAgent.js`)
Proposes: seasonal items, substitutes for your items, frequent buys you forgot

**Search Agent** (`agents/searchAgent.js`)
Filters products by name & price range: "find toothpaste under $5" → 1 result

**Orchestrator** (`agents/orchestrator.js`)
Coordinates all agents and controls the overall command-processing pipeline.
```text
User Input
    ↓
Orchestrator
    ↓
Intent Agent
    ↓
Intent Known? ── Yes ──→ Route
    │
    No
    ↓
Clarification Agent
    ↓
Resolved Intent
    ↓
Route
    ├──→ Fulfillment Agent
    └──→ Search Agent
             ↓
      Suggestion Agent
             ↓
          Response

```
For an ambiguous command:
```text
User:
"we're out of coffee"

        ↓

Orchestrator
        ↓
Intent Agent
        ↓
Unknown Intent
        ↓
Clarification Agent (Groq)
        ↓
{ intent: "add", item: "coffee", quantity: 1 }
        ↓
Fulfillment Agent
        ↓
Shopping List Updated
        ↓
Response + Voice Output

```
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



```text
voice-shop-assistant/
│
├── backend/
│   ├── src/
│   │   ├── agents/                    # Multi-agent orchestration layer
│   │   │   ├── intentAgent.js         # Rule-based command classifier (first-pass NLP)
│   │   │   ├── clarificationAgent.js  # LLM fallback for ambiguous commands (Groq)
│   │   │   ├── fulfillmentAgent.js    # Executes add/remove/quantity operations
│   │   │   ├── suggestionAgent.js     # Seasonal picks, substitutes, restock nudges
│   │   │   ├── searchAgent.js         # Product lookup with price filtering
│   │   │   └── orchestrator.js        # Coordinates the agent pipeline
│   │   │
│   │   ├── data/
│   │   │   └── products.js            # Mock catalog (30+ items, categories, pricing)
│   │   │
│   │   ├── nlp.js                     # Rule-based intent parser (add/remove/search)
│   │   ├── store.js                   # In-memory shopping list + usage history
│   │   ├── suggestions.js             # Suggestion engine (seasonal/substitute/restock)
│   │   └── server.js                  # Express routes + API endpoints
│   │
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceOrb.jsx           # Signature pulsing amber mic button
│   │   │   ├── VoiceOrb.css
│   │   │   ├── ShoppingList.jsx       # Categorized list with qty controls
│   │   │   ├── Suggestions.jsx        # Smart suggestion cards
│   │   │   ├── SearchPanel.jsx        # Voice search results
│   │   │   └── LanguageSelect.jsx     # 4-language voice recognition selector
│   │   │
│   │   ├── useVoice.js                # Web Speech API hook (recognition)
│   │   ├── useSpeech.js               # SpeechSynthesis hook (voice output)
│   │   ├── api.js                     # Backend client (fetch wrapper)
│   │   ├── App.jsx                    # Main app container + state management
│   │   ├── App.css                    # Dark theme + amber gradient styling
│   │   ├── index.css                  # Global design tokens
│   │   └── main.jsx                   # React entry point
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.example
│
├── .gitignore
├── render.yaml                        # Render deployment config (optional)
└── README.md
```




              



- Multilingual support covers voice **recognition** language; command
  parsing logic itself is currently English-pattern-based.
