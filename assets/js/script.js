"use strict";

const apiKey = "3fe9c7b3838b43f59e74004c2179d228";
const complexSearchURL = "https://api.spoonacular.com/recipes/complexSearch?";

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
const mainPage = document.querySelector("main-page");

/* Meal Page */
const mealPage = document.querySelector("meal-page");

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
  preferenceModal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

// Closes Preference Modal and deactivates overlay
const closePrefModal = function () {
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

  console.log(userInfo);

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
  const numberP = `number=${numResults}`;
  const typeP = `type=${mealTypeString}`;
  const apiKeyP = `apiKey=${apiKey}`;

  // Genereate string for excludeCuisine
  let excludeCuisineP = "excludeCuisine=";
  for (let i = 0; i < cuisines.toExclude.length; i++) {
    if (i === 0) {
      excludeCuisineP = cuisines.toExclude[i];
    } else {
      excludeCuisineP = `${excludeCuisineP},${cuisines.toExclude[i]}`;
    }
  }

  // Generate string for diet -- commas in the search represent AND. e.g. paleolithic,gluten free = paleolithic AND gluten free
  let dietP = "diet=";
  for (let i = 0; i < diets.toInclude.length; i++) {
    if (i === 0) {
      dietP = diets.toInclude[i];
    } else {
      dietP = `${dietP},${diets.toInclude[i]}`;
    }
  }

  // Generate string for intolerances -- commas in the search represent AND. e.g. egg,dairy = egg AND dairy
  let intolerancesP = "intolerances=";
  for (let i = 0; i < intolerances.toInclude.length; i++) {
    if (i === 0) {
      intolerancesP = intolerances.toInclude[i];
    } else {
      intolerancesP = `${intolerancesP},${intolerances.toInclude[i]}`;
    }
  }

  let finalURL = `${urlAPI}?${addRecipeInformationP}&${addRecipeNutritionP}&${instructionsRequiredP}&${typeP}&${numberP}&${excludeCuisineP}&${dietP}&${intolerancesP}&${apiKeyP}`;
  finalURL = encodeURI(finalURL);
  console.log(finalURL);
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

editPreferencesBtn.addEventListener("click", openPrefModal);
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
      date: Math.floor(dt.now().ts / 1000) + timeInterval,
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
      date: Math.floor(dt.now().ts / 1000) + timeInterval,
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
  mainPage.classList.add("hidden");
  mealPage.classList.remove("hidden");
};

const getRecipeInformation = async function (recipeID) {
  const URL = `https://api.spoonacular.com/recipes/${recipeID}/information?includeNutrition=false&apiKey=${apiKey}`;
  const response = await fetch(URL);
  const recipeInfo = await response.json();
  return recipeInfo;
};

// This function constructs the meal page with appropriate data. Needs recipe ID as parameter.

const renderMealPage = async function (recipeID) {
  /*Meal Page DOM Elements*/
  const mealTitle = document.querySelector(".meal-title");
  const mealSummary = document.querySelector("#meal-summary");

  // IF/ELSE statement: IF recipeID is in localStorage, recipe is pulled from localStorage. Otherwise, recipe is called from spoonacular API using getRecipeInformation() function.
  const recipe =
    localStorage.getItem(recipeID) != undefined
      ? JSON.parse(localStorage.getItem(recipeID))
      : await getRecipeInformation(recipeID);

  // if recipe not in local storage, it is saved there.
  localStorage.setItem(recipeID, JSON.stringify(recipe));

  // Starts setting page DOM elements to recipe properties
  mealTitle.innerHTML = recipe.title;
  mealSummary.innerHTML = recipe.summary;
};

renderMealPage(1101375);
