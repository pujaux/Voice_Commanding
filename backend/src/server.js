import express from "express";
import cors from "cors";
import { parseCommand } from "./nlp.js";
import { PRODUCTS, findProduct } from "./data/products.js";
import {
  getList,
  addItem,
  removeItem,
  setChecked,
  updateQuantity,
  getHistory,
} from "./store.js";
import { buildSuggestions } from "./suggestions.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- Voice command pipeline -------------------------------------------------
// POST { text: "add 2 bottles of water" } -> parses intent, applies it,
// and returns both the parsed intent (for UI feedback) and the new state.
app.post("/api/command", (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing 'text' in request body." });
  }

  const parsed = parseCommand(text);
  let result = { parsed };

  switch (parsed.intent) {
    case "add": {
      if (!parsed.item) return res.status(422).json({ error: "Could not identify an item to add.", parsed });
      addItem(parsed.item, parsed.quantity);
      result.list = getList();
      break;
    }
    case "remove": {
      if (!parsed.item) return res.status(422).json({ error: "Could not identify an item to remove.", parsed });
      removeItem(parsed.item);
      result.list = getList();
      break;
    }
    case "search": {
      result.results = searchProducts(parsed.item, parsed.minPrice, parsed.maxPrice);
      break;
    }
    default:
      return res.status(422).json({ error: "Sorry, I didn't understand that command.", parsed });
  }

  res.json(result);
});

function searchProducts(query, minPrice, maxPrice) {
  const q = (query || "").toLowerCase();
  return PRODUCTS.filter((p) => {
    const matchesText = !q || p.name.includes(q) || q.includes(p.name);
    const matchesMin = minPrice == null || p.price >= minPrice;
    const matchesMax = maxPrice == null || p.price <= maxPrice;
    return matchesText && matchesMin && matchesMax;
  });
}

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
  res.json({ suggestions: buildSuggestions(getList(), getHistory()) });
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
