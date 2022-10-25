'use strict'

// date/time object from luxon.
const dt = luxon.DateTime;

// List of diets that can be specified in meal plan API request:
// Enter as diet @param in API request (ex. https://foodapi?diet=diets.glutenFree)
// Options sourced from https://spoonacular.com/food-api/docs#Diets

/* Modal */
const preferenceModal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');

/* Modal Buttons */
const closeModalBtn = document.querySelector('.close-modal')
const editPreferencesBtn = document.querySelector('.show-modal');

/* Preference Modal Buttons */
const dietsBtn = document.querySelector('#pref-diets');
const cuisineBtn = document.querySelector('#pref-cuisines');
const intoleranceBtn = document.querySelector('#pref-intolerances');
const ingredientsBtn = document.querySelector('#pref-ingredients');

/* Preference Options */
const mainPreferenceOptions = document.querySelector('.preference-options');
const preferenceItems = document.querySelector('.preference-items');

const diets = {
    noPreference: 'No Preference',
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

const openPrefModal = function () {
    preferenceModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

const closePrefModal = function () {
    preferenceModal.classList.add('hidden');
    overlay.classList.add('hidden');
}

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

const setActiveButton = function (activeButton) {
    [dietsBtn, cuisineBtn, intoleranceBtn, ingredientsBtn].forEach(function (button) {
        if (button != activeButton) {
            button.classList.remove('active');
        } else {
            button.classList.add('active');
        }
    })
}

const generatePreferenceOptions = function (option) {
    preferenceItems.innerHTML = "";
    for (let [key, value] of Object.entries(option)) {
        if (key != 'toInclude' && key!= 'toExclude') {
            const item = document.createElement('button');
            item.setAttribute('data-key', key);
            item.textContent = value;
            if (key === 'noPreference' && diets.toInclude.length === 0) {
                item.style.backgroundColor = 'var(--active-preference)';
                diets.toInclude.push(diets.noPreference);
            }

            if (option === diets) {
                diets.toInclude.forEach(function (diet) {
                    if (diet === value) {
                        item.style.backgroundColor = 'var(--active-preference)';
                    } 
                })
            } else if (option === cuisines) {
                cuisines.toExclude.forEach(function(cuisine) {
                    if (cuisine === value) {
                        item.style.backgroundColor = 'var(--active-preference';
                    }
                })
            } else if (option === intolerances) {
                intolerances.toInclude.forEach(function(intolerance) {
                    if (intolerance === value) {
                        item.style.backgroundColor = 'var(--active-preference';
                    }
                })
            }

            preferenceItems.appendChild(item);
        }
    }
}

mainPreferenceOptions.addEventListener('click', function (event) {
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

preferenceItems.addEventListener('click', function (event) {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'button') {
        [dietsBtn, cuisineBtn, intoleranceBtn, ingredientsBtn].forEach(function(value) {
            if (value.classList.contains('active')) {
                if (value === dietsBtn) {
                    if (diets.toInclude.includes(diets[target.getAttribute('data-key')])) {
                        diets.toInclude = diets.toInclude.filter((value) => value!=diets[target.getAttribute('data-key')]);
                        target.style.backgroundColor = 'var(--inactive-preference';
                    } else {
                        diets.toInclude.push(diets[target.getAttribute('data-key')]);
                        target.style.backgroundColor = 'var(--active-preference)';
                    }
                } else if (value === cuisineBtn) {
                    if (cuisines.toExclude.includes(cuisines[target.getAttribute('data-key')])) {
                        cuisines.toExclude = cuisines.toExclude.filter((value) => value!=cuisines[target.getAttribute('data-key')]);
                        target.style.backgroundColor = 'var(--inactive-preference';
                    } else {
                        cuisines.toExclude.push(cuisines[target.getAttribute('data-key')]);
                        target.style.backgroundColor = 'var(--active-preference)';
                    }
                } else if (value === intoleranceBtn) {
                    if (intolerances.toInclude.includes(intolerances[target.getAttribute('data-key')])) {
                        intolerances.toInclude = intolerances.toInclude.filter((value) => value!=intolerances[target.getAttribute('data-key')]);
                        target.style.backgroundColor = 'var(--inactive-preference';
                    } else {
                        intolerances.toInclude.push(intolerances[target.getAttribute('data-key')]);
                        target.style.backgroundColor = 'var(--active-preference)';
                    }
                }
            }
        })
    // console.log(cuisines.toExclude);
    }
})

editPreferencesBtn.addEventListener('click', openPrefModal);
closeModalBtn.addEventListener('click', closePrefModal);

// Defaults Modal to display diet info.
generatePreferenceOptions(diets);

