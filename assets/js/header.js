(function () {
  // ✅ Detect if inside Kodular WebView
  const inKodular = typeof window.AppInventor !== "undefined" &&
                    typeof window.AppInventor.setWebViewString === "function";

  // ✅ Function to send messages to Kodular
  function sendToApp(message) {
    if (inKodular) {
      window.AppInventor.setWebViewString(message);
    } else {
      console.log("App Message:", message); // fallback for browser
    }
  }

  // ✅ Example: Intercept download links
  document.addEventListener("click", function (e) {
    let target = e.target.closest("a");

    if (target && target.hasAttribute("data-download")) {
      e.preventDefault();
      let url = target.getAttribute("href");
      sendToApp("download:" + url);
    }
  });

  // ✅ Example: Intercept external links
  document.addEventListener("click", function (e) {
    let target = e.target.closest("a");

    if (target && target.hasAttribute("data-external")) {
      e.preventDefault();
      let url = target.getAttribute("href");
      sendToApp("open:" + url);
    }
  });

  // ✅ Example: Custom video player trigger
  window.playInApp = function (videoUrl) {
    sendToApp("play:" + videoUrl);
  };

  // ✅ Debug info
  if (inKodular) {
    sendToApp("ready");
  } else {
    console.log("Running in browser mode");
  }
})();

(function () {
  const inKodular = typeof window.AppInventor !== "undefined" &&
                    typeof window.AppInventor.setWebViewString === "function";

  function sendToApp(message) {
    if (inKodular) {
      window.AppInventor.setWebViewString(message);
    } else {
      console.log("App Message:", message);
    }
  }

  // ========================
  // Premium Pull-to-Refresh
  // ========================
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  let isRefreshing = false;
  const refreshThreshold = 90; // px distance

  const loader = document.createElement("div");
  loader.id = "refreshLoader";
  loader.innerHTML = `<div class="spinner"></div>`;
  document.body.prepend(loader);

  function startRefresh() {
    if (isRefreshing) return;
    isRefreshing = true;
    loader.classList.add("active");

    sendToApp("refresh");

    setTimeout(() => {
      loader.classList.remove("active");
      isRefreshing = false;
      location.reload();
    }, 1500);
  }

  document.addEventListener("touchstart", (e) => {
    if (document.documentElement.scrollTop === 0 && !isRefreshing) {
      startY = e.touches[0].clientY;
      isDragging = true;
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    currentY = e.touches[0].clientY;
    let distance = currentY - startY;

    if (distance > 0) {
      e.preventDefault();
      let pull = Math.min(distance / 2, 120); // damp effect
      loader.style.transform = `translateY(${pull}px)`;
      loader.style.opacity = Math.min(1, distance / refreshThreshold);
    }
  });

  document.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;

    let distance = currentY - startY;

    if (distance > refreshThreshold) {
      startRefresh();
    } else {
      // bounce back
      loader.style.transform = "translateY(0)";
      loader.style.opacity = "0";
    }
  });

  // ========================
  // Existing Kodular Hooks
  // ========================
  document.addEventListener("click", function (e) {
    let target = e.target.closest("a");

    if (target && target.hasAttribute("data-download")) {
      e.preventDefault();
      let url = target.getAttribute("href");
      sendToApp("download:" + url);
    }

    if (target && target.hasAttribute("data-external")) {
      e.preventDefault();
      let url = target.getAttribute("href");
      sendToApp("open:" + url);
    }
  });

  window.playInApp = function (videoUrl) {
    sendToApp("play:" + videoUrl);
  };

  if (inKodular) {
    sendToApp("ready");
  } else {
    console.log("Running in browser mode");
  }
})();