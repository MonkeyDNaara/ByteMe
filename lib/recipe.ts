import z from "zod";

export const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  short_description: z.string(),
  time: z.number(),
  incredients: z.array(z.string()),
  labels: z.array(z.string()),
  img_url: z.string(),
  likes: z.number(),
});

export type Recipe = z.infer<typeof Recipe>;

export type MealType = "Breakfast" | "Lunch" | "Dinner";

// ---------------------------------------------------------------------------
// Placeholder data layer.
//
// TODO: replace the `placeholderRecipes` array and the bodies of
// `getAllRecipes` / `getRecipeById` with real database queries once the DB is
// wired up. The function signatures (async, returning `Recipe` / `Recipe[]`)
// are meant to stay the same so callers don't need to change.
// ---------------------------------------------------------------------------

const placeholderRecipes: Recipe[] = [
  {
    id: "rcp_breakfast_berry_pancakes",
    name: "Fluffy Berry Pancakes",
    short_description:
      "Airy buttermilk pancakes stacked high with warm mixed berries and maple syrup.",
    description:
      "Light, cloud-like buttermilk pancakes cooked until golden and served with a quick berry compote. Whisk the dry and wet ingredients separately, fold them together gently, and rest the batter for a few minutes so the pancakes turn out extra fluffy. Finish with a knob of butter and a generous pour of maple syrup.",
    time: 25,
    incredients: [
      "200g flour",
      "2 tsp baking powder",
      "1 tbsp sugar",
      "1 pinch salt",
      "250ml buttermilk",
      "1 egg",
      "30g melted butter",
      "150g mixed berries",
      "Maple syrup, to serve",
    ],
    labels: ["Vegetarian", "Sweet", "Quick", "Family favourite"],
    img_url:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    likes: 248,
  },
  {
    id: "rcp_lunch_chickpea_bowl",
    name: "Mediterranean Chickpea Bowl",
    short_description:
      "A bright, no-cook bowl of chickpeas, crunchy veg, feta and lemon-herb dressing.",
    description:
      "A fresh lunch bowl that comes together in minutes. Toss chickpeas with cucumber, cherry tomatoes, red onion and parsley, then dress with olive oil, lemon juice and a little garlic. Crumble over feta and serve with warm pita. Great for meal prep as it keeps well in the fridge for a couple of days.",
    time: 15,
    incredients: [
      "1 can chickpeas, drained",
      "1 cucumber, diced",
      "200g cherry tomatoes, halved",
      "1/2 red onion, thinly sliced",
      "100g feta",
      "1 handful parsley, chopped",
      "3 tbsp olive oil",
      "1 lemon, juiced",
      "1 clove garlic, grated",
    ],
    labels: ["Vegetarian", "No-cook", "High protein", "Meal prep"],
    img_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    likes: 187,
  },
  {
    id: "rcp_dinner_mushroom_risotto",
    name: "Creamy Mushroom Risotto",
    short_description:
      "Slow-stirred arborio rice with garlicky mushrooms, white wine and parmesan.",
    description:
      "A comforting weeknight risotto. Sauté mixed mushrooms until deeply golden, then set aside. Toast the rice, deglaze with white wine, and add warm stock one ladle at a time, stirring until creamy. Stir the mushrooms back in with butter and parmesan, and rest for two minutes before serving.",
    time: 40,
    incredients: [
      "300g arborio rice",
      "400g mixed mushrooms, sliced",
      "1 onion, finely chopped",
      "2 cloves garlic, minced",
      "150ml dry white wine",
      "1.2l vegetable stock, warm",
      "50g parmesan, grated",
      "30g butter",
      "Olive oil, salt and pepper",
    ],
    labels: ["Vegetarian", "Comfort food", "Date night"],
    img_url:
      "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80",
    likes: 312,
  },
  {
    id: "rcp_breakfast_overnight_oats",
    name: "Peanut Butter Banana Overnight Oats",
    short_description:
      "Make-ahead oats with peanut butter, banana and a drizzle of honey.",
    description:
      "Stir rolled oats, milk, yoghurt, peanut butter and chia seeds together in a jar the night before. In the morning it has thickened into a creamy, spoonable breakfast. Top with sliced banana, a little extra peanut butter and a drizzle of honey. Keeps for up to three days in the fridge.",
    time: 5,
    incredients: [
      "50g rolled oats",
      "120ml milk of choice",
      "60g yoghurt",
      "1 tbsp peanut butter",
      "1 tsp chia seeds",
      "1 banana",
      "Honey, to serve",
    ],
    labels: ["Vegetarian", "Make ahead", "No-cook"],
    img_url:
      "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
    likes: 143,
  },
  {
    id: "rcp_lunch_tomato_soup",
    name: "Roasted Tomato & Basil Soup",
    short_description:
      "Deeply savoury soup from oven-roasted tomatoes, garlic and fresh basil.",
    description:
      "Roast halved tomatoes with garlic, onion and olive oil until caramelised at the edges, then blend with vegetable stock and a handful of basil. Simmer briefly, season well, and finish with a swirl of cream or olive oil. Serve with crusty bread or a grilled cheese sandwich.",
    time: 45,
    incredients: [
      "1kg ripe tomatoes, halved",
      "1 onion, quartered",
      "4 cloves garlic, unpeeled",
      "3 tbsp olive oil",
      "500ml vegetable stock",
      "1 handful basil leaves",
      "1 tsp sugar",
      "Salt and pepper",
    ],
    labels: ["Vegetarian", "Comfort food", "Gluten free"],
    img_url:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    likes: 205,
  },
  {
    id: "rcp_dinner_sheet_pan_chicken",
    name: "Sheet-Pan Lemon Chicken & Veg",
    short_description:
      "One tray of juicy chicken thighs, potatoes and green beans with lemon and thyme.",
    description:
      "Toss chicken thighs, baby potatoes and red onion with olive oil, lemon, garlic and thyme, then roast on a single sheet pan. Add green beans partway through so they stay crisp-tender. Everything finishes at the same time for a hands-off dinner with almost no washing up.",
    time: 50,
    incredients: [
      "6 chicken thighs, bone-in",
      "600g baby potatoes, halved",
      "200g green beans, trimmed",
      "1 red onion, cut into wedges",
      "1 lemon, sliced",
      "3 cloves garlic, sliced",
      "3 tbsp olive oil",
      "1 tbsp fresh thyme",
      "Salt and pepper",
    ],
    labels: ["High protein", "One pan", "Gluten free"],
    img_url:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80",
    likes: 276,
  },
].map((recipe) => Recipe.parse(recipe));

/** Returns every recipe. TODO: swap for a real DB query. */
export async function getAllRecipes(): Promise<Recipe[]> {
  return placeholderRecipes;
}

/** Returns a single recipe by id, or `null` if none matches. TODO: swap for a real DB query. */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  return placeholderRecipes.find((recipe) => recipe.id === id) ?? null;
}
