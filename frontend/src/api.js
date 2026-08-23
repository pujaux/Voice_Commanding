const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  sendCommand: (text) =>
    request("/api/command", { method: "POST", body: JSON.stringify({ text }) }),
  getList: () => request("/api/list"),
  removeItem: (name) => request(`/api/list/${encodeURIComponent(name)}`, { method: "DELETE" }),
  toggleChecked: (id, checked) =>
    request(`/api/list/${id}/check`, { method: "PATCH", body: JSON.stringify({ checked }) }),
  setQuantity: (id, quantity) =>
    request(`/api/list/${id}/quantity`, { method: "PATCH", body: JSON.stringify({ quantity }) }),
  getSuggestions: () => request("/api/suggestions"),
  search: (q, minPrice, maxPrice) => {
    const params = new URLSearchParams({ q });
    if (minPrice != null) params.set("minPrice", minPrice);
    if (maxPrice != null) params.set("maxPrice", maxPrice);
    return request(`/api/search?${params.toString()}`);
  },
};
