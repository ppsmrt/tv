/* Player logic for "always-on" Live TV style player (Option 2)
   - playlist.json
   - data/ads.json
   - data/ticker.json
   - Transparent overlays, slow ticker, text-only ads
*/

(() => {
  const VIDEO_EL = document.getElementById('player');
  const BRAND_LEFT = document.getElementById('brandLeft');
  const WATERMARK_RIGHT = document.getElementById('watermarkRight');
  const TIME_BOX = document.getElementById('timeBox');
  const AD_BAR = document.getElementById('adBar');
  const AD_TEXT = document.getElementById('adText');
  const TICKER = document.getElementById('tickerTrack');
  const CONTROLS = document.getElementById('controls');
  const MUTE_BTN = document.getElementById('muteBtn');
  const MUTE_ICON = document.getElementById('muteIcon');
  const FS_BTN = document.getElementById('fsBtn');

  const PLAYLIST_URL = 'playlist.json';
  const ADS_URL = 'data/ads.json';
  const TICKER_URL = 'data/ticker.json';

  let playlist = [];
  let ads = [];
  let tickerLines = [];

  let idx = 0;
  let lastAdAt = 0;
  const AD_INTERVAL = 60 * 1000; // show ad every 60s
  const AD_DURATION = 5 * 1000;   // show ad for 5s

  // small cache-bust helper
  const fetchJSON = async (url) => {
    const res = await fetch(`${url}?_=${Date.now()}`);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return res.json();
  };

  // update time box (HH:MM:SS)
  function updateTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    TIME_BOX.textContent = `${hh}:${mm}:${ss}`;
  }
  setInterval(updateTime, 1000);
  updateTime();

  // Build slow ticker content and restart animation
  function refreshTicker(nowTitle = '') {
    const timeStr = new Date().toLocaleTimeString();
    const base = (tickerLines && tickerLines.length) ? tickerLines.join(' • ') : '';
    const msg = nowTitle ? `Now Playing: ${nowTitle} - ${timeStr} • ${base}` : base || `Live • ${timeStr}`;
    // repeat message so the track is long enough to scroll smoothly
    const repeated = (msg + '   •   ').repeat(6);
    TICKER.textContent = repeated;
    // restart CSS animation (works reliably)
    void TICKER.offsetWidth;
  }

  // Play the video item at index
  async function playIndex(i = 0) {
    if (!playlist.length) return;
    idx = i % playlist.length;
    const item = playlist[idx];

    // ensure mp4 only
    if (!item || !item.url || !item.url.toLowerCase().endsWith('.mp4')) {
      console.warn('Skipping non-mp4 or missing item:', item);
      next();
      return;
    }

    // set src and play
    try {
      VIDEO_EL.src = item.url;
      VIDEO_EL.muted = true; // autoplay-friendly
      VIDEO_EL.playsInline = true;
      VIDEO_EL.load();

      refreshTicker(item.title || '');
      await VIDEO_EL.play().catch(err => {
        // autoplay may fail on some browsers; try to keep it muted then play
        console.warn('Autoplay failed:', err);
        VIDEO_EL.muted = true;
        VIDEO_EL.play().catch(e => console.warn('Play retry failed', e));
      });
    } catch (err) {
      console.error('Error playing item:', err);
      next();
    }
  }

  function next() {
    idx = (idx + 1) % Math.max(1, playlist.length);
    playIndex(idx);
  }

  // show text-only ad
  function showAd() {
    if (!ads.length) return;
    const ad = ads[Math.floor(Math.random() * ads.length)];
    AD_TEXT.textContent = ad.text || ad;
    AD_BAR.classList.add('show');
    AD_BAR.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      AD_BAR.classList.remove('show');
      AD_BAR.setAttribute('aria-hidden', 'true');
    }, AD_DURATION);
  }

  // schedule ads
  setInterval(() => {
    const now = Date.now();
    if (now - lastAdAt >= AD_INTERVAL) {
      lastAdAt = now;
      showAd();
    }
  }, 5000);

  // simple heartbeat to attempt resume if paused/stalled
  setInterval(() => {
    if (playlist.length && VIDEO_EL.paused) {
      VIDEO_EL.play().catch(() => {});
    }
  }, 5000);

  // video events
  VIDEO_EL.addEventListener('ended', () => {
    next();
  });
  VIDEO_EL.addEventListener('error', (e) => {
    console.warn('Video error, skipping to next', e);
    next();
  });
  VIDEO_EL.addEventListener('stalled', () => {
    console.warn('stalled event');
  });

  // controls show on mousemove/touch
  let hideControlsTimer = null;
  function showControls() {
    CONTROLS.classList.add('show');
    if (hideControlsTimer) clearTimeout(hideControlsTimer);
    hideControlsTimer = setTimeout(() => CONTROLS.classList.remove('show'), 3000);
  }
  ['mousemove', 'touchstart', 'touchmove'].forEach(ev => {
    document.addEventListener(ev, showControls, { passive: true });
  });

  // mute toggle
  MUTE_BTN.addEventListener('click', () => {
    VIDEO_EL.muted = !VIDEO_EL.muted;
    MUTE_ICON.className = VIDEO_EL.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
  });

  // fullscreen toggle
  FS_BTN.addEventListener('click', () => {
    const doc = document;
    if (!doc.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      doc.exitFullscreen().catch(() => {});
    }
  });

  // visibility resume
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      VIDEO_EL.play().catch(() => {});
    }
  });

  // initializer
  (async function init() {
    try {
      // set brand text (already in DOM as DEV TV)
      BRAND_LEFT.textContent = 'DEV TV';
      WATERMARK_RIGHT.textContent = 'DEVA TV';

      // load JSONs in parallel
      const [pl, adList, tick] = await Promise.all([
        fetchJSON(PLAYLIST_URL).catch(() => []),
        fetchJSON(ADS_URL).catch(() => []),
        fetchJSON(TICKER_URL).catch(() => [])
      ]);

      // normalize playlist items (some files used "src" or "url")
      playlist = (pl || []).map(it => {
        return {
          title: it.title || it.name || 'Untitled',
          url: it.url || it.src || it.file || ''
        };
      }).filter(it => it.url);

      // fallback
      if (!playlist.length) {
        playlist = [
          { title: 'Fallback Sample', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ];
      }

      ads = (adList || []).map(a => (typeof a === 'string' ? { text: a } : a));
      tickerLines = (Array.isArray(tick) ? tick : (tick && tick.ticker ? [tick.ticker] : []) );

      // prepare ticker
      refreshTicker(playlist[0]?.title || '');

      // small initial ad after 10s
      setTimeout(() => { showAd(); lastAdAt = Date.now(); }, 10000);

      // start playback
      playIndex(0);
    } catch (err) {
      console.error('Init error', err);
      // minimal fallback
      playlist = [{ title: 'Fallback Sample', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }];
      playIndex(0);
    }
  })();
})();