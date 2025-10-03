// Logo Marquee Builder
// Builds multiple alternating marquee rows using logos from Images/Logo marquie/

(function () {
  const wrap = document.getElementById('lmWrap');
  if (!wrap) return;

  // Source logos from folder (as found in the project)
  const base = 'Images/Logo marquie/';
  const logos = [
    { src: base + 'ASGC.png', alt: 'ASGC' },
    { src: base + 'Al Ashram.png', alt: 'Al Ashram' },
    { src: base + 'Dr Sal.png', alt: 'Dr Saliha Afridi' },
    { src: base + 'Foothill.png', alt: 'Foothill' },
    { src: base + 'GS.png', alt: 'Growthspace', extraClass: 'logo-card--gs' },
    { src: base + 'Gardens.png', alt: 'Gardens' },
    { src: base + 'Imperial.png', alt: 'Imperial' },
    { src: base + 'Integra.png', alt: 'Integra' },
    { src: base + 'Light Hearted.png', alt: 'Light Hearted' },
    { src: base + 'Polar.png', alt: 'Polar' },
    { src: base + 'Smart Heart.png', alt: 'Smart Heart' },
    { src: base + 'Sported Orange.png', alt: 'Sported' },
    { src: base + 'TLHA.png', alt: 'The Lighthouse Arabia' },
    { src: base + 'Velo Presto.png', alt: 'Velo Presto' }
  ];

  // Config: keep rows big so logos are clearly visible
  const rows = 3; // fixed 3 rows for larger shapes
  const baseDuration = 32; // seconds

  // Utility: create a logo card element
  function createCard(item) {
    const card = document.createElement('div');
    card.className = 'logo-card' + (item.extraClass ? ' ' + item.extraClass : '');
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt || '';
    img.loading = 'lazy';
    card.appendChild(img);
    return card;
  }

  // Build one row with duplicated content for seamless loop
  function buildRow({ reverse = false, duration = baseDuration, startIndex = 0, density = 1 }) {
    const row = document.createElement('div');
    row.className = 'marquee-row';

    const track = document.createElement('div');
    track.className = 'marquee-track' + (reverse ? ' is-reverse' : '');
    track.style.animationDuration = duration + 's';

    // First set
    const set1 = document.createElement('div');
    set1.style.display = 'flex';
    set1.style.gap = 'var(--lm-gap)';

    // Second set (duplicate) for seamless scroll
    const set2 = document.createElement('div');
    set2.style.display = 'flex';
    set2.style.gap = 'var(--lm-gap)';

    // choose items: rotate starting index and optionally repeat for density
    const ordered = [];
    for (let i = 0; i < logos.length; i++) {
      ordered.push(logos[(startIndex + i) % logos.length]);
    }

    const finalList = [];
    for (let d = 0; d < Math.max(1, density); d++) {
      finalList.push(...ordered);
    }

    finalList.forEach((item) => set1.appendChild(createCard(item)));
    // duplicate
    finalList.forEach((item) => set2.appendChild(createCard(item)));

    track.appendChild(set1);
    track.appendChild(set2);

    // slight desync per row
    const delay = Math.random() * duration * -1; // negative delay starts somewhere mid-loop
    track.style.animationDelay = delay.toFixed(2) + 's';

    row.appendChild(track);
    return row;
  }

  // Construct rows with alternating direction and varied speeds
  for (let r = 0; r < rows; r++) {
    const reverse = r % 2 === 1;
    // vary duration per row for visual interest
    const duration = baseDuration + r * 5 + (reverse ? 4 : 0);
    const startIndex = Math.floor((r / rows) * logos.length) % logos.length;
    const density = 1; // keep 1 so card size remains large

    wrap.appendChild(
      buildRow({ reverse, duration, startIndex, density })
    );
  }
})();
