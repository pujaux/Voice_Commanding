// Fulfillment Agent
// Owns all writes to the shopping list. Nothing else in the system mutates
// the store directly — every add/remove/quantity change flows through here,
// so it's the single place that enforces list invariants.
import { getList, addItem, removeItem } from "../store.js";

export function fulfillAdd(item, quantity) {
  const list = addItem(item, quantity);
  return { list, message: `Added ${quantity} × ${item}` };
}

export function fulfillRemove(item) {
  const list = removeItem(item);
  return { list, message: `Removed ${item}` };
}

export function currentList() {
  return getList();
}
