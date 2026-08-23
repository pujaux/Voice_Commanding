const ICON = { seasonal: "☀", substitute: "⇄", restock: "↻" };

export default function Suggestions({ suggestions, onAdd, loading }) {
  if (loading) return <div className="panel__loading">Thinking of what you might need…</div>;
  if (suggestions.length === 0) return <p className="panel__empty">No suggestions right now.</p>;

  return (
    <ul className="suggestions">
      {suggestions.map((s, i) => (
        <li key={`${s.item}-${i}`} className="suggestion">
          <span className="suggestion__icon" aria-hidden>{ICON[s.type] || "•"}</span>
          <span className="suggestion__text">{s.message}</span>
          <button className="suggestion__add" onClick={() => onAdd(s.item)}>Add</button>
        </li>
      ))}
    </ul>
  );
}
