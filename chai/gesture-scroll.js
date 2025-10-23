(function(){
  function initGestureScroll(){
    var doc = window.document;
    var proxy = doc.getElementById('scrollDetector');
    if(!proxy) return;

    // Wheel: translate horizontal wheel (deltaX) into vertical scroll on the proxy
    window.addEventListener('wheel', function(e){
      // allow normal vertical scrolling; map horizontal to vertical
      if(Math.abs(e.deltaX) > 0 && Math.abs(e.deltaX) > Math.abs(e.deltaY)){
        proxy.scrollTop += e.deltaX; // natural direction: right scroll moves down
      }
    }, { passive: true });

    // Touch: translate horizontal swipe into vertical scroll on the proxy
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
      // Only map when horizontal intent is stronger
      if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10){
        proxy.scrollTop += (-dx * 2.2);
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', function(){ sx = 0; sy = 0; }, { passive: true });
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    initGestureScroll();
  } else {
    window.addEventListener('load', initGestureScroll, false);
  }
})();
