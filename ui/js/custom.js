const getAllCities =  async () => {
    let cities = await fetch('http://localhost:3000/get-cities');
    let citiesParsed = await cities.json();
    console.log(citiesParsed);
    return citiesParsed;
}
  getAllCities() // This function is called when app first loads, you will call this function in your JavaScript file. You might call it inside of another function.


let first = true;
// TODO: hide this
const SECRET_KEY = 'e59f580fe1e84a549bd15830232609';

(() => {

    // get the search city input from the DOM
    const cityInput = document.querySelector('#city');
    // variable to store the value to search for
    let searchValue = "";
    // addEventListener('change', (event) => {}) is similar to onChange((event) => {}) in react
    // React: <input placeholder="Enter City" onChange={(event) => {}} />
    // Vanilla: <input id="city" placeholder="Enter City" />
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    cityInput.addEventListener('change', (event) => {
        // read out the changed value
        // save value for later search, when the search button is clicked
        // since we don't want to search while the user is typing
        searchValue = event.target.value;
    });

    function resetValue() {
        // clear search value
        searchValue = "";
        // clear the input field of the searched value
        cityInput.value = "";
    }

    // get the search button from the DOM
    const searchButton = document.querySelector('#search');

    // addEventListener('click', () => {}) is similar to onClick(() => {}) in react
    // React: <input placeholder="Enter City" onChange={(event) => {}} />
    // Vanilla: <input id="city" placeholder="Enter City" />
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    searchButton.addEventListener('click', async () => {

        // transition from full page search view into weather view after searching for the first time
        if (first) {
            document.querySelector('.search-bar-start')?.classList.remove("search-bar-start");
            document.querySelector('.search-start')?.classList.remove("search-start");
            document.querySelector('.content.hidden')?.classList.remove("hidden");
            first = false;
        }

        let output;
        try {
            // call the weather api and get info on current searched location
            output = await getWeather(searchValue);
            // if something is typed into the input field that cannot be found
            if (output.error) {
                throw new Error(output.error);
            }
        } catch (e) {
            console.error(e.message);
            alert(e.message);
            return;
        }

        // clear the search value as well as the input field
        resetValue();

        // sanity check
        if (!output) {
            return;
        }

        // get the hero div from the DOM
        // for later use to insert our cards
        const heroElement =  document.querySelector('.hero');

        // some sacrifices are necessary evil to keep the gods happy
        // we need to clear the hero div of all its children
        // so that we don't have duplicate cards
        heroElement.innerHTML = "";

        // create emote card from template in html
        // bind values to the created emote card from the output of the api
        const emoteCard = createEmoteCard(output);
        // insert our newly created emote card into the DOM
        // we insert it into the hero div
        // by using appendChild we add it to the end of the hero div
        // currently it is empty and thus the first child
        heroElement.appendChild(emoteCard);

        // create current card from template in HTML
        // bind values to the created current card from the output of the api
        const currentCard = createCurrentCard(output);
        // insert our newly created current card into the DOM
        // insert it into the hero div
        // by using appendChild, we add it to the end of the hero div
        // this will be after the emote card
        heroElement.appendChild(currentCard);

        const cardsElement = document.querySelector('.cards');

        // again some more sacrifices are necessary evil, to prove that we are worthy
        // we need to clear the cards div of all its children
        cardsElement.innerHTML = "";

        // now create our three footer cards
        output.forecast.forecastday.forEach((forecastDay, index) => {
            // skip the current day
            // since we already have a card for that
            // we created it above
            if (index === 0) {
                return;
            }

            // create a footer card from template in HTML
            // bind values to the created footer card from the output of the api
            const forecastCard = createForecastCard(forecastDay);
            // insert our newly created footer card into the DOM
            // the same way as we did with the current card above
            // since this is an array of forecast days, we will append each day in the order as they come into our DOM
            cardsElement.appendChild(forecastCard);
        });
        const contentElement = document.querySelector('.content');

        // before we insert a new footer card, we need to get rid of the old one
        // smite the old footer card with the power of the gods
        // The optional chaining (?.) operator accesses an object's property or calls a function. If the object accessed or function called using this operator is undefined or null, the expression short circuits and evaluates to undefined instead of throwing an error.
        // syntactic sugar!
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        // so instead of doing this
        /*
            const footerElement = document.querySelector('.footer-content');
            if (footerElement) {
                footerElement.remove();
            }
         */
        // we can do this
        contentElement.querySelector('.footer-content')?.remove();

        // we need to show the hottest day of the week
        // we know all of them are hot, but only one can be shown ;)
        const hottestDayCard = createFooterCard(output);

        // we need to insert our hottest day card into the DOM
        // this will be AFTER our content div
        // appendChild will add it into the end of the content div
        contentElement.appendChild(hottestDayCard);
    });
})();


