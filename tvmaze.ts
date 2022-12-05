import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const BASE_URL = 'http://api.tvmaze.com';
const PLACEHOLDER_IMG = 'https://tinyurl.com/tv-missing';

// not a minimum. errors for extra keys??!?
interface IShows {
  show: {
    id: number;
    image?: {
      medium: string;
    };
    name: string;
    summary: string;
  };
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<IShows[]> {
  const resp = await axios({
    url: `${BASE_URL}/search/shows`,
    method: 'get',
    params: {q: term}
  });
  console.log("getShowsByTerm, resp is", resp);
  return resp.data; //TODO: the idea is to "PLUG UP" where there is image:null
  //TODO: and then to PLUCK only the 4-5 things we need
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: IShows[]): void {
  $showsList.empty();

  for (let show of shows) { //TODO: try not to put logic into this loop. presentational only
    let imageSrc;
    show.show.image === null
      ? imageSrc = PLACEHOLDER_IMG
      : imageSrc = show.show.image.medium;

    const $show = $(
        `<div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${imageSrc}"
              alt="${show.show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.show.name}</h5>
             <div><small>${show.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent): Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$showsList.on("click", "button.Show-getEpisodes", async function (evt: JQuery.ClickEvent) {
  const showId = $(evt.target).closest('.Show').data('show-id');
  populateEpisodes(await getEpisodesOfShow(showId));
});



interface IEpisodes {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<IEpisodes[]> {
  const resp = await axios({
    url: `${BASE_URL}/shows/${id}/episodes`,
    method: 'get',
  });
  console.log("getEpisodesOfShow resp is", resp);
  return resp.data;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: IEpisodes[]) {
  $episodesList.empty();

  for(let episode of episodes) {
    $episodesList.append($(`
      <li>${episode.name} (season ${episode.season}, number ${episode.number})</li>
    `))
  }

  $episodesArea.show();
}
