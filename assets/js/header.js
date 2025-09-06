const ptrIndicator = document.createElement('div');
ptrIndicator.textContent = '↓ Pull to refresh';
ptrIndicator.style.cssText = `
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.9rem;
  transition: top 0.3s;
  color: #facc15; /* yellow-400 */
`;
header.appendChild(ptrIndicator);

document.body.prepend(header);

// Pull-to-refresh logic
let startY = 0;
let isPulling = false;

window.addEventListener('touchstart', (e) => {
  if (window.scrollY === 0) {
    startY = e.touches[0].clientY;
    isPulling = true;
  }
});

window.addEventListener('touchmove', (e) => {
  if (!isPulling) return;
  const distance = e.touches[0].clientY - startY;
  if (distance > 0) {
    ptrIndicator.style.top = `${-40 + distance}px`;
    if (distance > 60) ptrIndicator.textContent = '↻ Release to refresh';
    else ptrIndicator.textContent = '↓ Pull to refresh';
  }
});

window.addEventListener('touchend', (e) => {
  if (!isPulling) return;
  const distance = e.changedTouches[0].clientY - startY;
  if (distance > 60) {
    ptrIndicator.textContent = '⟳ Refreshing...';
    // Simulate refresh (replace with your own fetch or reload logic)
    setTimeout(() => {
      ptrIndicator.style.top = '-40px';
      ptrIndicator.textContent = '↓ Pull to refresh';
    }, 1500);
  } else {
    ptrIndicator.style.top = '-40px';
  }
  isPulling = false;
});

// ✅ Kodular WebView Native Adapter
(function () {
  const isKodular = /kodular/i.test(navigator.userAgent) || typeof Android !== "undefined";
  if (!isKodular) return;

  console.log("Kodular Native Adapter Loaded");

  // --- 1. SPA-like Navigation (links open inside app) ---
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link || !link.href) return;

    const url = link.href;
    const sameHost = url.includes(location.host);

    e.preventDefault();

    if (!sameHost && typeof Android !== "undefined" && Android.openExternal) {
      // External link → open outside
      Android.openExternal(url);
    } else {
      // Internal link → load inside app with transition
      navigateInApp(url);
    }
  });

  function navigateInApp(url) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.background = "#000";
    overlay.style.opacity = "0";
    overlay.style.zIndex = "9999";
    overlay.style.transition = "opacity 0.3s ease";
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      setTimeout(() => {
        window.location.href = url;
      }, 250);
    });
  }

  // --- 2. Buttons always work ---
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn && btn.onclick) {
      e.preventDefault();
      btn.onclick.call(btn, e);
    }
  });

  // --- 3. Video Fullscreen Fix ---
  function enableKodularFullscreen(videoContainerId = "videoContainer") {
    const container = document.getElementById(videoContainerId);
    if (!container) return;

    document.addEventListener("fullscreenerror", () => {
      console.warn("Fullscreen not supported → using Kodular CSS fallback");
      container.classList.add("css-fullscreen");
    });

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        container.classList.remove("css-fullscreen");
      }
    });
  }
  enableKodularFullscreen();

  // --- 4. Safe Area (notch support) ---
  document.body.style.paddingTop = "env(safe-area-inset-top)";
  document.body.style.paddingBottom = "env(safe-area-inset-bottom)";

  // --- 5. Offline Banner ---
  function showOfflineBanner() {
    if (document.getElementById("offlineBanner")) return;
    const banner = document.createElement("div");
    banner.id = "offlineBanner";
    banner.innerText = "⚠️ You are offline. Please check your connection.";
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.right = "0";
    banner.style.zIndex = "99999";
    banner.style.background = "#f87171";
    banner.style.color = "#fff";
    banner.style.padding = "10px";
    banner.style.textAlign = "center";
    banner.style.fontWeight = "bold";
    document.body.appendChild(banner);
  }
  window.addEventListener("offline", showOfflineBanner);
  window.addEventListener("online", () => {
    document.getElementById("offlineBanner")?.remove();
  });

  // --- 6. Auto-hide video controls ---
  const controls = document.getElementById("controls");
  if (controls) {
    let timeout;
    function showControls() {
      controls.style.opacity = "1";
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        controls.style.opacity = "0";
      }, 2500);
    }
    document.getElementById("video")?.addEventListener("touchstart", showControls);
  }

  // --- 7. Disable pinch-zoom & overscroll (native feel) ---
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());
  document.addEventListener("gestureend", (e) => e.preventDefault());

  document.body.style.overscrollBehavior = "none"; // no bounce effect
})();