async function getWeather(location) {
    const options = {method: 'GET'};

    // days=4 contains today, plus three additional days
    const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${SECRET_KEY}&q=${location}&days=4`, options)
    // if the api has an error for whatever reason, display the error:
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    // convert the response body from string to json
    return await response.json();
}

/*
 * create an emote card
 * reads out the template from the DOM
 * clones the template into a DocumentFragment
 * replaces the {{emote}} with the emote text
 * returns the first div in the DocumentFragment
 */
function createEmoteCard(output) {
    // find the template in our current DOM
    const template = document.querySelector("#emote-card-template");

    // The DocumentFragment interface represents a minimal document object that has no parent.
    // It is used as a lightweight version of Document that stores a segment of a document structure comprised of nodes just like a standard document.
    // The key difference is due to the fact that the document fragment isn't part of the active document tree structure. Changes made to the fragment don't affect the document.
    // https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
    // clone is not an HTMLElement, but a DocumentFragment
    const clone = template.content.cloneNode(true);

    // so we need to find an HTMLElement
    // in this case, the first div in the DocumentFragment
    const emoteTextElement = clone.querySelector(".emote-text");
    // replace the emote text placeholder with the actual emote text
    emoteTextElement.textContent = emoteTextElement
        .textContent
        .replace('{{emote-text}}', `It's ${emote(output.forecast.forecastday[0].day.maxtemp_f)} today!`);

    // return the first div in the DocumentFragment
    return clone.firstElementChild;
}

// check what emote text should be used:
function emote(temp) {
    if (temp > 75) {
        return "hot"
    }
    if (temp >= 45 && temp <= 75) {
        return "moderate";
    }
    if (temp < 45) {
    }
    return "cold";
}


/*
 * create a current card
 * reads out the template from the DOM
 * clones the template into a DocumentFragment
 * replaces all the placeholder content with the api output
 * returns the first div in the DocumentFragment
 */
function createCurrentCard(output) {

    // find the template in our current DOM
    const template = document.querySelector("#card-current-template");

    // clone is not an HTMLElement, but a DocumentFragment
    const clone = template.content.cloneNode(true);

    // so we need to find an HTMLElement
    // in this case, the first div in the DocumentFragment

    // first replace the city with the current city
    const city = clone.querySelector(".city");
    // look for the {{city}} placeholder and replace it with the actual city
    // textContent is the text of the element, so we can look for the placeholder and replace it with the actual city:
    city.textContent = city
        .textContent
        .replace('{{city}}', `${output.location.name}, ${output.location.country}`);

    // replace current temp - same as above
    const currentTemp = clone.querySelector(".current-temp");
    currentTemp.textContent = currentTemp
        .textContent
        .replace('{{current-temp}}', `${output.current.temp_f}°`);

    // replace max temp - same as above
    const maxTemp = clone.querySelector(".max-temp");
    maxTemp.textContent = maxTemp
        .textContent
        .replace('{{max-temp}}', `${output.forecast.forecastday[0].day.maxtemp_f}°`);

    // replace min temp - same as above
    const minTemp = clone.querySelector(".min-temp");
    minTemp.textContent = minTemp
        .textContent
        .replace('{{min-temp}}', `${output.forecast.forecastday[0].day.mintemp_f}°`);

    // replace chance - same as above
    const chance = clone.querySelector(".chance");
    chance.textContent = chance
        .textContent
        .replace('{{chance}}', `${output.forecast.forecastday[0].day.daily_chance_of_rain}%`);

    // return the first div in the DocumentFragment
    return clone.firstElementChild;
}

/*
 * create a forecast card
 * reads out the template from the DOM
 * clones the template into a DocumentFragment
 * replaces all the placeholder with the api output
 * returns the first div in the DocumentFragment
 */
