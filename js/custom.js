let first = true;

(() => {
    const searchForm = document.querySelector('#search-form');
    searchForm.addEventListener('submit', (event) => {
        if (first) {
            document.querySelector('.search-bar-start')?.classList.remove("search-bar-start");
            document.querySelector('.search-start')?.classList.remove("search-start");
            document.querySelector('.content.hidden')?.classList.remove("hidden");
            first = false;
        }

        event.preventDefault();
        const data = new FormData(searchForm);
        for (const value of data.values()) {
            console.log(value);
        }

        searchForm.reset();
    })
})();
