let currentSong = {
  is_playing: false,
  progress_ms: 0,
  item: {
    name: "Nothing playing",
    artists: [{ name: "" }],
    album: {
      name: "",
      images: [],
    },
    duration_ms: 0,
    external_urls: {
      youtube_music: "",
    },
    preview_url: null,
  },
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NOW_PLAYING") {
    currentSong = message.song;
  }

  if (message.type === "GET_NOW_PLAYING") {
    sendResponse(currentSong);
  }
});
