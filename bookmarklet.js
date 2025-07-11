javascript: (function () {
  try {
    const title =
      document.querySelector("ytmusic-player-bar .title")?.innerText ||
      "Unknown";
    const artist =
      document.querySelector("ytmusic-player-bar .byline")?.innerText ||
      "Unknown";
    const image = document.querySelector("#song-image img")?.src || "";
    const url = location.href;

    fetch("https://spotify-now-playing-23l0.onrender.com/update-now-playing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: "youtube",
        is_playing: true,
        progress_ms: 0,
        item: {
          name: title,
          artists: artist.split(",").map((name) => ({ name: name.trim() })),
          album: {
            name: "YouTube Music",
            images: [{ url: image }],
          },
          duration_ms: 0,
          external_urls: { youtube_music: url },
          preview_url: null,
        },
      }),
    });
    alert("✅ Song sent to server!");
  } catch (e) {
    alert("⚠️ Failed to send song info");
    console.error(e);
  }
})();
