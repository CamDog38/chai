(function(){
  function initSwipeHelper(){
    var doc = window.document;
    var helper = doc.getElementById('swipeHelper');
    var scrollDetector = doc.getElementById('scrollDetector');
    if(!helper) return;

    var STORAGE_KEY = 'chai_swipe_hint_seen';
    var seen = false;
    try{ seen = window.sessionStorage.getItem(STORAGE_KEY) === 'true'; }catch(e){}

    if(!seen){
      setTimeout(function(){ helper.classList.add('is-visible'); }, 1200);
      setTimeout(function(){ helper.classList.remove('is-visible'); }, 6200);

      var hideHelper = function(){
        helper.classList.remove('is-visible');
        try{ window.sessionStorage.setItem(STORAGE_KEY, 'true'); }catch(e){}
      };
      window.addEventListener('scroll', hideHelper, { once: true, passive: true });
      window.addEventListener('touchstart', hideHelper, { once: true, passive: true });
    }

    if(scrollDetector){
      var sx = 0, sy = 0;
      window.addEventListener('touchstart', function(e){
        if(!e.touches || !e.touches[0]) return;
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
      }, { passive: true });

      window.addEventListener('touchmove', function(e){
        if(!e.touches || !e.touches[0]) return;
        if(!sx && !sy) return;
        var dx = e.touches[0].clientX - sx;
        var dy = e.touches[0].clientY - sy;
        if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20){
          scrollDetector.scrollTop += (-dx * 2.5);
          sx = e.touches[0].clientX;
          sy = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchend', function(){ sx = 0; sy = 0; }, { passive: true });
    }
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    initSwipeHelper();
  } else {
    window.addEventListener('load', initSwipeHelper, false);
  }
})();
