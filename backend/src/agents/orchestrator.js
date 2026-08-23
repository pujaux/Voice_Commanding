// Orchestrator
// The multi-agent coordinator. A voice command enters here and is routed
// through the agent pipeline:
//
//   1. Intent Agent   — fast, free, rule-based classification (first pass)
//   2. Clarification Agent — LLM escalation, only if step 1 returns "unknown"
//   3. Fulfillment / Search Agent — executes the resolved intent
//
// This keeps each agent single-purpose and swappable (e.g. Clarification
// Agent could later be backed by a different model, or Intent Agent could
// be upgraded, without touching the rest of the pipeline).
import { classify } from "./intentAgent.js";
import { clarify } from "./clarificationAgent.js";
import { fulfillAdd, fulfillRemove } from "./fulfillmentAgent.js";
import { search } from "./searchAgent.js";

export async function processCommand(text) {
  let parsed = classify(text);
  let escalated = false;

  if (parsed.intent === "unknown") {
    const clarified = await clarify(text);
    if (clarified.intent !== "unknown") {
      parsed = { ...clarified, raw: text };
      escalated = true;
    }
  }

  switch (parsed.intent) {
    case "add": {
      if (!parsed.item) return { error: "Could not identify an item to add.", parsed };
      const { list, message } = fulfillAdd(parsed.item, parsed.quantity || 1);
      return { parsed, list, message, escalated };
    }
    case "remove": {
      if (!parsed.item) return { error: "Could not identify an item to remove.", parsed };
      const { list, message } = fulfillRemove(parsed.item);
      return { parsed, list, message, escalated };
    }
    case "search": {
      const results = search(parsed.item, parsed.minPrice, parsed.maxPrice);
      return { parsed, results, message: `Found ${results.length} result${results.length === 1 ? "" : "s"}`, escalated };
    }
    default:
      return { error: "Sorry, I didn't understand that command.", parsed, escalated };
  }
}
