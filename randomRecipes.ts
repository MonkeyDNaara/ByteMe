type recipesType = {
  name: string;
  description: string;
  snippet: string;
  time: number;
  ingredients: string[];
  categories: string[];
  image_url: string;
};

export const recipes: recipesType[] = [
  {
    name: "Creamy Chicken Mushroom Pasta",
    description:
      "This creamy chicken mushroom pasta combines tender pieces of chicken with browned mushrooms, garlic, onions, and a rich cream sauce. The sauce coats the pasta beautifully and creates a comforting meal that feels special without requiring complicated techniques. A little Parmesan adds extra depth, while fresh parsley and black pepper keep the dish balanced and fragrant.",
    snippet: "Creamy pasta with chicken, mushrooms, garlic, and Parmesan.",
    time: 30,
    ingredients: [
      "chicken breast",
      "pasta",
      "mushrooms",
      "cream",
      "Parmesan",
      "garlic",
      "onion",
      "parsley",
      "olive oil",
    ],
    categories: ["Dinner", "Chicken", "Fast"],
    image_url:
      "https://loremflickr.com/800/600/chicken,mushroom,pasta?lock=301",
  },
  {
    name: "Beef Stroganoff",
    description:
      "Beef Stroganoff is a rich and comforting dish made with tender strips of beef, mushrooms, onions, and a creamy sauce. The combination of browned meat and earthy mushrooms creates a deep savory flavor, while sour cream gives the sauce its characteristic smoothness and slight tang. Serve it over rice, pasta, or traditional egg noodles.",
    snippet: "Tender beef and mushrooms in a creamy sour cream sauce.",
    time: 40,
    ingredients: [
      "beef",
      "mushrooms",
      "onion",
      "sour cream",
      "beef broth",
      "mustard",
      "butter",
      "egg noodles",
    ],
    categories: ["Dinner", "Beef"],
    image_url:
      "https://loremflickr.com/800/600/beef,stroganoff,mushroom?lock=302",
  },
  {
    name: "Vegetable Fried Noodles",
    description:
      "These vegetable fried noodles are a quick and flexible meal packed with colorful vegetables and savory Asian-inspired flavors. Noodles are tossed with carrots, bell peppers, cabbage, spring onions, garlic, and soy sauce until everything is hot and lightly caramelized. The recipe works especially well as a quick dinner because the vegetables can easily be replaced with whatever is available.",
    snippet: "Quick fried noodles with colorful vegetables and soy sauce.",
    time: 25,
    ingredients: [
      "noodles",
      "carrot",
      "bell pepper",
      "cabbage",
      "spring onion",
      "garlic",
      "soy sauce",
      "sesame oil",
    ],
    categories: ["Dinner", "Vegetarian", "Vegan", "Fast"],
    image_url:
      "https://loremflickr.com/800/600/fried,noodles,vegetables?lock=303",
  },
  {
    name: "Classic Beef Lasagna",
    description:
      "Classic beef lasagna layers rich tomato and beef sauce with tender pasta sheets and a creamy cheese filling. The dish is baked until the top becomes golden and bubbling, while the layers underneath remain soft and flavorful. It takes some time to prepare, but the result is a hearty family meal that reheats beautifully and often tastes even better the next day.",
    snippet: "Layered lasagna with beef tomato sauce and creamy cheese.",
    time: 75,
    ingredients: [
      "lasagna sheets",
      "ground beef",
      "tomatoes",
      "onion",
      "garlic",
      "ricotta",
      "mozzarella",
      "Parmesan",
      "oregano",
    ],
    categories: ["Dinner", "Beef", "Takes Time"],
    image_url: "https://loremflickr.com/800/600/beef,lasagna,pasta?lock=304",
  },
  {
    name: "Garlic Butter Chicken",
    description:
      "Garlic butter chicken is a simple skillet meal built around juicy chicken pieces cooked in a fragrant sauce of butter, garlic, herbs, and a splash of lemon juice. The butter becomes infused with the garlic and herbs while the chicken develops a golden exterior. Serve it with potatoes, rice, pasta, or vegetables for an easy and satisfying dinner.",
    snippet: "Golden chicken cooked in fragrant garlic herb butter.",
    time: 25,
    ingredients: [
      "chicken breast",
      "butter",
      "garlic",
      "lemon",
      "parsley",
      "thyme",
      "black pepper",
    ],
    categories: ["Dinner", "Chicken", "Fast"],
    image_url: "https://loremflickr.com/800/600/garlic,butter,chicken?lock=305",
  },
  {
    name: "Creamy Spinach Gnocchi",
    description:
      "Creamy spinach gnocchi turns soft potato gnocchi into a comforting vegetarian meal with a silky sauce, fresh spinach, garlic, and Parmesan. The gnocchi cook quickly, making this dish convenient for busy evenings, while the spinach adds freshness and color to the rich sauce. A little black pepper and nutmeg help round out the creamy flavor.",
    snippet: "Soft gnocchi with creamy spinach, garlic, and Parmesan.",
    time: 25,
    ingredients: [
      "gnocchi",
      "spinach",
      "cream",
      "Parmesan",
      "garlic",
      "butter",
      "nutmeg",
      "black pepper",
    ],
    categories: ["Dinner", "Vegetarian", "Fast"],
    image_url: "https://loremflickr.com/800/600/gnocchi,spinach,cream?lock=306",
  },
  {
    name: "Mediterranean Couscous Salad",
    description:
      "This Mediterranean couscous salad combines fluffy couscous with tomatoes, cucumber, bell pepper, parsley, olives, and lemon. The vegetables provide plenty of crunch while the lemon and olive oil dressing keeps everything fresh and bright. It works well as a light lunch, a side dish, or a make-ahead meal because the flavors develop nicely after resting.",
    snippet: "Fresh couscous salad with vegetables, olives, lemon, and herbs.",
    time: 20,
    ingredients: [
      "couscous",
      "tomatoes",
      "cucumber",
      "bell pepper",
      "olives",
      "parsley",
      "lemon",
      "olive oil",
    ],
    categories: ["Lunch", "Vegetarian", "Vegan", "Fast"],
    image_url:
      "https://loremflickr.com/800/600/couscous,salad,mediterranean?lock=307",
  },
  {
    name: "Honey Mustard Chicken",
    description:
      "Honey mustard chicken combines sweet honey with tangy mustard to create a flavorful glaze for juicy chicken breast. The sauce caramelizes slightly during cooking while keeping the meat tender and moist. Garlic, paprika, and a little lemon juice add extra depth, making this an easy weeknight dinner that pairs well with roasted potatoes, rice, or a simple green salad.",
    snippet: "Juicy chicken glazed with sweet and tangy honey mustard.",
    time: 30,
    ingredients: [
      "chicken breast",
      "honey",
      "mustard",
      "garlic",
      "lemon",
      "paprika",
      "olive oil",
    ],
    categories: ["Dinner", "Chicken", "Fast"],
    image_url: "https://loremflickr.com/800/600/honey,mustard,chicken?lock=308",
  },
  {
    name: "Creamy Tomato Gnocchi",
    description:
      "Creamy tomato gnocchi is a comforting one-pan style meal where soft potato gnocchi are coated in a rich tomato and cream sauce. Garlic, onion, herbs, and Parmesan add layers of flavor while the sauce becomes thick enough to cling to every piece of gnocchi. It is quick to prepare and works especially well when you want something cozy without spending a long time in the kitchen.",
    snippet: "Soft gnocchi in a creamy tomato and Parmesan sauce.",
    time: 25,
    ingredients: [
      "gnocchi",
      "tomatoes",
      "cream",
      "Parmesan",
      "garlic",
      "onion",
      "basil",
      "olive oil",
    ],
    categories: ["Dinner", "Vegetarian", "Fast"],
    image_url: "https://loremflickr.com/800/600/gnocchi,tomato,cream?lock=309",
  },
  {
    name: "Chicken Parmesan",
    description:
      "Chicken Parmesan features crispy breaded chicken topped with tomato sauce and melted mozzarella and Parmesan. The chicken is first browned until golden before being finished with the sauce and cheese, creating a combination of crunchy edges and a rich, cheesy center. Serve it with spaghetti, roasted vegetables, or a fresh salad for a complete Italian-inspired dinner.",
    snippet: "Crispy breaded chicken baked with tomato sauce and cheese.",
    time: 50,
    ingredients: [
      "chicken breast",
      "breadcrumbs",
      "flour",
      "egg",
      "tomato sauce",
      "mozzarella",
      "Parmesan",
      "oregano",
    ],
    categories: ["Dinner", "Chicken"],
    image_url:
      "https://loremflickr.com/800/600/chicken,parmesan,tomato?lock=310",
  },
  {
    name: "Vegan Chickpea Bowl",
    description:
      "This vegan chickpea bowl combines roasted chickpeas with rice, fresh vegetables, avocado, and a creamy tahini lemon dressing. The chickpeas become crisp and flavorful in the oven while the vegetables provide freshness and texture. It is filling without being heavy and can easily be prepared in advance for lunch or dinner throughout the week.",
    snippet: "Vegan rice bowl with crispy chickpeas, vegetables, and tahini.",
    time: 40,
    ingredients: [
      "chickpeas",
      "rice",
      "avocado",
      "cucumber",
      "tomatoes",
      "carrot",
      "tahini",
      "lemon",
    ],
    categories: ["Lunch", "Vegan", "Fast"],
    image_url: "https://loremflickr.com/800/600/chickpea,bowl,vegan?lock=311",
  },
  {
    name: "Baked Salmon with Lemon",
    description:
      "Baked salmon with lemon is a simple seafood dinner where salmon fillets are seasoned with garlic, lemon, herbs, and olive oil before being roasted until tender. The fish remains moist while the lemon adds freshness and acidity. Serve it alongside potatoes, rice, asparagus, or another vegetable for a balanced meal that requires very little preparation.",
    snippet: "Tender salmon baked with lemon, garlic, herbs, and olive oil.",
    time: 30,
    ingredients: [
      "salmon",
      "lemon",
      "garlic",
      "olive oil",
      "dill",
      "black pepper",
    ],
    categories: ["Dinner", "Fish", "Fast"],
    image_url: "https://loremflickr.com/800/600/salmon,lemon,fish?lock=312",
  },
  {
    name: "Vegetable Pad Thai",
    description:
      "Vegetable Pad Thai is a flavorful noodle dish combining rice noodles with crunchy vegetables, tofu, peanuts, lime, and a savory-sweet sauce. The noodles absorb the sauce while the vegetables remain slightly crisp, creating plenty of contrast in every bite. It is a great vegetarian meal that can be customized with different vegetables depending on the season.",
    snippet: "Rice noodles with vegetables, tofu, peanuts, and lime.",
    time: 35,
    ingredients: [
      "rice noodles",
      "tofu",
      "carrot",
      "bell pepper",
      "bean sprouts",
      "peanuts",
      "lime",
      "soy sauce",
    ],
    categories: ["Dinner", "Vegetarian"],
    image_url:
      "https://loremflickr.com/800/600/pad,thai,noodles,vegetables?lock=313",
  },
  {
    name: "Beef Burrito",
    description:
      "This hearty beef burrito is filled with seasoned ground beef, rice, beans, cheese, salsa, and fresh vegetables before being wrapped in a warm flour tortilla. The combination of creamy, spicy, fresh, and savory ingredients makes every bite satisfying. It is also easy to customize with avocado, sour cream, jalapeños, or additional cheese.",
    snippet:
      "Loaded tortilla wrap with seasoned beef, rice, beans, and cheese.",
    time: 30,
    ingredients: [
      "ground beef",
      "tortilla",
      "rice",
      "beans",
      "cheese",
      "tomatoes",
      "lettuce",
      "salsa",
    ],
    categories: ["Lunch", "Beef", "Fast"],
    image_url: "https://loremflickr.com/800/600/beef,burrito,mexican?lock=314",
  },
  {
    name: "Roasted Vegetable Soup",
    description:
      "Roasted vegetable soup gets its rich flavor from roasting the vegetables before blending them into a smooth and comforting soup. Tomatoes, carrots, bell peppers, onions, and garlic develop caramelized edges in the oven, giving the finished soup more depth than simply boiling everything together. A little olive oil and fresh herbs finish the dish.",
    snippet: "Smooth soup made from caramelized roasted vegetables.",
    time: 55,
    ingredients: [
      "tomatoes",
      "carrot",
      "bell pepper",
      "onion",
      "garlic",
      "vegetable broth",
      "olive oil",
      "thyme",
    ],
    categories: ["Lunch", "Vegetarian", "Vegan", "Takes Time"],
    image_url:
      "https://loremflickr.com/800/600/roasted,vegetable,soup?lock=315",
  },
  {
    name: "Chicken Fried Rice",
    description:
      "Chicken fried rice is an efficient way to turn cooked rice into a complete meal with chicken, eggs, vegetables, garlic, and soy sauce. The rice is fried over high heat so individual grains remain separated while absorbing the savory sauce. Carrots, peas, and spring onions add color and texture, making this a practical and satisfying dinner.",
    snippet: "Fried rice with chicken, vegetables, egg, and soy sauce.",
    time: 25,
    ingredients: [
      "rice",
      "chicken breast",
      "egg",
      "peas",
      "carrot",
      "spring onion",
      "soy sauce",
      "sesame oil",
    ],
    categories: ["Dinner", "Chicken", "Fast"],
    image_url: "https://loremflickr.com/800/600/chicken,fried,rice?lock=316",
  },
  {
    name: "Spinach Ricotta Stuffed Shells",
    description:
      "Spinach ricotta stuffed shells are large pasta shells filled with creamy ricotta, spinach, Parmesan, and herbs before being covered with tomato sauce and baked with mozzarella. The pasta becomes tender while the cheese filling stays rich and creamy. It is a comforting vegetarian dish that is especially good for family dinners or meal preparation.",
    snippet: "Baked pasta shells filled with spinach, ricotta, and cheese.",
    time: 65,
    ingredients: [
      "pasta shells",
      "ricotta",
      "spinach",
      "Parmesan",
      "mozzarella",
      "tomato sauce",
      "garlic",
      "oregano",
    ],
    categories: ["Dinner", "Vegetarian", "Takes Time"],
    image_url:
      "https://loremflickr.com/800/600/stuffed,shells,spinach,ricotta?lock=317",
  },
  {
    name: "Turkey Meatballs",
    description:
      "These turkey meatballs are tender, flavorful, and lighter than traditional beef versions while still being satisfying. Ground turkey is mixed with breadcrumbs, Parmesan, garlic, herbs, and egg before the meatballs are baked or browned and finished in tomato sauce. They work well with spaghetti, rice, mashed potatoes, or roasted vegetables.",
    snippet: "Tender turkey meatballs served with a rich tomato sauce.",
    time: 45,
    ingredients: [
      "ground turkey",
      "breadcrumbs",
      "Parmesan",
      "egg",
      "garlic",
      "parsley",
      "tomato sauce",
    ],
    categories: ["Dinner", "Fast"],
    image_url:
      "https://loremflickr.com/800/600/turkey,meatballs,tomato?lock=318",
  },
  {
    name: "Peanut Butter Banana Toast",
    description:
      "Peanut butter banana toast is a simple breakfast that combines toasted bread with creamy peanut butter, sliced banana, cinnamon, and a drizzle of honey. The warm toast provides a crisp base while the banana becomes soft and naturally sweet. It takes only a few minutes to prepare and makes a convenient breakfast when you want something filling without cooking a full meal.",
    snippet: "Crispy toast topped with peanut butter, banana, and cinnamon.",
    time: 10,
    ingredients: ["bread", "peanut butter", "banana", "cinnamon", "honey"],
    categories: ["Breakfast", "Sweet", "Fast"],
    image_url:
      "https://loremflickr.com/800/600/banana,peanut,butter,toast?lock=319",
  },
  {
    name: "Creamy Seafood Pasta",
    description:
      "Creamy seafood pasta combines spaghetti or linguine with shrimp, mussels, garlic, cream, lemon, and herbs. The seafood cooks quickly and adds a naturally rich flavor to the sauce, while lemon keeps the dish from becoming too heavy. This recipe works particularly well for a weekend dinner when you want something that feels restaurant-inspired but remains straightforward to prepare.",
    snippet: "Creamy pasta with shrimp, seafood, garlic, lemon, and herbs.",
    time: 35,
    ingredients: [
      "linguine",
      "shrimp",
      "mussels",
      "cream",
      "garlic",
      "lemon",
      "parsley",
      "Parmesan",
    ],
    categories: ["Dinner", "Fish"],
    image_url: "https://loremflickr.com/800/600/seafood,pasta,shrimp?lock=320",
  },
  {
    name: "Lentil Shepherd's Pie",
    description:
      "Lentil Shepherd's Pie is a hearty vegetarian version of the classic comfort food. Lentils are cooked with carrots, peas, onions, mushrooms, and a rich vegetable gravy before being covered with creamy mashed potatoes. The topping becomes golden and slightly crisp in the oven while the filling remains warm and savory underneath.",
    snippet: "Hearty lentil and vegetable filling topped with mashed potatoes.",
    time: 70,
    ingredients: [
      "lentils",
      "potatoes",
      "carrot",
      "peas",
      "mushrooms",
      "onion",
      "vegetable broth",
      "butter",
    ],
    categories: ["Dinner", "Vegetarian", "Takes Time"],
    image_url: "https://loremflickr.com/800/600/lentil,shepherds,pie?lock=321",
  },
  {
    name: "Chocolate Brownies",
    description:
      "These chocolate brownies are rich, fudgy, and packed with deep cocoa flavor. Butter and dark chocolate create a dense texture while sugar and vanilla balance the bitterness of the cocoa. The brownies are baked just until the center is set, keeping them moist rather than cakey. They are excellent served plain or with vanilla ice cream.",
    snippet: "Rich fudgy brownies with intense chocolate flavor.",
    time: 40,
    ingredients: [
      "dark chocolate",
      "butter",
      "sugar",
      "flour",
      "cocoa powder",
      "eggs",
      "vanilla",
    ],
    categories: ["Dessert", "Sweet"],
    image_url:
      "https://loremflickr.com/800/600/chocolate,brownies,dessert?lock=322",
  },
  {
    name: "Blueberry Cheesecake",
    description:
      "Blueberry cheesecake combines a creamy baked cheese filling with a buttery biscuit base and a generous blueberry topping. The contrast between the smooth cheesecake and the slightly tart berries makes the dessert balanced rather than overly sweet. It requires some chilling time, but the result is an impressive dessert that can easily be prepared a day before serving.",
    snippet: "Creamy cheesecake with a buttery base and blueberry topping.",
    time: 90,
    ingredients: [
      "cream cheese",
      "biscuits",
      "butter",
      "sugar",
      "eggs",
      "blueberries",
      "vanilla",
      "lemon",
    ],
    categories: ["Dessert", "Sweet", "Takes Time"],
    image_url:
      "https://loremflickr.com/800/600/blueberry,cheesecake,dessert?lock=323",
  },
  {
    name: "Crispy Fish Tacos",
    description:
      "Crispy fish tacos feature seasoned fish coated in a light crunchy crust and served inside warm tortillas with cabbage, tomato, lime, and a creamy sauce. The combination of crispy fish, fresh vegetables, and acidic lime creates plenty of contrast. They are quick enough for a weekday dinner and can be adjusted easily with different toppings.",
    snippet: "Crispy fish tacos with cabbage, lime, vegetables, and sauce.",
    time: 30,
    ingredients: [
      "white fish",
      "tortillas",
      "cabbage",
      "tomato",
      "lime",
      "flour",
      "breadcrumbs",
      "sour cream",
    ],
    categories: ["Dinner", "Fish", "Fast"],
    image_url: "https://loremflickr.com/800/600/fish,tacos,crispy?lock=324",
  },
  {
    name: "Vegetable Moussaka",
    description:
      "Vegetable moussaka layers roasted eggplant and potatoes with a rich tomato and vegetable filling before being finished with a creamy béchamel sauce. The casserole is baked until the top becomes golden and bubbling while the vegetables underneath become tender and flavorful. It takes some preparation but makes an excellent hearty vegetarian dinner.",
    snippet: "Layered eggplant and potato casserole with creamy béchamel.",
    time: 80,
    ingredients: [
      "eggplant",
      "potatoes",
      "tomatoes",
      "zucchini",
      "onion",
      "garlic",
      "milk",
      "flour",
      "cheese",
    ],
    categories: ["Dinner", "Vegetarian", "Takes Time"],
    image_url:
      "https://loremflickr.com/800/600/vegetable,moussaka,eggplant?lock=325",
  },
  {
    name: "Beef Chili",
    description:
      "This hearty beef chili combines ground beef with kidney beans, tomatoes, peppers, onions, and warming spices. Long simmering allows the flavors to develop and creates a thick, rich consistency that works perfectly with rice, bread, or tortilla chips. The recipe can easily be made milder or hotter depending on the amount of chili used.",
    snippet: "Hearty ground beef chili with beans, tomatoes, and spices.",
    time: 60,
    ingredients: [
      "ground beef",
      "kidney beans",
      "tomatoes",
      "bell pepper",
      "onion",
      "garlic",
      "chili powder",
      "cumin",
    ],
    categories: ["Dinner", "Beef", "Takes Time"],
    image_url: "https://loremflickr.com/800/600/beef,chili,beans?lock=326",
  },
  {
    name: "Greek Chicken Skewers",
    description:
      "Greek chicken skewers are made with pieces of chicken marinated in olive oil, lemon, garlic, oregano, and herbs before being grilled or roasted until lightly charred. The marinade keeps the chicken flavorful and juicy while adding a fresh Mediterranean character. Serve the skewers with pita, tzatziki, salad, or roasted potatoes.",
    snippet: "Mediterranean chicken skewers with lemon, garlic, and oregano.",
    time: 40,
    ingredients: [
      "chicken breast",
      "lemon",
      "olive oil",
      "garlic",
      "oregano",
      "yogurt",
      "cucumber",
      "pita",
    ],
    categories: ["Dinner", "Chicken"],
    image_url: "https://loremflickr.com/800/600/greek,chicken,skewers?lock=327",
  },
  {
    name: "Vegan Coconut Noodle Soup",
    description:
      "Vegan coconut noodle soup combines rice noodles with coconut milk, vegetable broth, mushrooms, carrots, spinach, garlic, ginger, and warming spices. The broth is creamy but remains fresh thanks to lime juice and herbs. It is comforting enough for cold evenings while still being quick to prepare, making it a practical plant-based dinner.",
    snippet: "Creamy vegan coconut noodle soup with vegetables and lime.",
    time: 30,
    ingredients: [
      "rice noodles",
      "coconut milk",
      "vegetable broth",
      "mushrooms",
      "carrot",
      "spinach",
      "ginger",
      "lime",
    ],
    categories: ["Dinner", "Vegan", "Fast"],
    image_url:
      "https://loremflickr.com/800/600/coconut,noodle,soup,vegan?lock=328",
  },
  {
    name: "Apple Cinnamon French Toast",
    description:
      "Apple cinnamon French toast combines golden slices of egg-soaked bread with warm cinnamon apples and a little maple syrup. The bread becomes crisp around the edges while remaining soft in the center, and the cooked apples add natural sweetness and a pleasant texture. It is an excellent weekend breakfast when you want something more indulgent.",
    snippet: "Golden French toast topped with warm cinnamon apples.",
    time: 25,
    ingredients: [
      "bread",
      "eggs",
      "milk",
      "apples",
      "cinnamon",
      "butter",
      "maple syrup",
      "vanilla",
    ],
    categories: ["Breakfast", "Sweet", "Fast"],
    image_url:
      "https://loremflickr.com/800/600/french,toast,apple,cinnamon?lock=329",
  },
  {
    name: "Roasted Garlic Potato Wedges",
    description:
      "Roasted garlic potato wedges are crisp on the outside and soft in the center, with plenty of flavor from garlic, paprika, herbs, and olive oil. The potatoes are roasted at high heat to develop browned edges while the inside stays fluffy. They make an excellent side dish for burgers, chicken, grilled vegetables, or almost any hearty main course.",
    snippet: "Crispy roasted potato wedges with garlic, herbs, and paprika.",
    time: 50,
    ingredients: [
      "potatoes",
      "garlic",
      "olive oil",
      "paprika",
      "rosemary",
      "salt",
      "black pepper",
    ],
    categories: ["Vegetarian", "Vegan", "Salty"],
    image_url:
      "https://loremflickr.com/800/600/roasted,potato,wedges,garlic?lock=330",
  },
];
