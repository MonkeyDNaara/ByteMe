# byteMe — UX Redesign Handoff

**Purpose:** This file hands the approved redesign to a new work session. It tells the session **what** to change, page by page, so each page can be committed, pushed and reviewed on its own.

- **Design canvas (source of truth):** https://claude.ai/artifact/MpLRgeaWB8TjqJ9agBFjBP
  Rows 01–09. On each row the **left** board is "today", the **middle** one is "proposed", and a **purple sticky** lists the changes.
- **Repo:** https://github.com/MonkeyDNaara/ByteMe (local: `07_byte-me`, branch `main`)
- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4 and daisyUI 5, Neon Postgres, Neon Auth
- **Status of this file:** design approved by Niko on 2026-09-25

---

## 0. Rules for the implementing session

1. **Before writing any Next.js code, read `AGENTS.md`**. This Next.js version has breaking changes. Check the docs in `node_modules/next/dist/docs/`, especially for Route Groups, Intercepting Routes and Parallel Routes.
2. **One page means one GitHub issue, one branch and one pull request.** Follow the order in section 3.
   - Put `Closes #N` in every PR body.
   - **Do not** add the "🤖 Generated with Claude Code" line to PR descriptions. Commit co-author trailers are fine.
3. **Niko is learning.** Explain *why* a change is made, name the concept (e.g. "Intercepting Routes"), and keep diffs small enough to review.
4. **Do not change the look completely.** Keep the pastel palette, the Geist font, rounded cards, daisyUI, the emojis and the humor: 🍲 difficulty labels, the LeetCode joke, "YOUR new Kitchen".
5. **Logo:** keep the coworker's `public/logo.svg` in the header, the footer and the mobile menu. Never replace it.
6. **Colors come from theme tokens only** (see section 1). **No hard-coded hex colors in components.** That is what keeps dark mode working automatically.
7. **The `lib/`, `dbQueries.ts` and server-action APIs stay as they are**, unless a page section below says otherwise.
8. **Backlog items (section 4) are NOT part of this pass.** Where the canvas shows a backlog feature, the notes below say what to render instead.

---

## 1. Shared design basics

### 1.1 Colors: map design colors to daisyUI tokens

The theme lives in `app/globals.css`: `bytemepastel` is light and `bytemepastel-dark` is dark. The canvas uses the light hex values. Implement them as tokens:

| Canvas (light) | Use in code | Where |
|---|---|---|
| `#fbfaff` | `bg-base-100` | page background |
| `#ffffff` | `bg-base-200` | cards, inputs, dropdowns |
| `#f1eefa` | `bg-base-300` | muted panels, tip boxes, "Can't decide?" card |
| `#ece6fb` / `#e4dcfb` | `border-base-300` | card and input borders |
| `#2e2a38` | `text-base-content` | body text |
| `#605a70` | `text-base-content/70` | secondary text |
| `#8b84a0` | `text-base-content/50` | captions, counters |
| `#c9b6ff` | `bg-primary text-primary-content` | primary buttons, active chips, badges |
| `#efe8ff` | `bg-primary/25` | active nav pill, soft highlights |
| `#c6f1d6` | `bg-accent text-accent-content` | "Your daily kitchen companion" pill, success states |
| `#ffd1dc` | `bg-secondary text-secondary-content` | "Loved it" button |
| Breakfast / Lunch / Dinner | `badge-success` / `badge-warning` / `badge-error` | meal badges (already used this way) |
| `#2e2a38` dark button | `bg-base-content text-base-100` | "Surprise me", the CTA band in recipe detail. These flip correctly in dark mode. |

