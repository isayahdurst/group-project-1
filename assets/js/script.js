'use strict'

const APIKEY = 'apiKey=3fe9c7b3838b43f59e74004c2179d228';

// date/time object from luxon.
const dt = luxon.DateTime;

// List of diets that can be specified in meal plan API request:
// Enter as diet @param in API request (ex. https://foodapi?diet=diets.glutenFree)
// Options sourced from https://spoonacular.com/food-api/docs#Diets

const dietFilter = document.querySelector('.diets');

const diets = {
    glutenFree: 'Gluten Free',
    ketogenic: 'Ketogenic',
    vegetarian: 'Vegetarian',
    lactoVegetarian: 'Lacto Vegetarian',
    ovoVegetarian: 'Ovo-Vegetarian',
    vegan: 'Vegan',
    pescetarian: 'Pescetarian',
    paleo: 'Paleo',
    primal: 'Primal',
    lowFODMAP: 'Low FODMAP',
    whole30: 'Whole30',
    toInclude: [],
};

// cuisines can be added or removed from search. 
const cuisines = {
    african: 'African',
    american: 'American',
    british: 'British',
    cajun: 'Cajun',
    carribbean: 'Carribbean',
    chinese: 'Chinese',
    easternEuropean: 'Eastern European',
    european: 'European',
    french: 'French',
    german: 'German',
    greek: 'Greek',
    indian: 'Indian',
    irish: 'Irish',
    italian: 'Italian',
    japanese: 'Japanese',
    jewish: 'Jewish',
    korean: 'Korean',
    latinAmerican: 'Latin American',
    mediterranean: 'Mediterranean',
    mexican: 'Mexican',
    middleEastern: 'Middle Eastern',
    nordic: 'Nordic',
    southern: 'Southern',
    spanish: 'Spanish',
    thai: 'Thai',
    vietnamese: 'Vietnamese',
    toExclude: [],
}

// Search API can filter intolerances.

const intolerances = {
    dairy: 'Dairy',
    egg: 'Egg',
    gluten: 'Gluten',
    grain: 'Grain',
    peanut: 'Peanut',
    seafood: 'Seafood',
    sesame: 'Sesame',
    shellfish: 'Shellfish',
    soy: 'Soy',
    sulfite: 'Sulfite',
    treeNut: 'Tree Nut',
    wheat: 'Wheat',
    toInclude: [],
}

// To generate a weekly meal plan, Spoonacular needs to have a username/password/hash generated
// for each individual user. We can't store that information on a server (yet) but
// we can store that inside of localStorage on their machine. That's the plan.
// LINK TO DOCS: https://spoonacular.com/food-api/docs#Get-Meal-Plan-Week

const connectUser = async function (userName, firstName, lastName, email) {
    const response = await fetch(`https://api.spoonacular.com/users/connect?${APIKEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: userName,
        firstName: firstName,
        lastName: lastName,
        email: email
    }),
  });

  const userData = await response.json();
  
  const userInfo = {
    username: userData.username,
    password: userData.spoonacularPassword,
    hash: userData.hash
  }

  console.log(userInfo);
 
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

// Retrieves user's Spoonacular credentials from localStorage
const getUserInfo = function () {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo;
}


// Below is just a test... we can use this code later but it needs to be in a function.

// For loop generates list items for each diet type and sets their attribute equal to the name we need to call the API.
for (let [key, value] of Object.entries(diets)) {
    if (key != 'toInclude') {
        const dietItem = document.createElement('li');
        dietItem.setAttribute('data-diet-key', key);
        dietItem.textContent = value;
        dietItem.style.cursor = 'pointer';
        dietItem.style.margin = '5px';
        dietFilter.appendChild(dietItem);
    }
}

// When diet item is selected, it's added or removed from included API items.
dietFilter.addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'li') {
        if (diets.toInclude.includes(diets[target.getAttribute('data-diet-key')])) {
            target.style.color = 'black';
            diets.toInclude = diets.toInclude.filter((value) => value!=diets[target.getAttribute('data-diet-key')]);
        } else {
            target.style.color = 'red';
            diets.toInclude.push(diets[target.getAttribute('data-diet-key')]);
        }
    }
    console.log(diets.toInclude);
})


