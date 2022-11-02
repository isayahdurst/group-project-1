"use strict";

const apiKey = "3fe9c7b3838b43f59e74004c2179d228";
const complexSearchURL = "https://api.spoonacular.com/recipes/complexSearch?";
const baseURL = "https://api.spoonacular.com/";

// date/time object from luxon.
const dt = luxon.DateTime;

// List of diets that can be specified in meal plan API request:
// Enter as diet @param in API request (ex. https://foodapi?diet=diets.glutenFree)
// Options sourced from https://spoonacular.com/food-api/docs#Diets

/* Modal */
const preferenceModal = document.querySelector(".pref-modal");
const overlay = document.querySelector(".overlay");

/* Modal Buttons */
const closeModalBtn = document.querySelector(".close-modal");
const editPreferencesBtn = document.querySelector(".show-modal");

/* Preference Modal Buttons */
const dietsBtn = document.querySelector("#pref-diets");
const cuisineBtn = document.querySelector("#pref-cuisines");
const intoleranceBtn = document.querySelector("#pref-intolerances");
const ingredientsBtn = document.querySelector("#pref-ingredients");

/* Preference Options */
const mainPreferenceOptions = document.querySelector(".preference-options");
const preferenceItems = document.querySelector(".preference-items");

/* Main Page (With Dates and Meal Cards) */
const mainPage = document.querySelector(".main-page");
const loadingScreen = document.getElementById("cover-screen");
let mealCardClicked;

/* Meal Page */
const mealPage = document.querySelector(".meal-page");
const mealBackButton = document.querySelector(".meal-back-button");
const mealReplaceButton = document.querySelector(".meal-replace-button");
const mealFavoritesButton = document.querySelector(".meal-favorite-button");

/* Main Page */
const dateButtons = document.querySelectorAll(".date-btn");
const mealCards = document.querySelectorAll(".recipe-card");
const mealImgList = document.querySelectorAll(".recipe-image");
const mealTitleList = document.querySelectorAll(".recipe-title");
const mealDietList = document.querySelectorAll(".recipe-diets");
const refreshMealPlanBtn = document.querySelector(".refresh-meal-plan");

/* Favorites Page */
const favoritesPage = document.getElementById("favorites-page");
let favoritesCards = document.querySelectorAll(".fav-recipe-card");
const favoritesBtn = document.getElementById("favorites-button");
const favoritesBackBtn = document.querySelector(".fav-meal-back-button");
let favoritesStatus = false;

/* Welcome Page (pre-sign-in/sign-up)*/
const welcomePage = document.querySelector(".welcome-page");

/* Nav Bar */
const logoutBtn = document.querySelector("#logout");
const userInfoBtn = document.querySelector("#user-info");
const usernameCredential = document.querySelector(".user-username");
const passwordCredential = document.querySelector(".user-password");

const diets = {
  noPreference: "No Preference",
  glutenFree: "Gluten Free",
  ketogenic: "Ketogenic",
  vegetarian: "Vegetarian",
  lactoVegetarian: "Lacto Vegetarian",
  ovoVegetarian: "Ovo-Vegetarian",
  vegan: "Vegan",
  pescetarian: "Pescetarian",
  paleo: "Paleo",
  primal: "Primal",
  lowFODMAP: "Low FODMAP",
  whole30: "Whole30",
  toInclude: [],
};

// cuisines can be added or removed from search.
const cuisines = {
  african: "African",
  american: "American",
  british: "British",
  cajun: "Cajun",
  carribbean: "Carribbean",
  chinese: "Chinese",
  easternEuropean: "Eastern European",
  european: "European",
  french: "French",
  german: "German",
  greek: "Greek",
  indian: "Indian",
  irish: "Irish",
  italian: "Italian",
  japanese: "Japanese",
  jewish: "Jewish",
  korean: "Korean",
  latinAmerican: "Latin American",
  mediterranean: "Mediterranean",
  mexican: "Mexican",
  middleEastern: "Middle Eastern",
  nordic: "Nordic",
  southern: "Southern",
  spanish: "Spanish",
  thai: "Thai",
  vietnamese: "Vietnamese",
  toExclude: [],
};

// Search API can filter intolerances.

const intolerances = {
  dairy: "Dairy",
  egg: "Egg",
  gluten: "Gluten",
  grain: "Grain",
  peanut: "Peanut",
  seafood: "Seafood",
  sesame: "Sesame",
  shellfish: "Shellfish",
  soy: "Soy",
  sulfite: "Sulfite",
  treeNut: "Tree Nut",
  wheat: "Wheat",
  toInclude: [],
};

let  favoriteMeals = [];

// API pull URL
const urlAPI = "https://api.spoonacular.com/recipes/complexSearch/";

// mealType object that allows you to select breakfast or lunch/dinner options in the API call
const mealType = {
  breakfast: "breakfast,morning meal,brunch",
  lunchDinner: "lunch,dinner,main course,main dish,side dish",
};

// To generate a weekly meal plan, Spoonacular needs to have a username/password/hash generated
// for each individual user. We can't store that information on a server (yet) but
// we can store that inside of localStorage on their machine. That's the plan.
// LINK TO DOCS: https://spoonacular.com/food-api/docs#Get-Meal-Plan-Week

