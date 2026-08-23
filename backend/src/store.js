import { findProduct } from "./data/products.js";

// Single in-memory session store (fine for an assessment project; would be
// swapped for a real DB + per-user auth in production).
let list = [];
let history = {}; // itemName -> times added, used for "running low" suggestions

export function getList() {
  return list;
}

export function addItem(name, quantity = 1) {
  const product = findProduct(name);
  const canonicalName = product ? product.name : name.toLowerCase();
  const existing = list.find((i) => i.name === canonicalName);

  if (existing) {
    existing.quantity += quantity;
  } else {
    list.push({
      id: `${canonicalName}-${Date.now()}`,
      name: canonicalName,
      category: product ? product.category : "other",
      quantity,
      checked: false,
    });
  }

  history[canonicalName] = (history[canonicalName] || 0) + 1;
  return list;
}

export function removeItem(name) {
  const target = name.toLowerCase();
  list = list.filter((i) => !(i.name === target || i.name.includes(target) || target.includes(i.name)));
  return list;
}

export function setChecked(id, checked) {
  const item = list.find((i) => i.id === id);
  if (item) item.checked = checked;
  return list;
}

export function updateQuantity(id, quantity) {
  const item = list.find((i) => i.id === id);
  if (item) item.quantity = Math.max(1, quantity);
  return list;
}

export function getHistory() {
  return history;
}
