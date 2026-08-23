// Rule-based NLP parser. No external API/key needed, so it works offline
// and on any free tier. It normalizes varied phrasing into one of a few
// intents: add, remove, search, set_quantity, unknown.

const NUM_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  a: 1, an: 1,
};

const ADD_PATTERNS = [
  /^(?:add|buy|get|grab|i need|i want to buy|i want|put)\s+(.+)$/i,
  /^(.+?)\s+to my (?:list|cart)$/i,
];

const REMOVE_PATTERNS = [
  /^(?:remove|delete|take off|cancel)\s+(.+?)(?:\s+from (?:my )?(?:list|cart))?$/i,
];

const SEARCH_PATTERNS = [
  /^(?:find|search for|look for|show me)\s+(.+)$/i,
];

const UNDER_PRICE = /under \$?(\d+(?:\.\d+)?)/i;
const OVER_PRICE = /over \$?(\d+(?:\.\d+)?)/i;

function extractQuantity(text) {
  const numMatch = text.match(/\b(\d+)\b/);
  if (numMatch) return { qty: parseInt(numMatch[1], 10), text: text.replace(numMatch[0], "").trim() };

  for (const [word, val] of Object.entries(NUM_WORDS)) {
    const re = new RegExp(`\\b${word}\\b`, "i");
    if (re.test(text)) {
      return { qty: val, text: text.replace(re, "").trim() };
    }
  }
  return { qty: 1, text };
}

function cleanItemText(text) {
  return text
    .replace(/\b(bottles?|cans?|bags?|boxes?|packs?|of)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/^(the|some|a|an)\s+/i, "");
}

export function parseCommand(raw) {
  const text = raw.trim();
  const lower = text.toLowerCase();

  for (const pattern of REMOVE_PATTERNS) {
    const m = lower.match(pattern);
    if (m) {
      return { intent: "remove", item: cleanItemText(m[1]), raw: text };
    }
  }

  for (const pattern of SEARCH_PATTERNS) {
    const m = lower.match(pattern);
    if (m) {
      let query = m[1];
      let maxPrice = null;
      let minPrice = null;
      const under = query.match(UNDER_PRICE);
      const over = query.match(OVER_PRICE);
      if (under) { maxPrice = parseFloat(under[1]); query = query.replace(under[0], ""); }
      if (over) { minPrice = parseFloat(over[1]); query = query.replace(over[0], ""); }
      return { intent: "search", item: cleanItemText(query), maxPrice, minPrice, raw: text };
    }
  }

  for (const pattern of ADD_PATTERNS) {
    const m = lower.match(pattern);
    if (m) {
      const { qty, text: withoutQty } = extractQuantity(m[1]);
      return { intent: "add", item: cleanItemText(withoutQty), quantity: qty, raw: text };
    }
  }

  // Fallback: bare item name spoken alone, e.g. "milk"
  if (lower.split(" ").length <= 3) {
    const { qty, text: withoutQty } = extractQuantity(lower);
    return { intent: "add", item: cleanItemText(withoutQty), quantity: qty, raw: text };
  }

  return { intent: "unknown", raw: text };
}
