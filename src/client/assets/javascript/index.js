


var store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};

const nicknames = {
  'Racer 1': 'Sandra',
  'Racer 2': 'Lara',
  'Racer 3': 'Emma',
  'Racer 4': 'Melina',
  'Racer 5': 'Elena'
};

const locations = {
  "Track 1": "Kitchen",
  "Track 2": "Livingroom",
  "Track 3": "Library",
  "Track 4": "Bathroom",
  "Track 5": "Kids room",
  "Track 6": "Garden"
};

document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  try {
    await getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
    });

    await getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    "click",
    function (event) {
      const { target } = event;

      if (target.matches(".card.track")) {
        handleSelectTrack(target);
      }

      
      if (
        target.matches(".card.podracer")
      ) {
        handleSelectPodRacer(target);
      }

      
      if (target.matches("#submit-create-race")) {
        event.preventDefault();

        
        handleCreateRace();
      }

      
      if (target.matches("#gas-peddle")) {
        handleAccelerate();
      }
    },
    false
  );
}

async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}



async function handleCreateRace() {
  
  renderAt("#race", renderRaceStartView(store.track_id, store.player_id));

  

  
  const race = await createRace(store.player_id, store.track_id)
    .then((response) => {
      store.race_id = response.ID - 1
    })
    .catch((error) => console.error(error));
  
  
  

  
  
  await runCountdown()
    .then(() => startRace(store.race_id))
    .then(() => runRace(store.race_id))
  

  
}

/* # 
 ## Runs a race. 
 ## 
 ## Args: 
 ##     raceID (int): The ID of the race to run. 
 ## 
 ## Returns: 
 ##     Promise: A promise that resolves when the race is finished. 
 ## 
 ## */ 
async function runRace(raceID) {
  
  return new Promise((resolve) => {

    let raceInterval = setInterval(() => {
        let run = getRace(raceID)
        .then((race) => {
          return race;
        }).then((raceData) => {
        if(raceData.status === 'in-progress') {
          renderAt("#leaderBoard", raceProgress(raceData.positions));
        }
        if (raceData.status === 'finished') {
         
          clearInterval(raceInterval); 
          renderAt("#race", resultsView(raceData.positions)); 
          resolve();
        }
      }, 500);
  });
  });

  
}

// 
 //// Runs a countdown timer. 
 //// 
 //// Parameters: 
 //// 
 ////     None. 
 //// 
 //// Returns: 
 //// 
 ////     Promise: A promise that resolves when the countdown is finished. 
 //// 
 //// Throws: 
 // 
async function runCountdown() {
  try {
    
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      
      let timerInterval = setInterval(() => {
        document.getElementById("big-numbers").innerHTML = --timer;
        if (timer == 0) {
          clearInterval(timerInterval);
          resolve()
          return;
        }
      }, 1000);
      

      
    });
  } catch (error) {
    console.log(error);
  }
}

function handleSelectPodRacer(target) {

  
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  
  target.classList.add("selected");

  
  store.player_id = target.id;
}

function handleSelectTrack(target) {

  
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  
  target.classList.add("selected");
  
  store.track_id = target.id;
}

/* // 
 //// This function is a wrapper for the accelerate function. 
 //// It takes a single argument, which is the race_id of the race to be accelerated. 
 //// It then calls the accelerate function, and returns the result. 
 ////  */
async function handleAccelerate(target) {
  
  await accelerate(store.race_id);
}




function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join("");

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3>${nicknames[driver_name]}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join("");

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${locations[name]}</h3>
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track, racers) {
  return `
		<header>
			<h1>Race: ${locations[track.name]}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  let userPlayer = positions.find((e) => {
    let result = e.id == store.player_id;
    return result;
  });

  let new_positions = positions.sort((a, b) => (a.segment - b.segment));
  let count = 1;

  const results = new_positions.map((p) => {
    return `
			<tr>
				<td>
					<h3>${count++} - ${nicknames[p.driver_name]} ${userPlayer.driver_name === p.driver_name ? '(you)' : ''}</h3>
				</td>
			</tr>
		`;
  });

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}





const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
}



async function getTracks() {
  
  let tracks = await fetch(`${SERVER}/api/tracks`, {
    ...defaultFetchOpts(),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
   
  return tracks;
}

async function getRacers() {
  
  let cars = await fetch(`${SERVER}/api/cars`)
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
   
  return cars;
}

// 
 //// Create a new race. 
 //// 
 //// Parameters: 
 //// 
 //// player_id (int): The id of the player who is racing. 
 //// 
 //// track_id (int): The id of the track that the player is racing on. 
 // 
async function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return await fetch(`${SERVER}/api/races`, {
    method: "POST",
    ...defaultFetchOpts(),
    dataType: "jsonp",
    body: JSON.stringify(body),
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log("Problem with createRace request::", err));
}

async function getRace(id) {
  
  let race = await fetch(`${SERVER}/api/races/${id}`)
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
   
  return race;
}

// 
 //// startRace(id) 
 //// 
 //// This function takes a single argument, id, which is a string. 
 //// 
 //// This function returns a promise. 
 //// 
 //// This function makes a POST request to the server at the specified URL. 
 //// 
async function startRace(id) {
  return await fetch(`${SERVER}/api/races/${id}/start`, {
    method: "POST",
    ...defaultFetchOpts(),
  })
    .catch((err) => console.log("Problem with getRace request::", err));
}

async function accelerate(id) {
  
  
  
  await fetch(
    `${SERVER}/api/races/${id}/accelerate`,
    {
      method: "POST",
      ...defaultFetchOpts(),
    })
    .catch((error) => {
      console.error(error);
    });
}
