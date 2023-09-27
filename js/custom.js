let first = true;

(() => {
    const searchForm = document.querySelector('#search-form');
    searchForm.addEventListener('submit', async (event) => {
        if (first) {
            document.querySelector('.search-bar-start')?.classList.remove("search-bar-start");
            document.querySelector('.search-start')?.classList.remove("search-start");
            document.querySelector('.content.hidden')?.classList.remove("hidden");
            first = false;
        }

        event.preventDefault();
        const data = new FormData(searchForm);

        const location = data.get("search-text");
        const output = await getCurrentWeather(location);
        const currentCard = createCurrentCard(output);
        const cards = output.forecast.forecastday.map(forecastDay => {
            return (createForecastCard(forecastDay));
        });
        const currentCardOld = document.querySelector('.card-current');
        currentCardOld.replaceWith(currentCard);
        const emoteCard = createEmoteCard(output.current);
        const emoteCardOld = document.querySelector(".emote-card");
        emoteCardOld.replaceWith(emoteCard);
        // const footerContentOld = document.querySelector('.footer-content');
        // footerContentOld.replaceWith(footerContent);

        Array.from(document.querySelectorAll('.card')).forEach((element, index) => element.replaceWith(cards[index +1]));

        searchForm.reset();
    })
})();

const SECRET_KEY='e59f580fe1e84a549bd15830232609';

function getCurrentWeather(location) {
    const options = {method: 'GET'};

    return fetch(`http://api.weatherapi.com/v1/forecast.json?key=${SECRET_KEY}&q=${location}&days=4`, options)
        .then(response => response.json())
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(err => console.error(err));
}

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

function createForecastCard(forecastDay) {

    return elementFromHTML(`
    <div class="card">
        <h4>${(new Date(forecastDay.date)).toLocaleDateString("en-US", { weekday: 'long' })}</h4>
        <h1>${forecastDay.day.avgtemp_f}°</h1>
        <h6>Today’s High: ${forecastDay.day.maxtemp_f}</h6>
        <h6>Today’s Low: ${forecastDay.day.mintemp_f}</h6>
        <h6>Chance of Precipitation: ${forecastDay.day.daily_chance_of_rain}%</h6>
    </div>`)
}
// FOR LINE 64, if the applied code doesn't work, replace with (new Date("2023-09-28")).toLocaleDateString("en-US", { weekday: 'long' }), check your work by replacing it altogether with forecastDay.date

function elementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstElementChild;
}

function emote(temp, type) {
    if (type === "f") {
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
}

function createEmoteCard(current) {

    return elementFromHTML(`
    <div class="emote-card">
        <h2>It's ${emote(current.temp_f, "f")} today!</h2>
    </div>`)
}

// function emoteDescriptor(temp, type) {
//     if (type === "f") {
//         if (temp > 75) {
//             return "hottest"
//         }
//         if (temp >= 45 && temp <= 75) {
//             return "most moderate";
//         }
//         if (temp < 45) {
//         }
//         return "coldest";
//     }
// }

// function createFooterCard(current) {

//     return elementFromHTML(`
//     <div class="footer-content">
//         <h2>The ${emoteDescriptor(current.temp_f, "f")} day this week will be ${forecastDay.date}</h2>
//     </div>`)
// }