// Intent Agent
// First-line command classifier. Fast, free, and deterministic — handles
// the large majority of shopping commands with zero latency and no API
// dependency. Returns { intent, item, quantity, ... } or intent: "unknown"
// when it can't confidently classify the command, which is the signal for
// the orchestrator to escalate to the Clarification Agent.
import { parseCommand } from "../nlp.js";

export function classify(text) {
  return parseCommand(text);
}
