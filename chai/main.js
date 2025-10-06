const scrollDetector = document.getElementById('scrollDetector');
const rail = document.getElementById('rail');
const progressFill = document.getElementById('progressFill');
const viewport = document.querySelector('.viewport');
const servicesSection = document.getElementById('services');
let headWords = [];
let bodyWords = [];
// About section word buckets
let aboutWords = [];
let aboutHeadWords = [];

// Tokenize text into .word spans while preserving existing inline elements
function tokenizePreserve(el){
  if (!el) return [];

  function wrapNode(node){
    if (node.nodeType === Node.TEXT_NODE){
      const frag = document.createDocumentFragment();
      const spans = [];
      const text = node.textContent || '';
      const parts = text.split(/(\s+)/); // keep whitespace tokens
      parts.forEach(part => {
        if (part === '') return;
        if (/^\s+$/.test(part)){
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = part;
          frag.appendChild(span);
          spans.push(span);
        }
      });
      return { node: frag, spans };
    }
    if (node.nodeType === Node.ELEMENT_NODE){
      const clone = node.cloneNode(false); // shallow
      const spans = [];
      node.childNodes.forEach(child => {
        const wrapped = wrapNode(child);
        clone.appendChild(wrapped.node);
        spans.push(...wrapped.spans);
      });
      return { node: clone, spans };
    }
    // Fallback: remove unsupported nodes
    return { node: document.createDocumentFragment(), spans: [] };
  }

  const newFrag = document.createDocumentFragment();
  const allSpans = [];
  Array.from(el.childNodes).forEach(n => {
    const wrapped = wrapNode(n);
    newFrag.appendChild(wrapped.node);
    allSpans.push(...wrapped.spans);
  });
  el.textContent = '';
  el.appendChild(newFrag);
  return allSpans;
}

// Smooth-scroll the horizontal rail so a given section (or its heading) is centered in the viewport
// opts: { offsetPx?: number, focus?: 'auto' | 'heading' | 'section' }
function scrollRailToSection(sectionEl, opts = {}){
  const { offsetPx = 0, focus = 'auto' } = opts;
  if(!sectionEl || !rail || !scrollDetector || !viewport) return;
  const vpRect = viewport.getBoundingClientRect();
  // Prefer the heading (.copy-head) when focusing, so the title aligns centrally
  let focal = sectionEl;
  if (focus === 'heading' || (focus === 'auto' && sectionEl.querySelector && sectionEl.querySelector('.copy-head'))){
    focal = sectionEl.querySelector('.copy-head') || sectionEl;
  }
  const elRect = focal.getBoundingClientRect();
  const vCenter = vpRect.left + vpRect.width / 2;
  const sCenter = elRect.left + elRect.width / 2;
  // Positive delta means target center is to the right; we need to scroll further down to move rail left
  const delta = sCenter - vCenter;
  const maxScroll = Math.max(0, scrollDetector.scrollHeight - window.innerHeight);
  let target = scrollDetector.scrollTop + delta + offsetPx;
  target = Math.max(0, Math.min(maxScroll, target));
  scrollDetector.scrollTo({ top: target, behavior: 'smooth' });
}

// Ensure scroll proxy height covers entire horizontal rail
function sizeGlobalScrollProxy(){
  const sh = document.querySelector('.scroll-height');
  if (!sh) return;
  const panels = document.querySelectorAll('.panel').length || 1;
  const required = (panels + 1) * window.innerHeight; // one viewport per panel + buffer
  const currentPx = parseFloat(getComputedStyle(sh).height) || 0;
  if (required > currentPx) sh.style.height = `${required}px`;
}

// Horizontal motion speed
const PX_PER_SCROLL = 1.0;

// Grow settings (kept modest so media doesn't swamp text)
const MIN_SCALE = 0.90;
const MAX_SCALE = 1.12;

// Elements that should grow when centered:
const growTargets = [];
document.querySelectorAll('.hero-media .photo-wrap').forEach(el => growTargets.push(el));
// New hero visual card
document.querySelectorAll('.visual').forEach(el => growTargets.push(el));
document.querySelectorAll('.category-stack__img').forEach(el => growTargets.push(el));
document.querySelectorAll('.case-card__logo').forEach(el => growTargets.push(el));
document.querySelectorAll('.video-wrap').forEach(el => growTargets.push(el));

