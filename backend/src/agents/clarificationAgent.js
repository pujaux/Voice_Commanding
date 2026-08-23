// Clarification Agent
// Escalation path for the ~10-20% of commands the rule-based Intent Agent
// can't confidently classify — unusual phrasing, slang, indirect requests
// ("we're out of coffee", "put some snacks on there"). Only called when
// intentAgent.classify() returns intent: "unknown", so the common case
// never pays for an LLM call.
//
// Uses Groq's free-tier API (OpenAI-compatible chat completions, Llama
// 3.1 8B) because it's fast, has a generous free tier, and needs no
// billing setup — get a key at https://console.groq.com/keys.
//
// If no key is configured, or the call fails for any reason, this
// resolves to { intent: "unknown" } so the app degrades gracefully back
// to the original "sorry, I didn't understand" behavior rather than
// crashing or hanging the request.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `You interpret voice shopping-list commands that a simple parser could not classify.
Respond with ONLY a JSON object, no prose, no markdown fences, matching exactly one of:
{"intent":"add","item":"<product name, singular, lowercase>","quantity":<integer, default 1>}
{"intent":"remove","item":"<product name, singular, lowercase>"}
{"intent":"search","item":"<product name or category>","minPrice":<number|null>,"maxPrice":<number|null>}
{"intent":"unknown"}
Use "unknown" if the command isn't a shopping list action. Infer intent from indirect phrasing,
e.g. "we're out of coffee" -> add coffee. "get rid of the bread" -> remove bread.`;

export async function clarify(text) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { intent: "unknown", agent: "clarification", skipped: "no_api_key" };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        max_tokens: 120,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return { intent: "unknown", agent: "clarification", error: `groq_${res.status}` };

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.intent) return { intent: "unknown", agent: "clarification" };
    return { ...parsed, agent: "clarification", raw: text };
  } catch (err) {
    return { intent: "unknown", agent: "clarification", error: err.message };
  }
}
