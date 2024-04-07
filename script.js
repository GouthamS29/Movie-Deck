let currentPage = 1;
let MOVIE_LIST = [];


// -------------HTML Selectors-------------

// Search Section

const searchInputArea = document.getElementById("search-input");
const searchInputBtn = document.getElementById("search-button");

// Sort Section

const dateSort = document.getElementById("date-sort");
const ratingSort = document.getElementById("rating-sort");

// Tabs Section

const allTabBtn = document.getElementById("all-tab");
const favTabBtn = document.getElementById("fav-tab");

// Movie List

const movieListContainer = document.getElementById("movie-list");

// Pagination

const prevPage = document.getElementById("prev-button");
const currentPageNumber = document.getElementById("page-number-button");
const nextPage = document.getElementById("next-button");


// -------------Data Fetching-------------

async function fetchData(pageNumber, sortOption){
    let url = "";

    if(sortOption) {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=b81b99e99799e103aca2e238e9d0a9ea&include_adult=false&include_video=false&language=en-US&page=1&page=${pageNumber}&sort_by=popularity.desc`;
    }
    else{
        url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&api_key=b81b99e99799e103aca2e238e9d0a9ea&page=${pageNumber}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    console.log(data);
    const result = data["results"];

    const modifiedList = remapData(result);

    MOVIE_LIST = modifiedList;
    
    return modifiedList;

}

function remapData(movieList = []) {
    const modifiedList = movieList.map((movieObj) => {
        return{
            id: movieObj.id,
            popularity: movieObj.popularity,
            voteAvg: movieObj.vote_average,
            title: movieObj.title,
            posterPath: movieObj.poster_path,
            overview: movieObj.overview,
        };
    });

    return modifiedList;
}

// -------------Render Data-------------

function renderMovies(movieList = []) {
    movieList.forEach((movie) => {
        const {id} = movie;
        const movieCardHTML = createMovieCard(movie);
        movieListContainer.append(movieCardHTML);

        const likeElement = document.getElementById(`icon${id}`);

        likeElement.addEventListener("click", (event) => {
            const movieLiked = event.target.id;
            const isFavMovie = likeElement.classList.contains("fa-solid");
            console.log(movieLiked);
            if(isFavMovie){

                removeMoviesFromLocalStorage(movieLiked);
                likeElement.classList.add("fa-regular");
                likeElement.classList.remove("fa-solid");
                console.log(movieLiked);
            }
            else{

                setMoviesToLocalStorage(id)
                likeElement.classList.remove("fa-regular");
                likeElement.classList.add("fa-solid");
                console.log(id);
            }
        });

        const favMovies = getMoviesToLocalStorage();
        const isFavMovie = favMovies.includes(id);
        if(isFavMovie){
            likeElement.classList.remove("fa-regular");
            likeElement.classList.add("fa-solid");
        }
        console.log(favMovies);
    });
}

function createMovieCard(movie) {
    const { id, title, popularity, posterPath, voteAvg, overview} = movie;
    const imgLink = `https://image.tmdb.org/t/p/original/${posterPath}`;
    const cardContainerElement = document.createElement("div");
    cardContainerElement.id = id;
    cardContainerElement.classList.add("card");

    cardContainerElement.innerHTML = `
        <section id="image-holder">
            <img class="poster" alt="${title}" src="${imgLink}"/>
        </section>
        <h2 class="title">${title}</h2>
        <p class="movie-overview">${overview}</p>
        <section class="votes-fav">
            <section class="votes">
                <p class="vote-count">Votes: ${voteAvg}</p>
                <p class="popularity-count">Popularity: ${popularity}</p>
            </section>
            <section class="favourites" id="favourites${id}">
                <i id=icon${id} class="fa-regular fa-heart" style="color: #0d0d0c; font-size:24px"></i>
            </section>
        </section>
    `;
    return cardContainerElement;
}

function clearMovies() {
    movieListContainer.innerHTML = "";
}

async function fecilitator(sortOption = false) {
    const data = await fetchData(currentPage, sortOption);
    clearMovies();
    renderMovies(data);

    allTabBtn.classList.add("active-tab");
}
fecilitator();

// Search Section

searchInputArea.addEventListener("input", () => {
    const searchTerm = searchInputArea.value.trim().toLowerCase();
    const filteredMovies = MOVIE_LIST.filter(movie => movie.title.toLowerCase().includes(searchTerm));
    clearMovies();
    renderMovies(filteredMovies);
});

// Buttons Section

prevPage.addEventListener("click", () => {
    currentPage--;
    fecilitator();
    currentPageNumber.innerHTML = `${currentPage}`;

    if(currentPage == 1){
        prevPage.disabled = true;
    }
    else{
        prevPage.disabled = false;
    }
});

nextPage.addEventListener("click", () => {
    currentPage++;
    fecilitator();
    currentPageNumber.innerHTML = `${currentPage}`;
});


ratingSort.addEventListener("click", () => {

    ratingSort.classList.toggle("sort-button-active");

    if(ratingSort.classList.contains("sort-button-active")){
        fecilitator(true);
    }else{
        fecilitator(false);
    }
});

function displayOnTabSwitch(element){
    const id = element.id;
    if(id === "all-tab"){
        ratingSort.style.display = "block";
        dateSort.style.display = "block";
        fecilitator();
    }
    else if(id === "fav-tab"){
        clearMovies();

        const favMovieIds = getMoviesToLocalStorage();
        const favMovieList = MOVIE_LIST.filter((movie) => {
            const{id} = movie;
            return favMovieIds.includes(id);
        });
        renderMovies(favMovieList);
        console.log(favMovieList);
    }
    else{}
}

function switchTabs(event){
    allTabBtn.classList.remove("active-tab");
    favTabBtn.classList.remove("active-tab");

    const element = event.target;
    element.classList.add("active-tab");

    displayOnTabSwitch(element);
}
allTabBtn.addEventListener("click", switchTabs);
favTabBtn.addEventListener("click", switchTabs);

// Favourites Section

function setMoviesToLocalStorage(newFavMovie) {
    const lastFavMovie = getMoviesToLocalStorage();
    const arrOfFavMovies = [...lastFavMovie, newFavMovie];
    localStorage.setItem("favMovie", JSON.stringify(arrOfFavMovies));
}

function getMoviesToLocalStorage() {
    const allFavMovieObj = JSON.parse(localStorage.getItem("favMovie"));
    console.log(allFavMovieObj);
    if(!allFavMovieObj)
    {
        return [];
    }
    else
    {
        return allFavMovieObj;
    }
}


function removeMoviesFromLocalStorage(id){
    const allFavMovieObj = getMoviesToLocalStorage();
    const filteredMovies = allFavMovieObj.filter((ids) => Number(ids) != Number(String(id).substring(4)));
    localStorage.setItem("favMovie", JSON.stringify(filteredMovies));
}