// Track only the elements near the viewport to reduce per-frame work
const activeGrow = new Set();
let growObserver;
try{
  growObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activeGrow.add(entry.target);
      else activeGrow.delete(entry.target);
    });
  }, { root: document.querySelector('.viewport'), threshold: 0, rootMargin: '0px 40% 0px 40%' });
  growTargets.forEach(el => growObserver.observe(el));
} catch(e){ /* fallback: activeGrow stays empty -> applyImageScales loops all */ }

function applyImageScales() {
  const vRect = viewport.getBoundingClientRect();
  const vCenter = vRect.left + vRect.width / 2;
  const half = vRect.width / 2;

  const iter = activeGrow.size ? activeGrow : growTargets;
  for (const el of iter) {
    const r = el.getBoundingClientRect();
    const c = r.left + r.width / 2;
    const norm = Math.min(1, Math.abs(c - vCenter) / half); // 0 when centered
    const scale = MIN_SCALE + (1 - norm) * (MAX_SCALE - MIN_SCALE);
    el.style.transform = `scale(${scale})`;
  }

}

function updateCopyFill() {
  const vRect = viewport.getBoundingClientRect();

  // Helper to compute progress for a section by its headline center vs viewport
  function progressFor(selector) {
    const root = document.querySelector(selector);
    if (!root) return 0;
    const target = root.querySelector('.copy-head') || root;
    const r = target.getBoundingClientRect();
    const vCenter = vRect.left + vRect.width / 2;
    const sCenter = r.left + r.width / 2;
    const threshold = Math.min(vRect.width / 2, Math.max(160, r.width / 2));
    const tolerance = Math.max(12, r.width * 0.04);
    const dist = Math.abs(sCenter - vCenter);
    let p = dist <= tolerance
      ? 1
      : 1 - Math.min(1, (dist - tolerance) / (threshold));
    return Math.min(1, Math.max(0, p + 0.05));
  }

  // Services fill
  if (servicesSection) {
    const ps = progressFor('#services');
    servicesSection.style.setProperty('--copyFill', `${(ps * 100).toFixed(1)}%`);
    const words = [...headWords, ...bodyWords];
    if (words.length) {
      const N = words.length;
      const filledCount = Math.max(0, Math.min(N, Math.ceil(ps * N)));
      for (let i = 0; i < N; i++) {
        if (i < filledCount) words[i].classList.add('on');
        else words[i].classList.remove('on');
      }
    }
  }

  // About fill
  const aboutSection = document.querySelector('.about');
  if (aboutSection && (aboutWords.length || aboutHeadWords.length)) {
    const pa = progressFor('.about');
    aboutSection.style.setProperty('--copyFill', `${(pa * 100).toFixed(1)}%`);
    const all = [...aboutHeadWords, ...aboutWords];
    const N = all.length;
    const filledCount = Math.max(0, Math.min(N, Math.ceil(pa * N)));
    for (let i = 0; i < N; i++) {
      if (i < filledCount) all[i].classList.add('on');
      else all[i].classList.remove('on');
    }
  }
}

function update() {
  const maxScroll = scrollDetector.scrollHeight - window.innerHeight;
  const y = scrollDetector.scrollTop;
  const progress = y / maxScroll;

  // Use translate3d to keep the rail on the compositor thread
  rail.style.transform = `translate3d(${-y * PX_PER_SCROLL}px, 0, 0)`;
  progressFill.style.width = `${progress * 100}%`;

  applyImageScales();
  updateCopyFill();
}

// Throttle global updates to animation frames to reduce jank
let tickingGlobal = false;
scrollDetector.addEventListener('scroll', () => {
  if (tickingGlobal) return;
  tickingGlobal = true;
  requestAnimationFrame(() => { update(); tickingGlobal = false; });
}, { passive: true });
window.addEventListener('resize', () => { sizeGlobalScrollProxy(); update(); });
sizeGlobalScrollProxy();
update();

