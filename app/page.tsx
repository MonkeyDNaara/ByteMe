import RecipeCard from "@/app/components/RecipeCard";
import { Recipe, type MealType } from "@/lib/recipe";
import Header from "./components/Header";
import Footer from "./components/Footer";

const recipesOfTheDay: { meal: MealType; recipe: Recipe }[] = [
  {
    meal: "Breakfast",
    recipe: Recipe.parse({
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
    }),
  },
  {
    meal: "Lunch",
    recipe: Recipe.parse({
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
    }),
  },
  {
    meal: "Dinner",
    recipe: Recipe.parse({
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
    }),
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10 sm:px-6">
      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-semibold">Recipes of the day</h3>
          <span className="hidden text-sm text-base-content/60 sm:inline">
            Updated daily
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {recipesOfTheDay.map(({ meal, recipe }) => (
            <RecipeCard key={recipe.id} meal={meal} recipe={recipe} />
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-3 rounded-box bg-base-300 px-6 py-10 text-center">
        <h3 className="text-xl font-semibold">Can&apos;t decide?</h3>
        <p className="max-w-md text-sm text-base-content/70">
          Let us pick a random recipe for you from the whole collection.
        </p>
        <button className="btn btn-primary cursor-pointer">Surprise Me</button>
      </section>
    </div>
  );
}