// Opens Preference Modal and activates overlay
const openPrefModal = function () {
  window.scrollTo(0, 0);
  preferenceModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

// Closes Preference Modal and deactivates overlay
const closePrefModal = function () {
  window.scrollTo(0, 0);
  preferenceModal.classList.add("hidden");
  overlay.classList.add("hidden");
};

// Establishes a user account with Spoonacular based on params.
const connectUser = async function (userName, firstName, lastName, email) {
  const response = await fetch(
    `https://api.spoonacular.com/users/connect?apiKey=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userName,
        firstName: firstName,
        lastName: lastName,
        email: email,
      }),
    }
  );

  const userData = await response.json();

  const userInfo = {
    username: userData.username,
    password: userData.spoonacularPassword,
    hash: userData.hash,
  };

  localStorage.setItem("userInfo", JSON.stringify(userInfo));
};

// Retrieves user's Spoonacular credentials from localStorage
const getUserInfo = function () {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo;
};

// Adds or removes active class from preferance buttons depending on whether they are clicked or not.
const setActiveButton = function (activeButton) {
  [dietsBtn, cuisineBtn, intoleranceBtn, ingredientsBtn].forEach(function (
    button
  ) {
    if (button != activeButton) {
      button.classList.remove("active");
    } else {
      button.classList.add("active");
    }
  });
};

// Saves preferences to local storage.
const savePreferences = function () {
  localStorage.setItem(
    "userPreferances",
    JSON.stringify({
      dietsPref: diets.toInclude,
      intolerancesPref: intolerances.toInclude,
      cuisinePref: cuisines.toExclude,
    })
  );
};

// Loads preferences from local storage.
const loadPreferences = function () {
  if (localStorage.getItem("userPreferances")) {
    const { dietsPref, cuisinePref, intolerancesPref } = JSON.parse(
      localStorage.getItem("userPreferances")
    );
    diets.toInclude = dietsPref;
    cuisines.toExclude = cuisinePref;
    intolerances.toInclude = intolerancesPref;
  }
  return diets.toInclude;
};

loadPreferences();

// Formats preferences/diets/cuisines/intolerances lists into API call format
const generateAPICallURL = function (numResults, mealTypeString) {
  //mealType is an object with keys of breakfast or lunchDinner

  const addRecipeInformationP = "addRecipeInformation=true";
  const addRecipeNutritionP = "addRecipeNutrition=true";
  const instructionsRequiredP = "instructionsRequired=true";
  const includeIngredients = "fillIngredients=true";
  const numberP = `number=${numResults}`;
  const typeP = `type=${mealTypeString}`;
  const sort = "sort=random";
  const apiKeyP = `apiKey=${apiKey}`;

  // Generate string for excludeCuisine
  let excludeCuisineP = "excludeCuisine=" + cuisines.toExclude.join(",");

  // Generate string for diet -- commas in the search represent AND. e.g. paleolithic,gluten free = paleolithic AND gluten free
  let dietP = "diet=" + diets.toInclude.join(",");

  // Generate string for intolerances -- commas in the search represent AND. e.g. egg,dairy = egg AND dairy
  let intolerancesP = "intolerances=" + intolerances.toInclude.join(",");

  let finalURL = `${urlAPI}?${addRecipeInformationP}&${sort}&${includeIngredients}&${addRecipeNutritionP}&${instructionsRequiredP}&${typeP}&${numberP}&${excludeCuisineP}&${dietP}&${intolerancesP}&${apiKeyP}`;
  finalURL = encodeURI(finalURL);

  return finalURL;
};

// Checks to see if a full day has passed since the meal plan was created. If so, remove the current days meal plan, shift all meal plans over by one day, then add a new day's meals
const checkIfDayPassed = async function () {
  //Get lastUpdatedDate from localStorage and check to see if there is a difference in date. If not, exit the function
  const lastUpdatedRawDate = JSON.parse(
    localStorage.getItem("lastUpdatedDate")
  );
  const lastUpdatedDate = dt.fromMillis(lastUpdatedRawDate, {
    zone: "America/Los_Angeles",
  });
  const todaysDate = dt.local({ zone: "America/Los_Angeles" });

  if (
    (todaysDate.c.year - lastUpdatedDate.year) * 365 +
      (todaysDate.c.month - lastUpdatedDate.month) * 30 +
      (todaysDate.c.day - lastUpdatedDate.day) <=
    0
  ) {
    return;
  }

  //If at least one day has passed since the last meal plan update, update meal plan so that each new day has a meal plan
  let mealPlanTable = await getMealPlan();
  let numDaysToAdd = 7 - mealPlanTable.days.length;
  let newMealPlanTable = [];
  console.log(numDaysToAdd);

  // Generate new recipes and add them to the list -- Code from initializeMealPlan() ----------------------------------------------
  const breakfastRecipes = await getRecipe(numDaysToAdd, mealType.breakfast);
  const mainRecipes = await getRecipe(numDaysToAdd * 2, mealType.lunchDinner);
  let latestTime = todaysDate + 86400000 * (7 - numDaysToAdd); // 7 - numDaysToAdd gives you the index of the first day that needs a new meal in an array of 7 days
  let timeInterval = 0;

  breakfastRecipes.results.forEach(function (meal, index) {
    localStorage.setItem(meal.id, JSON.stringify(meal));
    newMealPlanTable.push({
      date: latestTime / 1000 + timeInterval,
      slot: 1,
      position: 1,
      type: "RECIPE",
      value: {
        id: meal.id,
        servings: meal.servings,
        title: meal.title,
        imageType: meal.imageType,
      },
    });
    timeInterval += 86400;
  });

  timeInterval = 1;

  mainRecipes.results.forEach(function (meal, index) {
    localStorage.setItem(meal.id, JSON.stringify(meal));
    index % 2 === 0 ? (timeInterval = (index / 2) * 86_400) : null; // Adds 1 day to date, only on every other iteration.

    newMealPlanTable.push({
      date: latestTime / 1000 + timeInterval,
      slot: index % 2 === 0 ? 2 : 3, // Alternates slot positions between lunch and dinner for each item
      position: index % 2 === 0 ? 2 : 3, // Alternates positions of meals evenly
      type: "RECIPE",
      value: {
        id: meal.id,
        servings: meal.servings,
        title: meal.title,
        imageType: meal.imageType,
      },
    });
  });

  const { username, hash } = JSON.parse(localStorage.getItem("userInfo")); //gets username and hash from localStorage
  const mealURL = `https://api.spoonacular.com/mealplanner/${username}/items?hash=${hash}&apiKey=${apiKey}`;

  const response = await fetch(mealURL, {
    // Sends Meal Plan to Spoonacular
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newMealPlanTable),
  });

  console.log(response);

  localStorage.setItem("lastUpdatedDate", JSON.stringify(dt.now().ts)); // Set last updated date with the current date
};

// Populates each preference category (i.E. Diets, Cuisines, Intolerances) with preference options.
const generatePreferenceOptions = function (option) {
  preferenceItems.innerHTML = "";
  for (let [key, value] of Object.entries(option)) {
    if (key != "toInclude" && key != "toExclude") {
      const item = document.createElement("button");
      item.setAttribute("data-key", key);
      item.textContent = value;
      if (key === "noPreference" && diets.toInclude.length === 0) {
        item.style.backgroundColor = "var(--active-preference)";
      } else if (key === "noPreference" && diets.toInclude.length > 0) {
        item.style.backgroundColor = "var(--inactive-preference)";
      }

      if (option === diets) {
        diets.toInclude.forEach(function (diet) {
          if (diet === value) {
            item.style.backgroundColor = "var(--active-preference)";
          }
        });
      } else if (option === cuisines) {
        item.style.backgroundColor = "var(--active-preference)";
        cuisines.toExclude.forEach(function (cuisine) {
          if (cuisine === value) {
            item.style.backgroundColor = "var(--inactive-preference";
          }
        });
      } else if (option === intolerances) {
        intolerances.toInclude.forEach(function (intolerance) {
          if (intolerance === value) {
            item.style.backgroundColor = "var(--active-preference";
          }
        });
      }
      preferenceItems.appendChild(item);
    }
  }
};

mainPreferenceOptions.addEventListener("click", function (event) {
  console.log(event.target);
  if (event.target === dietsBtn) {
    setActiveButton(dietsBtn);
    generatePreferenceOptions(diets);
  } else if (event.target === cuisineBtn) {
    setActiveButton(cuisineBtn);
    generatePreferenceOptions(cuisines);
  } else if (event.target === intoleranceBtn) {
    setActiveButton(intoleranceBtn);
    generatePreferenceOptions(intolerances);
  }
});

preferenceItems.addEventListener("click", function (event) {
  const target = event.target;
  if (target.tagName.toLowerCase() === "button") {
    [dietsBtn, cuisineBtn, intoleranceBtn, ingredientsBtn].forEach(function (
      value
    ) {
      if (value.classList.contains("active")) {
        if (value === dietsBtn) {
          if (
            diets.toInclude.includes(diets[target.getAttribute("data-key")])
          ) {
            diets.toInclude = diets.toInclude.filter(
              (value) => value != diets[target.getAttribute("data-key")]
            );
            target.style.backgroundColor = "var(--inactive-preference";
          } else {
            diets.toInclude.push(diets[target.getAttribute("data-key")]);
            target.style.backgroundColor = "var(--active-preference)";
          }
        } else if (value === cuisineBtn) {
          if (
            cuisines.toExclude.includes(
              cuisines[target.getAttribute("data-key")]
            )
          ) {
            cuisines.toExclude = cuisines.toExclude.filter(
              (value) => value != cuisines[target.getAttribute("data-key")]
            );
            target.style.backgroundColor = "var(--active-preference";
          } else {
            cuisines.toExclude.push(cuisines[target.getAttribute("data-key")]);
            target.style.backgroundColor = "var(--inactive-preference)";
          }
        } else if (value === intoleranceBtn) {
          if (
            intolerances.toInclude.includes(
              intolerances[target.getAttribute("data-key")]
            )
          ) {
            intolerances.toInclude = intolerances.toInclude.filter(
              (value) => value != intolerances[target.getAttribute("data-key")]
            );
            target.style.backgroundColor = "var(--inactive-preference";
          } else {
            intolerances.toInclude.push(
              intolerances[target.getAttribute("data-key")]
            );
            target.style.backgroundColor = "var(--active-preference)";
          }
        }
      }
    });
    savePreferences();
    // console.log(cuisines.toExclude);
  }
});

//editPreferencesBtn.addEventListener("click", openPrefModal);
closeModalBtn.addEventListener("click", closePrefModal);
overlay.addEventListener("click", closePrefModal);

// Defaults Modal to display diet info.
generatePreferenceOptions(diets);

/* Gets a specified number of recipes based on user preferences and the type of meal requested */
const getRecipe = async function (number, mealType) {
  const response = await fetch(generateAPICallURL(number, mealType));
  const recipe = await response.json();

  return recipe;
  // This method will return a recipe.
};

// Gets the current meal plan in the user's Spoonacular profile
const getMealPlan = async function () {
  const { username, hash } = JSON.parse(localStorage.getItem("userInfo"));
  const creationDate = dt
    .local({ zone: "America/Los_Angeles" })
    .toFormat("yyyy-MM-dd");
  const mealPlanURL = `https://api.spoonacular.com/mealplanner/${username}/week/${creationDate}?hash=${hash}&apiKey=${apiKey}`;

  const response = await fetch(mealPlanURL);
  const mealPlan = await response.json();

  return mealPlan;
};

/* Initial Weekly Meal Plan Generation
Function generates 21 meals and assigns 1 breakfast and 2 regular meals for each day based on user prefereneces.
This covers 7 full days and is the initial meal plan for the user.
Meal Plan Data is sent to Spoonacular and stored in their DB. Info can be retreived with GET MEAL PLAN WEEK API Call.
Recipes returned are saved in local storage. */
const initializeMealPlan = async function () {
  const breakfastRecipes = await getRecipe(7, mealType.breakfast);
  const mainRecipes = await getRecipe(14, mealType.lunchDinner);
  const mealPlan = [];
  let timeInterval = 0;

  breakfastRecipes.results.forEach(function (meal, index) {
    localStorage.setItem(meal.id, JSON.stringify(meal));
    mealPlan[index] = {
      date: Math.floor(dt.now().ts / 1000) - 25200 + timeInterval,
      slot: 1,
      position: 1,
      type: "RECIPE",
      value: {
        id: meal.id,
        servings: meal.servings,
        title: meal.title,
        imageType: meal.imageType,
      },
    };
    timeInterval += 86400;
  });

  timeInterval = 1;

  mainRecipes.results.forEach(function (meal, index) {
    localStorage.setItem(meal.id, JSON.stringify(meal));
    index % 2 === 0 ? (timeInterval = (index / 2) * 86_400) : null; // Adds 1 day to date, only on every other iteration.
    mealPlan.push({
      date: Math.floor(dt.now().ts / 1000) - 25200 + timeInterval,
      slot: index % 2 === 0 ? 2 : 3, // Alternates slot positions between lunch and dinner for each item
      position: index % 2 === 0 ? 2 : 3, // Alternates positions of meals evenly
      type: "RECIPE",
      value: {
        id: meal.id,
        servings: meal.servings,
        title: meal.title,
        imageType: meal.imageType,
      },
    });
  });

  const { username, hash } = JSON.parse(localStorage.getItem("userInfo")); //gets username and hash from localStorage
  const mealURL = `https://api.spoonacular.com/mealplanner/${username}/items?hash=${hash}&apiKey=${apiKey}`;

  const response = await fetch(mealURL, {
    // Sends Meal Plan to Spoonacular
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mealPlan),
  });

  console.log(response);
};

