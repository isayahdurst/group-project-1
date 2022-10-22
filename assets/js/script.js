'use strict'

// To generate a weekly meal plan, Spoonacular needs to have a username/password/hash generated
// for each individual user. We can't store that information on a server (yet) but
// we can store that inside of localStorage on their machine. That's the plan.
// LINK TO DOCS: https://spoonacular.com/food-api/docs#Get-Meal-Plan-Week

const connectUser = async function (userName, firstName, lastName, email) {
    const response = await fetch(`https://api.spoonacular.com/users/connect?apiKey=${APIKEY}`, {
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
 
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

