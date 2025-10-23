(function(){
  function initSwipeHelper(){
    var doc = window.document;
    var helper = doc.getElementById('swipeHelper');
    if(!helper) return;

    // Always show on every visit
    setTimeout(function(){ helper.classList.add('is-visible'); }, 1200);
    setTimeout(function(){ helper.classList.remove('is-visible'); }, 6200);

    // Hide on first interaction (do not persist between visits)
    var hideHelper = function(){ helper.classList.remove('is-visible'); };
    window.addEventListener('scroll', hideHelper, { once: true, passive: true });
    window.addEventListener('touchstart', hideHelper, { once: true, passive: true });
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    initSwipeHelper();
  } else {
    window.addEventListener('load', initSwipeHelper, false);
  }
})();