/* Hides main menu and displays meal page with summary, ingredients, and recipe */
const openMealPage = function () {
  window.scrollTo(0, 0);
  mainPage.classList.add("hidden");
  mealPage.classList.remove("hidden");
};

/* Hides meal page and displays main menu */
const closeMealPage = function () {
  window.scrollTo(0, 0);
  if(favoritesStatus){
    favoritesPage.classList.remove('hidden')
  }
  else{
    mainPage.classList.remove("hidden");
  }
  mealPage.classList.add("hidden");
};

// Retrieves recipe information given a recipe ID
const getRecipeInformation = async function (recipeID) {
  const URL = `https://api.spoonacular.com/recipes/${recipeID}/information?includeNutrition=true&apiKey=${apiKey}`;
  const response = await fetch(URL);
  const recipeInfo = await response.json();
  return recipeInfo;
};

// This function constructs the meal page with appropriate data. Needs recipe ID as parameter.

const renderMealPage = async function (recipeID) {
  openMealPage();

  /*Meal Page DOM Elements*/
  const mealTitle = document.querySelector(".meal-title");
  const mealImage = document.querySelector(".meal-image");
  const mealSummary = document.querySelector("#meal-summary");
  const cookTime = document.querySelector(".cooking-time");
  const nutritionInfo = document.querySelector(".nutrition-information");

  // IF/ELSE statement: IF recipeID is in localStorage, recipe is pulled from localStorage. Otherwise, recipe is called from spoonacular API using getRecipeInformation() function.
  const recipe =
    localStorage.getItem(recipeID) != undefined
      ? JSON.parse(localStorage.getItem(recipeID))
      : await getRecipeInformation(recipeID);

  // if recipe not in local storage, it is saved there.
  localStorage.setItem(recipeID, JSON.stringify(recipe));

  // Adds recipeID attribute to replace meal button
  mealReplaceButton.setAttribute("data-recipeID", recipe.id);
  mealFavoritesButton.setAttribute("data-recipeID", recipe.id);

  // Starts setting page DOM elements to recipe properties
  mealTitle.innerHTML = recipe.title;
  mealImage.style.backgroundImage = `url(https://spoonacular.com/recipeImages/${recipeID}-636x393.${recipe.imageType})`;
  mealSummary.innerHTML = recipe.summary;

  // Displays cook time as Hrs & Minutes
  cookTime.innerHTML = `${Math.floor(recipe.readyInMinutes / 60)} Hours & ${
    recipe.readyInMinutes % 60
  } Minutes`;

  // Loops through recipe nutrition info and adds it to nutrition per serving
  nutritionInfo.innerHTML = "";
  for (const nutrient of recipe.nutrition.nutrients) {
    const name = nutrient.name;
    const amount = nutrient.amount;
    const unit = nutrient.unit;

    nutritionInfo.insertAdjacentHTML(
      "beforeend",
      `${amount}${unit} ${name} | \n`
    );
  }

  const tagList = document.querySelector(".tag-list");
  tagList.innerHTML = "";
  for (const tag of recipe.diets) {
    const item = document.createElement("li");
    item.classList.add("tag-item");
    item.textContent = tag;
    tagList.appendChild(item);
  }

  // Loops through recipe ingredients and creates necessary elements on page
  const ingredientsList = document.querySelector(".meal-required-ingredients");
  ingredientsList.innerHTML = "";
  for (const ingredient of recipe.extendedIngredients) {
    const name = ingredient.name;
    const amount = ingredient.amount;
    const unit = ingredient.unit;
    const imageSrc = `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`;

    const listItem = document.createElement("li");
    listItem.classList.add("meal-ingredient-item");
    ingredientsList.appendChild(listItem);

    const imageDiv = document.createElement("div");
    imageDiv.classList.add("image-slot");
    listItem.appendChild(imageDiv);

    const image = document.createElement("img");
    image.src = imageSrc;
    image.alt, (image.title = name);
    image.classList.add("meal-ingredient-image");
    imageDiv.appendChild(image);

    const ingredientTitle = document.createElement("div");
    ingredientTitle.classList.add("meal-ingredient-name");
    ingredientTitle.innerHTML = `${amount} ${unit} ${name}`;
    listItem.appendChild(ingredientTitle);
  }

  // Loops through recipe steps and creates necessary elements on page.
  const recipeSteps = recipe.analyzedInstructions[0].steps;
  const instructions = document.querySelector(".meal-recipe-list");
  instructions.innerHTML = "";
  for (const step of recipeSteps) {
    const card = document.createElement("li");
    card.classList.add("meal-recipe-step-card");
    instructions.appendChild(card);

    const stepNumber = document.createElement("div");
    stepNumber.classList.add("meal-recipe-step-number");
    stepNumber.innerHTML = step.number;
    card.appendChild(stepNumber);

    const recipeStep = document.createElement("div");
    recipeStep.classList.add("meal-recipe-step");
    recipeStep.innerHTML = step.step;
    card.appendChild(recipeStep);
  }

  const humorAPIKey = "39858bcfa42d43b98022080ba8c19567";
  const humorBaseURL = "https://api.humorapi.com";
  const randomJokePath = "/jokes/random";
  const excludeJokes =
    "Clean,Relatioship,School,Animal,Deep Thoughts,Jewish,Dark,Racist,Sexual,One Liner,Insults,Knock Knock,Political,Sexist,Sport,Chuck Norris,Holiday,Blondes,Yo Momma,Analogy,Law,NSFW,Christmas,Nerdy,Religious,Kids";
  const maxLength = "240";
  const generateJoke = async function () {
    const response = await fetch(
      encodeURI(
        `${humorBaseURL}${randomJokePath}?include-tags=food&exclude-tags=${excludeJokes}&max-length=${maxLength}&api-key=${humorAPIKey}`
      )
    );
    const joke = await response.json();
    const jokeEl = document.querySelector(".joke");
    jokeEl.textContent = joke.joke;
  };

  generateJoke();
};

