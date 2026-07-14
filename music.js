(function initBackgroundMusic() {
  const audio = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');

  if (!audio || !toggle) return;

  const iconOn = toggle.querySelector('.music-toggle__icon--on');
  const iconOff = toggle.querySelector('.music-toggle__icon--off');
  const TARGET_VOLUME = 0.25;
  const FADE_DURATION = 0.6;
  const STORAGE_KEY = 'bg-music-enabled';

  audio.volume = 0;

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
    audio.play().then(() => {
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

  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    play();
  } else {
    updateUI(false);
  }
})();
