// Checks to see if a full day has passed since the meal plan was created. If so, remove the current days meal plan, shift all meal plans over by one day, then add a new day's meals
const previousDate = luxon.DateTime.local(2022,10,25,5,{zone: 'America/Los_Angeles'});
const checkIfDayPassed = async function() {
    //let mealPlanTableTest = [1,2,3];
    //mealPlanTableTest = mealPlanTableTest.slice(1);
    //console.log(mealPlanTableTest);
    const currentDate = luxon.DateTime.local({zone: 'America/Los_Angeles'}); //Creates the date object using the current date and time
    let mealPlanTable = await getMealPlan();
    //let test = [];
    
   //for(let i = 0; i < mealPlanTable.length; i++){
   //     test[i] = mealPlanTable[i];
   //}
   console.log(mealPlanTable.days.slice(2));


    if(currentDate.c.day !== previousDate.c.day && currentDate.ts > previousDate.ts){
        console.log(`${currentDate.ts} and previous date ${previousDate.ts}`); //just checking
        //const firstElement = mealPlanTable.shift();
        //console.log(mealPlanTable);
    
        
    }
    
};

// Gets the current meal plan in the user's Spoonacular profile
const getMealPlan = async function() {
    const {username, hash} = JSON.parse(localStorage.getItem('userInfo'));
    const creationDate = '2022-10-26';
    const mealPlanURL = `https://api.spoonacular.com/mealplanner/${username}/week/${creationDate}?hash=${hash}&apiKey=${apiKey}`;

    const response = await fetch(mealPlanURL);
    const mealPlan = await response.json();
    
    return mealPlan;
}