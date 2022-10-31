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

const favoriteMeals = [];

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

  //cuisine
  //excludeCuisine -- done
  //diet -- done
  //intolerances -- done
  //includeIngredients
  //excludeIngredients
  //instructionsRequired -- done
  //addRecipeInformation -- done
  //addRecipeNutrition -- done
  //number -- done
  //type --done //need to generate 2 API calls -- one for breakfast and one for main course(lunch and dinner)
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

const openMealPage = function () {
  window.scrollTo(0, 0);
  mainPage.classList.add("hidden");
  mealPage.classList.remove("hidden");
};

const closeMealPage = function () {
  window.scrollTo(0, 0);
  mainPage.classList.remove("hidden");
  mealPage.classList.add("hidden");
};

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
};

//renderMealPage(655186);

// Evemt listener closes meal page and returns to the main page.
mealBackButton.addEventListener("click", closeMealPage);

// Initialize function
const init = async function () {
  // Set Interval of 10 minutes to see if a new day is here and the meal plan needs to be updated
  checkIfDayPassed();
  setTimeout(function () {
    checkIfDayPassed();
    init();
  }, 600000);
};

//init();

const replaceMeal = async function (recipeID) {
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

  renderMealPage(newMeal.results[0].id);
};

mealReplaceButton.addEventListener("click", function (event) {
  const recipeID = event.currentTarget.getAttribute("data-recipeID");
  replaceMeal(recipeID);
});

mealFavoritesButton.addEventListener("click", function (event) {
  const recipeID = event.currentTarget.getAttribute("data-recipeID");
  console.log(recipeID);
  favoriteMeals.push(JSON.parse(localStorage.getItem(recipeID)));
  localStorage.setItem("favorite meals", JSON.stringify(favoriteMeals));
});

mealCards.forEach((item) => {
  // CHANGE TO RENDER MEAL PAGE ONCE ANTHONY COMPLETES FUNCTIONALITY.
  item.addEventListener("click", function (event) {
    const recipeID = event.currentTarget.dataset.idrecipe;
    renderMealPage(recipeID);
  });
});

// Login Modal EventListener
const loginModal = document.getElementById("Login Modal");
const loginBtn = document.getElementById("#contact");
const span = document.getElementsByClassName("close")[0];
loginBtn.onclick = function (event) {
  loginModal.style.display = "block";
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

// Sign Up Modal Event Listener
const signUpModal = document.getElementById("SignUp Modal");
const signUpBtn = document.getElementById("signup");
const span2 = document.getElementsByClassName("close")[0];
signUpBtn.onclick = function (event) {
  signUpModal.style.display = "block";
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
    }
  };
  signUpModal.addEventListener("click", signup());
};

// Update the three meal cards to have a recipe id and pull in informational text
const populateMealCards = function (event) {
  // Go through each of the mealCards and update the information inside of them
  mealCards.forEach(async function (mealCard, index) {
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
  loadingScreen.style.display = "block";

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
  loadingScreen.style.display = "none";

  // Store today's date as the date of the last mealplan update
  // This data will be used to check if 1 or more days have passed and new meals need to be added to the meal plan
  localStorage.setItem("lastUpdatedDate", JSON.stringify(dt.now().ts));
};

refreshMealPlanBtn.addEventListener("click", clearAndRefreshMealPlan);

populateMainPage();

const lsTest = function () {
  loadingScreen.style.display = "block";
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 2000);
};

/*
const deleteMealPlan = async function(year, month, day){
  const { username, hash } = JSON.parse(localStorage.getItem("userInfo"));
  
  // Delete the week's meal plans one day at a time -- API only allows for deleting one day at a time
  const baseDate = dt.local(year,month,day,{zone:'America/Los_Angeles'}); //Calculate each day starting with today and adding 1 day for each next day
  const date = dt.fromMillis(baseDate.ts,{zone:'America/Los_Angeles'}).toFormat('yyyy-MM-dd');
  console.log(date);
  const clearMealPlanURL = `${baseURL}/mealplanner/${username}/day/${date}?hash=${hash}&apiKey=${apiKey}`;
  const response = await fetch(clearMealPlanURL,{method: 'DELETE'});
  console.log(response);

}

// Just recording local storage information in case I accidentally delete and need it again.

const userInformation = {
  hash: "84e8d054fd80cb6df56951b8df04bc2be3f9bfa9",
  password: "phyllopastrytartwithout41peppermint",
  username: "test347",
}

const dietsPreferences = {
  cuisinePref: ["American", "Cajun", "British", "Indian", "French", "European"],
  dietsPref: ["Vegetarian", "Gluten Free"],
  intolerancesPref: ["Egg"],
}

const setUserInfo = function(){
  localStorage.setItem('userInfo',JSON.stringify(userInformation));
  localStorage.setItem('userPreferances',JSON.stringify(dietsPreferences));
}
*/
