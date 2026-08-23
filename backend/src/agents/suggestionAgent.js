// Suggestion Agent
// Reasons about what the user might want next: seasonal picks, substitutes
// for items already on the list, and restock nudges based on history.
// Read-only — never mutates the list itself, only proposes additions that
// the Fulfillment Agent will apply if the user accepts.
import { buildSuggestions } from "../suggestions.js";
import { getHistory } from "../store.js";

export function suggest(list) {
  return buildSuggestions(list, getHistory());
}
