const CATEGORY_LABELS = {
  dairy: "Dairy",
  bakery: "Bakery",
  produce: "Produce",
  meat: "Meat",
  seafood: "Seafood",
  pantry: "Pantry",
  household: "Household",
  beverages: "Beverages",
  snacks: "Snacks",
  other: "Other",
};

export default function ShoppingList({ items, onToggle, onRemove, onQuantityChange }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>Your list is empty.</p>
        <span>Say “add milk” or “I need bananas” to get started.</span>
      </div>
    );
  }

  const grouped = items.reduce((acc, item) => {
    const key = item.category || "other";
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="list-groups">
      {Object.entries(grouped).map(([category, groupItems]) => (
        <div className="list-group" key={category}>
          <h3 className="list-group__label">{CATEGORY_LABELS[category] || category}</h3>
          <ul className="list-group__items">
            {groupItems.map((item) => (
              <li key={item.id} className={`list-item ${item.checked ? "list-item--checked" : ""}`}>
                <button
                  className="list-item__check"
                  onClick={() => onToggle(item)}
                  aria-label={item.checked ? "Mark as not bought" : "Mark as bought"}
                />
                <span className="list-item__name">{item.name}</span>
                <div className="list-item__qty">
                  <button onClick={() => onQuantityChange(item, item.quantity - 1)} aria-label="Decrease quantity">
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onQuantityChange(item, item.quantity + 1)} aria-label="Increase quantity">
                    +
                  </button>
                </div>
                <button className="list-item__remove" onClick={() => onRemove(item)} aria-label={`Remove ${item.name}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
