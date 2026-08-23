// Search Agent
// Owns product lookup: text matching plus price-range filtering
// ("toothpaste under $5"). Stateless — takes a query, returns matches.
import { PRODUCTS } from "../data/products.js";

export function search(query, minPrice, maxPrice) {
  const q = (query || "").toLowerCase();
  return PRODUCTS.filter((p) => {
    const matchesText = !q || p.name.includes(q) || q.includes(p.name);
    const matchesMin = minPrice == null || p.price >= minPrice;
    const matchesMax = maxPrice == null || p.price <= maxPrice;
    return matchesText && matchesMin && matchesMax;
  });
}
