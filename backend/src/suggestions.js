import { PRODUCTS, findProduct, seasonalProducts } from "./data/products.js";

export function buildSuggestions(list, history) {
  const suggestions = [];
  const listNames = new Set(list.map((i) => i.name));

  // 1. Substitutes for items already on the list (unavailable / preference)
  for (const item of list) {
    const product = findProduct(item.name);
    if (product?.substitutes?.length) {
      const alt = product.substitutes.find((s) => !listNames.has(s));
      if (alt) {
        suggestions.push({
          type: "substitute",
          message: `Prefer something else? Try ${alt} instead of ${item.name}.`,
          item: alt,
        });
      }
    }
  }

  // 2. Seasonal picks not already on the list
  for (const product of seasonalProducts()) {
    if (!listNames.has(product.name) && suggestions.length < 6) {
      suggestions.push({
        type: "seasonal",
        message: `${capitalize(product.name)} is in season right now.`,
        item: product.name,
      });
    }
  }

  // 3. "Running low" nudge: items bought often historically but not on the
  // current list (mocked signal — a real version would use purchase dates).
  const frequent = Object.entries(history)
    .filter(([name, count]) => count >= 2 && !listNames.has(name))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  for (const [name] of frequent) {
    suggestions.push({
      type: "restock",
      message: `Looks like you're running low on ${name}.`,
      item: name,
    });
  }

  return suggestions.slice(0, 8);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
