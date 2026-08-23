// In-memory product catalog. Each product has a category used for
// auto-organizing the shopping list, a rough price, whether it's currently
// "in season" (mocked against the current month), and substitute items
// used by the smart-suggestions engine.
const MONTH = new Date().getMonth(); // 0-11
const inSeasonMonths = {
  strawberries: [2, 3, 4, 5],
  watermelon: [4, 5, 6, 7],
  pumpkin: [8, 9, 10],
  oranges: [10, 11, 0, 1],
  asparagus: [2, 3, 4],
};

function isSeasonal(name) {
  const months = inSeasonMonths[name];
  return Array.isArray(months) && months.includes(MONTH);
}

export const PRODUCTS = [
  { id: "milk", name: "milk", category: "dairy", price: 3.2, substitutes: ["almond milk", "oat milk", "soy milk"] },
  { id: "almond milk", name: "almond milk", category: "dairy", price: 4.1, substitutes: ["milk", "oat milk"] },
  { id: "oat milk", name: "oat milk", category: "dairy", price: 4.5, substitutes: ["milk", "almond milk"] },
  { id: "eggs", name: "eggs", category: "dairy", price: 4.0, substitutes: ["egg substitute"] },
  { id: "cheese", name: "cheese", category: "dairy", price: 5.5, substitutes: ["vegan cheese"] },
  { id: "butter", name: "butter", category: "dairy", price: 4.8, substitutes: ["margarine"] },
  { id: "yogurt", name: "yogurt", category: "dairy", price: 3.0, substitutes: ["greek yogurt", "coconut yogurt"] },

  { id: "bread", name: "bread", category: "bakery", price: 2.8, substitutes: ["gluten-free bread", "tortillas"] },
  { id: "bagels", name: "bagels", category: "bakery", price: 3.5, substitutes: ["bread"] },

  { id: "apples", name: "apples", category: "produce", price: 1.2, substitutes: ["pears"] },
  { id: "bananas", name: "bananas", category: "produce", price: 0.6, substitutes: ["plantains"] },
  { id: "oranges", name: "oranges", category: "produce", price: 1.1, substitutes: ["tangerines"] },
  { id: "strawberries", name: "strawberries", category: "produce", price: 3.9, substitutes: ["blueberries"] },
  { id: "watermelon", name: "watermelon", category: "produce", price: 5.0, substitutes: ["cantaloupe"] },
  { id: "pumpkin", name: "pumpkin", category: "produce", price: 4.2, substitutes: ["butternut squash"] },
  { id: "asparagus", name: "asparagus", category: "produce", price: 3.3, substitutes: ["green beans"] },
  { id: "tomatoes", name: "tomatoes", category: "produce", price: 2.0, substitutes: ["canned tomatoes"] },
  { id: "spinach", name: "spinach", category: "produce", price: 2.5, substitutes: ["kale"] },
  { id: "onions", name: "onions", category: "produce", price: 1.0, substitutes: ["shallots"] },
  { id: "garlic", name: "garlic", category: "produce", price: 0.9, substitutes: ["garlic powder"] },

  { id: "chicken breast", name: "chicken breast", category: "meat", price: 7.5, substitutes: ["tofu", "tempeh"] },
  { id: "ground beef", name: "ground beef", category: "meat", price: 6.9, substitutes: ["plant-based ground"] },
  { id: "salmon", name: "salmon", category: "seafood", price: 9.5, substitutes: ["trout"] },

  { id: "rice", name: "rice", category: "pantry", price: 3.0, substitutes: ["quinoa"] },
  { id: "pasta", name: "pasta", category: "pantry", price: 1.8, substitutes: ["gluten-free pasta"] },
  { id: "olive oil", name: "olive oil", category: "pantry", price: 8.0, substitutes: ["vegetable oil"] },
  { id: "toothpaste", name: "toothpaste", category: "household", price: 3.4, substitutes: ["whitening toothpaste"] },
  { id: "water", name: "water", category: "beverages", price: 1.0, substitutes: ["sparkling water"] },
  { id: "coffee", name: "coffee", category: "beverages", price: 6.5, substitutes: ["decaf coffee"] },
  { id: "chips", name: "chips", category: "snacks", price: 2.2, substitutes: ["pretzels"] },
];

export function findProduct(name) {
  const n = name.trim().toLowerCase();
  return (
    PRODUCTS.find((p) => p.name === n) ||
    PRODUCTS.find((p) => p.name.includes(n) || n.includes(p.name))
  );
}

export function seasonalProducts() {
  return PRODUCTS.filter((p) => isSeasonal(p.id));
}