//renderMealPage(655186);

// Evemt listener closes meal page and returns to the main page.
mealBackButton.addEventListener("click", function(){
  mealReplaceButton.classList.remove("hidden");
  mealFavoritesButton.classList.remove("hidden");
  closeMealPage();
});

// Initialize function
const init = async function () {
  // Set Interval of 10 minutes to see if a new day is here and the meal plan needs to be updated
  checkIfDayPassed();
  setTimeout(function () {
    checkIfDayPassed();
    init();
  }, 600000);
};

const replaceMeal = async function (recipeID) {
  loadingScreen.classList.remove("hidden");

  const meal = JSON.parse(localStorage.getItem(recipeID));
  const dishType = await meal.dishTypes;
  let replacedDishType;

  for (const type of mealType.breakfast.split(",")) {
    if (dishType.includes(type)) {
      replacedDishType = mealType.breakfast;
    }
  }

  for (const type of mealType.lunchDinner.split(",")) {
    if (dishType.includes(type)) {
      replacedDishType = mealType.lunchDinner;
    }
  }

  const newMeal = await getRecipe(1, replacedDishType);
  localStorage.setItem(
    newMeal.results[0].id,
    JSON.stringify(newMeal.results[0])
  );

  mealCardClicked.dataset.idrecipe = newMeal.results[0].id; //set the clicked mealCard to have the newRecipeId

  //Check all date buttons and replace the old recipe ID with the newRecipeID
  let dateIndexRemoved = 0;
  let dateTs;
  let newMealPlan = [];

  dateButtons.forEach(function (dateBtn) {
    switch (recipeID) {
      case dateBtn.dataset.idbreakfast:
        dateBtn.dataset.idbreakfast = newMeal.results[0].id;
        dateTs = dateBtn.dataset.datets;
        dateIndexRemoved = dateBtn.dataset.index;
        break;
      case dateBtn.dataset.idlunch:
        dateBtn.dataset.idlunch = newMeal.results[0].id;
        dateTs = dateBtn.dataset.datets;
        dateIndexRemoved = dateBtn.dataset.index;
        break;
      case dateBtn.dataset.iddinner:
        dateBtn.dataset.iddinner = newMeal.results[0].id;
        dateTs = dateBtn.dataset.datets;
        dateIndexRemoved = dateBtn.dataset.index;
        break;
      default:
    }
  });

  // Build the deleted day's meal plan by first copying over all data from the day that was deleted
  const oldMealPlan = await getMealPlan();
  await deleteMealPlanDay(dateTs);
  console.log(dateIndexRemoved);

  const deletedDay = oldMealPlan.days[dateIndexRemoved];
  for (let i = 0; i < deletedDay.items.length; i++) {
    const meal = deletedDay.items[i];

    newMealPlan.push({
      date: deletedDay.date,
      slot: meal.slot,
      position: meal.position,
      type: "RECIPE",
      value: {
        id: meal.value.id,
        servings: meal.value.servings,
        title: meal.value.title,
        imageType: meal.value.imageType,
      },
    });
  }

  // Replace the data of the meal that was replaced
  let deletedDayIndex = 0;
  switch (
    mealCardClicked.children[1].children[0].children[0].children[0].textContent
  ) {
    case "BREAKFAST":
      deletedDayIndex = 0;
      break;
    case "LUNCH":
      deletedDayIndex = 1;
      break;
    case "DINNER":
      deletedDayIndex = 2;
      break;
  }

  newMealPlan[deletedDayIndex].value.id = newMeal.results[0].id;
  newMealPlan[deletedDayIndex].value.servings = newMeal.results[0].servings;
  newMealPlan[deletedDayIndex].value.title = newMeal.results[0].title;
  newMealPlan[deletedDayIndex].value.imageType = newMeal.results[0].imageType;

  console.log(newMealPlan);

  const { username, hash } = JSON.parse(localStorage.getItem("userInfo")); //gets username and hash from localStorage
  const mealURL = `https://api.spoonacular.com/mealplanner/${username}/items?hash=${hash}&apiKey=${apiKey}`;

  const response = await fetch(mealURL, {
    // Sends Meal Plan to Spoonacular
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newMealPlan),
  });

  console.log(response);

  await renderMealPage(newMeal.results[0].id);
  loadingScreen.classList.add("hidden");
};

