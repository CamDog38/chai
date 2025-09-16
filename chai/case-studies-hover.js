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
})();