// Contact form submit handler (moved from inline onsubmit)
document.addEventListener('DOMContentLoaded', () => {
  sizeGlobalScrollProxy();
  // Kick off loader animation and remove overlay after it finishes
  (function initLoader(){
    const loader = document.getElementById('loader');
    if(!loader) return;
    // Optional hold before sliding away for a more deliberate reveal
    const START_DELAY = 900; // ms (longer hold before slide)
    const SLIDE_DURATION = 3000; // must match CSS transition duration
    let hidden = false;

    function hideLoader(){
      if (hidden) return; hidden = true;
      loader.classList.add('is-hidden');
    }

    // Begin the slide after a small delay
    setTimeout(() => {
      // First, reveal logo with a subtle fade/scale
      loader.classList.add('on');
      // Then after the logo settles, slide the panel away
      setTimeout(() => loader.classList.add('animate'), 700);
      // Prefer transitionend to timeouts for accuracy
      const onEnd = (e) => {
        if (e.target !== loader) return;
        loader.removeEventListener('transitionend', onEnd);
        hideLoader();
      };
      loader.addEventListener('transitionend', onEnd);
      // Fallback in case transitionend doesn't fire
      setTimeout(hideLoader, SLIDE_DURATION + 900); // account for pre-slide logo settle
    }, START_DELAY);
  })();
  // Word-by-word fill setup for headline (preserve inline markup and tokenize text nodes)
  const head = document.querySelector('#services .copy-head');
  if (head && !head.dataset.tokenized) {
    headWords = tokenizePreserve(head);
    head.dataset.tokenized = '1';
  }

  // Tokenize body paragraphs into word spans (Services) while preserving inline elements
  const paras = document.querySelectorAll('#services .body-text p');
  bodyWords = [];
  paras.forEach((p) => {
    if (!p.dataset.tokenized) {
      const spans = tokenizePreserve(p);
      p.dataset.tokenized = '1';
      bodyWords.push(...spans);
      return;
    }
    bodyWords.push(...p.querySelectorAll('.word'));
  });

  // Tokenize About header
  const aboutHead = document.querySelector('.about .copy-head');
  if (aboutHead && !aboutHead.dataset.tokenized) {
    const words = aboutHead.textContent.trim().split(/\s+/);
    aboutHead.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      aboutHead.appendChild(span);
      if (i < words.length - 1) aboutHead.appendChild(document.createTextNode(' '));
    });
    aboutHead.dataset.tokenized = '1';
  }
  aboutHeadWords = Array.from(document.querySelectorAll('.about .copy-head .word'));

  // Tokenize About paragraphs (two columns) while preserving inline elements
  const aboutParas = document.querySelectorAll('.about .copy-cols p');
  aboutWords = [];
  aboutParas.forEach((p) => {
    if (!p.dataset.tokenized) {
      const spans = tokenizePreserve(p);
      p.dataset.tokenized = '1';
      aboutWords.push(...spans);
      return;
    }
    aboutWords.push(...p.querySelectorAll('.word'));
  });

  const form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Submitted (demo)');
    });
  }

  // Services stacked scroll animation (from stack.js, scoped)
  (function initServicesStack(){
    const stackRoot = document.querySelector('.services-stack');
    if (!stackRoot) return;
    const DEBUG_STACK = false;
    // Tuning: make stacking start earlier and finish by mid-screen
    // Positive offset nudges the section as if it's slightly further left, so progress increases earlier
    const STACK_EARLY_OFFSET_PX = 140;    // increase to start stacking sooner (suggested: 100–200)
    const STACK_SPEED = 1.18;             // >1 speeds up progress; keep modest to avoid abrupt animation
    const services = Array.from(stackRoot.querySelectorAll('.service'));
    const listEl = stackRoot.querySelector('.services-list');
    const mediaImg = document.getElementById('mediaImage');
    // Set default preview to service 01 (Kate) and make it visible on load
    if (mediaImg) {
      const abs0 = new URL('Images/Team/Kate.JPG', window.location.href).href;
      if (mediaImg.src !== abs0) mediaImg.src = abs0;
      mediaImg.classList.add('is-visible');
    }
    // Force service 01 (data-idx="1") image first until user interacts
    let hasShownFirst = false;
    let forcedIdx = services.findIndex(el => el.getAttribute('data-idx') === '1');

    const ROW_H = 132;
    const ROW_GAP = 20; // closer spacing between cards
    const GAP_SAFE = 4;  // safety pixels to prevent any bleed/overlap
    const SIDE_PAD_LEFT = 0;
    const SIDE_PAD_RIGHT = 14;
    const BOTTOM_PAD = 68; // shifted up ~30px more
    const STACK_TOP_OFFSET = 0; // no extra top offset needed with larger gaps

    function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
    function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

    let hoverIdx = -1;
    let hoverUrl = '';

    // ensure --bg set from data-image (fallback if not inline)
    services.forEach((el) => {
      const url = el.getAttribute('data-image');
      if (url && !el.style.getPropertyValue('--bg')) el.style.setProperty('--bg', `url("${url}")`);
    });

    function sizeScrollProxy(){
      const required = (Math.max(1, services.length) + 1) * window.innerHeight;
      const sh = document.querySelector('.scroll-height');
      if (!sh) return;
      const currentPx = parseFloat(getComputedStyle(sh).height) || 0;
      if (required > currentPx) {
        sh.style.height = `${required}px`;
        if (DEBUG_STACK) console.log('[stack] sizeScrollProxy increased', { required, currentPx });
      }
    }

    function setMedia(url){
      if (!mediaImg || !url) return;
      // Normalize to absolute to compare reliably with mediaImg.src
      const abs = new URL(url, window.location.href).href;
      if (mediaImg.src === abs) return;
      mediaImg.classList.remove('is-visible');
      const onLoad = () => { mediaImg.classList.add('is-visible'); mediaImg.removeEventListener('load', onLoad); };
      mediaImg.addEventListener('load', onLoad);
      // In case the image is instantly available from cache
      mediaImg.src = abs;
      if (mediaImg.complete) mediaImg.classList.add('is-visible');
    }

    function layout(){
      const vh = window.innerHeight;
      const y = scrollDetector.scrollTop;
      const maxScroll = scrollDetector.scrollHeight - vh;
      const progress = maxScroll > 0 ? y / maxScroll : 0;
      if (progressFill) progressFill.style.width = `${progress * 100}%`;

      // On the very first layout pass, set the preview to service 01 (brand & strategy)
      if (!hasShownFirst) {
        const firstSvc = services[forcedIdx] || services[0];
        const url0 = firstSvc && firstSvc.getAttribute('data-image');
        if (url0) setMedia(url0);
        hasShownFirst = true;
        // keep going so positions are computed, but prefer forcedIdx below
      }

      // Horizontal-position driven progress (guarantee full stack by center)
      const vRect = viewport.getBoundingClientRect();
      const sRect = stackRoot.getBoundingClientRect();
      const vCenter = vRect.left + vRect.width / 2;
      const vRight = vRect.left + vRect.width;
      const sCenter = sRect.left + sRect.width / 2;
      // Progress baseline: 0 when section center is at viewport right edge; 1 when at viewport center
      const denom = Math.max(1, vRect.width / 2);
      // Apply an early-start bias and a gentle speed multiplier, then clamp
      const base = (vRight - sCenter + STACK_EARLY_OFFSET_PX) / denom;
      const g = clamp(base * STACK_SPEED, 0, 1);

      const ch = listEl ? listEl.clientHeight : vh;

      let activeIdx = 0;
      let bestDist = Infinity;

      const N = Math.max(1, services.length);
      services.forEach((el, i) => {
        // As g goes 0->1, each card finishes in sequence; at g=1 last is fully stacked
        const p = clamp(g * N - i, 0, 1);
        const eased = easeOutCubic(p);
        const startY = -ROW_H - 60;
        const EFFECTIVE = ROW_H + ROW_GAP + GAP_SAFE;
        const targetY = Math.max(0, STACK_TOP_OFFSET + ch - BOTTOM_PAD - EFFECTIVE * (i + 1) + ROW_GAP);
        const curY = startY + (targetY - startY) * eased;
        el.style.setProperty('--ty', `${curY}px`);
        el.style.left = `${SIDE_PAD_LEFT}px`;
        el.style.right = `${SIDE_PAD_RIGHT}px`;
        // Ensure visual stacking: top rows should render above lower rows
        el.style.zIndex = String(1000 - i);
        el.style.setProperty('--alpha', `${p}`);
        const tx = (1 - eased) * -28;
        el.style.setProperty('--tx', `${tx}px`);
        const distToOne = 1 - p;
        if (distToOne < bestDist){ bestDist = distToOne; activeIdx = i; }
      });

      if (DEBUG_STACK) {
        const firstP = clamp(g * N - 0, 0, 1);
        console.log('[stack] layout', { y, g: +g.toFixed(3), N, ch, activeIdx, firstP, sectionCenter: sCenter.toFixed(1), vCenter: vCenter.toFixed(1), vRight: vRight.toFixed(1), vWidth: vRect.width.toFixed(1), base: +base.toFixed(3) });
      }

      services.forEach((el, i) => {
        if (i === activeIdx && hoverIdx === -1) el.classList.add('service--active');
        else el.classList.remove('service--active');
        if (i === hoverIdx) el.classList.add('service--active');
        // visual hover class (used when overlay blocks pointer events)
        if (i === hoverIdx) el.classList.add('service--hover');
        else el.classList.remove('service--hover');
      });

      const chosenIdx = (forcedIdx !== -1) ? forcedIdx : (hoverIdx !== -1 ? hoverIdx : activeIdx);
      const chosen = services[chosenIdx];
      const url = hoverIdx !== -1 ? hoverUrl : chosen?.getAttribute('data-image');
      if (url) setMedia(url);
    }

    // Hover/focus handling
    services.forEach((el, i) => {
      const enter = () => { hoverIdx = i; hoverUrl = el.getAttribute('data-image') || ''; layout(); };
      const leave = () => { hoverIdx = -1; hoverUrl = ''; layout(); };
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointerleave', leave);
      el.addEventListener('mouseover', enter);
      el.addEventListener('mouseout', leave);
      el.addEventListener('focus', enter);
      el.addEventListener('blur', leave);
    });

    // Clear the forced preview once the user interacts or after a short delay
    const clearForced = () => { if (forcedIdx !== -1) { forcedIdx = -1; layout(); } };
    listEl && listEl.addEventListener('mouseenter', clearForced, { passive: true });
    listEl && listEl.addEventListener('focusin', clearForced, { passive: true });

    // Overlay hover probe INSIDE init so it has access to variables
    function probeHoverFromOverlay(ev){
      const prev = scrollDetector.style.pointerEvents;
      scrollDetector.style.pointerEvents = 'none';
      const elBelow = document.elementFromPoint(ev.clientX, ev.clientY);
      scrollDetector.style.pointerEvents = prev || '';
      const svc = elBelow && elBelow.closest ? elBelow.closest('.service') : null;
      if (svc){
        const i = services.indexOf(svc);
        if (i !== -1){
          hoverIdx = i; hoverUrl = svc.getAttribute('data-image') || ''; layout();
          return;
        }
      }
      if (hoverIdx !== -1){ hoverIdx = -1; hoverUrl = ''; layout(); }
    }
    scrollDetector.addEventListener('mousemove', probeHoverFromOverlay, { passive: true });
    scrollDetector.addEventListener('mouseleave', () => { if (hoverIdx !== -1){ hoverIdx = -1; hoverUrl = ''; layout(); } }, { passive: true });

    // Bind to global scroll so the stack updates while you scroll
    // Throttle stack layout to rAF as well
    let tickingStack = false;
    scrollDetector.addEventListener('scroll', () => {
      if (tickingStack) return;
      tickingStack = true;
      requestAnimationFrame(() => { layout(); tickingStack = false; });
    }, { passive: true });
    window.addEventListener('resize', () => {
      updateCopyFill();
    });

    // Contact button: JS-driven hover/click to bypass overlay intercepting pointer events
    (function enableContactButtonHover() {
      const btn = document.querySelector('.panel.contact .submit');
      if (!btn) return;

      function withinCircle(x, y, rect) {
        const r = rect.width / 2;
        const cx = rect.left + r;
        const cy = rect.top + r;
        const dx = x - cx;
        const dy = y - cy;
        return (dx*dx + dy*dy) <= (r*r);
      }

      function onMove(e) {
        const rect = btn.getBoundingClientRect();
        if (withinCircle(e.clientX, e.clientY, rect)) btn.classList.add('is-hover');
        else btn.classList.remove('is-hover');
      }

      function onClick(e) {
        const rect = btn.getBoundingClientRect();
        if (withinCircle(e.clientX, e.clientY, rect)) {
          e.preventDefault();
          // Trigger the anchor programmatically
          btn.click();
        }
      }

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mousedown', onClick);
    })();

    // Left menu flyout: anchor links scroll the horizontal rail to target sections
    (function initLeftMenuAnchors(){
      const links = document.querySelectorAll('.left-flyout a[href^="#"]');
      links.forEach(a => {
        a.addEventListener('click', (e) => {
          const hash = a.getAttribute('href');
          if (!hash || hash.length < 2) return;
          // For Services, target the services stack panel instead of the copy panel
          const svcStack = document.querySelector('#rail > section.panel.services-stack.layer-media');
          const target = (hash === '#services' && svcStack) ? svcStack : document.querySelector(hash);
          if (target){
            e.preventDefault();
            const focus = hash === '#services' ? 'section' : 'auto';
            scrollRailToSection(target, { focus });
            // Close the flyout if open
            const menu = document.querySelector('.left-menu');
            if (menu && menu.classList.contains('is-open')){
              menu.classList.remove('is-open');
              const btn = document.querySelector('.left-menu__toggle');
              const fly = document.getElementById('leftFlyout');
              if (btn) btn.setAttribute('aria-expanded', 'false');
              if (fly) fly.setAttribute('aria-hidden', 'true');
            }
          }
        });
      });
    })();

    // Global hash link handler: smoothly scroll any in-rail section (logo, hero buttons, etc.)
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.length < 2) return;
      const svcStack = document.querySelector('#rail > section.panel.services-stack.layer-media');
      const target = (href === '#services' && svcStack) ? svcStack : document.querySelector(href);
      if (!target) return;
      // Only intercept if the target is part of the horizontal rail content
      if (!target.closest || !target.closest('.rail')) return;
      ev.preventDefault();
      const focus = href === '#services' ? 'section' : 'auto';
      scrollRailToSection(target, { focus });
      // Close the flyout if it is open
      const menu = document.querySelector('.left-menu');
      if (menu && menu.classList.contains('is-open')){
        menu.classList.remove('is-open');
        const btn = document.querySelector('.left-menu__toggle');
        const fly = document.getElementById('leftFlyout');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (fly) fly.setAttribute('aria-hidden', 'true');
      }
    }, { passive: false });

  // Overlay click proxy: forward clicks that land on the scroll overlay to the underlying CTA anchors
  if (scrollDetector){
    scrollDetector.addEventListener('click', (ev) => {
      // If the click actually hit a real anchor, let existing handlers process it
      if (ev.target.closest && ev.target.closest('a')) return;
      // Peek underneath the overlay to find the element at the click point
      const prev = scrollDetector.style.pointerEvents;
      scrollDetector.style.pointerEvents = 'none';
      const below = document.elementFromPoint(ev.clientX, ev.clientY);
      scrollDetector.style.pointerEvents = prev || '';
      const anchor = below && below.closest ? below.closest('a[href="#case-studies"], a[href="#contact"]') : null;
      if (!anchor) return;
      ev.preventDefault();
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      scrollRailToSection(target, { focus: 'section' });
      // Close flyout if open
      const menu = document.querySelector('.left-menu');
      if (menu && menu.classList.contains('is-open')){
        menu.classList.remove('is-open');
        const btn = document.querySelector('.left-menu__toggle');
        const fly = document.getElementById('leftFlyout');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (fly) fly.setAttribute('aria-hidden', 'true');
      }
    }, { passive: false });
  }

  // Fallback: ensure hero CTA anchors (#case-studies, #contact) always scroll
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest && ev.target.closest('a[href="#case-studies"], a[href="#contact"]');
    if (!a) return;
    const href = a.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    ev.preventDefault();
    scrollRailToSection(target, { focus: 'section' });
    // Close the flyout if it is open
    const menu = document.querySelector('.left-menu');
    if (menu && menu.classList.contains('is-open')){
      menu.classList.remove('is-open');
      const btn = document.querySelector('.left-menu__toggle');
      const fly = document.getElementById('leftFlyout');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (fly) fly.setAttribute('aria-hidden', 'true');
    }
  }, { passive: false });

  // JS-driven hover for hero CTA buttons so overlay can't suppress the visual affordance
  (function ensureHeroHover(){
    const cta = document.querySelector('.hero__cta');
    if (!cta) return;
    const btns = Array.from(cta.querySelectorAll('.btn'));
    function setHover(e){
      // Probe under the overlay if necessary
      let el = e.target;
      if (scrollDetector){
        const prev = scrollDetector.style.pointerEvents;
        scrollDetector.style.pointerEvents = 'none';
        el = document.elementFromPoint(e.clientX, e.clientY);
        scrollDetector.style.pointerEvents = prev || '';
      }
      btns.forEach(b => b.classList.toggle('is-hover', !!(el && (el === b || (el.closest && el.closest('.btn') === b)))));
    }
    function clearHover(){ btns.forEach(b => b.classList.remove('is-hover')); }
    window.addEventListener('mousemove', setHover, { passive: true });
    window.addEventListener('mouseout', clearHover, { passive: true });
  })();

  // Explicit logo-to-start handler (in case delegated handler misses it)
  const logoLink = document.querySelector('.left-menu__logo[href="#start"]');
  if (logoLink){
    logoLink.addEventListener('click', (e) => {
      const start = document.querySelector('#start');
      if (start){
        e.preventDefault();
        scrollRailToSection(start);
        const menu = document.querySelector('.left-menu');
        if (menu && menu.classList.contains('is-open')){
          menu.classList.remove('is-open');
          const btn = document.querySelector('.left-menu__toggle');
          const fly = document.getElementById('leftFlyout');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          if (fly) fly.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  layout(); 
  if (DEBUG_STACK) console.log('[stack] init', { count: services.length });
  sizeGlobalScrollProxy();
  layout();
})();

(function(){
  // Case studies: subtle 3D tilt on hover (requested)
  (function enableCaseCardTilt(){
    const cards = document.querySelectorAll('.case-card__top');
    if (!cards.length) return;
    cards.forEach((card) => {
      card.style.willChange = 'transform';
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
      });
    });
  })();
})();

  // Marquee panel: one-time scroll-in animation (no glitchy reverse)
  (function initMarqueeScrollAnimation(){
    const marqueePanel = document.querySelector('.marquee-panel');
    if (!marqueePanel) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Unobserve after first trigger to prevent glitchy reverse
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, // trigger a bit earlier
      rootMargin: '0px 240px 0px 240px' // expand root horizontally to pre-trigger
    });
    
    observer.observe(marqueePanel);
  })();

  // Case studies: staggered scroll-in from top
  (function initCaseStudyAnimations(){
    // Preload ONLY the first case-card image to avoid first-hit jank; others load normally
    (function preloadFirstCaseStudyImage(){
      try{
        const firstTop = document.querySelector('.case-card__top');
        if(!firstTop) return;
        const inline = firstTop.style && firstTop.style.backgroundImage ? firstTop.style.backgroundImage : '';
        const m = inline.match(/url\((['\"]?)(.*?)\1\)/);
        const src = m && m[2] ? m[2] : '';
        if(!src) return;
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.fetchPriority = 'high';
        img.src = src;
      } catch(err){ /* no-op */ }
    })();

    const caseCards = document.querySelectorAll('.case-card');
    if (!caseCards.length) return;
    // Make only the first card visible immediately to avoid a first-hit animation stall
    caseCards[0] && caseCards[0].classList.add('is-visible');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px'
    });
    
    caseCards.forEach((card, i) => { if (i > 0) observer.observe(card); });
  })();

});
