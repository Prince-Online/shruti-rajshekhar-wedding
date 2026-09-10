document.addEventListener('DOMContentLoaded', () => {
  const data = typeof INVITE_DATA !== 'undefined' ? INVITE_DATA : {};

  const audio = new Audio(data.music || 'assets/audio/bgm.mp3');
  audio.loop = true;
  let isPlaying = false;
  let userPaused = false;
  let wasPlayingBeforeHidden = false;
  let envelopeOpened = false;

  const envelopeModal = document.getElementById('envelopeModal');
  const envelopeFlap = document.getElementById('envelopeFlap');
  const envelopeSeal = document.getElementById('envelopeSeal');
  const envelopeCard = document.getElementById('envelopeCard');
  const envelopePetalBox = document.getElementById('envelopePetalBox');
  const envelopePrompt = document.getElementById('envelopePrompt');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicIconContainer = document.getElementById('musicIconContainer');

  const playSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
  const pauseSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;

  function updateMusicIcon() {
    if (musicIconContainer) {
      musicIconContainer.innerHTML = isPlaying ? pauseSvg : playSvg;
    }
  }

  function playAudio() {
    return audio.play().then(() => {
      isPlaying = true;
      updateMusicIcon();
    }).catch(() => {
      isPlaying = false;
      updateMusicIcon();
    });
  }

  function pauseAudio(isManual = false) {
    audio.pause();
    isPlaying = false;
    if (isManual) {
      userPaused = true;
      wasPlayingBeforeHidden = false;
    }
    updateMusicIcon();
  }

  function toggleAudio() {
    if (!isPlaying) {
      userPaused = false;
      wasPlayingBeforeHidden = false;
      playAudio();
    } else {
      pauseAudio(true);
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleAudio);
  }

  function handleVisibilityOrFocusChange() {
    if (document.hidden || !document.hasFocus()) {
      if (isPlaying) {
        wasPlayingBeforeHidden = true;
        pauseAudio(false);
      }
    } else {
      if (wasPlayingBeforeHidden && !userPaused && envelopeOpened) {
        wasPlayingBeforeHidden = false;
        playAudio();
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityOrFocusChange);
  window.addEventListener('blur', handleVisibilityOrFocusChange);
  window.addEventListener('focus', handleVisibilityOrFocusChange);
  window.addEventListener('pagehide', () => {
    if (isPlaying) {
      wasPlayingBeforeHidden = true;
      pauseAudio(false);
    }
  });

  function spawnEnvelopePetals() {
    if (!envelopePetalBox) return;
    const hues = ['#C7A252', '#E4C989', '#9C7C34', '#F1E3BD'];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i + (Math.random() * 10 - 5);
      const distance = 170 + Math.random() * 190;
      const delay = Math.random() * 200;
      const size = 22 + Math.random() * 20;
      const hue = hues[i % hues.length];

      const el = document.createElement('div');
      el.className = 'petal-burst';
      el.style.setProperty('--pb-angle', `${angle}deg`);
      el.style.setProperty('--pb-distance', `${distance}px`);
      el.style.setProperty('--pb-delay', `${delay}ms`);
      el.style.setProperty('--pb-size', `${size}px`);

      el.innerHTML = `
        <svg width="${size}" height="${size}" viewBox="-16 -20 32 40" class="petal-svg">
          <line x1="0" y1="14" x2="0" y2="-14" stroke="${hue}" stroke-width="1" opacity="0.75" />
          <ellipse cx="-5" cy="-2" rx="5.2" ry="2.4" fill="${hue}" opacity="0.9" transform="rotate(-35 -5 -2)" />
          <ellipse cx="5" cy="2" rx="5.2" ry="2.4" fill="${hue}" opacity="0.9" transform="rotate(35 5 2)" />
          <circle cx="0" cy="-14" r="1.4" fill="#EFDDA6" />
        </svg>
      `;
      envelopePetalBox.appendChild(el);
    }
  }

  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;
    userPaused = false;
    wasPlayingBeforeHidden = false;

    playAudio();

    if (envelopeSeal) {
      envelopeSeal.classList.add('broken');
    }
    if (envelopePrompt) {
      envelopePrompt.style.opacity = '0';
      envelopePrompt.style.pointerEvents = 'none';
    }

    setTimeout(() => {
      if (envelopeFlap) envelopeFlap.classList.add('open');
    }, 120);

    setTimeout(() => {
      if (envelopeCard) {
        envelopeCard.style.pointerEvents = 'auto';
        envelopeCard.classList.add('rise');
      }
    }, 600);

    setTimeout(() => {
      spawnEnvelopePetals();
    }, 850);

    setTimeout(() => {
      if (envelopeModal) {
        envelopeModal.classList.add('fade-out');
      }
      document.body.classList.remove('locked');
      initScratchCanvas();
    }, 2800);
  }

  if (envelopeModal) {
    envelopeModal.addEventListener('click', openEnvelope);
  }

  const groomNameEls = document.querySelectorAll('.bind-groom-first');
  const brideNameEls = document.querySelectorAll('.bind-bride-first');
  const sealInitialEl = document.getElementById('sealInitials');
  const groomParentsEl = document.getElementById('bindGroomParents');
  const brideParentsEl = document.getElementById('bindBrideParents');
  const groomGrandparentsEl = document.getElementById('bindGroomGrandparents');
  const brideGrandparentsEl = document.getElementById('bindBrideGrandparents');
  const groomAddressEl = document.getElementById('bindGroomAddress');
  const brideAddressEl = document.getElementById('bindBrideAddress');
  const groomFamilyTitleEl = document.getElementById('bindGroomFamilyTitle');
  const brideFamilyTitleEl = document.getElementById('bindBrideFamilyTitle');
  const eventDateDisplayEl = document.getElementById('bindDateDisplay');
  const eventDateShortEl = document.getElementById('bindDateShort');
  const heroThankYouEl = document.getElementById('bindHeroThankYou');
  const storyQuoteEl = document.getElementById('bindStoryQuote');
  const directionsBtn = document.getElementById('bindDirectionsBtn');
  const saveCalendarBtn = document.getElementById('saveCalendarBtn');

  if (data.groom && data.groom.firstName) {
    groomNameEls.forEach(el => el.textContent = data.groom.firstName);
  }
  if (data.bride && data.bride.firstName) {
    brideNameEls.forEach(el => el.textContent = data.bride.firstName);
  }
  if (sealInitialEl && data.groom && data.bride) {
    const brideInit = data.bride.initial || data.bride.firstName?.charAt(0) || 'S';
    const groomInit = data.groom.initial || data.groom.firstName?.charAt(0) || 'R';
    sealInitialEl.textContent = `${brideInit} & ${groomInit}`;
  }
  if (groomParentsEl && data.groom) {
    groomParentsEl.innerHTML = `${data.groom.parents} <span style="color: var(--gold); font-weight: 300; font-style: italic; text-transform: lowercase;">${data.groom.parentsAnd || '&'}</span> ${data.groom.parentsMother}`;
  }
  if (brideParentsEl && data.bride) {
    brideParentsEl.innerHTML = `${data.bride.parents} <span style="color: var(--gold); font-weight: 300; font-style: italic; text-transform: lowercase;">${data.bride.parentsAnd || '&'}</span> ${data.bride.parentsMother}`;
  }
  if (groomGrandparentsEl && data.groom?.grandparents) {
    groomGrandparentsEl.textContent = `Grandson of ${data.groom.grandparents}`;
  }
  if (brideGrandparentsEl && data.bride?.grandparents) {
    brideGrandparentsEl.textContent = `Granddaughter of ${data.bride.grandparents}`;
  }
  if (groomAddressEl && data.groom?.address) {
    groomAddressEl.textContent = data.groom.address;
  }
  if (brideAddressEl && data.bride?.address) {
    brideAddressEl.textContent = data.bride.address;
  }
  if (groomFamilyTitleEl && data.groom) {
    groomFamilyTitleEl.textContent = `${data.groom.familyTitle} & Elders`;
  }
  if (brideFamilyTitleEl && data.bride) {
    brideFamilyTitleEl.textContent = `${data.bride.familyTitle} & Elders`;
  }
  if (eventDateDisplayEl && data.event) {
    eventDateDisplayEl.textContent = data.event.dateDisplay;
  }
  if (eventDateShortEl && data.event) {
    eventDateShortEl.textContent = `WEDDING DATE: ${data.event.dateShort}`;
  }
  if (heroThankYouEl && data.hero) {
    heroThankYouEl.textContent = data.hero.thankYouNote;
  }
  if (storyQuoteEl && data.story) {
    storyQuoteEl.textContent = data.story.quote;
  }
  if (saveCalendarBtn && data.event && data.event.calendarUrl) {
    saveCalendarBtn.href = data.event.calendarUrl;
  }
  if (directionsBtn && data.event && data.event.mapUrl) {
    directionsBtn.href = data.event.mapUrl;
  }

  function updateCountdown() {
    const targetStr = data.event?.dateCountdown || 'December 13, 2026 18:00:00';
    const target = new Date(targetStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    let d = 0, h = 0, m = 0, s = 0;
    if (diff > 0) {
      d = Math.floor(diff / (1000 * 60 * 60 * 24));
      h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      m = Math.floor((diff / (1000 * 60)) % 60);
      s = Math.floor((diff / 1000) % 60);
    }

    const dEl = document.getElementById('cdDays');
    const hEl = document.getElementById('cdHours');
    const mEl = document.getElementById('cdMins');
    const sEl = document.getElementById('cdSecs');

    if (dEl) dEl.textContent = d.toString().padStart(2, '0');
    if (hEl) hEl.textContent = h.toString().padStart(2, '0');
    if (mEl) mEl.textContent = m.toString().padStart(2, '0');
    if (sEl) sEl.textContent = s.toString().padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  let scratchInited = false;
  function initScratchCanvas() {
    if (scratchInited) return;
    scratchInited = true;

    const canvas = document.getElementById('scratchCanvas');
    const container = document.getElementById('scratchContainer');
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width || 300;
    const h = rect.height || 120;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a2c5b';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#c0a062';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = 'bold 14px Montserrat, sans-serif';
    ctx.fillStyle = '#c0a062';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH TO REVEAL', w / 2, h / 2 - 12);

    ctx.font = 'italic 16px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('our wedding date', w / 2, h / 2 + 14);

    ctx.globalCompositeOperation = 'destination-out';

    let isDrawing = false;
    let isRevealed = false;

    function scratchAt(clientX, clientY) {
      const cRect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / cRect.width;
      const scaleY = canvas.height / cRect.height;
      const x = (clientX - cRect.left) * scaleX;
      const y = (clientY - cRect.top) * scaleY;

      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    function triggerConfetti() {
      if (typeof confetti === 'function') {
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#c0a062', '#1a2c5b', '#ffffff']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#c0a062', '#1a2c5b', '#ffffff']
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    }

    function checkReveal() {
      if (isRevealed) return;
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let transparentCount = 0;
        const step = 16;
        for (let i = 3; i < pixels.length; i += step) {
          if (pixels[i] < 128) {
            transparentCount++;
          }
        }
        const total = Math.floor(pixels.length / step);
        if (transparentCount / total > 0.4) {
          isRevealed = true;
          canvas.classList.add('revealed');
          const dateEl = document.getElementById('bindDateDisplay');
          if (dateEl) dateEl.classList.add('scale-up');
          triggerConfetti();

          const cd = document.getElementById('countdownWrapper');
          if (cd) {
            cd.classList.remove('hidden-initially');
            cd.classList.add('show-fade');
          }
          const rev = document.getElementById('revealedSections');
          if (rev) {
            rev.classList.remove('hidden-initially');
            rev.classList.add('show-fade');
          }
        }
      } catch (_) {
        isRevealed = true;
        canvas.classList.add('revealed');
      }
    }

    function handleStart(e) {
      if (isRevealed) return;
      isDrawing = true;
      const point = e.touches ? e.touches[0] : e;
      scratchAt(point.clientX, point.clientY);
    }

    function handleMove(e) {
      if (!isDrawing || isRevealed) return;
      if (e.cancelable && e.touches) e.preventDefault();
      const point = e.touches ? e.touches[0] : e;
      scratchAt(point.clientX, point.clientY);
    }

    function handleEnd() {
      isDrawing = false;
      checkReveal();
    }

    canvas.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  }

  const slides = data.story?.slides || [];
  let currentSlide = 0;
  const slideImgEl = document.getElementById('storySlideImg');
  const slideCaptionEl = document.getElementById('storySlideCaption');
  const dotsContainer = document.getElementById('storyDots');
  const prevBtn = document.getElementById('storyPrevBtn');
  const nextBtn = document.getElementById('storyNextBtn');

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = `dot ${i === currentSlide ? 'active' : ''}`;
      dotsContainer.appendChild(dot);
    });
  }

  function showSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    const slide = slides[currentSlide];

    if (slideImgEl) {
      slideImgEl.style.opacity = '0';
      setTimeout(() => {
        slideImgEl.src = slide.image;
        slideImgEl.alt = slide.alt || slide.caption;
        slideImgEl.style.opacity = '1';
      }, 150);
    }
    if (slideCaptionEl) {
      slideCaptionEl.textContent = slide.caption || slide.alt;
    }
    renderDots();
  }

  if (slides.length > 0) {
    showSlide(0);
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
  }

  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));
});