mealReplaceButton.addEventListener("click", async function (event) {
  const recipeID = event.currentTarget.getAttribute("data-recipeID");
  await replaceMeal(recipeID);
  await populateSingleMealCard(mealCardClicked); //Update the clicked mealCard with the newRecipeID info
});

mealFavoritesButton.addEventListener("click", async function (event) {
  const recipeID = event.currentTarget.getAttribute("data-recipeID");
  console.log(recipeID);

  // IF/ELSE statement: IF recipeID is in localStorage, recipe is pulled from localStorage. Otherwise, recipe is called from spoonacular API using getRecipeInformation() function.
  const recipe =
  localStorage.getItem(recipeID) != undefined
    ? JSON.parse(localStorage.getItem(recipeID))
    : await getRecipeInformation(recipeID);

  // if recipe not in local storage, it is saved there.
  localStorage.setItem(recipeID, JSON.stringify(recipe));

  if(!favoriteMeals.includes(JSON.stringify(recipe))){
    favoriteMeals.push((localStorage.getItem(recipeID)));
    localStorage.setItem("favorite-meals", JSON.stringify(favoriteMeals));
  }
});


// Generate favorites meal cards
const generateFavoritesCards = function(){
  favoritesPage.classList.remove("hidden");
  mainPage.classList.add("hidden");
  mealPage.classList.add("hidden");
  document.querySelector(".spacer").classList.add("hidden");

  const favoritesContainer = document.getElementById('favorites-container');
  favoritesContainer.innerHTML = '';
  
  // For each meal in favoriteMeals, generate a mealCard
  for(let i = 0; i < favoriteMeals.length; i++){
    const recipe = JSON.parse(favoriteMeals[i]);

    const twoFifthsCard = document.createElement('div');
    twoFifthsCard.classList.add("column", "is-two-fifths")
    favoritesContainer.append(twoFifthsCard);

    const recipeCard = document.createElement("div");
    recipeCard.classList.add("fav-recipe-card","card");
    recipeCard.setAttribute("data-idrecipe",recipe.id);
    twoFifthsCard.append(recipeCard);

    const cardImage = document.createElement("div");
    cardImage.classList.add("fav-card-image");
    recipeCard.append(cardImage);

    const favFigure = document.createElement("figure");
    favFigure.classList.add("fav-image","image","is-4by1");
    cardImage.append(favFigure);

    const actualImage = document.createElement("img");
    actualImage.classList.add("fav-recipe-image");
    actualImage.setAttribute("src",recipe.image);
    favFigure.append(actualImage);

    //------------------
    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");
    recipeCard.append(cardContent);

    const media = document.createElement("div");
    media.classList.add("media");
    cardContent.append(media);


    //-------------------
    const recipeTitle = document.createElement("div");
    recipeTitle.classList.add("fav-recipe-title","content","is-size-4");
    recipeTitle.textContent = recipe.title;
    cardContent.append(recipeTitle);

    //-------------------
    const recipeDiets = document.createElement("div");
    recipeDiets.classList.add("fav-recipe-diets", "category");
    cardContent.append(recipeDiets);
    // Populate the diets in the mealCard -- pulled from recipe data in local storage
    recipe.diets.forEach(function(diet){
      let newSpan = document.createElement('span');
      newSpan.classList.add('subtitle');
      newSpan.classList.add('is-6');
      newSpan.textContent = diet;
      recipeDiets.append(newSpan);
    })

    

  }

  favoritesCards = document.querySelectorAll(".fav-recipe-card");

  let maxHeight = 0;

  // Go through each meal card and figure out what the max height is
  favoritesCards.forEach(function (card) {
    if (card.clientHeight > maxHeight) {
      maxHeight = card.clientHeight;
    }
  });

  // Go through each meal card and set the max height to the greatest height of the meal cards
  favoritesCards.forEach(function (card) {
    card.style.height = `${maxHeight}px`;
  });

  favoritesCards.forEach((item) => {
    // CHANGE TO RENDER MEAL PAGE ONCE ANTHONY COMPLETES FUNCTIONALITY.
    item.addEventListener("click", function(event){
      const recipeID = event.currentTarget.dataset.idrecipe;
      console.log(event.currentTarget.dataset.idrecipe);
      console.log(event.currentTarget);
      renderMealPage(recipeID);
      mealCardClicked = event.currentTarget;
    });
  })

  mealReplaceButton.classList.add("hidden");
  mealFavoritesButton.classList.add("hidden");

};

