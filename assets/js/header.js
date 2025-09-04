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