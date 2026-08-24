import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { processCommand } from "./agents/orchestrator.js";
import { search as searchProducts } from "./agents/searchAgent.js";
import { suggest } from "./agents/suggestionAgent.js";
import {
  getList,
  addItem,
  removeItem,
  setChecked,
  updateQuantity,
} from "./store.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- Voice command pipeline -------------------------------------------------
// POST { text: "add 2 bottles of water" } -> routed through the agent
// pipeline (see agents/orchestrator.js): Intent Agent classifies, escalating
// to the Clarification Agent (LLM) only if unclassified, then the resolved
// intent is fulfilled. Returns the parsed intent (for UI feedback), which
// agent handled it, and the new state.
app.post("/api/command", async (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing 'text' in request body." });
  }

  const result = await processCommand(text);
  if (result.error) return res.status(422).json(result);
  res.json(result);
});

// --- Shopping list CRUD ------------------------------------------------------
app.get("/api/list", (_req, res) => res.json({ list: getList() }));

app.post("/api/list", (req, res) => {
  const { name, quantity = 1 } = req.body || {};
  if (!name) return res.status(400).json({ error: "Missing 'name'." });
  res.json({ list: addItem(name, quantity) });
});

app.delete("/api/list/:name", (req, res) => {
  res.json({ list: removeItem(req.params.name) });
});

app.patch("/api/list/:id/check", (req, res) => {
  res.json({ list: setChecked(req.params.id, !!req.body?.checked) });
});

app.patch("/api/list/:id/quantity", (req, res) => {
  res.json({ list: updateQuantity(req.params.id, Number(req.body?.quantity) || 1) });
});

// --- Suggestions & search -----------------------------------------------------
app.get("/api/suggestions", (_req, res) => {
  res.json({ suggestions: suggest(getList()) });
});

app.get("/api/search", (req, res) => {
  const { q, minPrice, maxPrice } = req.query;
  res.json({
    results: searchProducts(
      q,
      minPrice ? parseFloat(minPrice) : null,
      maxPrice ? parseFloat(maxPrice) : null
    ),
  });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Voice Shop API listening on :${PORT}`));