favoritesBtn.addEventListener("click", function(){
  generateFavoritesCards();
  favoritesStatus = true;
});

favoritesBackBtn.addEventListener("click", function(){
  mealReplaceButton.classList.remove("hidden");
  mealFavoritesButton.classList.remove("hidden");
  favoritesPage.classList.add("hidden");
  mainPage.classList.remove("hidden");
  favoritesStatus = false;
});

favoritesCards.forEach((item) => {
  // CHANGE TO RENDER MEAL PAGE ONCE ANTHONY COMPLETES FUNCTIONALITY.
  item.addEventListener("click", function(event){
    const recipeID = event.currentTarget.dataset.idrecipe;
    console.log(event.currentTarget.dataset.idrecipe);
    console.log(event.currentTarget);
    renderMealPage(recipeID);
    mealCardClicked = event.currentTarget;
  });
})


mealCards.forEach((item) => {
  // CHANGE TO RENDER MEAL PAGE ONCE ANTHONY COMPLETES FUNCTIONALITY.
  item.addEventListener("click", function (event) {
    const recipeID = event.currentTarget.dataset.idrecipe;
    renderMealPage(recipeID);
    mealCardClicked = event.currentTarget;
  });
});

// Login Modal EventListener
const loginModal = document.getElementById("Login Modal");
const loginBtn = document.getElementById("#contact");
const span = document.getElementsByClassName("close")[0];
loginBtn.onclick = function (event) {
  loginModal.style.display = "block";
  loginModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
  if (event.target == loginModal) {
    loginModal.style.display = "none";
  }
  function Login() {
    document.getElementById("Login Modal");

    event.preventDefault();
  }
  window.onclick = function (event) {
    if (event.target == loginModal) {
      loginModal.style.display = "none";
      overlay.classList.add("hidden");
    }
  };
  loginModal.addEventListener("click", Login());
};

const loginbutton = document.querySelector("#login-form-button");

loginbutton.addEventListener("click", async function () {
  const username = document.querySelector("#login-username").value;
  const hash = document.querySelector("#login-password").value;
  const password = "";

  console.log("clicked");

  localStorage.setItem(
    "userInfo",
    JSON.stringify({
      username: username,
      password: password,
      hash: hash,
    })
  );

  welcomePage.classList.add("hidden");
  toggleLoginButtons();
  await populateMainPage();
  populateMealCards();
  overlay.classList.add("hidden");
  loginModal.classList.add("hidden");
});

// Sign Up Modal Event Listener
const signUpModal = document.getElementById("SignUp Modal");
const signUpBtn = document.getElementById("signup");
const span2 = document.getElementsByClassName("close")[0];
signUpBtn.onclick = function (event) {
  signUpModal.classList.remove("hidden");
  signUpModal.style.display = "block";
  overlay.classList.remove("hidden");
  if (event.target == signUpModal) {
    signUpModal.style.display = "none";
  }
  function signup() {
    document.getElementById("SignUp Modal");

    event.preventDefault();
  }
  window.onclick = function (event) {
    if (event.target == signUpModal) {
      signUpModal.style.display = "none";
      overlay.classList.add("hidden");
    }
  };
  signUpModal.addEventListener("click", signup());
};

// Selects "Sign Up Button Form Submit" inside sign-up modal
const signupbutton = document.querySelector("#signup-form-button");

signupbutton.addEventListener("click", async function (event) {
  const firstName = document.querySelector("#sign-up-first-name").value;
  const lastName = document.querySelector("#sign-up-last-name").value;
  const username = document.querySelector("#sign-up-username").value;
  const email = document.querySelector("#sign-up-email").value;

  loadingScreen.classList.remove("hidden");
  event.preventDefault();
  await connectUser(username, firstName, lastName, email);
  await initializeMealPlan();
  await populateMainPage();
  if(localStorage.getItem("favorite-meals") != undefined){
    favoriteMeals = JSON.parse(localStorage.getItem("favorite-meals"));
  }
  signUpModal.classList.add("hidden");
  overlay.classList.add("hidden");
  populateMealCards();
  loadingScreen.classList.add("hidden");
  welcomePage.classList.add("hidden");
  toggleLoginButtons();
});

