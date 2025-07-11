function getSongInfo() {
  const titleEl = document.querySelector(".title.ytmusic-player-bar");
  const artistEl = document.querySelector(".byline.ytmusic-player-bar");
  const albumImg = document.querySelector("#thumbnail img");
  const progressBar = document.querySelector("#progress-bar");

  const title = titleEl?.innerText || "Unknown";
  const artist = artistEl?.innerText || "Unknown";
  const albumName = albumImg?.alt || "Unknown Album";
  const albumImage = albumImg?.src || "";
  const progress_ms = Number(progressBar?.getAttribute("aria-valuenow") || 0);
  const duration_ms = Number(progressBar?.getAttribute("aria-valuemax") || 0);

  // Detect ad heuristically:
  const isAd =
    !title ||
    title.toLowerCase().includes("ad") ||
    artist.toLowerCase().includes("ad") ||
    title.toLowerCase().includes("advertisement") ||
    artist.toLowerCase().includes("advertisement");

  return {
    is_playing: Boolean(title) && !isAd,
    ad_playing: isAd,
    progress_ms,
    item: isAd
      ? null
      : {
          name: title,
          artists: artist.split(",").map((a) => ({ name: a.trim() })),
          album: {
            name: albumName,
            images: albumImage ? [{ url: albumImage }] : [],
          },
          duration_ms,
          external_urls: {
            youtube_music: window.location.href,
          },
          preview_url: null,
        },
  };
}

function sendNowPlaying() {
  try {
    const song = getSongInfo();

    // If ad is playing, send a minimal object or skip sending:
    if (song.ad_playing) {
      // Option 1: Send minimal info to indicate ad playing
      chrome.runtime.sendMessage({
        type: "NOW_PLAYING",
        song: { is_playing: false, ad_playing: true },
      });

      fetch(
        "https://spotify-now-playing-23l0.onrender.com/update-now-playing",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: "youtube",
            is_playing: false,
            ad_playing: true,
          }),
        }
      ).catch(console.error);
      return;
    }

    // Normal song playing
    chrome.runtime.sendMessage({ type: "NOW_PLAYING", song });

    fetch("https://spotify-now-playing-23l0.onrender.com/update-now-playing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "youtube", ...song }),
    }).catch(console.error);
  } catch (err) {
    console.warn(
      "sendNowPlaying error (possibly due to context invalidation):",
      err
    );
  }
}

let observer = null;
let interval = null;

function initializeTracking() {
  try {
    if (observer) observer.disconnect();
    if (interval) clearInterval(interval);

    observer = new MutationObserver(sendNowPlaying);
    observer.observe(document.body, { childList: true, subtree: true });

    interval = setInterval(sendNowPlaying, 1000);
    sendNowPlaying(); // immediate run
  } catch (err) {
    console.warn("Initialization error:", err);
  }
}

// SPA: detect when URL changes (YouTube Music uses history API)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("🔄 SPA navigation detected, reinitializing tracker");
    initializeTracking();
  }
}).observe(document.body, { childList: true, subtree: true });

// First load
initializeTracking();

function safeSendMessage(message) {
  try {
    if (chrome?.runtime?.id) {
      chrome.runtime.sendMessage(message);
    }
  } catch (err) {
    console.warn("chrome.runtime.sendMessage failed:", err);
  }
}