function createForecastCard(forecastDay) {
    // find the template in our current DOM
    const template = document.querySelector("#card-template");

    // clone is not an HTMLElement, but a DocumentFragment
    const clone = template.content.cloneNode(true);

    // so we need to find an HTMLElement
    // in this case, the first div in the DocumentFragment

    // first replace the city with the current city
    const day = clone.querySelector(".day");
    // look for the {{day}} placeholder and replace it with the actual day
    // textContent is the text of the element
    // so we can look for the placeholder
    // and replace it with the actual day
    day.textContent = day
        .textContent
        // if the applied code doesn't work, replace with (new Date("2023-09-28")).toLocaleDateString("en-US", { weekday: 'long' }),
        // check your work by replacing it altogether with forecastDay.date
        // converts string into a Date then uses the local date string to convert it into a weekday
        // e.g. if we have "2023-09-28",it should print "Thursday"
        .replace('{{day}}', (new Date(`${forecastDay.date}T00:00:00`)).toLocaleDateString("en-US", {weekday: 'long'}));
        // The new operator lets developers create an instance of a user-defined object type or of one of the built-in object types that has a constructor function.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new
        // basically, this creates a newly defined object

    // replace current temp - same as above
    const avgTemp = clone.querySelector(".avg-temp");
    avgTemp.textContent = avgTemp
        .textContent
        .replace('{{avg-temp}}', `${forecastDay.day.avgtemp_f}°`);

    // replace max temp - same as above
    const maxTemp = clone.querySelector(".max-temp");
    maxTemp.textContent = maxTemp
        .textContent
        .replace('{{max-temp}}', `${forecastDay.day.maxtemp_f}°`);

    // replace min temp - same as above
    const minTemp = clone.querySelector(".min-temp");
    minTemp.textContent = minTemp
        .textContent
        .replace('{{min-temp}}', `${forecastDay.day.mintemp_f}°`);

    // replace chance - same as above
    const chance = clone.querySelector(".chance");
    chance.textContent = chance
        .textContent
        .replace('{{chance}}', `${forecastDay.day.daily_chance_of_rain}%`);

    // return the first div in the DocumentFragment
    return clone.firstElementChild;
}


/*
 * create a footer card
 * reads out the template from the DOM
 * clones the template into a DocumentFragment
 * replaces {{hottest-day}} with the api output
 * returns the first div in the DocumentFragment
 */
function createFooterCard(output) {

    // find the template in our current DOM
    const template = document.querySelector("#footer-template");

    // clone is not an HTMLElement, but a DocumentFragment
    const clone = template.content.cloneNode(true);

    // so we need to find an HTMLElement
    // in this case, the first div in the DocumentFragment:
    const hottestDayElement = clone.querySelector(".hottest-day");

    // replace the emote text placeholder with the actual emote text
    hottestDayElement.textContent = hottestDayElement
        .textContent
        .replace('{{hottest-day}}', `The hottest day this week will be ${hottestDay(output)}`);

    // return the first div in the DocumentFragment
    return clone.firstElementChild;

}


// calculate what the hottest day is from all days
function hottestDay(output) {
    // contains all forecast for every day
    const days = output.forecast.forecastday;

    // we only need the temperature for each day
    // read out the max temp for each day - because we want to know the HOTTEST day
    // so maxtemp_f should be the correct value
    const temps = days.map(forecastDay => forecastDay.day.maxtemp_f);

    // The Math.max() static method returns the largest of the numbers given as input parameters
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
    // because we have an array, and Math.max does not like these we need to destruct the array
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    // e.g. Math.max(...[1, 2, 3, 4]) is the same as Math.max(1, 2, 3, 4)
    // or Math.max(...temps) is the same as Math.max(temps[0], temps[1], temps[2], temps[3])
    // Spread syntax "expands" an array into its elements
    // this is syntactic sugar
    const maxTemp = Math.max(...temps);

    // we now know the temperature of the hottest day
    // so we can lookup the forecastDay for that temperature
    // we use find to find the first element in the array that matches the condition
    // The find() method of Array instances returns the first element in the provided array that satisfies the provided testing function. If no values satisfy the testing function, undefined is returned.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    const hottestDay = days.find(forecastDay => forecastDay.day.maxtemp_f === maxTemp)

    // now it returns the day of the week based on our findings
    return (new Date(`${hottestDay.date}T00:00:00`)).toLocaleDateString("en-US", {weekday: 'long'})
}