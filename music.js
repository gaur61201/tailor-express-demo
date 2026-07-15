(function initBackgroundMusic() {
  const audio = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');

  if (!audio || !toggle) return;

  const iconOn = toggle.querySelector('.music-toggle__icon--on');
  const iconOff = toggle.querySelector('.music-toggle__icon--off');
  const TARGET_VOLUME = 0.15;
  const FADE_DURATION = 0.6;
  const STORAGE_KEY = 'bg-music-enabled';
  const POSITION_KEY = 'bg-music-position';
  const TIMESTAMP_KEY = 'bg-music-timestamp';
  const NAV_GAP_THRESHOLD = 5;       // seconds — treat as an immediate page-to-page navigation
  const STALE_THRESHOLD = 5 * 60;    // seconds — beyond this, start fresh instead of resuming

  audio.volume = 0;

  function savePlaybackPosition() {
    if (!audio.paused) {
      localStorage.setItem(POSITION_KEY, audio.currentTime.toString());
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    }
  }

  function getResumePosition() {
    const savedPos = parseFloat(localStorage.getItem(POSITION_KEY) || '0');
    const savedTime = parseInt(localStorage.getItem(TIMESTAMP_KEY) || '0', 10);
    const elapsed = (Date.now() - savedTime) / 1000;

    if (savedPos > 0 && elapsed < NAV_GAP_THRESHOLD) {
      // Just navigated to a new page — keep playback in sync with real time.
      const audioDuration = audio.duration || 222; // 3:42 fallback before metadata loads
      return (savedPos + elapsed) % audioDuration;
    }

    if (savedPos > 0 && elapsed < STALE_THRESHOLD) {
      // Same visit, came back to the tab/site shortly after — resume as-is.
      return savedPos;
    }

    // Away long enough (5+ minutes) that resuming mid-track would feel stale.
    return 0;
  }

  function updateUI(playing) {
    toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
    iconOn.style.display = playing ? 'block' : 'none';
    iconOff.style.display = playing ? 'none' : 'block';
    toggle.setAttribute(
      'aria-label',
      playing ? 'Turn off background music' : 'Turn on background music'
    );
  }

  function fadeTo(volume, onComplete) {
    if (window.gsap) {
      gsap.to(audio, { volume, duration: FADE_DURATION, ease: 'power1.inOut', onComplete });
    } else {
      audio.volume = volume;
      if (onComplete) onComplete();
    }
  }

  function play() {
    const resumeFrom = getResumePosition();
    if (resumeFrom > 0 && audio.duration && resumeFrom < audio.duration) {
      audio.currentTime = resumeFrom;
    }
    return audio.play().then(() => {
      localStorage.setItem(STORAGE_KEY, 'true');
      updateUI(true);
      fadeTo(TARGET_VOLUME);
    }).catch(() => {
      // Autoplay blocked without a user gesture — normal on first visit.
      updateUI(false);
    });
  }

  function pause() {
    localStorage.setItem(STORAGE_KEY, 'false');
    updateUI(false);
    fadeTo(0, () => audio.pause());
  }

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      play();
    } else {
      pause();
    }
  });

  // Save position roughly once per second while playing (not on every
  // timeupdate tick, which fires several times a second).
  let lastSavedSecond = -1;
  audio.addEventListener('timeupdate', () => {
    if (!audio.paused) {
      const sec = Math.floor(audio.currentTime);
      if (sec !== lastSavedSecond) {
        lastSavedSecond = sec;
        savePlaybackPosition();
      }
    }
  });

  // Safety net: catch the position right before the page unloads.
  window.addEventListener('beforeunload', savePlaybackPosition);
  window.addEventListener('pagehide', savePlaybackPosition);

  // Resume from saved position once the audio's own duration is known
  // (the play()-time seek above is a best-effort fallback for when
  // duration happens to already be known, e.g. later in the same visit).
  audio.addEventListener('loadedmetadata', () => {
    const resumeFrom = getResumePosition();
    if (resumeFrom > 0 && resumeFrom < audio.duration) {
      audio.currentTime = resumeFrom;
    }
  });

  // Auto-start music on the first qualifying user gesture. Click, touch,
  // key, and pointer input reliably unlock audio.play() (confirmed via
  // repeated headless testing); scroll/wheel unlocked inconsistently in
  // the same testing, so they're kept as opportunistic extras, not relied
  // on as the primary trigger.
  //
  // BUG THIS REPLACES: the previous version bound one shared handler to
  // scroll/click/touchstart/keydown and had that handler unconditionally
  // remove ALL FOUR listeners the moment ANY ONE of them fired. Scroll
  // fires easily and its play() attempt is the least reliable of the set —
  // when it fired first and didn't result in audible playback, it had
  // already destroyed the click/touchstart/keydown listeners, leaving
  // nothing to catch the user's next (perfectly valid) click. That matched
  // the reported symptom exactly: only the dedicated toggle button worked.
  let autoStartAttempted = false;
  const GESTURE_EVENTS = ['click', 'touchstart', 'keydown', 'pointerdown', 'wheel', 'scroll'];

  function removeGestureListeners() {
    GESTURE_EVENTS.forEach((evt) => window.removeEventListener(evt, attemptAutoStart));
  }

  function attemptAutoStart() {
    if (autoStartAttempted) return; // one attempt only, regardless of which event triggered it
    autoStartAttempted = true;
    removeGestureListeners();
    play();
  }

  const wasExplicitlyMuted = localStorage.getItem(STORAGE_KEY) === 'false';

  if (wasExplicitlyMuted) {
    // User previously muted — respect their choice, don't auto-start.
    updateUI(false);
  } else {
    // Attach gesture listeners immediately (before the autoplay attempt
    // below resolves), so the very first interaction is never missed.
    GESTURE_EVENTS.forEach((evt) => {
      window.addEventListener(evt, attemptAutoStart, { once: true, passive: true });
    });

    // Also try immediate autoplay in case the browser already allows it
    // (e.g. enough prior engagement on this origin).
    play().then(() => {
      if (!audio.paused) {
        autoStartAttempted = true;
        removeGestureListeners();
      }
    });
  }
})();
