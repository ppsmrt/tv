/* Web TV – always-on looped player with transparent slow ticker
   Paths (relative to /tv/):
   - playlist:  playlist.json
   - ticker:    data/ticker.json
*/

const video = document.getElementById('player');
const loader = document.getElementById('loader');
const tickerTrack = document.getElementById('tickerTrack');
const brandLeft = document.getElementById('brandLeft');
const watermarkRight = document.getElementById('watermarkRight');

// --- State ---
let playlist = [];
let idx = 0;
let tickerLines = [];
let booted = false;

// --- Utils ---
const fetchJSON = async (url) => {
  const res = await fetch(`${url}?v=${Date.now()}`); // cache-bust for GH Pages
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
};

const showLoader = (on) => loader.classList.toggle('show', !!on);

// Concatenate ticker text and duplicate for continuous crawl
function setTicker(nowTitle = '') {
  const timeStr = new Date().toLocaleTimeString();
  const extra = tickerLines && tickerLines.length
    ? ' | ' + tickerLines.join(' | ')
    : '';
  const msg = `Now Playing: ${nowTitle} - ${timeStr}${extra}   •   `;
  // Repeat to ensure long smooth scroll
  tickerTrack.textContent = (msg + (tickerLines.join(' • ') || msg)).repeat(3);
}

// Load one video source and start playing
async function loadAndPlay(index) {
  if (!playlist.length) return;

  const item = playlist[index % playlist.length];
  idx = index % playlist.length;

  try {
    showLoader(true);

    // Prepare source (MP4-only)
    video.src = item.url;
    video.loop = false;            // we loop playlist, not single file
    video.muted = true;            // for autoplay policy
    video.playsInline = true;

    // Update overlay info
    setTicker(item.title);

    // Wait until ready and play
    await video.play().catch(() => {});
  } catch (e) {
    console.warn('Play error, skipping:', e);
    next();
  }
}

// Next item in playlist
function next() {
  idx = (idx + 1) % Math.max(1, playlist.length);
  loadAndPlay(idx);
}

// Keep-alive: if paused (visibility/tab changes), try to resume
function heartbeat() {
  if (playlist.length && (video.paused || video.readyState < 2)) {
    video.play().catch(() => {});
  }
}
setInterval(heartbeat, 5000);

// --- Events ---
video.addEventListener('canplay', () => showLoader(false));
video.addEventListener('waiting', () => showLoader(true));
video.addEventListener('stalled', () => showLoader(true));
video.addEventListener('error', () => {
  console.warn('Video error -> next()');
  next();
});
video.addEventListener('ended', next);

// Update ticker time every second
setInterval(() => setTicker(playlist[idx]?.title || ''), 1000);

// Attempt to resume when tab becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) heartbeat();
});

// --- Boot ---
(async function init() {
  try {
    // Set fixed overlay labels
    brandLeft.textContent = 'DEV TV';
    watermarkRight.textContent = 'DEVA TV';

    const [pl, tick] = await Promise.all([
      fetchJSON('playlist.json'),
      fetchJSON('data/ticker.json')
    ]);

    // filter MP4 only (safety)
    playlist = (pl || []).filter(v => v?.url?.toLowerCase().endsWith('.mp4'));

    // Fallback sample if playlist empty
    if (!playlist.length) {
      playlist = [
        { title: 'Sample (BBB)', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
      ];
    }

    tickerLines = Array.isArray(tick) ? tick : [];
    setTicker(playlist[0]?.title || '');

    booted = true;
    loadAndPlay(0);
  } catch (err) {
    console.error('Init failed:', err);
    // Minimal fallback to keep screen alive
    playlist = [
      { title: 'Sample (BBB)', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
    ];
    tickerLines = [];
    setTicker(playlist[0].title);
    loadAndPlay(0);
  }
})();