// Function removes login/sign up buttons if the user is signed in.
const toggleLoginButtons = function () {
  if (JSON.parse(localStorage.getItem("userInfo")) != undefined) {
    loginBtn.classList.add("hidden");
    signUpBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    userInfoBtn.classList.remove('hidden');
    favoritesBtn.classList.remove("hidden");
    const {username, hash} = JSON.parse(localStorage.getItem('userInfo'));
    usernameCredential.textContent = username;
    passwordCredential.textContent = hash;
  } else {
    loginBtn.classList.remove("hidden");
    signUpBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userInfoBtn.classList.add("hidden");
  }
};

toggleLoginButtons();

// Logout button functionality:
logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("userInfo"); // Clears userInfo from local storage.
  toggleLoginButtons();
  mealPage.classList.add("hidden");
  mainPage.classList.add("hidden");
  welcomePage.classList.remove("hidden");
});

// Populate main page that shows 3 recipes for a given day
const populateMainPage = async function () {
  mainPage.classList.remove("hidden");

  // Get current meal plan so that we can update the buttons of the week with meal ids
  let mealPlanTable = await getMealPlan();

  // Update the date buttons with the dates for the week
  dateButtons.forEach(function (btn, index) {
    let btnDate = dt.now().ts - 25200000 + 86400000 * index;
    btn.dataset.datets = Math.floor(btnDate / 1000);
    btn.textContent = dt
      .fromMillis(btnDate, { zone: "America/Los_Angeles" })
      .toFormat("MM/dd");
    btn.dataset.idbreakfast = mealPlanTable.days[index].items[0].value.id;
    btn.dataset.idlunch = mealPlanTable.days[index].items[1].value.id;
    btn.dataset.iddinner = mealPlanTable.days[index].items[2].value.id;
  });

  // Go through each of the mealCards and update the information inside of them
  mealCards.forEach(async function (mealCard, index) {
    // Remove height property before populating card to remove any CSS that would overwrite the height being pulled in
    mealCard.style.removeProperty("height");

    // Update the three meal cards to have a recipe id and pull in informational text
    let recipeID = "";

    switch (index) {
      case 0:
        recipeID = dateButtons[0].dataset.idbreakfast;
        break;
      case 1:
        recipeID = dateButtons[0].dataset.idlunch;
        break;
      case 2:
        recipeID = dateButtons[0].dataset.iddinner;
        break;
      default:
        console.log(
          "Index is greater than 2, check to see that there are only 3 meal cards"
        );
    }

    // Add recipeID to the mealCard data attribute -- this allows us to pull the recipe data from local storage when card is clicked
    mealCard.dataset.idrecipe = recipeID;

    // Get the recipe data from local storage
    const recipeData =
      localStorage.getItem(recipeID) != undefined
        ? JSON.parse(localStorage.getItem(recipeID))
        : await getRecipeInformation(recipeID);

    // If recipe not in local storage, it is saved there.
    localStorage.setItem(recipeID, JSON.stringify(recipeData));

    // Populate the image and data on each card with the recipe date pulled from local storage
    mealImgList[index].src = recipeData.image;
    mealTitleList[index].textContent = recipeData.title;
    mealDietList[index].innerHTML = "";

    // Populate the diets in the mealCard -- pulled from recipe data in local storage
    recipeData.diets.forEach(function (diet) {
      let newSpan = document.createElement("span");
      newSpan.classList.add("subtitle");
      newSpan.classList.add("is-6");
      newSpan.textContent = diet;
      mealDietList[index].append(newSpan);
    });
  });

  let maxHeight = 0;

  // Go through each meal card and figure out what the max height is
  mealCards.forEach(function (card) {
    if (card.clientHeight > maxHeight) {
      maxHeight = card.clientHeight;
    }
  });

  // Go through each meal card and set the max height to the greatest height of the meal cards
  mealCards.forEach(function (card) {
    card.style.height = `${maxHeight}px`;
  });
};

const populateSingleMealCard = async function (element) {
  const mealCard = element;
  const recipeID = mealCard.dataset.idrecipe;

  // Remove height property before populating card to remove any CSS that would overwrite the height being pulled in
  mealCard.style.removeProperty("height");

  // Get the recipe data from local storage
  const recipeData =
    localStorage.getItem(recipeID) != undefined
      ? JSON.parse(localStorage.getItem(recipeID))
      : await getRecipeInformation(recipeID);

  // If recipe not in local storage, it is saved there.
  localStorage.setItem(recipeID, JSON.stringify(recipeData));

  // Populate the image and data on each card with the recipe date pulled from local storage
  mealCard.children[0].children[0].children[0].src = recipeData.image;
  mealCard.children[1].children[1].textContent = recipeData.title;
  mealCard.children[1].children[2].innerHTML = "";

  // Populate the diets in the mealCard -- pulled from recipe data in local storage
  recipeData.diets.forEach(function (diet) {
    let newSpan = document.createElement("span");
    newSpan.classList.add("subtitle");
    newSpan.classList.add("is-6");
    newSpan.textContent = diet;
    mealCard.children[1].children[2].append(newSpan);
  });

  let maxHeight = 0;

  // Go through each meal card and figure out what the max height is
  mealCards.forEach(function (card) {
    if (card.clientHeight > maxHeight) {
      maxHeight = card.clientHeight;
    }
  });

  // Go through each meal card and set the max height to the greatest height of the meal cards
  mealCards.forEach(function (card) {
    card.style.height = `${maxHeight}px`;
  });
};

// Update the three meal cards to have a recipe id and pull in informational text
const populateMealCards = function (event) {
  // Go through each of the mealCards and update the information inside of them
  mealCards.forEach(async function (mealCard, index) {
    // Remove height property before populating card to remove any CSS that would overwrite the height being pulled in
    mealCard.style.removeProperty("height");

    // Get the recipe ID for the current recipe card depending on if it's breakfast, lunch or dinner
    let recipeID = "";

    switch (index) {
      case 0:
        recipeID = event.target.dataset.idbreakfast;
        break;
      case 1:
        recipeID = event.target.dataset.idlunch;
        break;
      case 2:
        recipeID = event.target.dataset.iddinner;
        break;
      default:
        console.log(
          "Index is greater than 2, check to see that there are only 3 meal cards"
        );
    }

    // Add recipeID to the mealCard data attribute -- this allows us to pull the recipe data from local storage when card is clicked
    mealCard.dataset.idrecipe = recipeID;

    // Get the recipe data from local storage
    const recipeData =
      localStorage.getItem(recipeID) != undefined
        ? JSON.parse(localStorage.getItem(recipeID))
        : await getRecipeInformation(recipeID);

    // If recipe not in local storage, it is saved there.
    localStorage.setItem(recipeID, JSON.stringify(recipeData));

    // Populate the image and data on each card with the recipe date pulled from local storage
    mealImgList[index].src = recipeData.image;
    mealTitleList[index].textContent = recipeData.title;
    mealDietList[index].innerHTML = "";

    // Populate the diets in the mealCard -- pulled from recipe data in local storage
    recipeData.diets.forEach(function (diet) {
      let newSpan = document.createElement("span");
      newSpan.classList.add("subtitle");
      newSpan.classList.add("is-6");
      newSpan.textContent = diet;
      mealDietList[index].append(newSpan);
    });
  });

  let maxHeight = 0;

  // Go through each meal card and figure out what the max height is
  mealCards.forEach(function (card, index) {
    if (card.clientHeight > maxHeight) {
      maxHeight = card.clientHeight;
    }
  });

  // Go through each meal card and set the max height to the greatest height of the meal cards
  mealCards.forEach(function (card, index) {
    card.style.height = `${maxHeight}px`;
  });
};

