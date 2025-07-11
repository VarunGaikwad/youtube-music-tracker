let currentSeconds = 0;
let durationSeconds = 0;
let timer;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function updateUILocally() {
  const player = document.getElementById("player");
  const noMusic = document.getElementById("noMusic");

  if (!durationSeconds) {
    player.style.display = "none";
    noMusic.style.display = "block";
    clearInterval(timer);
    return;
  }

  player.style.display = "block";
  noMusic.style.display = "none";

  const currentTimeEl = document.getElementById("currentTime");
  const totalTimeEl = document.getElementById("totalTime");
  const progressBar = document.getElementById("progressBar");

  currentTimeEl.innerText = formatTime(Math.floor(currentSeconds));
  totalTimeEl.innerText = formatTime(durationSeconds);

  const progressPercent = (currentSeconds / durationSeconds) * 100;
  progressBar.style.width = progressPercent + "%";

  if (currentSeconds < durationSeconds) {
    currentSeconds += 0.25; // increment 250ms per tick
  }
}

function fetchNowPlaying() {
  chrome.runtime.sendMessage({ type: "GET_NOW_PLAYING" }, (response) => {
    if (!response?.is_playing || !response.item) {
      document.getElementById("player").style.display = "none";
      document.getElementById("noMusic").style.display = "block";
      clearInterval(timer);
      return;
    }

    const { item, progress_ms } = response;

    currentSeconds = progress_ms; // progress_ms assumed seconds
    durationSeconds = item.duration_ms; // assumed seconds

    const albumArt = document.getElementById("albumArt");
    albumArt.src = item.album.images[0]?.url || "";
    albumArt.alt = item.album.name || "Album Art";

    const titleEl = document.getElementById("title");
    const artistEl = document.getElementById("artist");
    titleEl.innerText = item.name;
    artistEl.innerText = item.artists.map((a) => a.name).join(", ");

    // Immediately update UI before starting timer
    updateUILocally();

    if (timer) clearInterval(timer);
    timer = setInterval(updateUILocally, 250); // update every 250ms
  });
}

fetchNowPlaying();
