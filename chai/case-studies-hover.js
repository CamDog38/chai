// case-studies-hover.js
// Enable hover-like effects on case cards even when a scroll proxy overlays the viewport.
// It uses elementsFromPoint() to find the underlying .case-card and toggles the .is-hover class.
(function(){
  const d = document;
  let lastHovered = null;

  function updateHoverFromPoint(x, y){
    const stack = d.elementsFromPoint(x, y);
    const card = stack.find(el => el && el.classList && el.classList.contains('case-card'));
    if(card !== lastHovered){
      if(lastHovered) lastHovered.classList.remove('is-hover');
      if(card) card.classList.add('is-hover');
      lastHovered = card || null;
    }
  }

  function clearHover(){
    if(lastHovered){ lastHovered.classList.remove('is-hover'); lastHovered = null; }
  }

  // Mouse support
  d.addEventListener('mousemove', (e)=>{
    updateHoverFromPoint(e.clientX, e.clientY);
  }, {passive:true});

  d.addEventListener('mouseleave', clearHover, {passive:true});

  // Touch support: tap to toggle reveal on the tapped card; auto-clear after a delay.
  let touchClearTimer = null;
  d.addEventListener('touchstart', (e)=>{
    const touch = e.touches[0];
    if(!touch) return;
    updateHoverFromPoint(touch.clientX, touch.clientY);
    if(touchClearTimer) clearTimeout(touchClearTimer);
    touchClearTimer = setTimeout(clearHover, 1800);
  }, {passive:true});

  // CLICK ROUTING: when an overlay sits above the cards (e.g., scroll proxy),
  // route clicks to the underlying case card link at the pointer position.
  d.addEventListener('click', (e) => {
    // Use elementsFromPoint to find the first full-card link under the cursor
    const stack = d.elementsFromPoint(e.clientX, e.clientY);
    const link = stack.find(el => el && el.tagName === 'A' && el.classList.contains('case-card__link'));
    if (link) {
      e.preventDefault();
      // Preserve standard navigation behavior
      const href = link.getAttribute('href');
      if (href) window.location.assign(href);
    }
  }, { capture: true });

  // KEYBOARD ACCESS: if a card is hover-targeted, allow Enter/Space to activate its link
  d.addEventListener('keydown', (e) => {
    if (!lastHovered) return;
    if (e.key === 'Enter' || e.key === ' ') {
      const link = lastHovered.querySelector('a.case-card__link');
      if (link && link.href) {
        e.preventDefault();
        window.location.assign(link.href);
      }
    }
  });
})();
