document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  const controls = document.querySelector(".shaka-controls-container");
  let controlsTimeout;

  // Initialize Shaka player
  shaka.polyfill.installAll();
  if (shaka.Player.isBrowserSupported()) {
    const player = new shaka.Player(video);

    player.addEventListener("error", (e) => {
      console.error("Shaka Player Error:", e.detail);
    });

    // Load stream from Firebase later if needed
    const urlParams = new URLSearchParams(window.location.search);
    const streamUrl = urlParams.get("stream");
    if (streamUrl) {
      player.load(streamUrl).catch((e) => console.error("Load error", e));
    }
  } else {
    console.error("Browser not supported!");
  }

  // ========== CONTROLS AUTO-HIDE IN PORTRAIT ==========
  function showControls() {
    controls.classList.remove("opacity-0");
    controls.classList.add("opacity-100");

    clearTimeout(controlsTimeout);
    if (window.matchMedia("(orientation: portrait)").matches) {
      controlsTimeout = setTimeout(() => {
        controls.classList.remove("opacity-100");
        controls.classList.add("opacity-0");
      }, 3000); // hide after 3s in portrait
    }
  }

  // Show controls on user interaction
  video.addEventListener("touchstart", showControls);
  video.addEventListener("click", showControls);

  // Always show controls in fullscreen (landscape)
  video.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      controls.classList.remove("opacity-0");
      controls.classList.add("opacity-100");
      clearTimeout(controlsTimeout); // disable hiding in fullscreen
    } else {
      showControls(); // restart portrait behavior
    }
  });

  // Start with hidden controls in portrait
  if (window.matchMedia("(orientation: portrait)").matches) {
    controls.classList.add("opacity-0");
  }
});