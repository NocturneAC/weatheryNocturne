let first = true;
let previousSearches = [];
// TODO: hide this
const SECRET_KEY = 'e59f580fe1e84a549bd15830232609';

(() => {
    const searchForm = document.querySelector('#search-form');
    searchForm.addEventListener('submit', async (event) => {
        // stop form from submitting anything to the server
        event.preventDefault();

        // transition from full page search view into weather view after searching for the first time
        if (first) {
            document.querySelector('.search-bar-start')?.classList.remove("search-bar-start");
            document.querySelector('.search-start')?.classList.remove("search-start");
            document.querySelector('.content.hidden')?.classList.remove("hidden");
            first = false;
        }

        // parse currently submitted form data
        const data = new FormData(searchForm);

        // read out the location that the user submitted
        const location = data.get("location");
        // store our last searches in an array
        previousSearches = [location, ...previousSearches]
            // only keep the last three
            .slice(0, 2); 

        let output;
        try {
            // call the weather api and get info on current location
            output = await getWeather(location);
            // if we typed in something that couldn't be found
            if (output.error) {
                throw new Error(output.error);
            }
        } catch (e) {
            console.error(e.message);
            alert(e.message);
            return;
        }

        // sanity check
        if (!output) {
            return;
        }


        // here we update our current card view
        // we bind the data to a html string and create an html element
        // which we then replace

        // bind data to html and create htmlelement
        const currentCard = createCurrentCard(output);
        // load the stale current card from dom
        const currentCardOld = document.querySelector('.card-current');
        // replace the current card with our newly created card
        currentCardOld.replaceWith(currentCard);

        // again updating the emote card view - same as before
        const emoteCard = createEmoteCard(output);
        const emoteCardOld = document.querySelector(".emote-card");
        emoteCardOld.replaceWith(emoteCard);

        // again updating the hottest day card view - same as before
        const footerContent = createFooterCard(output);
        const footerContentOld = document.querySelector('.footer-content');
        footerContentOld.replaceWith(footerContent);

        // create cards for the next three days
        // iterate over all days
        const cards = output.forecast.forecastday
            // on index 0 sits our current day, we need to skip this
            .filter((_, index) => index > 0)
            // now bind the data to the view
            .map(forecastDay => createForecastCard(forecastDay));

        // iterate over our card in the dom
        // replace every card with our new cards
        // since we skipped today,
        // cards[0] contains tomorrow
        // cards[1] contains the day after tomorrow
        // cards[2] contains the day after the day after tomorrow
        Array.from(
            document.querySelectorAll('.card')
        ).forEach((element, index) =>
            // we replace the elements with the current day
            element.replaceWith(cards[index])
        );

        // we clear the search form
        searchForm.reset();
    })
})();


async function getWeather(location) {
    const options = {method: 'GET'};

    // days=4 contains today, plus three additional days
    const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${SECRET_KEY}&q=${location}&days=4`, options)
    // if the api has an error for whatever reason display the error
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    // convert the response body from string to json
    return await response.json();
}

// bind data from the api into our html
// we create a html string first
// then convert into a HTMLElement
function createCurrentCard(weatherOutput) {
    return elementFromHTML(`
    <div class="card-current">
        <h2>Current Temp</h2>
        <h4>${weatherOutput.location.name}, ${weatherOutput.location.country}</h4>
        <h1>${weatherOutput.current.temp_f}°</h1>
        <h6>Today’s High: ${weatherOutput.forecast.forecastday[0].day.maxtemp_f}</h6>
        <h6>Today’s Low: ${weatherOutput.forecast.forecastday[0].day.mintemp_f}</h6>
        <h6>Chance of Precipitation: ${weatherOutput.forecast.forecastday[0].day.daily_chance_of_rain}%</h6>
    </div>`);
}

// bind data from the api into our html
// we create a html string first
// then convert into a HTMLElement
function createForecastCard(forecastDay) {
    // FOR LINE 64, if the applied code doesn't work, replace with (new Date("2023-09-28")).toLocaleDateString("en-US", { weekday: 'long' }), check your work by replacing it altogether with forecastDay.date

    return elementFromHTML(`
    <div class="card">
        <h4>${(new Date(forecastDay.date)).toLocaleDateString("en-US", {weekday: 'long'})}</h4>
        <h1>${forecastDay.day.avgtemp_f}°</h1>
        <h6>High: ${forecastDay.day.maxtemp_f}</h6>
        <h6>Low: ${forecastDay.day.mintemp_f}</h6>
        <h6>Chance of Precipitation: ${forecastDay.day.daily_chance_of_rain}%</h6>
    </div>`)
}


// bind data from the api into our html
// we create a html string first
// then convert into a HTMLElement
function elementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstElementChild;
}

// check what emote text we should use
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

// bind data from the api into our html
// we create a html string first
// then convert into a HTMLElement
function createEmoteCard(output) {
    const emoteText = emote(output.forecast.forecastday[0].day.maxtemp_f);
    return elementFromHTML(`
    <div class="emote-card ${emoteText}">
        <h2>It's ${emoteText} today!</h2>
    </div>`)
}

// calculate what the hottest day is from all days
function hottestDay(output) {
    // read out the highest temp of each day
    const temps = output.forecast.forecastday.map(forecastDay => forecastDay.day.maxtemp_f);
    // get the max temp
    const maxTemp = Math.max(...temps);
    // look for the index of the hottest day
    const hottestDayIndex = temps.findIndex(temp => temp === maxTemp);
    // get the hottest day
    const hottestDay = output.forecast.forecastday[hottestDayIndex];
    // display the weekday name of the date
    return (new Date(hottestDay.date)).toLocaleDateString("en-US", {weekday: 'long'})
}

// bind data from the api into our html
// we create a html string first
// then convert into a HTMLElement
function createFooterCard(output) {
    return elementFromHTML(`
    <div class="footer-content">
        <h2>The hottest day this week will be ${hottestDay(output)}</h2>
    </div>`)
}