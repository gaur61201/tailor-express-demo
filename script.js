/* =============================================
   TAILOR EXPRESS — script.js
   Step 1: Preloader · Navigation · Hero
   Motion contract: confident, unhurried.
   See BRAND_CONTEXT.md §5.2, §10, §14.1
   ============================================= */

(() => {
  'use strict';

  if (typeof gsap === 'undefined') {
    console.warn('[Tailor Express] GSAP not loaded — animations disabled.');
    document.body.classList.remove('is-loading');
    const pl = document.getElementById('preloader');
    if (pl) pl.style.display = 'none';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* === Brand motion defaults (BRAND_CONTEXT.md §5.2)
     "Stress-free luxury, even when you're in a hurry":
     slow durations, smooth eases. NEVER back.out or elastic. */
  gsap.defaults({
    ease: 'power3.out',
    duration: 1.2,
  });

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* =============================================
     PRELOADER SEQUENCE
     Spec: BRAND_CONTEXT.md §10
     ~3.5–4s total
     ============================================= */
  const runPreloader = () => {
    const preloader = document.getElementById('preloader');
    if (!preloader) {
      document.body.classList.remove('is-loading');
      startHeroReveal();
      return;
    }

    if (prefersReducedMotion) {
      gsap.set(preloader, { opacity: 0, pointerEvents: 'none' });
      gsap.set(preloader, { display: 'none', delay: 0.2 });
      document.body.classList.remove('is-loading');
      startHeroReveal();
      return;
    }

    const xSvg     = preloader.querySelector('.preloader__x');
    const xCircle  = preloader.querySelector('.preloader__x-circle');
    const xStrokes = preloader.querySelectorAll('.preloader__x-stroke');
    const wordmark = preloader.querySelector('.preloader__wordmark');
    const barFill  = preloader.querySelector('.preloader__bar-fill');

    const tl = gsap.timeline({
      onComplete: () => {
        // Remove the preloader entirely so no residual layer can ever
        // sit on top of the nav or interfere with interactions
        preloader.remove();
        document.body.classList.remove('is-loading');
        startHeroReveal();
      }
    });

    // Step 1: X stitches itself (~2.0–2.5s, power3.inOut)
    tl.fromTo(xSvg,
      { scale: 0.95, transformOrigin: '50% 50%' },
      { scale: 1.0, duration: 2.2, ease: 'power3.inOut' }
    )
    .fromTo(xCircle,
      { strokeDashoffset: 100 },
      { strokeDashoffset: 0, duration: 1.4, ease: 'power3.inOut' },
      0
    )
    .fromTo(xStrokes,
      { strokeDashoffset: 100 },
      { strokeDashoffset: 0, duration: 1.2, ease: 'power3.inOut', stagger: 0.15 },
      0.7
    )
    // Step 2: wordmark fade in (overlaps end of Step 1)
    .to(wordmark,
      { opacity: 1, duration: 1.0, ease: 'power3.out' },
      1.8
    )
    // Step 3: progress bar fills
    .to(barFill,
      { width: '100%', duration: 0.8, ease: 'power2.inOut' },
      2.6
    )
    // Step 4: exit fade
    .to(preloader,
      { opacity: 0, duration: 0.7, ease: 'power3.inOut' },
      3.5
    );
  };

  /* =============================================
     NAVIGATION
     ============================================= */
  const initNav = () => {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('nav-burger');
    const panel = document.getElementById('nav-panel');
    if (!nav) return;

    // Scroll state
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile burger toggle
    if (burger && panel) {
      const closePanel = () => {
        burger.classList.remove('is-open');
        panel.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      };
      burger.addEventListener('click', () => {
        const isOpen = panel.classList.toggle('is-open');
        burger.classList.toggle('is-open', isOpen);
        burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closePanel));
      // Close on resize back to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closePanel();
      });
    }
  };

  /* =============================================
     EN/AR LANGUAGE TOGGLE
     Updates BOTH html.dir and body.dir so CSS matches either selector.
     ============================================= */
  const initLangToggle = () => {
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const currentDir = document.documentElement.dir || document.body.dir || 'ltr';
        const nextDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
        const nextLang = nextDir === 'rtl' ? 'ar' : 'en';

        document.documentElement.dir = nextDir;
        document.documentElement.lang = nextLang;
        document.body.dir = nextDir;

        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      });
    });
  };

  /* =============================================
     HERO REVEAL
     Runs after preloader completes.
     Order: eyebrow → headline (line-by-line mask) → subline → 24/7 → CTAs → X icon → scroll cue
     ============================================= */
  let heroRevealStarted = false;
  function startHeroReveal() {
    if (heroRevealStarted) return;
    heroRevealStarted = true;

    if (prefersReducedMotion) {
      gsap.set('.hero__eyebrow, .hero__headline, .hero__subline, .hero__open, .hero__ctas, .hero__media-x, .hero__scroll-cue', {
        opacity: 1
      });
      return;
    }

    // Prepare headline lines for mask-wipe reveal.
    // Each .hero__line gets an inner wrapper translated 105% down inside
    // the line's overflow:hidden box — the wrapper then animates to y:0.
    document.querySelectorAll('.hero__line').forEach(line => {
      if (line.querySelector('.hero__line-inner')) return;
      const inner = document.createElement('span');
      inner.className = 'hero__line-inner';
      inner.style.display = 'inline-block';
      inner.style.transform = 'translateY(105%)';
      inner.style.willChange = 'transform';
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
    });

    // Explicit initial transform states — without these the fade-up
    // animations would animate y:0→0 (visually a pure fade, not a lift).
    gsap.set('.hero__subline',   { y: 28, opacity: 0 });
    gsap.set('.hero__open',      { y: 28, opacity: 0 });
    gsap.set('.hero__ctas',      { y: 24, opacity: 0 });
    gsap.set('.hero__media-x',   { scale: 0.9, opacity: 0, transformOrigin: '50% 50%' });
    gsap.set('.hero__scroll-cue',{ y: 8,  opacity: 0 });

    const tl = gsap.timeline({ delay: 0.1 });

    tl.to('.hero__eyebrow', {
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
    })
    .to('.hero__line-inner', {
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
      stagger: 0.10,
    }, '-=0.4')
    .to('.hero__subline', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
    }, '-=0.7')
    .to('.hero__open', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
    }, '-=0.6')
    .to('.hero__ctas', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
    }, '-=0.6')
    .to('.hero__media-x', {
      opacity: 1,
      scale: 1.0,
      duration: 1.2,
      ease: 'power3.out',
    }, '-=0.8')
    .to('.hero__scroll-cue', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.3');
  }

  /* =============================================
     ABOUT SECTION ANIMATIONS (Step 2A)
     - Scale-breathing scrub on the image (enters 0.9/0.6, settles 1/1,
       exits 0.9/0.6 as the section travels through viewport)
     - One-time entry reveals on eyebrow, heading, paragraphs, CTA
     - matchMedia handles reduced-motion cleanly
     ============================================= */
  const initAbout = () => {
    const section = document.querySelector('.about');
    if (!section) return;
    const imageContainer = section.querySelector('.about__image-container');

    // Wrap each visible heading span's text in an inner translatable element
    // so we get a clean mask-wipe reveal (parent acts as overflow mask).
    section.querySelectorAll('.about__heading .en-text, .about__heading .ar-text')
      .forEach(span => {
        if (span.dataset.prepared) return;
        const inner = document.createElement('span');
        inner.className = 'about__heading-inner';
        inner.style.display = 'inline-block';
        inner.style.willChange = 'transform, opacity';
        while (span.firstChild) inner.appendChild(span.firstChild);
        span.appendChild(inner);
        span.style.display = 'inline-block';
        span.style.overflow = 'hidden';
        span.dataset.prepared = '1';
      });

    const mm = gsap.matchMedia();

    // === Standard motion ===
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // 1. Scale-breathing scrub IN — fires before pin engages
      gsap.fromTo(imageContainer,
        { scale: 0.85, opacity: 0.6 },
        {
          scale: 1.0,
          opacity: 1.0,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top 30%',
            scrub: 1,
          },
        }
      );

      // OUT scrub removed: it would fire DURING the pin range
      // (the 'bottom 70%' trigger lands inside the pin scroll distance),
      // causing the X placeholder to shrink mid-pin.
      // User spec confirms scale 1.0 throughout the pinned phase.

      // 2. One-time entry reveals — fire before pin engages
      gsap.set('.about__heading-inner', { y: '110%' });
      gsap.set('.about__paragraph',     { y: 24, opacity: 0 });
      gsap.set('.about__cta',           { y: 16, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
        defaults: { ease: 'power3.out' },
      });

      tl.to('.about__eyebrow', { opacity: 1, duration: 0.8 })
        .to('.about__heading-inner', { y: 0, duration: 1.2, stagger: 0.15 }, '-=0.4')
        .to('.about__paragraph', { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 }, '-=0.7')
        .to('.about__cta', { y: 0, opacity: 1, duration: 0.6 }, '+=0.1');
    });

    // === Reduced motion: show everything statically ===
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(imageContainer, { scale: 1, opacity: 1 });
      gsap.set('.about__heading-inner', { y: 0 });
      gsap.set('.about__eyebrow, .about__paragraph, .about__cta', { opacity: 1, y: 0 });
    });
  };

  /* =============================================
     ABOUT BACKGROUND SEQUENCE (Step 2A amendment)
     - Desktop: pin section + scrub timeline crossfading 8 backgrounds
                with subtle 1.0 → 1.05 scale on the active image
     - Mobile:  IntersectionObserver auto-advance every 2s, no pin
     - Reduced: bg_01 static only, no pin
     ============================================= */
  const initAboutBgSequence = () => {
    const section = document.querySelector('.about');
    if (!section) return;
    const backgrounds = Array.from(section.querySelectorAll('.about__bg'));
    if (backgrounds.length < 2) return;

    const mm = gsap.matchMedia();

    // ---------- DESKTOP: pin + scrub crossfade ----------
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      // Reset all bgs, ensure bg_01 starts visible at scale 1.0
      gsap.set(backgrounds, { opacity: 0, scale: 1.0, transformOrigin: '50% 50%' });
      gsap.set(backgrounds[0], { opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=400%',           // 4× viewport height of pin scroll
          pin: true,
          scrub: 1,                // 1-second smoothing — buttery scroll-link
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const N = backgrounds.length;     // 8
      const SLOT = 1;                    // seconds per bg in timeline
      const CROSSFADE = 0.35;            // crossfade duration (felt cinematic)

      // Subtle scale-up on each active bg: 1.0 → 1.05 across its slot
      for (let i = 0; i < N; i++) {
        tl.fromTo(backgrounds[i],
          { scale: 1.0 },
          { scale: 1.05, ease: 'none', duration: SLOT },
          i * SLOT
        );
      }

      // Crossfades at each boundary (between slots)
      for (let i = 0; i < N - 1; i++) {
        const transitionStart = (i + 1) * SLOT - CROSSFADE / 2;
        tl.to(backgrounds[i],     { opacity: 0, duration: CROSSFADE, ease: 'power2.inOut' }, transitionStart);
        tl.to(backgrounds[i + 1], { opacity: 1, duration: CROSSFADE, ease: 'power2.inOut' }, transitionStart);
      }

      return () => {
        gsap.set(backgrounds, { clearProps: 'opacity,transform,scale' });
      };
    });

    // ---------- MOBILE: IntersectionObserver auto-advance ----------
    mm.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      let currentIndex = 0;
      let intervalId = null;

      gsap.set(backgrounds, { opacity: 0, scale: 1.0 });
      gsap.set(backgrounds[0], { opacity: 1 });

      const advance = () => {
        const next = (currentIndex + 1) % backgrounds.length;
        gsap.to(backgrounds[currentIndex], { opacity: 0, duration: 0.6, ease: 'power2.inOut' });
        gsap.to(backgrounds[next],         { opacity: 1, duration: 0.6, ease: 'power2.inOut' });
        currentIndex = next;
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !intervalId) {
            intervalId = setInterval(advance, 2000);
          } else if (!entry.isIntersecting && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        });
      }, { threshold: 0.3 });
      observer.observe(section);

      return () => {
        if (intervalId) clearInterval(intervalId);
        observer.disconnect();
        gsap.set(backgrounds, { clearProps: 'opacity,transform,scale' });
      };
    });

    // ---------- REDUCED MOTION: bg_01 static only ----------
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(backgrounds, { opacity: 0, scale: 1.0 });
      gsap.set(backgrounds[0], { opacity: 1 });
    });
  };

  /* =============================================
     NAV AUTO-HIDE on immersive sections
     - Sections that take over the viewport (Services carousel,
       Gallery 3D scene) hide the nav while they're active so the
       sticky bar doesn't compete with the experience.
     - Slides nav up (translateY -100%) when section is ≥40% visible
     - Slides back down when section scrolls past
     - reduced-motion path: opacity fade instead of slide
     - Reentry (scrolling back UP into section) hides again
     - A single shared `isHidden` flag prevents flicker when two
       trigger zones overlap (e.g. scrolling from Services straight
       into Gallery).
     ============================================= */
  const initNavAutoHide = () => {
    const nav = document.getElementById('nav');
    if (!nav || typeof ScrollTrigger === 'undefined') return;

    const targets = [
      document.querySelector('.services'),
      document.getElementById('pillar'),
      document.getElementById('gallery'),
      document.getElementById('testimonials'),
    ].filter(Boolean);
    if (targets.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DUR = 0.5;
    const EASE = 'power3.inOut';

    // Track which sections currently want the nav hidden. We only
    // show the nav when ALL hide-requesters have released it —
    // protects against the moment you scroll from one hide-section
    // into the next where two triggers' states briefly conflict.
    const hideRequesters = new Set();

    const sync = () => {
      const shouldHide = hideRequesters.size > 0;
      if (shouldHide && nav.dataset.navHidden !== 'true') {
        nav.dataset.navHidden = 'true';
        if (prefersReducedMotion) {
          gsap.to(nav, { opacity: 0, duration: DUR, ease: EASE, overwrite: 'auto' });
        } else {
          gsap.to(nav, { y: '-100%', duration: DUR, ease: EASE, overwrite: 'auto' });
        }
        nav.setAttribute('aria-hidden', 'true');
      } else if (!shouldHide && nav.dataset.navHidden === 'true') {
        nav.dataset.navHidden = 'false';
        if (prefersReducedMotion) {
          gsap.to(nav, { opacity: 1, duration: DUR, ease: EASE, overwrite: 'auto' });
        } else {
          gsap.to(nav, { y: 0, duration: DUR, ease: EASE, overwrite: 'auto' });
        }
        nav.removeAttribute('aria-hidden');
      }
    };

    targets.forEach((el) => {
      const key = el.id || el.className;
      // Hide when section occupies the upper viewport (≈40% visible),
      // show when it passes.
      //   start 'top 60%'    ≈ 40% of section visible from below
      //   end   'bottom 30%' = section's bottom is 30% from top
      //                       (about to leave viewport entirely)
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 30%',
        onEnter:     () => { hideRequesters.add(key); sync(); },
        onLeave:     () => { hideRequesters.delete(key); sync(); },
        onEnterBack: () => { hideRequesters.add(key); sync(); },
        onLeaveBack: () => { hideRequesters.delete(key); sync(); },
      });
    });
  };

  /* =============================================
     SERVICES CAROUSEL (Step 3)
     Architecture:
     - Card position math: signed position from active index (-2..-1..0..+1..+2)
       wraps circularly for N=6. Positions ±3 are hidden.
     - Each transition: GSAP animates all cards to their new positions in parallel,
       plus the section background-color and the heading-color CSS variable.
     - Auto-advance, hover/touch pause, IntersectionObserver, Page Visibility,
       keyboard, swipe (mobile), reduced-motion all wired here.
     ============================================= */
  const initServices = () => {
    const section = document.querySelector('.services');
    if (!section) return;
    const carousel = section.querySelector('.services__carousel');
    const cards = Array.from(section.querySelectorAll('.services__card'));
    const dots = Array.from(section.querySelectorAll('.services__dot'));
    const liveRegion = section.querySelector('.services__live-region');
    const prevBtn = section.querySelector('.services__arrow--prev');
    const nextBtn = section.querySelector('.services__arrow--next');
    const N = cards.length;
    if (N === 0) return;

    // ----- Apply overlay colors from data attributes -----
    // Note: the data-overlay-rgba value still carries an alpha component for
    // backward compatibility, but we IGNORE it here and only use the rgb
    // portion. The actual overlay opacity is animated per card position
    // inside applyPositions (0.12 when active, 0.65 when side).
    cards.forEach(card => {
      const rgba = card.dataset.overlayRgba;
      const overlay = card.querySelector('.services__card-overlay');
      if (overlay && rgba) {
        const [r, g, b] = rgba.split(',').map(s => s.trim());
        overlay.style.background = `rgb(${r}, ${g}, ${b})`;
        overlay.style.opacity = '0.65'; // pre-JS state matches side-card opacity
      }
    });

    // Overlay opacity targets — referenced inside applyPositions
    const OVERLAY_OPACITY_ACTIVE = 0.12;
    const OVERLAY_OPACITY_SIDE   = 0.65;

    // ----- State -----
    let activeIndex = 0;
    let autoTimer = null;
    let resumeTimer = null;
    let entryDone = false;
    let isInView = false;
    let interactingUser = false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileQuery = window.matchMedia('(max-width: 900px)');

    const ROTATE_DURATION = 0.8;
    const ROTATE_EASE = 'power3.inOut';
    const AUTO_INTERVAL = 5000;
    const RESUME_DELAY = 3000;

    // Desktop position config (signed relative position → transform values)
    // Returns an object with the GSAP target props for a given signed position.
    function desktopConfigForPosition(pos) {
      // pos is -3..+3 (we use 0 = active, ±1 neighbor, ±2 far, ±3 hidden)
      const abs = Math.abs(pos);
      if (abs === 0) return { x: 0,    scale: 1.0,  rotate: 0,            opacity: 1.0,  zIndex: 6 };
      if (abs === 1) return { x: pos * 300, scale: 0.70, rotate: pos * 6,  opacity: 0.6,  zIndex: 5 };
      if (abs === 2) return { x: pos * 520, scale: 0.55, rotate: pos * 10, opacity: 0.30, zIndex: 3 };
      return            { x: Math.sign(pos) * 640, scale: 0.45, rotate: Math.sign(pos) * 14, opacity: 0, zIndex: 1 };
    }
    function mobileConfigForPosition(pos) {
      // Mobile Pattern B — symmetric peek: active card centered at 70vw,
      // adjacent cards peek from each edge at 0.3 opacity. Translate
      // neighbors by 70vw + 5px (center-to-center) so each shows ~15vw.
      // Edge cards (first/last) hide the wrapped neighbor so no broken
      // peek appears on the missing side.
      if (pos === 0) return { x: 0, scale: 1.0, rotate: 0, opacity: 1, zIndex: 5 };
      const isEdgeWrap =
        (activeIndex === 0     && pos === -1) ||
        (activeIndex === N - 1 && pos ===  1);
      if ((pos === 1 || pos === -1) && !isEdgeWrap) {
        const peekX = window.innerWidth * 0.70 + 5;
        return { x: pos * peekX, scale: 1.0, rotate: 0, opacity: 0.3, zIndex: 3 };
      }
      // Edge-wrap neighbor OR far cards — push off-screen, fully hidden
      return { x: Math.sign(pos || 1) * window.innerWidth, scale: 1.0, rotate: 0, opacity: 0, zIndex: 1 };
    }
    function configForPosition(pos) {
      return mobileQuery.matches ? mobileConfigForPosition(pos) : desktopConfigForPosition(pos);
    }

    function getSignedPosition(cardIdx) {
      let rel = (cardIdx - activeIndex + N) % N;
      if (rel > N / 2) rel -= N;
      return rel;
    }

    // ----- Render carousel state -----
    function applyPositions(animate = true) {
      const duration = (animate && !prefersReducedMotion) ? ROTATE_DURATION : 0;
      cards.forEach((card, i) => {
        const pos = getSignedPosition(i);
        const cfg = configForPosition(pos);
        gsap.to(card, {
          x: cfg.x,
          y: 0,
          scale: cfg.scale,
          rotate: cfg.rotate,
          opacity: cfg.opacity,
          zIndex: cfg.zIndex,
          duration,
          ease: ROTATE_EASE,
          overwrite: 'auto',
        });

        // Overlay opacity — active card reveals image (12%), side cards stay
        // muted (65%). Animates with the same timing as the card rotation.
        const overlay = card.querySelector('.services__card-overlay');
        if (overlay) {
          const targetOverlayOpacity = (pos === 0) ? OVERLAY_OPACITY_ACTIVE : OVERLAY_OPACITY_SIDE;
          gsap.to(overlay, {
            opacity: targetOverlayOpacity,
            duration,
            ease: ROTATE_EASE,
            overwrite: 'auto',
          });
        }
      });

      // Section bg + header color flip
      const active = cards[activeIndex];
      const targetBg = active.dataset.sectionBg;
      // Determine if bg is "dark" → flip header text to cream.
      // Sage olive (#515a47) added 2026-05-14: it's dark enough that plum
      // text disappears against it. Red (#ff5050) and light coral (#ff8773)
      // are saturated/mid bgs — plum text still has acceptable contrast,
      // so they stay in the "light" branch.
      const darkBgs = ['#33202a', '#60202e', '#515a47'];
      const isDarkBg = darkBgs.includes(targetBg.toLowerCase());
      const targetFg = isDarkBg ? '#f6e8ea' : '#33202a';
      const targetFgSoft = isDarkBg ? '#f06449' : '#60202e';

      gsap.to(section, {
        '--services-bg': targetBg,
        '--services-fg': targetFg,
        '--services-fg-soft': targetFgSoft,
        backgroundColor: targetBg,
        duration,
        ease: 'power2.inOut',
      });

      // Dot active state
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeIndex));

      // Live region announcement
      if (liveRegion) {
        const enLabel = active.getAttribute('aria-label') || '';
        liveRegion.textContent = enLabel ? `Now showing: ${enLabel}` : '';
      }
    }

    // ----- Navigation -----
    function advance() {
      activeIndex = (activeIndex + 1) % N;
      applyPositions(true);
      restartAutoTimerIfRunning();
    }
    function retreat() {
      activeIndex = (activeIndex - 1 + N) % N;
      applyPositions(true);
      restartAutoTimerIfRunning();
    }
    function goTo(idx) {
      activeIndex = ((idx % N) + N) % N;
      applyPositions(true);
      restartAutoTimerIfRunning();
    }

    // ----- Auto-advance -----
    function startAuto() {
      if (prefersReducedMotion) return;
      if (!entryDone || !isInView || interactingUser || document.hidden) return;
      stopAuto();
      autoTimer = setInterval(advance, AUTO_INTERVAL);
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }
    function restartAutoTimerIfRunning() {
      if (autoTimer) { stopAuto(); startAuto(); }
    }
    function pauseInteraction() {
      interactingUser = true;
      stopAuto();
      if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
    }
    function resumeInteractionAfterDelay() {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        interactingUser = false;
        startAuto();
      }, RESUME_DELAY);
    }

    // ----- Events -----
    if (prevBtn) prevBtn.addEventListener('click', retreat);
    if (nextBtn) nextBtn.addEventListener('click', advance);
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Hover pause/resume (desktop)
    section.addEventListener('mouseenter', pauseInteraction);
    section.addEventListener('mouseleave', resumeInteractionAfterDelay);

    // Keyboard
    carousel.addEventListener('keydown', (e) => {
      const isRtl = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        isRtl ? advance() : retreat();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        isRtl ? retreat() : advance();
      }
    });

    // Card click → focus that card by index (judgment call from brief:
    // "clicks on cards should do nothing for now (or optionally bring that
    // card into the center position)"). Bringing it to center is the more
    // satisfying default.
    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (i !== activeIndex) goTo(i);
      });
    });

    // Mobile touch swipe — uses touchstart/move/end. Threshold 50px.
    let touchStartX = 0, touchStartY = 0, touchMoved = false;
    section.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
      pauseInteraction();
    }, { passive: true });
    section.addEventListener('touchmove', (e) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > 10 && dx > dy) touchMoved = true;
    }, { passive: true });
    section.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (touchMoved && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        const isRtl = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
        // Swipe LEFT (negative dx) advances in LTR; swipe RIGHT in RTL
        if ((dx < 0 && !isRtl) || (dx > 0 && isRtl)) advance();
        else retreat();
      }
      resumeInteractionAfterDelay();
    }, { passive: true });

    // Page Visibility — pause when tab hidden, resume when shown
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto();
      else startAuto();
    });

    // IntersectionObserver — only auto-advance while section is in view
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isInView = entry.isIntersecting;
        if (isInView) {
          // Trigger entry animation once
          if (!entryDone && !prefersReducedMotion) {
            runEntryAnimation();
          } else if (!entryDone) {
            // Reduced-motion: jump straight to carousel positions
            applyPositions(false);
            entryDone = true;
          }
          startAuto();
        } else {
          stopAuto();
        }
      });
    }, { threshold: 0.3 });
    io.observe(section);

    // ----- Entry animation (stack → spread) -----
    function setStackedInitialState() {
      // All cards stacked at center with slight offsets + rotations.
      // Topmost card index = activeIndex (will be Card 1).
      const stackOffsetsY  = [0, 4, 8, 12, 16, 20];
      const stackRotations = [-3, 2, -1, 3, -2, 1];
      cards.forEach((card, i) => {
        gsap.set(card, {
          x: 0,
          y: stackOffsetsY[i] || 0,
          scale: 0.88,
          rotate: stackRotations[i] || 0,
          opacity: i === activeIndex ? 1 : 0.92,
          zIndex: N - i,
        });
      });
      // Set initial section bg to match Card 1's pair
      const initialBg = cards[activeIndex].dataset.sectionBg;
      gsap.set(section, {
        '--services-bg': initialBg,
        backgroundColor: initialBg,
      });
    }

    function runEntryAnimation() {
      if (entryDone) return;
      const tl = gsap.timeline({
        onComplete: () => {
          entryDone = true;
          startAuto();
        }
      });
      // Spread cards in sequence — outer cards (3, 4) leave first, then 2, 5, then 1, 6
      // For a more theatrical reveal we order by abs(signed position) descending.
      const order = cards
        .map((card, i) => ({ card, i, abs: Math.abs(getSignedPosition(i)) }))
        .sort((a, b) => b.abs - a.abs); // farthest first
      order.forEach((item, k) => {
        const pos = getSignedPosition(item.i);
        const cfg = configForPosition(pos);
        tl.to(item.card, {
          x: cfg.x,
          y: 0,
          scale: cfg.scale,
          rotate: cfg.rotate,
          opacity: cfg.opacity,
          zIndex: cfg.zIndex,
          duration: 1.0,
          ease: 'power3.inOut',
        }, k * 0.08);
        // Animate the active card's overlay down to 0.12 in lockstep with spread
        const overlay = item.card.querySelector('.services__card-overlay');
        if (overlay) {
          const targetOverlayOpacity = (pos === 0) ? OVERLAY_OPACITY_ACTIVE : OVERLAY_OPACITY_SIDE;
          tl.to(overlay, {
            opacity: targetOverlayOpacity,
            duration: 1.0,
            ease: 'power3.inOut',
          }, k * 0.08);
        }
      });
    }

    // ----- Init -----
    if (prefersReducedMotion) {
      applyPositions(false);
      entryDone = true;
    } else {
      setStackedInitialState();
    }

    // Re-render on viewport breakpoint change so cards re-flow correctly
    const handleMqChange = () => applyPositions(false);
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', handleMqChange);
    else if (mobileQuery.addListener) mobileQuery.addListener(handleMqChange);

    // Window resize: re-apply (positions depend on px values that scale with breakpoint)
    let resizeRaf = null;
    window.addEventListener('resize', () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => applyPositions(false));
    });
  };

  /* =============================================
     24/7 PILLAR SECTION (Step 4)
     - Pinned section; timeline plays on entry (scrub: false)
     - 1s pause after pin engages → 5s animation
     - Body travels along a quadratic Bezier arc (no MotionPathPlugin needed)
     - Moon (crescent) cross-fades to Sun (full circle + rays) at mid-journey
     - Background animates through 5 stops: midnight → blush daylight
     - Counter ticks 00 → 24 in sync with progress
     - Counter + label colors flip cream → plum as bg goes light
     - Reduced-motion: skip pin, snap to final state
     Spec: BRAND_CONTEXT.md §11.3, §14.4 + Step 4 brief
     ============================================= */
  const initPillar = () => {
    const section = document.querySelector('#pillar');
    if (!section) return;

    const body           = section.querySelector('.pillar__body');
    const moon           = section.querySelector('.pillar__moon');
    const moonGlow       = section.querySelector('.pillar__moon-glow');
    const sunCircle      = section.querySelector('.pillar__sun-circle');
    const sunGlow        = section.querySelector('.pillar__sun-glow');
    const sunRays        = section.querySelector('.pillar__sun-rays');
    const arcPath        = section.querySelector('.pillar__arc-path');
    const counter        = section.querySelector('.pillar__counter');
    const counterNumber  = section.querySelector('.pillar__counter-number');
    const counterLabel   = section.querySelector('.pillar__counter-label');
    const description    = section.querySelector('.pillar__description');
    const counter2       = section.querySelector('.pillar__counter2');
    const counter2Number = section.querySelector('.pillar__counter2-number');
    const counter2Label  = section.querySelector('.pillar__counter2-label');
    const description2   = section.querySelector('.pillar__description2');

    if (!body || !counterNumber) return;

    /* === Arc geometry — TRUE 180° semicircle in SVG userSpace (viewBox 0 0 1000 540).
       Matches the static <path> d: M 50 500 A 450 450 0 0 1 950 500.
       Center (500, 500), radius 450, going counterclockwise (upper dome). */
    const ARC_CX = 500;
    const ARC_CY = 500;
    const ARC_R  = 450;
    const arcPoint = (t) => {
      // theta sweeps from π (left endpoint) down to 0 (right endpoint),
      // passing through π/2 at the apex.
      const theta = Math.PI * (1 - t);
      return {
        x: ARC_CX + ARC_R * Math.cos(theta),
        y: ARC_CY - ARC_R * Math.sin(theta),  // SVG y flipped → apex is small y
      };
    };
    const setBodyAt = (t) => {
      const p = arcPoint(t);
      // Use setAttribute (faster + more reliable than gsap.set with attr plugin
      // for raw SVG transform attributes on every onUpdate frame)
      body.setAttribute('transform', `translate(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`);
    };

    /* === Phase colors ===
       The plain sun (phase B) is gold; it tweens to coral during phase C as
       the halo and rays bloom in. */
    const SUN_PLAIN_COLOR   = '#f0a050';
    const SUN_GLOWING_COLOR = '#f08054';
    const RAYS_FINAL_OPACITY = 0.55;

    /* === Resting-state target offsets ===
       Where the counter slides to (mobile: up; desktop: left + vertically
       centered) and where the description starts before sliding in. Computed
       at runtime so the math accounts for actual font-shaping width. */
    const isMobileViewport = () => window.innerWidth <= 900;
    const isRtlNow = () => (document.documentElement.dir === 'rtl' || document.body.dir === 'rtl');

    const counterRest = { x: 0, y: 0 };
    const computeCounterRest = () => {
      const sectionRect = section.getBoundingClientRect();
      const counterRect = counter.getBoundingClientRect();
      if (isMobileViewport()) {
        // Mobile: 4 elements stack vertically; counter1 lands at ~16% from top
        // (was 14%) — paired with the tighter desc/counter2/desc2 anchors.
        const targetCenterY = sectionRect.top + sectionRect.height * 0.16;
        counterRest.x = 0;
        counterRest.y = targetCenterY - (counterRect.top + counterRect.height / 2);
        return;
      }
      // Desktop: counter's leading edge anchored 10% from section's leading
      // side, anchored 30% down (was 25%) so the two halves sit closer
      // together and read as one composition. RTL flips left↔right.
      const targetLeadingEdge = isRtlNow()
        ? sectionRect.right - sectionRect.width * 0.1 - counterRect.width
        : sectionRect.left + sectionRect.width * 0.1;
      const targetCenterY = sectionRect.top + sectionRect.height * 0.30;
      counterRest.x = targetLeadingEdge - counterRect.left;
      counterRest.y = targetCenterY - (counterRect.top + counterRect.height / 2);
    };

    const setupDescriptionInitial = () => {
      if (isMobileViewport()) {
        // Mobile: top:38% / left:50% via CSS; xPercent:-50 centers
        // horizontally; y:40 is the off-screen-below start for the slide-up.
        gsap.set(description, { xPercent: -50, x: 0, yPercent: -50, y: 40, opacity: 0 });
      } else {
        // Desktop: anchored top-half-right (top:25% inset-inline-end:10%)
        // via CSS. yPercent:-50 vertically centers around top:25%; x:80
        // is the off-screen-trailing start. RTL mirrors x sign.
        gsap.set(description, {
          xPercent: 0,
          x: isRtlNow() ? -80 : 80,
          yPercent: -50,
          y: 0,
          opacity: 0,
        });
      }
    };

    /* === Secondary group ("7 days a week") initial state ===
       Counter2 lives bottom-half-trailing (top:75% inset-inline-end:10%);
       description2 lives bottom-half-leading. Both hidden until Phase 6. */
    const setupSecondaryInitial = () => {
      if (isMobileViewport()) {
        // Mobile: stacked at 62% (counter2) and 86% (desc2) of section.
        // xPercent:-50 + left:50% → horizontally centered; yPercent:-50
        // for counter2 vertical center; y:40 for desc2 slide-up start.
        gsap.set(counter2, { xPercent: -50, x: 0, yPercent: -50, y: 0, opacity: 0 });
        gsap.set(description2, { xPercent: -50, x: 0, yPercent: -50, y: 40, opacity: 0 });
      } else {
        const isRtl = isRtlNow();
        // Desktop: counter2 absolute at top:75% right:10% — vertical center
        // via yPercent:-50.
        gsap.set(counter2, { xPercent: 0, x: 0, yPercent: -50, y: 0, opacity: 0 });
        // Description2 absolute at top:75% left:10% (or right:10% in RTL via
        // inset-inline-start). Slides in from the leading side, so x:-80 in
        // LTR (slides right) and x:+80 in RTL (slides left).
        gsap.set(description2, {
          xPercent: 0,
          x: isRtl ? 80 : -80,
          yPercent: -50,
          y: 0,
          opacity: 0,
        });
      }
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* === Reduced motion: snap to final COMPOSED state, no pin ===
       Plum bg, both halves visible: "24" top-left + description top-right
       + "7" bottom-right + description-2 bottom-left. */
    if (reducedMotion) {
      counterNumber.textContent = '24';
      counter2Number.textContent = '7';
      requestAnimationFrame(() => {
        computeCounterRest();
        gsap.set(counter, { x: counterRest.x, y: counterRest.y });
        if (isMobileViewport()) {
          gsap.set(description,  { xPercent: -50, x: 0, yPercent: -50, y: 0, opacity: 1 });
          gsap.set(counter2,     { xPercent: -50, x: 0, yPercent: -50, y: 0, opacity: 1 });
          gsap.set(description2, { xPercent: -50, x: 0, yPercent: -50, y: 0, opacity: 1 });
        } else {
          gsap.set(description,  { xPercent: 0, x: 0, yPercent: -50, y: 0, opacity: 1 });
          gsap.set(counter2,     { xPercent: 0, x: 0, yPercent: -50, y: 0, opacity: 1 });
          gsap.set(description2, { xPercent: 0, x: 0, yPercent: -50, y: 0, opacity: 1 });
        }
      });
      return;
    }

    /* === Initial state (midnight, crescent at left, "00" displayed) === */
    setBodyAt(0);
    counterNumber.textContent = '00';
    counter2Number.textContent = '0';
    gsap.set(moon,      { opacity: 1 });
    gsap.set(moonGlow,  { opacity: 1 });
    gsap.set(sunCircle, { opacity: 0, attr: { fill: SUN_PLAIN_COLOR } });
    gsap.set(sunGlow,   { opacity: 0 });
    gsap.set(sunRays,   { opacity: 0 });
    gsap.set(arcPath,   { opacity: 1 });
    gsap.set(counter,   { x: 0, y: 0 });
    gsap.set([counterNumber, counterLabel], { color: '#f6e8ea' });
    gsap.set(section,   { backgroundColor: '#1a0d12' });
    setupDescriptionInitial();
    setupSecondaryInitial();

    /* === Build the timeline (paused; played by ScrollTrigger.onEnter) ===
       Three distinct celestial phases (replaces the earlier slow morph):
       - Phase A (0.0s → 2.4s):  Crescent visible, travels left half of arc
       - Swap   (2.4s → 2.6s):   Quick cross-fade at apex (0.2s, centered on 2.5s)
       - Phase B (2.6s → 4.5s):  Plain gold sun — no glow, no halo, no rays
       - Phase C (4.5s → 5.0s):  Halo + rays opacity-ramp; sun gold → coral */
    const progressObj = { t: 0 };
    const counterObj  = { value: 0 };

    const buildTimeline = () => {
      const tl = gsap.timeline({ paused: true });

      // Body travel along arc (0 → 1) over 5s
      tl.to(progressObj, {
        t: 1,
        duration: 5,
        ease: 'power2.inOut',
        onUpdate: () => setBodyAt(progressObj.t),
      }, 0);

      // Counter ticks up 0 → 24, displayed with leading zero
      tl.to(counterObj, {
        value: 24,
        duration: 5,
        ease: 'power2.inOut',
        onUpdate: () => {
          const n = Math.floor(counterObj.value);
          counterNumber.textContent = String(n).padStart(2, '0');
        },
        onComplete: () => {
          // Snap to "24" — guards against ease overshoot/undershoot at completion
          counterNumber.textContent = '24';
        },
      }, 0);

      // Background through 5 stops (4 transitions × 1.25s each, ease: 'none'
      // for true linear color interpolation across the sky) — unchanged.
      tl.to(section, { backgroundColor: '#33202a', duration: 1.25, ease: 'none' }, 0)
        .to(section, { backgroundColor: '#60202e', duration: 1.25, ease: 'none' }, 1.25)
        .to(section, { backgroundColor: '#f06449', duration: 1.25, ease: 'none' }, 2.5)
        .to(section, { backgroundColor: '#f6e8ea', duration: 1.25, ease: 'none' }, 3.75);

      // PHASE A → B swap at apex (t=2.5s ≈ 50% of journey).
      // 0.2s cross-fade centered on the apex moment.
      tl.to([moon, moonGlow], {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.inOut',
      }, 2.4);
      tl.to(sunCircle, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.inOut',
      }, 2.4);

      // Counter + label color shift (cream → plum) as the sky goes from
      // burgundy into coral/blush. Timed to land just as bg becomes legible-light.
      // Unchanged from prior spec.
      tl.to([counterNumber, counterLabel], {
        color: '#33202a',
        duration: 1.5,
        ease: 'power2.inOut',
      }, 3.0);

      // PHASE C — last 0.5s of the journey (4.5s → 5.0s).
      // Halo + rays bloom in; sun color shifts from gold to coral.
      tl.to(sunGlow, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, 4.5);
      tl.to(sunRays, {
        opacity: RAYS_FINAL_OPACITY,
        duration: 0.5,
        ease: 'power2.out',
      }, 4.5);
      // SVG fill attribute tween — GSAP supports attr.fill color interpolation
      tl.to(sunCircle, {
        attr: { fill: SUN_GLOWING_COLOR },
        duration: 0.5,
        ease: 'power2.out',
      }, 4.5);

      /* ===========================================================
         POST-ANIMATION RESTING-STATE SEQUENCE (5.0s → 6.3s)
         Day-cycle has just landed at "24" + glowing sun. Now the
         section transitions to its editorial resting layout.
         =========================================================== */

      // POST PHASE 1 — Sun + arc fade out (5.0 → 5.5s)
      tl.to([sunCircle, sunGlow, sunRays, arcPath], {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      }, 5.0);

      // POST PHASE 2 — Background blush → deep plum (5.0 → 5.8s, overlaps Phase 1)
      tl.to(section, {
        backgroundColor: '#33202a',
        duration: 0.8,
        ease: 'power2.inOut',
      }, 5.0);

      // Recompute counter slide target right before Phase 3 plays — function
      // values in tweens are evaluated when the tween renders, so this gives
      // GSAP a fresh measurement that accounts for the current viewport/RTL.
      tl.add(() => {
        computeCounterRest();
        setupDescriptionInitial();
      }, 5.0);

      // POST PHASE 3 — Counter slides to resting position + cream color
      // (5.3 → 6.3s, starts 0.3s after Phase 1 begins per spec)
      tl.to(counter, {
        x: () => counterRest.x,
        y: () => counterRest.y,
        duration: 1.0,
        ease: 'power3.inOut',
      }, 5.3);
      tl.to([counterNumber, counterLabel], {
        color: '#f6e8ea',
        duration: 1.0,
        ease: 'power3.inOut',
      }, 5.3);

      // POST PHASE 4 — Description slides in (5.3 → 6.3s, simultaneous with Phase 3)
      // x:0 y:0 hits both slide directions correctly:
      //   desktop: x animates 80→0 (slide in from right), y stays 0
      //   mobile:  x stays 0,        y animates 40→0 (slide up from below)
      tl.to(description, {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'power3.inOut',
      }, 5.3);

      /* ===========================================================
         "7 DAYS A WEEK" MIRROR REVEAL (6.3s → 7.8s)
         Kicks off the instant the "24" group lands (no pause).
         Counter2 fades in + ticks 0→7, label appears, description2
         slides in from the leading side. Symmetric mirror motion.
         =========================================================== */

      // Refresh secondary initial state right before the reveal — handles
      // viewport / RTL changes that might have happened during pin.
      tl.add(setupSecondaryInitial, 6.3);

      // Counter2 + label fade in (6.3 → 7.8s)
      tl.to(counter2, {
        opacity: 1,
        duration: 1.5,
        ease: 'power3.inOut',
      }, 6.3);

      // Counter2 ticks 0 → 7 (smooth tick-up, integer display)
      const counter2Obj = { value: 0 };
      tl.to(counter2Obj, {
        value: 7,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          counter2Number.textContent = String(Math.floor(counter2Obj.value));
        },
        onComplete: () => {
          counter2Number.textContent = '7';
        },
      }, 6.3);

      // Description2 slides in from the leading side.
      // x:0 y:0 hits both slide directions correctly:
      //   desktop LTR: x animates -80→0 (slide in from left), y stays 0
      //   desktop RTL: x animates +80→0 (slide in from right)
      //   mobile:      x stays 0,           y animates 40→0 (slide up)
      tl.to(description2, {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'power3.inOut',
      }, 6.3);

      return tl;
    };

    let timeline = buildTimeline();
    let delayedStart = null;

    const resetToStart = () => {
      if (delayedStart) { delayedStart.kill(); delayedStart = null; }
      timeline.pause(0);
      progressObj.t = 0;
      counterObj.value = 0;
      setBodyAt(0);
      counterNumber.textContent = '00';
      counter2Number.textContent = '0';
      gsap.set([moon, moonGlow], { opacity: 1 });
      gsap.set(sunCircle, { opacity: 0, attr: { fill: SUN_PLAIN_COLOR } });
      gsap.set([sunGlow, sunRays], { opacity: 0 });
      gsap.set(arcPath, { opacity: 1 });
      gsap.set(counter, { x: 0, y: 0 });
      gsap.set([counterNumber, counterLabel], { color: '#f6e8ea' });
      gsap.set(section, { backgroundColor: '#1a0d12' });
      setupDescriptionInitial();
      setupSecondaryInitial();
    };

    const jumpToEnd = () => {
      if (delayedStart) { delayedStart.kill(); delayedStart = null; }
      timeline.progress(1).pause();
    };

    /* === Pin + trigger ===
       Plays ONCE per page load. After completion the trigger kills itself
       (via `once: true`), the pin releases, and the section becomes a normal
       static section permanently showing the final daylight state. A page
       refresh restarts the cycle (closure variable resets).
       Pin distance: 650px on desktop, 400px on mobile — function-based so
       refresh() recomputes when the viewport crosses the breakpoint. */
    let pillarAnimationPlayed = false;
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + (window.innerWidth <= 900 ? 600 : 950),
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      once: true,
      onEnter: (self) => {
        if (pillarAnimationPlayed) {
          // Re-entry path — fires only if the user bailed mid-pin before the
          // end position was reached on the first run (so `once: true` hadn't
          // killed the trigger yet). Snap to final state, kill the trigger so
          // the pin doesn't hold them again.
          if (delayedStart) { delayedStart.kill(); delayedStart = null; }
          timeline.progress(1).pause();
          self.kill();
          return;
        }
        pillarAnimationPlayed = true;
        // Brief settle beat before animation plays — preserves the
        // "land, then move" cinematic feel without the perceived lag
        // that 1.0s introduced. 0.2s reads as intentional rather than
        // as a wait.
        resetToStart();
        delayedStart = gsap.delayedCall(0.2, () => timeline.play(0));
      },
      onLeave: () => {
        // Scrolling past while animation may still be playing: snap to final
        // state so user sees daylight, not a half-finished sky.
        // `once: true` kills the trigger right after this fires.
        jumpToEnd();
      },
      // No onEnterBack / onLeaveBack — the animation plays once per page load.
      // Once `once: true` kills the trigger (end reached), no callbacks fire
      // again. If the user bailed mid-pin first, the flag + onEnter handle it.
    });
  };

  /* =============================================
     BRANCHES SECTION (Step 5)
     - 9 branch brackets in the right column.
     - Click bracket → shutter-blinds reveal new interior image
       (7 stripes, staggered clip-path open) + crossfade exterior
       + iframe-fade-swap map.
     - Lazy-load map via IntersectionObserver to protect first paint.
     - Entry animation: header reveals + brackets stagger when section
       crosses 70% viewport line.
     - Reduced motion: instant swap, no shutter, no entry stagger.
     ============================================= */
  const initBranches = () => {
    const section = document.querySelector('#branches');
    if (!section) return;

    // === Branch data (placeholder; client to confirm names + coords) ===
    const branches = [
      { en: 'Tailor Express — Avenues', ar: 'تيلور إكسبرس — الأفنيوز', lat: 29.3027, lng: 47.9347 },
      { en: '[Branch 2 — TBD]',          ar: '[فرع 2 — قيد التأكيد]',  lat: 29.3760, lng: 48.0067 },
      { en: '[Branch 3 — TBD]',          ar: '[فرع 3 — قيد التأكيد]',  lat: 29.3416, lng: 47.9282 },
      { en: '[Branch 4 — TBD]',          ar: '[فرع 4 — قيد التأكيد]',  lat: 29.3162, lng: 48.0723 },
      { en: '[Branch 5 — TBD]',          ar: '[فرع 5 — قيد التأكيد]',  lat: 29.2786, lng: 48.0681 },
      { en: '[Branch 6 — TBD]',          ar: '[فرع 6 — قيد التأكيد]',  lat: 29.4337, lng: 47.9778 },
      { en: '[Branch 7 — TBD]',          ar: '[فرع 7 — قيد التأكيد]',  lat: 29.2491, lng: 48.0911 },
      { en: '[Branch 8 — TBD]',          ar: '[فرع 8 — قيد التأكيد]',  lat: 29.3947, lng: 48.0419 },
      { en: '[Branch 9 — TBD]',          ar: '[فرع 9 — قيد التأكيد]',  lat: 29.2233, lng: 48.0445 },
    ];

    // Placeholder image URLs — picsum returns a deterministic random photo per
    // seed. Real branch photos drop in here when the client provides them.
    const interiorUrl = (i) => `https://picsum.photos/seed/te-int-${i + 1}/800/600`;
    const exteriorUrl = (i) => `https://picsum.photos/seed/te-ext-${i + 1}/800/600`;
    const mapEmbedUrl = (lat, lng) => `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`;
    const directionsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    // === Element refs ===
    const interiorBase    = section.querySelector('.branches__interior-base');
    const interiorStrips  = Array.from(section.querySelectorAll('.branches__interior-strip'));
    const exteriorBase    = section.querySelector('.branches__exterior-base');
    const exteriorOverlay = section.querySelector('.branches__exterior-overlay');
    const mapFrame        = section.querySelector('.branches__map-frame');
    const mapLink         = section.querySelector('.branches__map-link');
    const brackets        = Array.from(section.querySelectorAll('.branches__bracket'));
    const heading         = section.querySelector('.branches__heading');
    const images          = section.querySelector('.branches__images');
    const mapWrap         = section.querySelector('.branches__map');

    if (!interiorBase || brackets.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pre-stage strip srcs to branch 0 so they're not blank when the first
    // transition fires. Their clip-paths keep them invisible until JS opens them.
    interiorStrips.forEach((strip) => { strip.src = interiorUrl(0); });
    exteriorOverlay.src = exteriorUrl(0);

    // Strip clip-path math: each strip's "closed" state is a horizontal line
    // at its center; its "open" state is its assigned 1/7 horizontal stripe.
    const STRIP_COUNT = interiorStrips.length;
    const stripClosed = (i) => {
      const centerY = ((i + 0.5) / STRIP_COUNT) * 100;
      return `inset(${centerY.toFixed(3)}% 0 ${(100 - centerY).toFixed(3)}% 0)`;
    };
    const stripOpen = (i) => {
      const top = (i / STRIP_COUNT) * 100;
      const bot = ((STRIP_COUNT - 1 - i) / STRIP_COUNT) * 100;
      return `inset(${top.toFixed(3)}% 0 ${bot.toFixed(3)}% 0)`;
    };

    // Initial state: all strips closed (invisible)
    interiorStrips.forEach((strip, i) => {
      gsap.set(strip, { clipPath: stripClosed(i) });
    });

    let activeIndex = 0;
    let transitioning = false;

    const updateMapLink = (idx) => {
      const b = branches[idx];
      mapLink.setAttribute('href', directionsUrl(b.lat, b.lng));
    };
    const updateBracketAria = (newIdx) => {
      brackets.forEach((b, i) => {
        const isActive = i === newIdx;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    // === Transition to a new branch ===
    const goToBranch = (newIdx) => {
      if (newIdx === activeIndex || transitioning) return;
      transitioning = true;

      const branch = branches[newIdx];

      // 1. Bracket active state flips immediately (no animation needed)
      updateBracketAria(newIdx);
      updateMapLink(newIdx);

      // 2. Map fade-swap (iframe src swap with crossfade)
      const newMapSrc = mapEmbedUrl(branch.lat, branch.lng);
      if (prefersReducedMotion) {
        mapFrame.src = newMapSrc;
      } else {
        gsap.to(mapFrame, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => {
            mapFrame.src = newMapSrc;
            gsap.to(mapFrame, { opacity: 1, duration: 0.45, ease: 'power2.out' });
          },
        });
      }

      // 3. Exterior (front layer) — simple crossfade
      const newExtSrc = exteriorUrl(newIdx);
      if (prefersReducedMotion) {
        exteriorBase.src = newExtSrc;
      } else {
        exteriorOverlay.src = newExtSrc;
        gsap.fromTo(exteriorOverlay,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
              exteriorBase.src = newExtSrc;
              gsap.set(exteriorOverlay, { opacity: 0 });
            },
          }
        );
      }

      // 4. Interior (back layer) — shutter-blinds reveal
      const newIntSrc = interiorUrl(newIdx);
      // Point each strip at the new image
      interiorStrips.forEach((strip) => { strip.src = newIntSrc; });

      if (prefersReducedMotion) {
        // Instant swap
        interiorBase.src = newIntSrc;
        interiorStrips.forEach((strip, i) => {
          gsap.set(strip, { clipPath: stripClosed(i) });
        });
        transitioning = false;
        activeIndex = newIdx;
        return;
      }

      // Stagger each strip's "open" — center-out clip-path expansion.
      // Total wall-clock: (STRIP_COUNT - 1) * 0.08s + 0.5s ≈ 1.0s.
      const stripStagger = 0.08;
      const stripDur = 0.5;
      interiorStrips.forEach((strip, i) => {
        gsap.to(strip, {
          clipPath: stripOpen(i),
          duration: stripDur,
          delay: i * stripStagger,
          ease: 'power3.inOut',
          onComplete: i === STRIP_COUNT - 1
            ? () => {
                // All strips fully open — swap base image to new src and
                // reset strips to closed (invisible). Visually a no-op
                // since the strips already cover the base with the new image.
                interiorBase.src = newIntSrc;
                interiorStrips.forEach((s, j) => {
                  gsap.set(s, { clipPath: stripClosed(j) });
                });
                transitioning = false;
                activeIndex = newIdx;
              }
            : undefined,
        });
      });
    };

    // === Bracket click handlers ===
    brackets.forEach((bracket, i) => {
      bracket.addEventListener('click', () => goToBranch(i));
      // Keyboard: Enter / Space already trigger click on <button>; nothing extra.
    });

    // === Lazy-load map iframe — defer until section enters viewport ===
    const lazyLoadMap = () => {
      if (mapFrame.dataset.loaded === '1') return;
      mapFrame.src = mapFrame.dataset.src;
      mapFrame.dataset.loaded = '1';
    };
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          lazyLoadMap();
          mapObserver.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    mapObserver.observe(section);

    // === Entry animations ===
    if (prefersReducedMotion) {
      // Skip stagger — already opacity:1 via reduced-motion media query
      return;
    }

    // Wrap the heading text inside an inner span for mask-wipe reveal.
    section.querySelectorAll('.branches__heading .en-text, .branches__heading .ar-text')
      .forEach((span) => {
        if (span.dataset.prepared) return;
        const inner = document.createElement('span');
        inner.className = 'branches__heading-inner';
        inner.style.display = 'inline-block';
        inner.style.willChange = 'transform';
        while (span.firstChild) inner.appendChild(span.firstChild);
        span.appendChild(inner);
        span.dataset.prepared = '1';
      });

    gsap.set('.branches__heading-inner', { y: '110%' });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to('.branches__heading-inner', { y: 0, duration: 1.0 })
          .to(images, { opacity: 1, scale: 1.0, duration: 1.0 }, '-=0.6')
          .to(mapWrap, { opacity: 1, duration: 1.0 }, '-=0.8')
          .to(brackets, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
          }, '-=0.8');
      },
    });
  };

  /* =============================================
     GALLERY (Step 6)
     Cartier-style 3D floating-plane scene (Option A) with 2D mosaic
     fallback (Option B). Per BRAND_CONTEXT.md §14.3, Option B is
     also the desktop emergency fallback if A fails / feels stiff.

     Pipeline:
       1. Detect mobile / low-end / WebGL availability.
       2. If 2D path → wire fallback grid drift + hover + lightbox.
       3. If 3D path → IntersectionObserver lazy-loads Three.js, then
          builds the scene; if anything fails, we silently fall back
          to the 2D grid path. Same lightbox in both modes.
     ============================================= */
  // PLACEHOLDER IMAGES — to be replaced with real Tailor Express work
  // later. Currently using consistent warm-toned Unsplash/picsum stock
  // that matches the cinematic atelier aesthetic. Indices line up with
  // PLANE_LAYOUT and the 2D-fallback tiles in index.html.
  const GALLERY_IMAGES = [
    { src: 'https://picsum.photos/seed/te-gallery-1/1200/900',  alt: 'Warm fabric texture in dramatic side light — the featured exhibit.' },
    { src: 'https://picsum.photos/seed/te-gallery-2/900/1200',  alt: 'Tailor atelier interior in moody dark lighting.' },
    { src: 'https://picsum.photos/seed/te-gallery-3/1000/1000', alt: 'Thread spools arranged in warm light.' },
    { src: 'https://picsum.photos/seed/te-gallery-4/900/1200',  alt: 'Close-up detail of a garment in warm tones.' },
    { src: 'https://picsum.photos/seed/te-gallery-5/900/1200',  alt: 'Scissors resting on fabric — tailor’s tools.' },
    { src: 'https://picsum.photos/seed/te-gallery-6/900/1200',  alt: 'Folded fabric with dramatic shadow.' },
    // v6 — NEW lower-left foreground plane (distinct seed, warm-toned).
    // v7 — seed swapped from `te-gallery-9-foreground` (was returning an
    // American flag from picsum's random pool — inappropriate for a
    // Kuwait business) to `te-linen-folded-warm`, a neutral warm-toned
    // image (organic macro). Verified prior to commit against the
    // exclusion list: no flag, recognizable landmark, face, religious
    // symbol, brand, or map. Distinct from the other 8 plane images.
    { src: 'https://picsum.photos/seed/te-linen-folded-warm/900/1200', alt: 'Warm organic detail in soft side light.' },
    { src: 'https://picsum.photos/seed/te-gallery-7/900/1200',  alt: 'Macro close-up of needle and thread.' },
    { src: 'https://picsum.photos/seed/te-gallery-8/900/1200',  alt: 'Luxury garment hanging on a stand.' },
  ];

  // Per-plane layout for the Stage 2 gallery rebuild. Indices line
  // up with GALLERY_IMAGES above. Geometry sizes are explicit per
  // plane (not aspect-derived) so the hero plane reads as the largest
  // focal piece and the deep-corner planes are visibly smaller.
  // Drift kind/amp/period + random phaseOffset keeps each plane out
  // of sync so the composition feels organic, never robotic.
  //   rot = [rotX, rotY, rotZ]    pos = [x, y, z]    size = [w, h]
  // Stage 2 v6.1 — spacing + pedestal-clearance pass.
  // v6 had two issues on review: (a) upper-left visual cluster — Plane
  // 2 (back-wall-L), Plane 6 (close-side-L) and Plane 8 (deep-corner-L)
  // all projected into the same left zone; (b) new Plane 7 bottom edge
  // dropped below the pedestal top (y=0.6 vs pedestal top y=1.2), so
  // the plane visibly touched the pedestal. v6.1 fixes both:
  //   - Plane 7 lifted (y 2.2 → 3.5) so its bottom y=1.9 is 0.7u above
  //     pedestal top — clearly floating, not touching.
  //   - Plane 6 pushed further outward (x -6.5 → -7.5) for separation
  //     from Plane 7 below it.
  //   - Planes 2 & 3 spread further into the back-wall corners and
  //     lifted (Plane 2: -9→-10/y 7.5→8; Plane 3: 9→10/y 7→8).
  //   - Planes 8 & 9 pulled outward + dropped + slightly back
  //     (-8,7.5,-2 → -9.5,6.5,-3 and mirror) to break the upper stack
  //     against Plane 2 and visually balance the right side.
  // All other planes unchanged. Pedestal clearance verified for every
  // plane: lowest bottom is now Plane 7 at y=1.9 (was y=0.6).
  const PLANE_LAYOUT = [
    // 1 — HERO (NO CHANGE)
    { size: [4.0,  3.0 ], pos: [ 0,    5.2,  4   ], rot: [-0.05,  0,    0], drift: { kind: 'circle',    amp: 0.10, period: 12 } },
    // 2 — back-wall left — v6.1 spread outward (-9→-9.5) + lifted (7.5→8)
    { size: [3.64, 4.55], pos: [-9.5,  8.0, -8   ], rot: [ 0,     0.10, 0], drift: { kind: 'updown',    amp: 0.12, period: 8  } },
    // 3 — back-wall right — v6.1 mirror of Plane 2 (9→9.5, y 7→8)
    { size: [3.64, 3.64], pos: [ 9.5,  8.0, -7.5 ], rot: [ 0,    -0.10, 0], drift: { kind: 'leftright', amp: 0.10, period: 9  } },
    // 4 — mid-depth right (UNCHANGED FROM v6 — fills mid-right zone)
    { size: [2.5,  3.2 ], pos: [ 4,    4.5, -1   ], rot: [-0.05, -0.15, 0], drift: { kind: 'circle',    amp: 0.08, period: 10 } },
    // 5 — close side wall RIGHT (NO CHANGE)
    { size: [2.0,  2.5 ], pos: [ 8.5,  3.5,  2.5 ], rot: [ 0,    -0.30, 0], drift: { kind: 'updown',    amp: 0.15, period: 7  } },
    // 6 — close side wall LEFT — v6.1 pushed further outward (-6.5→-7.5,
    //     y 3.2→3.5) for separation from new Plane 7 at x=-5
    { size: [2.0,  2.5 ], pos: [-7.5,  3.5,  2.5 ], rot: [ 0,     0.30, 0], drift: { kind: 'leftright', amp: 0.12, period: 11 } },
    // 7 — v6 NEW (v6.1 lifted): lower-left foreground plane. Portrait,
    //     gentle inward tilt toward camera. y 2.2 → 3.5 lifts plane
    //     bottom from y=0.6 to y=1.9 (0.7u clear of pedestal top y=1.2)
    //     so the plane no longer touches the pedestal. Right edge at
    //     x=-3.8 still sits 0.2u inside pedestal x range, but with
    //     bottom now well above pedestal top there's no visible
    //     intersection. Drift x-amp kept small (0.04) for stability.
    { size: [2.4,  3.2 ], pos: [-5,    3.5,  4   ], rot: [ 0,     0.15, 0], drift: { kind: 'updown',    amp: 0.08, period: 9, ampX: 0.04 } },
    // 8 — deep corner LEFT — v6.1 dropped + back (y 7.5→6, z -2→-3),
    //     x stays at -8 so plane reads in mid-left, not pushed off-frame
    { size: [1.8,  2.4 ], pos: [-8.0,  6.0, -3   ], rot: [ 0,     0.20, 0], drift: { kind: 'circle',    amp: 0.06, period: 13 } },
    // 9 — deep corner RIGHT — v6.1 mirror of Plane 8 (y 7.5→6, z -2→-3)
    { size: [1.8,  2.2 ], pos: [ 8.0,  6.0, -3   ], rot: [ 0,    -0.20, 0], drift: { kind: 'updown',    amp: 0.10, period: 10 } },
  ];

  const initGallery = () => {
    const section = document.getElementById('gallery');
    if (!section) return;

    const eyebrow      = section.querySelector('.gallery__eyebrow');
    const heading      = section.querySelector('.gallery__heading');
    const canvasWrap   = section.querySelector('.gallery__canvas-wrap');
    const grid         = section.querySelector('.gallery__grid');
    const tiles        = Array.from(section.querySelectorAll('.gallery__tile'));
    const tileBtns     = Array.from(section.querySelectorAll('.gallery__tile-btn'));
    const lightbox     = document.getElementById('gallery-lightbox');
    const lightboxImg  = lightbox?.querySelector('.gallery-lightbox__img');
    const lightboxCur  = lightbox?.querySelector('.gallery-lightbox__counter-current');
    const lightboxTot  = lightbox?.querySelector('.gallery-lightbox__counter-total');
    const btnClose     = lightbox?.querySelector('.gallery-lightbox__close');
    const btnPrev      = lightbox?.querySelector('.gallery-lightbox__nav--prev');
    const btnNext      = lightbox?.querySelector('.gallery-lightbox__nav--next');

    if (lightboxTot) lightboxTot.textContent = GALLERY_IMAGES.length;

    /* --- Capability detection (§14.3) -------------------------- */
    const isNarrow = window.matchMedia('(max-width: 899px)').matches;
    const isLowEnd =
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency < 4;
    const hasWebGL = (() => {
      try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext &&
                  (c.getContext('webgl') || c.getContext('experimental-webgl')));
      } catch (e) { return false; }
    })();
    const use3D = !prefersReducedMotion && !isNarrow && !isLowEnd && hasWebGL;

    /* --- Lightbox -------------------------------------------- */
    let activeIndex = 0;

    const openLightbox = (index) => {
      if (!lightbox) return;
      activeIndex = index;
      lightbox.hidden = false;
      lightboxImg.src = GALLERY_IMAGES[index].src;
      lightboxImg.alt = GALLERY_IMAGES[index].alt;
      lightboxCur.textContent = index + 1;
      // Force a reflow so the [hidden] → display flex transition fires
      // cleanly on first open.
      void lightbox.offsetHeight;
      requestAnimationFrame(() => lightbox.classList.add('is-open'));
      document.documentElement.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      // Wait for transition to end before fully hiding
      setTimeout(() => {
        if (!lightbox.classList.contains('is-open')) lightbox.hidden = true;
      }, 400);
    };

    const swapLightboxImage = (newIndex) => {
      if (!lightbox || !lightboxImg) return;
      activeIndex = (newIndex + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
      lightbox.classList.add('is-changing');
      setTimeout(() => {
        lightboxImg.src = GALLERY_IMAGES[activeIndex].src;
        lightboxImg.alt = GALLERY_IMAGES[activeIndex].alt;
        lightboxCur.textContent = activeIndex + 1;
        lightbox.classList.remove('is-changing');
      }, 200);
    };

    btnClose?.addEventListener('click', closeLightbox);
    btnPrev?.addEventListener('click', () => swapLightboxImage(activeIndex - 1));
    btnNext?.addEventListener('click', () => swapLightboxImage(activeIndex + 1));
    lightbox?.addEventListener('click', (e) => {
      // Click on backdrop (not on stage / arrows / close) closes
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (lightbox?.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft')  swapLightboxImage(activeIndex - 1);
      else if (e.key === 'ArrowRight') swapLightboxImage(activeIndex + 1);
    });

    // 2D tiles always wire to lightbox — they're either the live UI
    // (Option B) or the no-JS baseline.
    tileBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => openLightbox(i));
    });

    /* --- Header entry (always runs) -------------------------- */
    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        gsap.to(heading, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 });
      },
    });

    /* --- 2D fallback path (also the desktop emergency path) -- */
    const init2DFallback = () => {
      // Entry stagger
      ScrollTrigger.create({
        trigger: section,
        start: 'top 65%',
        once: true,
        onEnter: () => {
          gsap.to(tiles, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.12,
            ease: 'power3.out',
            delay: 0.25,
          });
        },
      });

      // Per-tile drift — independent x + y sin tweens with
      // different periods give a Lissajous-style organic motion.
      // Pause when section out of viewport.
      if (prefersReducedMotion) return;

      const driftTweens = [];
      tiles.forEach((tile, i) => {
        const xAmp     = 4  + (i % 3) * 2;     // 4–8px
        const yAmp     = 6  + (i % 4) * 2;     // 6–12px
        const xPeriod  = 7  + (i * 0.7);
        const yPeriod  = 9  + (i * 0.5);
        const xDelay   = (i * 0.6) % xPeriod;
        const yDelay   = (i * 0.9) % yPeriod;

        const tx = gsap.to(tile, {
          x: xAmp,
          duration: xPeriod / 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: -xDelay,
          paused: true,
        });
        const ty = gsap.to(tile, {
          y: yAmp,
          duration: yPeriod / 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: -yDelay,
          paused: true,
        });
        driftTweens.push(tx, ty);
      });

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) driftTweens.forEach(t => t.play());
          else                driftTweens.forEach(t => t.pause());
        },
      });
    };

    /* --- 3D scene path (lazy-loaded) ------------------------- */
    const init3DScene = () => {
      let scene, camera, renderer, raycaster, mouse;
      let planes      = [];      // { mesh, basePos: {x,y,z}, baseScale, drift, idx }
      let hovered     = null;
      let rafId       = null;
      let sceneActive = false;   // animation-loop gate (in viewport)
      let startTime   = 0;

      const buildScene = () => {
        // Make the canvas wrap measurable BEFORE we size the renderer.
        // The wrap is display:none until `.is-3d` is set on the section,
        // so a getBoundingClientRect before this line returns 0×0 and
        // the renderer ends up with NaN aspect.
        section.classList.add('is-3d');

        // --- Renderer (Stage 1 rebuild)
        // shadowMap + PCFSoft for crisp soft shadows from the key
        // light onto the floor; ACES tone mapping + sRGB output for a
        // filmic look that makes the room feel like a real render and
        // not "computer graphics."
        const wrapRect = canvasWrap.getBoundingClientRect();
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(wrapRect.width, wrapRect.height);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        // sRGB output: r152+ uses .outputColorSpace, older releases
        // used .outputEncoding.
        if (typeof THREE.SRGBColorSpace !== 'undefined') {
          renderer.outputColorSpace = THREE.SRGBColorSpace;
        } else if (typeof THREE.sRGBEncoding !== 'undefined') {
          renderer.outputEncoding = THREE.sRGBEncoding;
        }
        canvasWrap.appendChild(renderer.domElement);
        renderer.domElement.style.cursor = 'default';

        // --- Camera — eye-level, aimed at the back-wall halo zone
        // With the pedestal removed and the canvas now filling the
        // full section (taller aspect ratio), the focal point shifts
        // to the back-wall light halo. Raised lookAt from y=2 → y=4
        // so the camera angle is closer to level — floor still reads
        // at the bottom of the frame, walls fill the upper portion.
        // v7.1 — aspect from window dimensions, NOT wrap dimensions. At
        // buildScene time, wrapRect can pick up the 2D-fallback grid's
        // pre-is-3d content height (~1729px) before .is-3d's CSS settles,
        // producing aspect ≈ 0.833 (portrait) and a horizontally pinched
        // ~42° hFOV. The gallery section is height:100vh so the viewport
        // aspect is the correct compositional aspect for the camera.
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 4, 14);
        // v7 — lookAt target shifted from (0, 4, 0) → (0, 3, 2) so the
        // initial framing matches the fixed lookAt anchor used by the
        // scroll-driven camera sweep (see cameraKeyframes below). Without
        // this, scrolling into the pin causes a one-frame look jump.
        camera.lookAt(0, 3, 2);

        // --- Scene + atmospheric fog
        // Fog color matches wall color so distant walls bleed into
        // the fog rather than reading as a hard cut. Tuned for the
        // Cartier "Sound of Craft" feel: NEAR pulled in to 6 so the
        // side-wall corners dissolve dramatically, FAR kept at 32 so
        // the back wall (≈24u from camera) still renders clearly
        // with its key-light halo — the dominant focal element.
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x2a1a22, 6, 32);

        // --- Lighting
        // Ambient stays low (0.3) and warm-dark so shadows never go
        // pure black but contrast is preserved.
        const ambient = new THREE.AmbientLight(0x2a1a22, 0.3);
        scene.add(ambient);

        // Key light — warm late-afternoon cream from upper-right.
        // Strong (1.2) and shadow-casting. This is what writes the
        // dramatic light across the pedestal and back wall.
        const keyLight = new THREE.DirectionalLight(0xfaf0e0, 1.2);
        keyLight.position.set(8, 12, 6);
        keyLight.castShadow = true;
        // 4096² shadow map keeps the pedestal's edge crisp against
        // the floor; 2048 was just-soft enough that it read more as
        // a smudge than a defined cast shadow.
        keyLight.shadow.mapSize.set(4096, 4096);
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -15;
        keyLight.shadow.camera.right = 15;
        keyLight.shadow.camera.top = 15;
        keyLight.shadow.camera.bottom = -15;
        keyLight.shadow.bias = -0.0005;
        scene.add(keyLight);

        // Fill light — coral, low intensity, opposite side. Lifts the
        // shadow side of the pedestal off pure black with a warm tone.
        // Does NOT cast shadow (clean key-only shadow on the floor).
        const fillLight = new THREE.DirectionalLight(0xf06449, 0.25);
        fillLight.position.set(-6, 4, 5);
        scene.add(fillLight);

        // Back-wall halo spotlight — added after comparing Stage 1 to
        // the Cartier "Sound of Craft" reference. Creates the signature
        // bright "exhibit zone" on the back wall above the pedestal,
        // with soft falloff to the corners. Aimed slightly above the
        // pedestal so it grazes the wall. Distance + decay tuned so
        // the cone actually reaches the back wall (~16u away from the
        // light's position) with enough intensity to register as a
        // clear hotspot.
        const halo = new THREE.SpotLight(
          0xfaf0e0,    // same warm cream as key light
          2.4,         // strong — needs to reach 16u+ into fog
          30,          // distance (back wall is ~16u from light)
          Math.PI / 5, // ~36° cone half-angle
          0.75,        // soft penumbra edges
          1.0          // gentler falloff
        );
        halo.position.set(0, 9, 6);
        halo.target.position.set(0, 6, -10);  // aim at upper back wall
        halo.castShadow = false;              // key light already owns shadows
        scene.add(halo);
        scene.add(halo.target);

        // --- Room geometry: floor + back wall + left wall + right wall
        // Floor — slight reflectivity (roughness 0.45) so the key
        // light catches a soft warm bounce on the floor, matching the
        // Cartier reference rather than reading as flat matte.
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(40, 40),
          new THREE.MeshStandardMaterial({
            color: 0x1f1419, roughness: 0.45, metalness: 0.0,
          })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);

        const wallMaterial = new THREE.MeshStandardMaterial({
          color: 0x2a1a22, roughness: 0.8, metalness: 0.0,
        });

        // Walls do NOT receive shadows — the floating image planes
        // cast rectangular decal-like patches on the walls otherwise,
        // which reads as "stage set with stickers" rather than a real
        // gallery space. Lighting alone (key + fill + halo + fog) is
        // doing the depth work.

        // Back wall — z = -10
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), wallMaterial);
        backWall.position.set(0, 7, -10);
        backWall.receiveShadow = false;
        scene.add(backWall);

        // Left wall — angled to form left corner
        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(25, 15), wallMaterial);
        leftWall.position.set(-12, 7, 2);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = false;
        scene.add(leftWall);

        // Right wall — opposite corner
        const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(25, 15), wallMaterial);
        rightWall.position.set(12, 7, 2);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = false;
        scene.add(rightWall);

        // --- Marble pedestal (Stage 1 — final piece)
        // PBR setup using AmbientCG Marble012 maps already in the
        // project at `gallery_textures/`. Uses Color (sRGB) + NormalGL
        // (Three.js uses OpenGL coordinate system) + Roughness maps.
        // A PMREMGenerator-based environment map gives the polished
        // marble subtle reflections of the room's atmosphere so it
        // doesn't read as flat plastic.
        const texLoader = new THREE.TextureLoader();
        const marbleColor     = texLoader.load('gallery_textures/Marble012_1K-JPG_Color.jpg');
        const marbleNormal    = texLoader.load('gallery_textures/Marble012_1K-JPG_NormalGL.jpg');
        const marbleRoughness = texLoader.load('gallery_textures/Marble012_1K-JPG_Roughness.jpg');

        [marbleColor, marbleNormal, marbleRoughness].forEach(tex => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          // Box is 8 × 1.2 × 4 — the top face reads as the dominant
          // surface so we tile to keep marble veins at a believable
          // scale rather than stretching one giant pattern across
          // the whole top.
          tex.repeat.set(1.5, 0.6);
          if (renderer.capabilities.getMaxAnisotropy) {
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          }
        });

        // Color-space: color map is sRGB, normal & roughness are raw
        // linear data.
        if (typeof THREE.SRGBColorSpace !== 'undefined') {
          marbleColor.colorSpace = THREE.SRGBColorSpace;
        } else if (typeof THREE.sRGBEncoding !== 'undefined') {
          marbleColor.encoding = THREE.sRGBEncoding;
        }

        // Build a subtle environment map from the warm wall color so
        // the polished marble has *something* to reflect. Without it
        // the surface reads as plasticky.
        let envMap = null;
        try {
          const pmrem = new THREE.PMREMGenerator(renderer);
          const envScene = new THREE.Scene();
          envScene.background = new THREE.Color(0x2a1a22);
          envMap = pmrem.fromScene(envScene).texture;
          scene.environment = envMap;
          pmrem.dispose();
        } catch (envErr) {
          console.warn('[Tailor Express] PMREM env-map failed, marble will rely on direct lighting only.', envErr);
        }

        const pedestalMaterial = new THREE.MeshStandardMaterial({
          map: marbleColor,
          normalMap: marbleNormal,
          roughnessMap: marbleRoughness,
          roughness: 0.4,
          metalness: 0.05,
          envMapIntensity: 1.0,
        });

        const pedestal = new THREE.Mesh(
          new THREE.BoxGeometry(8, 1.2, 4),
          pedestalMaterial
        );
        pedestal.position.set(0, 0.6, 4);
        pedestal.castShadow = true;
        pedestal.receiveShadow = true;
        scene.add(pedestal);

        // --- Raycaster / interaction infra ---
        // Allocated for Stage 2 (image-plane hover detection). Without
        // a populated `planes` array the handlers are no-ops, so the
        // canvas behaves as a static render in Stage 1.
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        renderer.domElement.addEventListener('pointermove', onPointerMove);
        renderer.domElement.addEventListener('pointerleave', onPointerLeave);
        renderer.domElement.addEventListener('click', onClick);
        window.addEventListener('resize', onResize);

        // Two-frame delay for first render to land before the
        // canvas-wrap opacity fades in (avoids flash of black).
        requestAnimationFrame(() => {
          requestAnimationFrame(() => section.classList.add('is-3d-ready'));
        });

        // STAGE 2 — Add the 9 floating image planes to the room (v6).
        // Function defined below; populates the `planes` array that the
        // raycaster/hover/click handlers and drift loop all read from.
        setupGalleryPlanes();

        startTime = performance.now() / 1000;
        sceneActive = true;
        loop();
      };

      /* ===== STAGE 2 — Image planes =====================================
         Adds the 9 floating image planes to the empty marble-pedestal
         room (v6). Plane 0 is the hero (above pedestal, largest, almost
         flat-facing camera). The other 8 distribute across back wall,
         mid-depth, near side walls, and the lower-left foreground.

         Each plane:
           - PlaneGeometry sized per PLANE_LAYOUT
           - MeshStandardMaterial with sRGB color map, envMapIntensity 0.5
             (subtle plum reflection from scene.environment), emissive
             coral with intensity 0 (animated to 0.08 on hover)
           - castShadow: false (rectangular shadow decals on walls and
           floor read as a stage set rather than a real gallery — see
           v5 shadow-removal pass. The pedestal stays the only object
           grounding the scene with a real cast shadow.)
           - userData: { idx, baseX/Y/Z, phaseOffset, drift } for drift
             loop + raycast click handler

         Entry is ScrollTrigger-gated: planes start at basePos.z + 6 with
         opacity 0; when the section reaches `top 70%`, they stagger
         forward to basePos.z and fade in 0 → 1 with 0.15s stagger.

         Reduced motion: skip drift + skip stagger, planes appear at
         final position with full opacity. */
      const setupGalleryPlanes = () => {
        const texLoader = new THREE.TextureLoader();
        texLoader.crossOrigin = 'anonymous';

        GALLERY_IMAGES.forEach((img, i) => {
          const layout = PLANE_LAYOUT[i];
          const [w, h] = layout.size;

          const geo = new THREE.PlaneGeometry(w, h);
          const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: prefersReducedMotion ? 1 : 0,
            roughness: 0.6,
            metalness: 0.0,
            envMapIntensity: 0.5,
            emissive: new THREE.Color(0xf06449),
            emissiveIntensity: 0,        // gsap animates 0 → 0.08 on hover
          });

          const mesh = new THREE.Mesh(geo, mat);
          const startZ = prefersReducedMotion ? layout.pos[2] : layout.pos[2] + 6;
          mesh.position.set(layout.pos[0], layout.pos[1], startZ);
          mesh.rotation.set(layout.rot[0], layout.rot[1], layout.rot[2]);
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          mesh.userData = { idx: i };
          scene.add(mesh);

          texLoader.load(
            img.src,
            (tex) => {
              if (typeof THREE.SRGBColorSpace !== 'undefined') {
                tex.colorSpace = THREE.SRGBColorSpace;
              } else if (typeof THREE.sRGBEncoding !== 'undefined') {
                tex.encoding = THREE.sRGBEncoding;
              }
              if (renderer.capabilities.getMaxAnisotropy) {
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
              }
              mat.map = tex;
              mat.needsUpdate = true;
            },
            undefined,
            () => { /* silent texture failure — material stays white */ }
          );

          planes.push({
            mesh, mat,
            basePos: { x: layout.pos[0], y: layout.pos[1], z: layout.pos[2] },
            baseScale: 1.0,
            drift: layout.drift,
            // Random phase offset so the 9 sinusoids never sync.
            phaseOffset: Math.random() * Math.PI * 2,
            idx: i,
          });
        });

        if (prefersReducedMotion) {
          // Static reveal — no stagger.
          return;
        }

        // Entry stagger — gated by ScrollTrigger so it plays when the
        // section enters viewport (≈top 70%). `once: true` means we
        // never re-trigger on back-scroll.
        ScrollTrigger.create({
          trigger: section,
          start: 'top 70%',
          once: true,
          onEnter: () => {
            planes.forEach((p, i) => {
              gsap.to(p.mesh.position, {
                z: p.basePos.z,
                duration: 1.2,
                delay: 0.1 + i * 0.15,
                ease: 'power3.out',
              });
              gsap.to(p.mat, {
                opacity: 1,
                duration: 1.0,
                delay: 0.1 + i * 0.15,
                ease: 'power3.out',
              });
            });
          },
        });
      };

      const onResize = () => {
        if (!renderer || !canvasWrap) return;
        const r = canvasWrap.getBoundingClientRect();
        // Renderer keeps using the canvas wrap's actual rendered size
        // (CSS-constrained to the section dims) — that's what fills the
        // visible canvas. But camera.aspect uses the viewport (window)
        // dims because the scene should be composed for what the user
        // is looking at, not the wrap's possibly-pre-layout-settled rect.
        // See companion comment at camera-init for the rationale.
        renderer.setSize(r.width, r.height);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };

      const onPointerMove = (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const meshes = planes.map(p => p.mesh);
        const hits = raycaster.intersectObjects(meshes, false);
        const nextHovered = hits.length ? hits[0].object : null;
        if (nextHovered !== hovered) {
          setHover(nextHovered);
        }
      };

      const onPointerLeave = () => {
        if (hovered) setHover(null);
      };

      const setHover = (target) => {
        hovered = target;
        // Cursor on <body> rather than the canvas so the pointer state
        // doesn't blink when the cursor briefly leaves the canvas area.
        document.body.style.cursor = target ? 'pointer' : '';
        // Reduced-motion: snappier transitions (0.2s) so the hover feel
        // doesn't lag the cursor.
        const DUR = prefersReducedMotion ? 0.2 : 0.4;
        planes.forEach((p) => {
          const isHover = p.mesh === target;
          if (isHover) {
            // Hovered plane: scale up, come slightly forward, full
            // opacity, subtle warm coral emissive glow.
            gsap.to(p.mesh.scale,    { x: 1.08, y: 1.08, z: 1.08, duration: DUR, ease: 'power2.out' });
            gsap.to(p.mesh.position, { z: p.basePos.z + 0.6, duration: DUR, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(p.mat,           { opacity: 1.0, emissiveIntensity: 0.08, duration: DUR, ease: 'power2.out' });
          } else if (target) {
            // Other planes while one is hovered: dim + slight scale-down.
            gsap.to(p.mesh.scale,    { x: 0.96, y: 0.96, z: 0.96, duration: DUR, ease: 'power2.out' });
            gsap.to(p.mat,           { opacity: 0.5, emissiveIntensity: 0, duration: DUR, ease: 'power2.out' });
          } else {
            // No hover anywhere — restore everything.
            gsap.to(p.mesh.scale,    { x: 1.0, y: 1.0, z: 1.0, duration: DUR, ease: 'power2.out' });
            gsap.to(p.mesh.position, { z: p.basePos.z, duration: DUR, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(p.mat,           { opacity: 1.0, emissiveIntensity: 0, duration: DUR, ease: 'power2.out' });
          }
        });
      };

      const onClick = () => {
        if (!hovered) return;
        const idx = hovered.userData.idx;
        // Reset all planes back to neutral so the scene doesn't keep
        // a dimmed/hover state behind the lightbox.
        setHover(null);
        if (typeof idx === 'number') openLightbox(idx);
      };

      // Animation loop — Stage 2. Static room (walls/floor/pedestal),
      // plus per-frame gentle drift on the 9 image planes (v6). Loop is
      // gated on `sceneActive` (paused when section out of viewport).
      // Drift is skipped under prefers-reduced-motion. We only nudge
      // x/y; z is owned by hover/entry GSAP tweens.
      const loop = () => {
        if (!sceneActive) { rafId = null; return; }
        if (!prefersReducedMotion && planes.length > 0) {
          const t = performance.now() / 1000;
          for (let i = 0; i < planes.length; i++) {
            const p = planes[i];
            const d = p.drift;
            const tt = t + p.phaseOffset;
            const w = (2 * Math.PI) / d.period;
            let dx = 0, dy = 0;
            if (d.kind === 'circle') {
              dx = Math.cos(tt * w) * d.amp;
              dy = Math.sin(tt * w) * d.amp;
            } else if (d.kind === 'updown') {
              dy = Math.sin(tt * w) * d.amp;
              // v6 — optional secondary horizontal nudge (e.g. Plane 7
              // ampX=0.04). Phase-offset by π/2 so the path traces a
              // gentle figure-8 rather than synced X+Y.
              if (typeof d.ampX === 'number') dx = Math.cos(tt * w) * d.ampX;
            } else if (d.kind === 'leftright') {
              dx = Math.sin(tt * w) * d.amp;
            }
            p.mesh.position.x = p.basePos.x + dx;
            p.mesh.position.y = p.basePos.y + dy;
          }
        }
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(loop);
      };

      // In-viewport gate for the animation loop (perf)
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          sceneActive = self.isActive;
          if (sceneActive && !rafId) {
            // Resume clock from "now" — drift phases per plane keep
            // them out of sync regardless of when we restart.
            startTime = performance.now() / 1000;
            loop();
          }
        },
      });

      /*
       * GALLERY CAMERA — Pull-back reveal
       *
       * Camera starts immersive (left-of-center, slightly forward)
       * and pulls back to the clean center view as user scrolls.
       *
       * Progress 0.0 → Image 2 position: in the room, looking from
       *   the left side, walls extending at angles
       * Progress 1.0 → Image 1 position: composed center view, full
       *   gallery surveyable, pedestal centered
       *
       * The pull-back motion ends on a "landing" frame — the viewer
       * feels they have arrived at the canonical gallery view.
       *
       * Look-at is FIXED at (0, 3, 2) — the pedestal/hero zone — so
       * the pedestal stays in view throughout the pull-back.
       *
       * Pin duration: 1000px desktop / 600px ≤900px viewport / 400px
       * under reduced-motion (pin still applies — it prevents the
       * next section from bleeding through during scroll — but the
       * camera does NOT animate under reduced-motion).
       */
      const cameraKeyframes = {
        positions: [
          { p: 0.00, x: -4,   y: 4.2, z: 13 },  // Start: immersive left
          { p: 1.00, x:  0,   y: 4.0, z: 14 },  // End: clean center
        ],
        lookAt: { x: 0, y: 3, z: 2 },
      };

      const updateCameraForScroll = (progress) => {
        if (!camera) return;
        const p = Math.max(0, Math.min(1, progress));
        const eased = gsap.parseEase('power2.inOut')(p);
        const kf = cameraKeyframes.positions;
        let i = 0;
        for (let j = 0; j < kf.length - 1; j++) {
          if (eased >= kf[j].p && eased <= kf[j + 1].p) {
            i = j;
            break;
          }
        }
        const segStart = kf[i].p;
        const segEnd   = kf[i + 1].p;
        const local    = (segEnd === segStart) ? 0 :
                         (eased - segStart) / (segEnd - segStart);
        camera.position.x = gsap.utils.interpolate(kf[i].x, kf[i + 1].x, local);
        camera.position.y = gsap.utils.interpolate(kf[i].y, kf[i + 1].y, local);
        camera.position.z = gsap.utils.interpolate(kf[i].z, kf[i + 1].z, local);
        camera.lookAt(
          cameraKeyframes.lookAt.x,
          cameraKeyframes.lookAt.y,
          cameraKeyframes.lookAt.z
        );
      };

      // Expose for capture/diagnostic tooling. Not used by site code.
      section._tailorExpressDebug = {
        updateCameraForScroll,
        getCameraState: () => camera ? {
          x: camera.position.x, y: camera.position.y, z: camera.position.z,
        } : null,
      };

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + (
          prefersReducedMotion ? 400 :
          (window.innerWidth <= 900 ? 600 : 1000)
        ),
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 1,
        onUpdate: (self) => {
          if (prefersReducedMotion) return;
          updateCameraForScroll(self.progress);
        },
      });

      // v7.3 — the pinSpacing insert above just shifted every section
      // after Gallery down by the pin distance (1500px desktop). Other
      // triggers (notably nav-hide for Testimonials/FAQ) have their
      // scroll positions cached against the PRE-pin layout. One refresh
      // recomputes everyone against the now-correct flow. One rAF gives
      // the browser a frame to apply the spacer to layout before the
      // refresh reads positions.
      requestAnimationFrame(() => ScrollTrigger.refresh());

      // Build now (Three.js is already loaded if we got here)
      try {
        buildScene();
      } catch (err) {
        // Hard failure — fall back to 2D for this user.
        console.warn('[Tailor Express] Gallery 3D init failed, falling back to 2D mosaic.', err);
        section.classList.remove('is-3d', 'is-3d-ready');
        init2DFallback();
      }
    };

    /* --- Path selection ------------------------------------- */
    if (!use3D) {
      // 2D path — wire fallback grid immediately. Lightbox already
      // wired above.
      init2DFallback();
      return;
    }

    // 3D path — lazy-load Three.js when user is within one viewport
    // of the gallery section.
    const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    let threeLoading = false;
    let threeLoaded = false;

    const loadThree = () => new Promise((resolve, reject) => {
      if (window.THREE) { threeLoaded = true; resolve(); return; }
      if (threeLoading) {
        // Poll until loaded
        const poll = setInterval(() => {
          if (window.THREE) { clearInterval(poll); threeLoaded = true; resolve(); }
        }, 50);
        return;
      }
      threeLoading = true;
      const s = document.createElement('script');
      s.src = THREE_CDN;
      s.async = true;
      s.onload = () => { threeLoaded = true; resolve(); };
      s.onerror = () => reject(new Error('Three.js failed to load'));
      document.head.appendChild(s);
    });

    const proximityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          proximityObserver.disconnect();
          loadThree()
            .then(() => init3DScene())
            .catch((err) => {
              // Three.js fetch failure — collapse to 2D mosaic.
              // init2DFallback's ScrollTrigger handles entry whenever
              // the section next enters viewport; if user is already
              // past it, the tiles remain at their CSS reduced-motion
              // / fallback state which is still readable.
              console.warn('[Tailor Express] Three.js load failed — using 2D mosaic.', err);
              init2DFallback();
              // Force-show tiles in case ScrollTrigger has already
              // missed its entry window (user landed on section).
              gsap.set(tiles, { opacity: 1, y: 0, scale: 1 });
            });
        });
      },
      { rootMargin: '100% 0px 100% 0px' }
    );
    proximityObserver.observe(section);
  };

  /* =============================================
     TESTIMONIALS (Section 9 / Step 7)
     Single quote at a time. Auto-advance every 6s. Crossfade with
     a deliberate 0.2s empty pause (reads as a slow blink, premium).
     Pause on hover, resume 3s after mouseleave. IntersectionObserver
     gate so we don't burn cycles when section is off-screen.
     prefers-reduced-motion → no auto-advance, instant swap, dots
     remain the manual nav.
     ============================================= */
  const initTestimonials = () => {
    const section = document.getElementById('testimonials');
    if (!section) return;

    const items = Array.from(section.querySelectorAll('.testi__item'));
    const dots  = Array.from(section.querySelectorAll('.testi__dot'));
    if (items.length === 0) return;

    const FADE_OUT = 0.6;       // seconds
    const HOLD     = 0.2;       // empty pause (the deliberate "blink")
    const FADE_IN  = 0.6;
    const INTERVAL = 3000;      // ms between advances

    let active = 0;
    let advanceTimer = null;
    let inViewport   = false;
    // Tap-to-stop: once the user takes manual control (taps anywhere
    // in the section, including a dot), auto-advance is killed for
    // the rest of the page session. Hover does NOT pause anymore.
    let userTookControl = false;
    let isTransitioning = false;

    /* --- Item state helpers ----------------------------------- */
    const setActive = (nextIdx) => {
      if (nextIdx === active || isTransitioning) return;
      const current = items[active];
      const next    = items[nextIdx];
      if (!current || !next) return;

      // Dot state flips immediately (no transition lag on the indicator)
      dots.forEach((d, i) => {
        const on = i === nextIdx;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      if (prefersReducedMotion) {
        // Instant swap — reduced-motion path
        current.classList.remove('is-active');
        current.setAttribute('aria-hidden', 'true');
        next.classList.add('is-active');
        next.setAttribute('aria-hidden', 'false');
        active = nextIdx;
        return;
      }

      isTransitioning = true;
      // Use GSAP so we can sequence the fade-out → empty hold → fade-in
      // cleanly with one timeline. CSS transitions also exist as a
      // baseline but GSAP wins via overwrite.
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => { isTransitioning = false; },
      });
      tl.to(current, {
        opacity: 0,
        duration: FADE_OUT,
        onComplete: () => {
          current.classList.remove('is-active');
          current.setAttribute('aria-hidden', 'true');
        },
      })
      // The 0.2s "blink" — empty space between the two quotes
      .set({}, {}, `+=${HOLD}`)
      .add(() => {
        next.classList.add('is-active');
        next.setAttribute('aria-hidden', 'false');
      })
      .fromTo(next,
        { opacity: 0 },
        { opacity: 1, duration: FADE_IN }
      );

      active = nextIdx;
    };

    const advance = () => setActive((active + 1) % items.length);

    /* --- Auto-advance control --------------------------------- */
    const startAutoAdvance = () => {
      if (prefersReducedMotion) return;
      if (userTookControl) return;
      stopAutoAdvance();
      advanceTimer = setInterval(advance, INTERVAL);
    };
    const stopAutoAdvance = () => {
      if (advanceTimer) { clearInterval(advanceTimer); advanceTimer = null; }
    };

    /* --- Tap-to-stop ----------------------------------------- */
    // Any click/tap inside the section (including on dots) signals
    // that the user wants to drive. Auto-advance halts for the rest
    // of the session; dots still navigate. Hover does NOT pause.
    section.addEventListener('pointerdown', () => {
      userTookControl = true;
      stopAutoAdvance();
    });

    /* --- Dot click handlers ----------------------------------- */
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        // The pointerdown handler above has already flipped
        // userTookControl + stopped the timer. We just switch.
        setActive(i);
      });
    });

    /* --- IntersectionObserver gate ---------------------------- */
    // Only run auto-advance when the section is in viewport. Uses a
    // 25% threshold so we don't start with the section barely peeking.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        inViewport = entry.isIntersecting;
        if (inViewport) {
          startAutoAdvance();   // no-op if userTookControl is set
        } else {
          stopAutoAdvance();
        }
      });
    }, { threshold: 0.25 });
    io.observe(section);
  };

  /* =============================================
     FAQ (Section 10 / Step 8)
     Classic accordion. Each .faq__q is a real <button> wired to
     toggle its matching .faq__a. Multiple items can be open at
     once. Animation: slide-down + opacity, GSAP-driven so we can
     animate height: 'auto' cleanly. Reduced-motion path swaps
     instantly. The `hidden` attribute on each .faq__a is removed
     when opening so the CSS height tween has something to measure.
     ============================================= */
  const initFAQ = () => {
    const section = document.getElementById('faq');
    if (!section) return;

    const items = Array.from(section.querySelectorAll('.faq__item'));
    if (items.length === 0) return;

    const OPEN_DUR  = 0.4;
    const CLOSE_DUR = 0.4;

    items.forEach((item) => {
      const btn = item.querySelector('.faq__q');
      const ans = item.querySelector('.faq__a');
      if (!btn || !ans) return;

      const open = () => {
        btn.setAttribute('aria-expanded', 'true');
        // Remove the `hidden` attribute so the answer enters the
        // a11y tree AND so the height tween can measure content.
        ans.hidden = false;
        if (prefersReducedMotion) {
          gsap.set(ans, { height: 'auto', opacity: 1 });
          return;
        }
        gsap.fromTo(ans,
          { height: 0, opacity: 0 },
          {
            height: 'auto',
            opacity: 1,
            duration: OPEN_DUR,
            ease: 'power3.out',
            overwrite: 'auto',
            // Clear inline height after open so subsequent text reflow
            // (font load, language toggle, viewport resize) doesn't
            // get clamped to the old pixel value.
            onComplete: () => { ans.style.height = ''; },
          }
        );
      };

      const close = () => {
        btn.setAttribute('aria-expanded', 'false');
        if (prefersReducedMotion) {
          gsap.set(ans, { height: 0, opacity: 0 });
          ans.hidden = true;
          return;
        }
        gsap.to(ans, {
          height: 0,
          opacity: 0,
          duration: CLOSE_DUR,
          ease: 'power3.in',
          overwrite: 'auto',
          onComplete: () => {
            ans.hidden = true;
            ans.style.height = '';
          },
        });
      };

      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        if (isOpen) close();
        else open();
        // Multi-open is allowed — no closing siblings.
      });

      // <button> already handles Enter + Space natively; no extra
      // keydown wiring needed.
    });
  };

  /* =============================================
     CONTACT FORM (Section 11)
     Inline form + popup form both call into this. Validates per
     field with native HTML5 constraints, surfaces messages in the
     adjacent .field__error span, POSTs to Formspree, swaps to
     a success state on 200, shows .contact-form__error on failure.
     CLIENT TO CONFIRM: replace [PLACEHOLDER_ENDPOINT] in the form
     action attribute before launch.
     ============================================= */
  const wireContactForm = (form, { onSuccess } = {}) => {
    if (!form) return;
    const fields = Array.from(form.querySelectorAll('.field'));
    const submitBtn = form.querySelector('.contact-form__submit');
    const errorEl = form.querySelector('.contact-form__error');

    // Per-field error messages — kept short, brand-voice.
    const messageFor = (input, lang) => {
      const v = input.validity;
      if (v.valueMissing) {
        return lang === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
      }
      if (v.typeMismatch && input.type === 'email') {
        return lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email';
      }
      if (v.patternMismatch && input.type === 'tel') {
        return lang === 'ar' ? 'يرجى إدخال رقم كويتي صحيح (8 أرقام)' : 'Enter a valid Kuwait number (8 digits)';
      }
      return lang === 'ar' ? 'هذا الحقل غير صالح' : 'Please check this field';
    };

    const langForPage = () => (document.documentElement.dir === 'rtl' ? 'ar' : 'en');

    const showFieldError = (field, msg) => {
      field.dataset.invalid = 'true';
      const slot = field.querySelector('.field__error');
      if (slot) slot.textContent = msg;
    };
    const clearFieldError = (field) => {
      delete field.dataset.invalid;
      const slot = field.querySelector('.field__error');
      if (slot) slot.textContent = '';
    };

    // Clear an error as the user fixes it
    fields.forEach((field) => {
      const input = field.querySelector('.field__input');
      if (!input) return;
      input.addEventListener('input',  () => clearFieldError(field));
      input.addEventListener('change', () => clearFieldError(field));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate
      let firstInvalid = null;
      fields.forEach((field) => {
        const input = field.querySelector('.field__input');
        if (!input) return;
        if (!input.checkValidity()) {
          showFieldError(field, messageFor(input, langForPage()));
          firstInvalid = firstInvalid || input;
        } else {
          clearFieldError(field);
        }
      });
      if (errorEl) errorEl.hidden = true;
      if (firstInvalid) { firstInvalid.focus(); return; }

      // POST to Formspree
      if (submitBtn) submitBtn.disabled = true;
      form.classList.add('is-sending');

      const fd = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' },
      })
      .then((res) => {
        if (!res.ok) throw new Error('Submit failed: ' + res.status);
        form.classList.remove('is-sending');
        if (submitBtn) submitBtn.disabled = false;
        if (typeof onSuccess === 'function') onSuccess();
      })
      .catch((err) => {
        console.warn('[Tailor Express] Contact form submit failed:', err);
        form.classList.remove('is-sending');
        if (submitBtn) submitBtn.disabled = false;
        if (errorEl) errorEl.hidden = false;
      });
    });
  };

  const initContactForm = () => {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('contact-form-success');
    wireContactForm(form, {
      onSuccess: () => {
        if (form) form.hidden = true;
        if (success) success.hidden = false;
      },
    });
  };

  /* =============================================
     LEAD POPUP (Section 11 — popup variant)
     Fires 7s after DOMContentLoaded, desktop only (≥900px), once
     per session. Suppressed if the user has already scrolled
     anywhere near the inline Contact section (no need to nag).
     Focus trap inside the card. Dismiss via X / ESC / backdrop.
     ============================================= */
  const initPopup = () => {
    const popup = document.getElementById('lead-popup');
    const form  = document.getElementById('popup-form');
    if (!popup || !form) return;

    const STORAGE_KEY = 'tailor_express_popup_shown';
    const DELAY = 7000;
    const NARROW = '(max-width: 899px)';

    // Hard skips
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
    if (window.matchMedia(NARROW).matches) return;

    let lastFocused = null;
    let openTimer  = null;
    let canStillOpen = true;

    // If the user has already seen the inline Contact section,
    // suppress the popup permanently for this session.
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            canStillOpen = false;
            sessionStorage.setItem(STORAGE_KEY, '1');
            if (openTimer) { clearTimeout(openTimer); openTimer = null; }
            io.disconnect();
          }
        });
      }, { threshold: 0.1 });
      io.observe(contactSection);
    }

    const getFocusable = () => {
      return Array.from(popup.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )).filter((el) => !el.hidden && el.offsetParent !== null);
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const open = () => {
      if (!canStillOpen) return;
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
      sessionStorage.setItem(STORAGE_KEY, '1');

      lastFocused = document.activeElement;
      popup.hidden = false;
      popup.setAttribute('aria-hidden', 'false');
      // Force reflow then add .is-open so CSS transition fires
      void popup.offsetHeight;
      requestAnimationFrame(() => popup.classList.add('is-open'));

      // Move focus to first input
      const firstInput = form.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();

      document.addEventListener('keydown', onKeyDown);
    };

    const close = () => {
      popup.classList.remove('is-open');
      popup.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', onKeyDown);
      setTimeout(() => {
        if (!popup.classList.contains('is-open')) popup.hidden = true;
      }, 320);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    // Dismissal — X / backdrop / any element marked data-popup-dismiss
    popup.querySelectorAll('[data-popup-dismiss]').forEach((el) => {
      el.addEventListener('click', close);
    });

    // Wire the popup's form via the shared helper. On success, swap
    // form → success state inside the card, then auto-dismiss after
    // 4s (no manual close needed).
    const popupSuccess = popup.querySelector('.contact-form__success');
    wireContactForm(form, {
      onSuccess: () => {
        form.hidden = true;
        if (popupSuccess) popupSuccess.hidden = false;
        setTimeout(close, 4000);
      },
    });

    // 7-second trigger
    openTimer = setTimeout(() => {
      if (canStillOpen) open();
    }, DELAY);
  };

  /* =============================================
     SMOOTH ANCHOR SCROLL
     ============================================= */
  const initAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const targetId = link.getAttribute('href');
        if (targetId.length <= 1 || targetId === '#booking-placeholder') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        const offset = 80;
        const rect = target.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top - offset,
          behavior: 'smooth',
        });
      });
    });
  };

  /* =============================================
     HERO VIDEO AUTOPLAY FALLBACK
     iOS Safari (and some Android browsers) can block autoplay even with
     muted+playsinline. If .play() rejects, wait for any user interaction
     and try again — first touchstart/click anywhere will start the video.
     ============================================= */
  const initHeroVideo = () => {
    const heroVideo = document.querySelector('.hero__video');
    if (!heroVideo) return;
    const tryPlay = () => {
      const p = heroVideo.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          // Autoplay blocked — wait for first user interaction
          const playOnTouch = () => {
            heroVideo.play().catch(() => {});
            document.removeEventListener('touchstart', playOnTouch);
            document.removeEventListener('click', playOnTouch);
          };
          document.addEventListener('touchstart', playOnTouch, { once: true });
          document.addEventListener('click', playOnTouch, { once: true });
        });
      }
    };
    if (heroVideo.readyState >= 2) {
      tryPlay();
    } else {
      heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
    }
  };

  /* =============================================
     INIT
     ============================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeroVideo();
    initLangToggle();
    initAnchors();
    initAbout();
    initAboutBgSequence();
    initServices();
    initPillar();
    initBranches();
    initGallery();
    initTestimonials();
    initFAQ();
    initContactForm();
    initPopup();
    initNavAutoHide();
    // Defer preloader start one frame so all fonts and CSS apply
    requestAnimationFrame(runPreloader);
    // Note: the ScrollTrigger.refresh() that used to live here was
    // removed in v7.3. It ran before the lazy-loaded Gallery pin
    // existed, so it had no effect on the cached-position bug it was
    // meant to fix. The effective refresh now lives inside init3DScene,
    // immediately after the pin trigger is created.
  });

})();