// Add event listeners for each date button on the main page
dateButtons.forEach((item) => {
  item.addEventListener("click", populateMealCards);
});

const prefButtons = document.querySelectorAll(".pref-btn");
prefButtons.forEach((item) => {
  item.addEventListener("click", openPrefModal);
});

// Clear the current meal plan from API server, create a new meal plan, upload new mealplan to server
const clearAndRefreshMealPlan = async function () {
  // Set up a loading screen while API calls run
  window.scrollTo(0, 0);
  loadingScreen.classList.remove("hidden");

  const { username, hash } = JSON.parse(localStorage.getItem("userInfo"));

  // Delete the week's meal plans one day at a time -- API only allows for deleting one day at a time
  for (let i = 0; i < 7; i++) {
    const baseDate = dt.now().ts + 86400000 * i; //Calculate each day starting with today and adding 1 day for each next day
    const date = dt
      .fromMillis(baseDate, { zone: "America/Los_Angeles" })
      .toFormat("yyyy-MM-dd");
    const clearMealPlanURL = `${baseURL}/mealplanner/${username}/day/${date}?hash=${hash}&apiKey=${apiKey}`;
    const response = await fetch(clearMealPlanURL, { method: "DELETE" });
    console.log(response);
  }

  // Save down user info and meal preferences, then clear local storage and reload user info and meal preferences to local storage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  loadPreferences();

  localStorage.clear();

  localStorage.setItem("userInfo", JSON.stringify(userInfo));
  savePreferences();

  // Call initializeMealPlan() to create a fresh new meal plan, then populate the date buttons with the new recipe ids
  await initializeMealPlan();
  await populateMainPage();

  // Remove loading screen
  loadingScreen.classList.add("hidden");

  // Store today's date as the date of the last mealplan update
  // This data will be used to check if 1 or more days have passed and new meals need to be added to the meal plan
  localStorage.setItem("lastUpdatedDate", JSON.stringify(dt.now().ts));
};

refreshMealPlanBtn.addEventListener("click", clearAndRefreshMealPlan);

/* populateMainPage(); */

const deleteMealPlanDay = async function (timeStamp) {
  const { username, hash } = JSON.parse(localStorage.getItem("userInfo"));

  // Delete the week's meal plans one day at a time -- API only allows for deleting one day at a time
  const date = dt
    .fromMillis(parseInt(timeStamp) * 1000, { zone: "America/Los_Angeles" })
    .toFormat("yyyy-MM-dd");
  console.log(date);
  const clearMealPlanURL = `${baseURL}/mealplanner/${username}/day/${date}?hash=${hash}&apiKey=${apiKey}`;
  const response = await fetch(clearMealPlanURL, { method: "DELETE" });
  console.log(response);
};

// checks whether the user's credentials is saved in local storage (meaning they're logged in) and directs them straight to the meal page rather than welcome page.
const checkLoginStatus = async function () {
  if (JSON.parse(localStorage.getItem("userInfo"))) {
    welcomePage.classList.add("hidden");
    toggleLoginButtons();
    await populateMainPage();
    if(localStorage.getItem("favorite-meals") != undefined){
      favoriteMeals = JSON.parse(localStorage.getItem("favorite-meals"));
    }
  }
};

checkLoginStatus();

var swiper = new Swiper(".mySwiper", {
  pagination: {
    el: ".swiper-pagination",
    dynamicBullets: true,
  },
});

// Establishes modal for account credentials
const credentialModal = document.querySelector("#credential-modal");
const modalBG = document.querySelector(".modal-background");
const modalCloseBtn = document.querySelector(".modal-close");

const closeCredentialModal = function () {
  credentialModal.classList.remove("is-active");
};

const openCredentialModal = function () {
  credentialModal.classList.add("is-active");
};

modalBG.addEventListener("click", closeCredentialModal);
userInfoBtn.addEventListener("click", openCredentialModal);
modalCloseBtn.addEventListener("click", closeCredentialModal);

passwordCredential.addEventListener("click", () => {
  const { hash } = JSON.parse(localStorage.getItem("userInfo"));
  navigator.clipboard.writeText(hash);
  passwordCredential.textContent = " Password Copied To Clipboard";
  setTimeout(
    () => (passwordCredential.textContent = " Click to Copy Password"),
    1000
  );
});

// Get Started -- Code from signUpBtn event listener
document
  .querySelector("#get-started")
  .addEventListener("click", function (event) {
    signUpModal.classList.remove("hidden");
    signUpModal.style.display = "block";
    overlay.classList.remove("hidden");
    if (event.target == signUpModal) {
      signUpModal.style.display = "none";
    }
    function signup() {
      document.getElementById("SignUp Modal");

      event.preventDefault();
    }
    window.onclick = function (event) {
      if (event.target == signUpModal) {
        signUpModal.style.display = "none";
        overlay.classList.add("hidden");
      }
    };
    signUpModal.addEventListener("click", signup());
  });

const brandLogo = document.querySelector(".brand");

// redirects user upon clicking logo
brandLogo.addEventListener("click", function () {
  mainPage.classList.remove("hidden");
  closeMealPage();
  favoritesPage.classList.add("hidden");
  mealReplaceButton.classList.remove("hidden");
  mealFavoritesButton.classList.remove("hidden");
  favoritesStatus = false;
  
});
