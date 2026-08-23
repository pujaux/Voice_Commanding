export default function SearchPanel({ results, query, onAdd }) {
  if (query == null) {
    return <p className="panel__empty">Say “find organic apples” or “toothpaste under $5”.</p>;
  }
  if (results.length === 0) {
    return <p className="panel__empty">No matches for “{query}”.</p>;
  }
  return (
    <ul className="search-results">
      {results.map((p) => (
        <li key={p.id} className="search-result">
          <div>
            <span className="search-result__name">{p.name}</span>
            <span className="search-result__price">${p.price.toFixed(2)}</span>
          </div>
          <button onClick={() => onAdd(p.name)}>Add</button>
        </li>
      ))}
    </ul>
  );
}