**⚠️ Link and text-accent color:** `text-primary` (#c9b6ff) is **too light to read as text on light backgrounds**. It fails WCAG contrast. The canvas uses `#5b3fc4` for links and "See all →". Add one custom token to **both** themes in `globals.css`, for example:

```css
/* inside each @plugin "daisyui/theme" block */
--color-link: #5b3fc4;   /* light theme */
--color-link: #c9b6ff;   /* dark theme */
```

Then register it (e.g. `@theme { --color-link: var(--color-link); }`) so `text-link` works. Figuring out the exact Tailwind 4 wiring is part of the task. Use it for text links, "See all recipes →", the "Step 2 of 4" label and similar.

### 1.2 Typography

- **Font:** Geist, already loaded in `app/layout.tsx`. Mono digits (timer) use Geist Mono, also already loaded.
- **Heading sizes:**
  - Page H1: `text-4xl sm:text-5xl font-extrabold tracking-tight` (40–56px on the canvas)
  - Section H2: `text-2xl sm:text-3xl font-bold`
  - Card title: `text-lg font-semibold`
- **Body:** 15–16px. Secondary text 14px. Captions 12–13px.

### 1.3 Shape and spacing

- **Content width:** `max-w-6xl` (1120px on the canvas), wider than today's `max-w-5xl`. Side padding `px-4 sm:px-6`.
- **Radius:**
  - Cards: `rounded-box` (1.5rem)
  - Big panels (hero side card, auth card): `rounded-[2rem]`
  - Buttons, chips, search: `rounded-full`
- **Borders:** cards get `border border-base-300` plus a soft shadow (`shadow-sm` or `shadow-md`). Hover: `-translate-y-0.5 shadow-lg`, which is already there.
- **Touch targets:** at least 44px (`h-11`) for every clickable element, especially on mobile.

### 1.4 Shared components (create or refactor first, see PR 0)

| Component | Notes |
|---|---|
| `Header` | Logo (`logo.svg`) and "byte**Me**". Nav: Home · All recipes · Favorites · Shopping list. **Active link = pill** (`bg-primary/25 font-semibold`). Right side: theme toggle (sun/moon, keep it!), then Sign in or user name + Log out, then `+ Create recipe` (only if `canCreateRecipes`). Signed-out users still see Favorites and Shopping list. |
| Mobile menu | Full-screen overlay (not a small dropdown) with 56px rows and emoji icons (🏠 📖 💜 🛒 🎲), a dark-mode switch row, and at the bottom the account row (avatar initial, Log out) plus a full-width "+ Create recipe". Board `MobileMenu`. |
| `Footer` | 4 columns: brand + tagline · Explore (Home, All recipes, Favorites, Shopping list, Surprise me) · Account (Sign in, Create account, Create recipe) · Project (GitHub link, stack line, "Team project · WBS Coding School", **LeetCode joke button** "👩‍💻 Start cooking (for real software developers)" → `https://leetcode.com/problemset/`). Bottom row: `© {year} byteMe` and "Made by [team names]" (ask Niko for the names). |
| `RecipeCard` | Image 190–200px. Meal badge top left (Home only). 🛒 + ♡ icon buttons top right (white round, 36px). Title. 2-line snippet. **Max 3 tags + a dashed "+N" tag.** Meta area: **line 1** = 🍲 pots + fun label (`whitespace-nowrap`, **must never wrap**). **Line 2** = ⏱ time (left) and ❤️ likes (right). Card click behavior: see PR 3. |
| `EmptyState` | Big emoji, headline, one sentence, one primary button (+ optional secondary). Dashed `border-primary/40`. Used for: No favorites · Sign in to unlock this · Nothing to buy · Not approved yet. Board `EmptyStates`. |
| `SearchBar` | See PR 2. Gets a `defaultOpen` prop so Home can show it expanded. |

Difficulty labels come from `lib/recipe.ts` (`DIFFICULTY_LABELS`: "Can do a newborn", "Easy peasy", "Normal muggel", "Muggel with 2 hands", "Master chef"). Keep them everywhere. Show 🍲 × level plus the remaining pots at 25% opacity.

---

## 2. Page-by-page changes

Each section lists its canvas board, the files involved, the changes and the acceptance criteria ("done when").

### PR 0 · Foundation: tokens, header, footer, card, empty state

**Boards:** headers and footers on all proposed boards, `EmptyStates`, `MobileMenu`, `HomeDark`

**Files:** `app/globals.css`, `app/layout.tsx`, `app/components/Header.tsx`, `app/components/Footer.tsx`, `app/components/RecipeCard.tsx` (card part only), new `app/components/EmptyState.tsx`

**Changes:**
- **Link color:** add the `link` token (section 1.1).
- **Content width:** `max-w-5xl` becomes `max-w-6xl` in the shared containers.
- **Header:** active pill, logo kept, theme toggle kept, links kept visible when signed out, full-screen mobile menu.
- **Footer:** 4-column layout, including the LeetCode joke button.
- **RecipeCard visuals:** tags capped at 3 + "+N". Difficulty gets its own line (nowrap), then time + likes.
- **EmptyState:** new component.
- **PixelReveal:** move `<PixelReveal />` out of `app/layout.tsx` into `app/page.tsx`, so it runs on Home only.

**Done when:**
- Every page shows the new header and footer.
- Cards never wrap the pots row.
- Dark mode still works everywhere.
- The pixel animation only runs on `/`.

### PR 1 · Home (`/`)

**Board:** `Main` (01 Home · proposed), plus `MobileHome` and `HomeDark`

**File:** `app/page.tsx`

**Changes:**

1. **Hero replaces the duplicate "byteMe" H1.** Two columns:
   - **Left:** mint pill "Your daily kitchen companion", H1 "What are we cooking today?", subline, the `SearchBar` with `defaultOpen`, and quick label chips linking to `/all-recipes` (Breakfast, Under 20 min, Vegetarian, One-pot, Dessert, "All labels →").
   - **Right:** a "Can't decide?" side card (🎲 or dice icon, text, dark "Surprise me →" button → `/recipe/random`).
2. **Recipes of the day:** H2 + subline "A fresh breakfast, lunch and dinner pick — every day." + "See all recipes →" on the right. Three `RecipeCard`s with meal badges.
3. **Welcome section** (`bg-base-300`):
   - Keep the title "✨🍱 Welcome to YOUR new Kitchen! 🍳✨" and paragraph 1 centered.
   - Below it, 3 **feature tiles**: 🔍 Find → All recipes · ⏲️ Cook → a recipe · 🛒 Shop → Shopping list.
   - Below those, a **2×2 grid of story cards** with the remaining paragraphs:
     - 🥄 Keep it simple
     - 📚 Something for every taste
     - ❤️ More than just food
     - 🍰 Whatever brought you here
   - The closing line "Roll up your sleeves… 👨‍🍳👩‍🍳" goes in a white pill.
   - Copy the exact wording from the canvas board; it is lightly trimmed from today's text.
4. **Phone:** the hero stacks. "Can't decide?" becomes a one-line button. Recipes of the day becomes a horizontal swipe row (`overflow-x-auto snap-x`).

**Done when:**
- It matches the `Main` board on desktop and `MobileHome` on a phone.
- No emoji or paragraph from the old welcome text is lost (except the small trims).

### PR 2 · All recipes (`/all-recipes`) + Favorites (`/favorites`)

**Boards:** `AllRecipes` (interactive, hover the search), `SearchStates`, `MobileAll`, `EmptyStates`

**Files:** `app/all-recipes/page.tsx`, `app/all-recipes/SearchBar.tsx`, `app/components/RecipeFilters.tsx`, `app/favorites/page.tsx`, `app/components/FavoritesGrid.tsx`

**Changes:**

1. **Page header row:** H1 "All recipes 📖" with the subline on the left. The **SearchBar** sits on the right in the same row.
2. **SearchBar, keeping the coworker's animation:**
   - **Same mechanic and timing** (0.8s ease-in-out, 148px wide at rest, about 560px on hover or focus). It grows into the empty space to the right of the H1, not onto its own line.
   - **Restyled:**
     - At rest: `bg-base-200`, `border-base-300`, `rounded-full`, 48px tall.
     - On hover or focus: border turns primary, soft primary glow shadow, the Search button turns `bg-primary`.
     - The ✕ clear button fades in after the width animation (same delay idea as today).
   - **Suggestions dropdown** as a card:
     - "Top matches" caption.
     - Rows with a 36px thumbnail, the name with the **matched letters bold**, and ❤ likes.
     - Last row: "See all results for “…” →".
   - Props: add `defaultOpen?: boolean`. When true it stays expanded, for Home.
3. **Filter bar card** (`bg-base-200 rounded-box border`):
   - **Row 1:** `Labels ▾` (with a count badge), `⏱ Time ▾`, `🍲 Difficulty ▾`, a divider, the **5 most-used labels as toggle chips** (active = `bg-primary`), then Sort on the right.
   - **Row 2:** **"38 recipes"** · removable pills for active filters ("Vegetarian ✕", "Up to 30 min ✕") · "Clear all".
4. **Default sort** is `"likes"` ("Most liked") instead of `"newest"`.
5. **Show more:** render 12 cards, then a "Show more recipes (N left)" button that adds 12 more. No pagination.
6. **Phone:**
   - The search collapses to a "🔍 Search" pill and expands full width on tap.
   - Filters sit behind one "⚙︎ Filters (n)" button that opens a bottom sheet (daisyUI `modal modal-bottom`).
   - Label chips scroll horizontally.
7. **Favorites:**
   - Same layout without the search.
   - Empty: EmptyState 💜 "No favorites yet" with "Browse recipes" + "🎲 or let us surprise you".
   - Signed out: EmptyState "Sign in to unlock this".

**Done when:**
- The search animation looks like the canvas.
- Filters show active pills and the count.
- Sort defaults to Most liked.
- Show more works.
- Favorites shows the right empty state for signed in and signed out.

### PR 3 · Recipe detail + modal (`/recipe/[id]`)

**Boards:** `RecipeDetail`, `RecipeModal`, `MobileDetail`

**Files:** `app/recipe/[id]/page.tsx`, `app/components/RecipeCard.tsx` (remove the inline modal), new `app/components/RecipeDetails.tsx`, new intercepting and parallel route folders

**Architecture decision: modal and page combined, one component.**
- Create `<RecipeDetails recipe variant="page" | "modal" />` holding all detail markup. **Delete the duplicated modal markup** in `RecipeCard.tsx` and the manual `history.pushState` / `popstate` logic.
- Use **Parallel Routes + Intercepting Routes** (e.g. an `@modal` slot in the layout and `(.)recipe/[id]` inside it):
  - A card click inside the app opens the recipe as a **modal over the list**, and the URL becomes `/recipe/12`.
  - A reload, a shared link or "Open full page ↗" shows the **full page**.
- `RecipeCard` becomes a plain `<Link href="/recipe/{id}">` card, with 🛒 and ♡ still stopping propagation.
- Explain this pattern to Niko in the PR. It's a portfolio highlight.

**Page layout:**
1. **Breadcrumb** "← All recipes / Dinner / Vegan Lentil Bolognese" replaces the `BackButton` (a back button breaks on direct links).
2. **Hero, 2 columns:**
   - **Left:** large image, `rounded-[2rem]`, about 460px tall.
   - **Right, in order:**
     - Meal badge + tags.
     - **H1 with the ♡ button top right, next to the title.**
     - Snippet.
     - "by {author}" with an initial avatar.
     - **3 stat tiles showing only the values, centered vertically and horizontally, no captions:** "⏱ 55 min" · 🍲🍲🍲 + "Normal muggel" · "❤️ 312".
     - Buttons: **"🍳 Start cooking"** (primary, large) + "🛒 Add to shopping list" (outline).
     - Owner only: a strip "This is your recipe" with ✏️ Edit and 🗑 Delete.
3. **Body, 2 columns:**
   - **Left:** sticky **Ingredients card**, 🥕 title, rows with a **bold amount column** + name (use `ingredientDetails`).
     - ⚠️ The checkboxes, the "tick off what you have" hint and "Add missing to shopping list" are **backlog**. For this pass, render the rows **without checkboxes** and drop that button.
   - **Right:**
     - 📝 "About this dish" (`description`).
     - **👣 Steps, shown in full:** numbered circles, title, description, and badges (🥣 ingredients, ⏱ time) from `recipe.steps`. Header: "N steps · ⏱ M timers".
     - Then a **dark CTA band** "Ready? Let's cook step by step." with a "Start cooking →" button (`whitespace-nowrap`, **one line**).
   - If a recipe has no steps, hide the Steps section and the CTA band.
4. **The LeetCode button is removed here.** It now lives in the footer (PR 0).
5. **Modal variant** (board `RecipeModal`):
   - Top bar: title + "Open full page ↗" + ✕.
   - Content: image, badges, title with ♡, the meta line, "🛒 Add", and a 2-column ingredient list.
   - Sticky footer: "N steps · M timers" + "🍳 Start cooking".
6. **Phone:**
   - Photo on top with ← and ♡ floating on it.
   - The content sheet overlaps the photo with rounded top corners.
   - Stat tiles.
   - **Ingredients / Steps as tabs.**
   - 🛒 + "🍳 Start cooking" pinned to the bottom.

**Done when:**
- A card click opens the modal with the URL changed.
- A reload shows the full page.
- There is no duplicated detail markup left.
- The ♡ sits next to the title.
- Stat values are centered.
- The CTA button is one line.

### PR 4 · Cooking mode (`/recipe/[id]/cook`)

**Boards:** `Cook`, `CookFinish`, `CookMobile`

**Files:** `app/recipe/[id]/cook/CookingMode.tsx`, `ActiveTimers.tsx`, `page.tsx`, a route-group layout

**Changes:**

1. **Focus mode, main header hidden (approved).**
   - Use **Route Groups**, e.g. `app/(app)/layout.tsx` with Header + Footer, and `app/(focus)/recipe/[id]/cook/…` without them.
   - No `pathname` checks in the root layout.
2. **Top bar:** "✕ Exit" (→ recipe page) · small thumbnail · "👩‍🍳 COOKING MODE" caption + recipe name.
3. **Progress bar with step names:** one segment per step. Each is clickable and jumps to that step. Done steps show "✓". The current step is bold.
4. **Step content:** "Step 2 of 4" (link color), **H1 48px**, **description 26px**, and "You need for this step" ingredient chips.
   - **The big recipe photo on every step is removed.**
5. **Timer card** (right column):
   - SVG **progress ring** + big mono digits "04:48" + "of 8:00 min".
   - Large Pause/Resume and Stop buttons.
   - Before the timer starts: a large "▶ Start 8 min timer" button.
   - Below it: an **"Up next"** card ("3 · Simmer · ⏱ 35 min").
6. **Timer dock** (restyled `ActiveTimers`) at the bottom: pills per timer (dot, step name, time, ⏸). A finished one turns **accent green with 🔔** and a ✕ dismiss.
7. **Prev/Next:** huge buttons (64px). The Next label names the next step ("Next: Simmer →"). Optional nice extra: ←/→ arrow keys.
8. **Finish screen** (after the last step): round photo, 🎉 "Bon appétit!", "You cooked X in N steps", buttons "❤️ Loved it — save to favorites" (secondary), "Back to recipe", and "🎲 Surprise me with the next one →".
9. **Phone:** same order. The timer is a compact row. Prev (←) and Next are pinned to the bottom.
10. ⚠️ The "🔆 Screen stays on" hint on the canvas belongs to a **backlog** feature. Leave it out for now.

**Done when:**
- There is no main header in cooking mode.
- Steps are clickable in the progress bar.
- The ring timer works with the existing `useCookingTimers`.
- The finish screen appears after the last step.

### PR 5 · Shopping list (`/shopping-list`)

**Boards:** `Shopping`, `EmptyStates`

**Files:** `app/shopping-list/page.tsx`, `ShoppingListItemRow.tsx`, `CustomShoppingListSection.tsx`, `RemoveFromShoppingListButton.tsx`

**Changes:**

1. **H1 "Shopping list 🛒"** + subline "Everything you need for your N recipes — combined automatically." A **progress bar** "7 of 18 in the cart" on the right, computed from the `checked` flags.
2. **Two columns.**
   - **Left, the main column:**
     - **"🥕 Ingredients to buy" card:**
       - Open items first. Rows have a checkbox (existing logic), a bold amount column and the name.
       - **Checked items collapse** into a `<details>` "✓ Already in the cart (n)".
       - The long matching explanation becomes a small **💡 tip** at the bottom.
     - **"🧻 Your own items" card:** a one-line add row (amount · unit · item · "+ Add") with visually hidden labels, and a list styled like the main one with a ✕ to remove.
   - **Right sidebar:** "📖 Recipes on your list" as **mini cards** (thumbnail, name link, "⏱ time · n ingredients", ✕ remove) + a dashed "+ Add more recipes".
3. **Empty states:**
   - Signed out: EmptyState 🛒 "Sign in to unlock this" (Sign in + Create account).
   - No items: 📝 "Nothing to buy yet" + "Find a recipe".
4. The **nav badge** ("3") on the canvas is **backlog**. Leave it out for now.

**Done when:**
- The two-column layout matches.
- Checked items collapse.
- The progress bar is correct.
- All three empty or signed-out states work.

### PR 6 · Create / Edit recipe (`/create-recipe`, `/recipe/[id]/edit`)

**Board:** `CreateRecipe`

**Files:** `app/components/RecipeForm.tsx` (split it up), `app/create-recipe/*`, `app/recipe/[id]/edit/*`

**Refactor first:** split the roughly 600-line `RecipeForm.tsx` into `IngredientsEditor`, `StepsEditor`, `LabelPicker`, `DifficultyPicker` (+ `RecipeCardPreview`).
- Each part owns its own state and keeps writing the same **hidden inputs**, so the server actions stay the same.

**Changes:**

1. **Page:** H1 "Create a recipe 👩‍🍳" + "fields with * are required". Two columns: form on the left, sidebar (340px) on the right.
2. **Five numbered section cards.** The number circle turns into a green ✓ when that section's required fields are valid.
   1. **The basics:** name, short description (with a "Shown on the recipe card · n / 90 characters" hint), "About this dish" (description), total time (with a "min" suffix).
   2. **Photo** (**moved up** from the bottom): a live image preview (160×110) next to the URL field, so broken links show immediately.
   3. **Ingredients:** the add row (amount · unit · name · "+ Add", **Enter adds too**). Added items as **2-column rows** with a bold amount + ✕ (instead of wrapping badges).
   4. **Cooking steps:**
      - A badge "Unlocks 🍳 cooking mode".
      - Added steps as cards: number, title, description, 🥣/⏱ line, **↑/↓ reorder** (keep it; drag & drop is backlog), Edit, Delete.
      - The input form is a dashed "Step N" card at the end: title, description, ingredients, ⏱ minutes, "+ Add step".
   5. **Labels & difficulty:**
      - `CATEGORY_GROUPS` as **toggle chips** per group (active = `bg-primary` with ✓), instead of checkboxes.
      - **Difficulty** as **5 clickable pot tiles** (🍲×n + fun label, `role="radiogroup"`) instead of a `<select>`.
3. **Sidebar, approved as part of this pass:**
   - A **live card preview** using the real `RecipeCard` look, updating as you type.
     - ⚠️ This requires **name, snippet, time, image, categories and difficulty to become controlled state** (today they use `defaultValue`). Explain this to Niko.
   - A **"Ready to publish?" checklist** (✅/➕ per section).
4. **Sticky bottom bar:** status text ("All required fields done 🎉" or what's missing) · Cancel · **Publish recipe**.
5. **Edit page:** the same component. Title "Edit recipe", button "Save changes", plus a "Delete recipe" action in the bar.
6. **Not approved yet** (from `canCreateRecipes`): EmptyState ⏳ "Almost there, chef!" + "Browse recipes" (board `AuthVariants`, 3rd card).

**Done when:**
- Create and edit both work end to end.
- The server actions are unchanged.
- The preview updates live.
- Sections tick green.
- Labels and difficulty are keyboard-accessible.

### PR 7 · Sign in / Sign up / Forgot password (`/auth/*`)

**Boards:** `SignIn`, `AuthVariants`

**Files:** `app/auth/AuthForm.tsx`, `app/auth/forgot-password/*`, `app/auth/reset-password/*`

**Changes:**

1. **Split card** (`max-w-5xl`, `rounded-[2rem]`):
   - **Left:** pastel `bg-primary/25` panel with 🍳 and "Welcome back to YOUR kitchen!" (sign-up variant: a matching headline), plus 3 perks: 💜 Save your favorites · 🛒 Smart shopping list · 👩‍🍳 Share your own recipes ("once your account is approved").
   - **Right:** the form.
2. **"No account yet? Create one — it's free" moves to the top**, under the H1. On sign-up: "Already cooking with us? Sign in".
3. **"Forgot password?"** sits on the same line as the Password label, right-aligned.
4. **A Show/Hide password button** inside the field.
5. **Errors:** an alert box `bg-error/20` with ⚠️ and friendly text, instead of small red text.
6. **Sign-up:**
   - "Create account 🎉".
   - A live password hint: 3-step strength bar + "✓ At least 8 characters", turning green when met.
7. **Forgot password:**
   - Same card style, 🔑, "No stress — enter your email…", "Send reset link", "← Back to sign in".
   - Success state: 📬 "Check your inbox!".
   - Reset password: same style.
8. On a phone the perk panel is hidden or collapsed above the form.

**Done when:**
- All auth screens match the boards.
- Show/Hide works.
- Error and success states are styled.

### PR 8 · Final QA pass (mobile + dark)

**Boards:** row 08 (phones) and row 09 (`HomeDark`)

- Walk every page at 375px width and fix overflow.
- Check touch targets are at least 44px.
- Toggle dark mode on every page and check contrast, especially links, captions and chips.
- `grep` for leftover hex colors in `app/**/*.tsx`.
- Check the broken-image recipes (see backlog) and add an `onError` image fallback in `RecipeCard` / `RecipeDetails` if still needed.

---

## 3. Suggested order and GitHub issues

Create one issue per PR, then branch `redesign/<n>-<page>`. Put `Closes #N` in the PR body.

| # | Issue title | Branch |
|---|---|---|
| 0 | Redesign: foundation (tokens, header, footer, card, empty state) | `redesign/0-foundation` |
| 1 | Redesign: Home page | `redesign/1-home` |
| 2 | Redesign: All recipes + Favorites (search, filter bar, show more) | `redesign/2-all-recipes` |
| 3 | Redesign: Recipe detail + modal via intercepting routes | `redesign/3-recipe-detail` |
| 4 | Redesign: Cooking mode (focus layout, timer ring, finish screen) | `redesign/4-cooking-mode` |
| 5 | Redesign: Shopping list + empty states | `redesign/5-shopping-list` |
| 6 | Redesign: Create / edit recipe form (sections, live preview) | `redesign/6-recipe-form` |
| 7 | Redesign: Auth pages | `redesign/7-auth` |
| 8 | Redesign: mobile + dark mode QA | `redesign/8-qa` |

**Issue body template:**

```md
## Goal
Implement the approved redesign for <page>. Design: canvas row <NN> — https://claude.ai/artifact/MpLRgeaWB8TjqJ9agBFjBP
Spec: docs/redesign-handoff.md → section "PR <n>"

## Tasks
- [ ] …(copy the "Changes" list from the handoff)

## Done when
- …(copy "Done when")
```

---

## 4. Backlog: approved features, NOT part of the styling pass

Each of these should become its own issue later.

1. **Tick off ingredients on the recipe detail page.** Checkboxes in the Ingredients card ("tick off what you have") + an **"Add missing to shopping list"** button. The shopping list already has checkboxes via `ShoppingListItemRow` / `setShoppingListItemCheckedAction`; reuse that pattern.
2. **Keep the screen awake in cooking mode** with the Screen Wake Lock API.
   - `navigator.wakeLock.request('screen')` on start.
   - Request it again on `visibilitychange` when the tab becomes visible.
   - Release it on Exit or Finish.
   - Show the "🔆 Screen stays on" hint in the cooking top bar. Fail silently if unsupported.
3. **Nav badge on "Shopping list"** showing the number of **recipes** on the list.
   - `Header` is a client component. Use the existing `useShoppingList()` hook, which is already loaded and cached for the 🛒 buttons.
   - That means no extra DB query, and it updates live.
   - Also shown in the mobile menu.
4. **Signed-out ♡ / 🛒 go to sign-in** with a return URL back to the recipe, instead of doing nothing.
5. **Drag & drop to reorder cooking steps** in the recipe form, replacing ↑/↓ (e.g. `dnd-kit` or native HTML5 DnD).
6. **Clean up recipes with broken images** (data task; do it at the end).

---

## 5. Board index (canvas)

| Row | Boards (today → proposed) |
|---|---|
| 01 Home | `HomeCurrent` → `Main` |
| 02 All recipes | `AllRecipesCurrent` → `AllRecipes` (interactive), `SearchStates` |
| 03 Recipe detail | `RecipeDetailCurrent` → `RecipeDetail`, `RecipeModal` |
| 04 Cooking mode | `CookCurrent` → `Cook`, `CookFinish`, `CookMobile` |
| 05 Shopping list | `ShoppingCurrent` → `Shopping`, `EmptyStates` |
| 06 Create / edit | `CreateRecipeCurrent` → `CreateRecipe` |
| 07 Auth | `SignInCurrent` → `SignIn`, `AuthVariants` |
| 08 Mobile | `MobileHome`, `MobileMenu` (interactive), `MobileAll`, `MobileDetail` |
| 09 Dark mode | `HomeDark` |

A new session can read any board's markup with the Artifact tool (`action: "read"` on the canvas URL, `path: "project/<Board>.dc.html"`). Treat the markup as a visual reference, not as code to copy: it uses inline hex styles, while the app must use daisyUI tokens (section 1.1).
