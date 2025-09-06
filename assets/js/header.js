
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