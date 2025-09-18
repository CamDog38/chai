// Portfolio-specific JavaScript

// Track if portfolio purpose text has been fully revealed
let portfolioPurposeTextFullyRevealed = false;

// Animation on scroll
function animateOnScroll() {
    console.log('animateOnScroll function called');
    // Animate section headers with lines
    document.querySelectorAll('.section-header').forEach(header => {
        const headerTop = header.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (headerTop < window.innerHeight - elementVisible) {
            const topLine = header.querySelector('.top-line');
            const bottomLine = header.querySelector('.bottom-line');
            
            if (topLine && !topLine.classList.contains('animate')) {
                topLine.classList.add('animate');
            }
            
            if (bottomLine && !bottomLine.classList.contains('animate')) {
                bottomLine.classList.add('animate');
            }
        }
    });
    
    // Animate portfolio purpose text word by word
    const portfolioAboutSection = document.querySelector('.portfolio-about');
    if (portfolioAboutSection && !portfolioPurposeTextFullyRevealed) {
        const rect = portfolioAboutSection.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Calculate how far the section is through the viewport (0 to 1)
        let progress = 0;
        
        if (sectionTop <= windowHeight && sectionTop + sectionHeight >= 0) {
            // Section is at least partially in view
            if (sectionTop <= 0) {
                // Section has scrolled up past the top of the viewport
                progress = Math.min(1, Math.abs(sectionTop) / (sectionHeight * 0.5));
            } else {
                // Section is coming into view from the bottom
                progress = Math.max(0, 1 - (sectionTop / windowHeight));
            }
            
            // Get all purpose words
            const purposeWords = document.querySelectorAll('.portfolio-purpose-word');
            const totalWords = purposeWords.length;
            
            // Calculate how many words should be visible based on progress
            const visibleWordCount = Math.floor(progress * (totalWords + 2)); // +2 to ensure all words get visible
            
            // Apply visibility to words based on scroll progress
            purposeWords.forEach((word, index) => {
                if (index < visibleWordCount) {
                    word.classList.add('visible');
                } else {
                    word.classList.remove('visible');
                }
            });
            
            // Check if all words are now visible
            if (visibleWordCount >= totalWords) {
                portfolioPurposeTextFullyRevealed = true; // Mark as fully revealed
            }
        }
    }
    
    // Animate other portfolio elements
    const elements = document.querySelectorAll('.portfolio-about .info-text, .portfolio-about .note-text, .info-section .info-text, .info-section .note-text, .package-header h2, .package-item, .contact-section p, .contact-section .logo, .contact-section .tagline, .grid-item');
    
    console.log('Found elements for animation:', elements.length);
    
    // Log specific elements we're looking for
    const infoSectionElements = document.querySelectorAll('.info-section .info-text, .info-section .note-text');
    console.log('Info section elements found:', infoSectionElements.length);
    infoSectionElements.forEach((el, i) => {
        console.log(`Info section element ${i}:`, el.classList.contains('animate') ? 'already has animate class' : 'does not have animate class yet');
    });
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            console.log('Adding animate class to:', element.classList.value);
            element.classList.add('animate');
        }
    });
}

// Smooth scrolling for CTA button
function initSmoothScrolling() {
    const ctaButton = document.querySelector('.portfolio-cta');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const packagesSection = document.querySelector('#packages');
            if (packagesSection) {
                packagesSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Side menu functionality
function initSideMenu() {
    const sideMenu = document.getElementById('side-menu');
    if (!sideMenu) return;
    
    let hideTimeout;

    function showMenu() {
        clearTimeout(hideTimeout);
        sideMenu.style.opacity = '1';
        sideMenu.style.visibility = 'visible';
    }

    function hideMenu() {
        hideTimeout = setTimeout(() => {
            sideMenu.style.opacity = '0';
            sideMenu.style.visibility = 'hidden';
        }, 300);
    }

    // Show menu on mouse move near left edge
    document.addEventListener('mousemove', (e) => {
        if (e.clientX < 100) {
            showMenu();
        } else if (e.clientX > 200) {
            hideMenu();
        }
    });

    // Keep menu visible when hovering over it
    sideMenu.addEventListener('mouseenter', showMenu);
    sideMenu.addEventListener('mouseleave', hideMenu);

    // Initially hide the menu
    hideMenu();
}



// Video player functionality
function initVideoPlayers() {
    const videoItems = document.querySelectorAll('.video-item');
    const videoTracking = [];
    
    videoItems.forEach(item => {
        const video = item.querySelector('video');
        const soundToggle = item.querySelector('.sound-toggle');
        
        if (video && soundToggle) {
            // Set video attributes
            video.setAttribute('preload', 'metadata');
            video.muted = true; // Mute videos by default
            video.loop = true; // Loop videos for continuous preview
            
            // Add this video item to our tracking array
            videoTracking.push({
                element: item,
                video: video,
                soundToggle: soundToggle,
                isInView: false,
                userChangedSound: false, // Track if user manually changed sound
                lastToggleTime: 0 // Track last toggle time to prevent double clicks
            });
            
            // Function to toggle sound with debouncing
            const toggleSound = () => {
                const now = Date.now();
                const videoItem = videoTracking.find(vi => vi.video === video);
                
                // Prevent rapid double clicks (debounce with 300ms)
                if (videoItem && now - videoItem.lastToggleTime < 300) {
                    console.log('Toggle ignored due to debounce');
                    return;
                }
                
                if (videoItem) {
                    videoItem.lastToggleTime = now;
                }
                
                console.log('toggleSound called, current muted state:', video.muted);
                
                // Toggle muted state
                const newMutedState = !video.muted;
                video.muted = newMutedState;
                console.log('New muted state:', video.muted);
                
                // Mark that user has manually changed sound
                if (videoItem) {
                    videoItem.userChangedSound = true;
                    console.log('Marked userChangedSound as true');
                }
                
                // Update sound toggle button appearance
                if (newMutedState) {
                    soundToggle.classList.add('muted');
                    console.log('Added muted class');
                } else {
                    soundToggle.classList.remove('muted');
                    console.log('Removed muted class');
                    // Ensure video is playing when unmuting
                    if (video.paused) {
                        console.log('Video was paused, attempting to play');
                        video.play().catch(e => console.log('Play prevented:', e));
                    }
                }
            };
            
            // Set up click handler for sound toggle button (using mousedown to prevent double events)
            soundToggle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('Sound toggle clicked for video:', video.src);
                toggleSound();
            });
            
            // Prevent click event from also firing
            soundToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            });
            
            // Set up click handler for video itself
            video.addEventListener('click', (e) => {
                // Check if click was on the sound toggle (prevent double handling)
                if (e.target.closest('.sound-toggle')) {
                    return;
                }
                
                // Toggle video controls on click
                if (!video.controls) {
                    video.controls = true;
                } else {
                    // If controls are already showing, let the native controls handle the click
                }
            });
            
            // When video ends, reset to loop
            video.addEventListener('ended', () => {
                // If video has ended naturally (not looping)
                if (!video.loop) {
                    video.loop = true; // Re-enable looping
                    video.play().catch(e => console.log('Loop play prevented:', e));
                }
            });
            
            // Make sure poster is displayed
            if (video.hasAttribute('poster')) {
                // Poster attribute exists, make sure it's loaded
                const posterUrl = video.getAttribute('poster');
                if (posterUrl) {
                    const img = new Image();
                    img.src = posterUrl;
                }
            }
        }
    });
    
    // Function to check if an element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= -rect.height/2 &&
            rect.left >= -rect.width/2 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + rect.height/2 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + rect.width/2
        );
    }
    
    // Function to handle scroll and play videos in view
    function handleScroll() {
        videoTracking.forEach(item => {
            const wasInView = item.isInView;
            item.isInView = isElementInViewport(item.element);
            
            // If came into view
            if (!wasInView && item.isInView) {
                // Only set to muted if user hasn't manually changed sound
                if (!item.userChangedSound) {
                    item.video.muted = true;
                    item.soundToggle.classList.add('muted');
                }
                item.video.loop = true;
                item.video.play().catch(e => console.log('Autoplay prevented:', e));
            }
            
            // If went out of view
            if (wasInView && !item.isInView) {
                // Only pause if muted (if user unmuted, they probably want to keep listening)
                if (item.video.muted) {
                    item.video.pause();
                }
            }
        });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check on load
    setTimeout(handleScroll, 500);
}

// Mobile media experience functionality
function initMobileMediaExperience() {
    // Only apply on mobile devices
    if (window.innerWidth > 768) {
        return;
    }
    
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    
    // Create mobile media experience container
    const mobileContainer = document.createElement('div');
    mobileContainer.className = 'mobile-media-experience';
    // CSS styles are now in the portfolio.css file
    
    // Get all media items from the grid
    const gridItems = portfolioGrid.querySelectorAll('.grid-item');
    const mediaItems = [];
    
    gridItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const video = item.querySelector('video');
        const soundToggle = item.querySelector('.sound-toggle');
        
        if (img || video) {
            mediaItems.push({
                element: img || video,
                type: img ? 'image' : 'video',
                soundToggle: soundToggle,
                index: index
            });
        }
    });
    
    // Create mobile media items
    mediaItems.forEach((media, index) => {
        const mobileItem = document.createElement('div');
        mobileItem.className = 'mobile-media-item';
        mobileItem.dataset.index = index;
        
        const mediaElement = media.element.cloneNode(true);
        
        // Check for position-adjustable elements
        const isPositionAdjustable = media.element.closest('#position-adjustable') !== null;
        const isPositionAdjustable2 = media.element.closest('.position-adjustable-2') !== null;
        const isPositionAdjustable3 = media.element.closest('.position-adjustable-3') !== null;
        
        mediaElement.style.cssText = `
            width: 100vw;
            height: 100vh;
            object-fit: cover;
            ${isPositionAdjustable ? 'object-position: 70% center;' : ''}
            ${isPositionAdjustable2 ? 'object-position: 30% center;' : ''}
            ${isPositionAdjustable3 ? 'object-position: 10% center;' : ''}
        `;
        
        // Handle video autoplay and controls
        if (media.type === 'video') {
            mediaElement.muted = true;
            mediaElement.loop = true;
            mediaElement.playsInline = true;
            
            // Add sound toggle
            if (media.soundToggle) {
                const soundToggle = media.soundToggle.cloneNode(true);
                soundToggle.style.cssText = `
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    z-index: 100;
                `;
                
                soundToggle.addEventListener('click', () => {
                    mediaElement.muted = !mediaElement.muted;
                    soundToggle.classList.toggle('muted', mediaElement.muted);
                });
                
                mobileItem.appendChild(soundToggle);
            }
        }

        mobileItem.appendChild(mediaElement);
        mobileContainer.appendChild(mobileItem);
    });

    // Create progress indicator
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'media-progress-indicator';
    progressIndicator.textContent = `1 / ${mediaItems.length}`;
    progressIndicator.style.opacity = '0'; // Start hidden
    mobileContainer.appendChild(progressIndicator);

    // Add content reveal section after media
    const contentReveal = document.createElement('div');
    contentReveal.className = 'mobile-content-reveal';
    contentReveal.innerHTML = `
        <div>
            <h3>ready to create something amazing?</h3>
            <p>scroll down to explore our packages and get in touch. let's bring your vision to life with content that truly matters.</p>
        </div>
    `;
    mobileContainer.appendChild(contentReveal);
    
    // Replace the portfolio grid with mobile experience
    portfolioGrid.parentNode.replaceChild(mobileContainer, portfolioGrid);
    
    // Handle scroll-based video playback and progress
    let currentMediaIndex = 0;
    const mediaElements = mobileContainer.querySelectorAll('.mobile-media-item');
    
    const handleScroll = () => {
        const scrollTop = mobileContainer.scrollTop;
        const itemHeight = window.innerHeight;
        const newIndex = Math.floor(scrollTop / itemHeight);
        const contentRevealPosition = mediaItems.length * itemHeight;
        
        // Show/hide progress indicator based on scroll position
        if (scrollTop < contentRevealPosition) {
            // In media section - show progress indicator
            progressIndicator.style.opacity = '1';
        } else {
            // Past media section - hide progress indicator
            progressIndicator.style.opacity = '0';
        }
        
        if (newIndex !== currentMediaIndex && newIndex < mediaItems.length) {
            // Pause previous video
            const prevItem = mediaElements[currentMediaIndex];
            if (prevItem) {
                const prevVideo = prevItem.querySelector('video');
                if (prevVideo) prevVideo.pause();
            }
            
            currentMediaIndex = newIndex;
            progressIndicator.textContent = `${currentMediaIndex + 1} / ${mediaItems.length}`;
            
            // Play current video
            const currentItem = mediaElements[currentMediaIndex];
            if (currentItem) {
                const currentVideo = currentItem.querySelector('video');
                if (currentVideo) {
                    currentVideo.currentTime = 0;
                    currentVideo.play().catch(() => {});
                }
            }
        }
    };
    
    mobileContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize first video
    const firstVideo = mediaElements[0]?.querySelector('video');
    if (firstVideo) {
        firstVideo.play().catch(() => {});
    }
}

// Legacy mobile swipe functionality (kept for desktop compatibility)
function initMobileSwipe() {
    const gridContainer = document.querySelector('.grid-container');
    if (!gridContainer) return;
    
    // Only apply swipe functionality on desktop or when mobile experience is not active
    if (window.innerWidth <= 768) {
        return;
    }
    let isDown = false;
    let startX;
    let scrollLeft;
    let startTime;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    
    // Mouse/touch start
    gridContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - gridContainer.offsetLeft;
        scrollLeft = gridContainer.scrollLeft;
        startTime = Date.now();
        lastX = e.pageX;
        lastTime = startTime;
        gridContainer.style.cursor = 'grabbing';
        gridContainer.style.scrollBehavior = 'auto';
    });
    
    gridContainer.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - gridContainer.offsetLeft;
        scrollLeft = gridContainer.scrollLeft;
        startTime = Date.now();
        lastX = e.touches[0].pageX;
        lastTime = startTime;
        gridContainer.style.scrollBehavior = 'auto';
    }, { passive: true });
    
    // Mouse/touch leave
    gridContainer.addEventListener('mouseleave', () => {
        isDown = false;
        gridContainer.style.cursor = 'grab';
        applyMomentum();
    });
    
    // Mouse/touch end
    gridContainer.addEventListener('mouseup', () => {
        isDown = false;
        gridContainer.style.cursor = 'grab';
        applyMomentum();
    });
    
    gridContainer.addEventListener('touchend', () => {
        isDown = false;
        applyMomentum();
    });
    
    // Mouse/touch move
    gridContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - gridContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        gridContainer.scrollLeft = scrollLeft - walk;
        
        // Calculate velocity
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        const deltaX = e.pageX - lastX;
        if (deltaTime > 0) {
            velocity = deltaX / deltaTime;
        }
        lastX = e.pageX;
        lastTime = currentTime;
    });
    
    gridContainer.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - gridContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        gridContainer.scrollLeft = scrollLeft - walk;
        
        // Calculate velocity
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        const deltaX = e.touches[0].pageX - lastX;
        if (deltaTime > 0) {
            velocity = deltaX / deltaTime;
        }
        lastX = e.touches[0].pageX;
        lastTime = currentTime;
    }, { passive: true });
    
    // Apply momentum scrolling
    function applyMomentum() {
        if (Math.abs(velocity) > 0.1) {
            const momentum = velocity * 200; // Adjust multiplier for desired momentum
            const targetScroll = gridContainer.scrollLeft - momentum;
            
            gridContainer.style.scrollBehavior = 'smooth';
            gridContainer.scrollLeft = Math.max(0, Math.min(targetScroll, gridContainer.scrollWidth - gridContainer.clientWidth));
            
            // Reset scroll behavior after animation
            setTimeout(() => {
                gridContainer.style.scrollBehavior = 'auto';
            }, 300);
        }
        velocity = 0;
    }
    
    // Set initial cursor
    gridContainer.style.cursor = 'grab';
    
    // Prevent default drag behavior on images and videos
    gridContainer.querySelectorAll('img, video').forEach(media => {
        media.addEventListener('dragstart', (e) => e.preventDefault());
        media.style.pointerEvents = 'none';
    });
    
    // Re-enable pointer events for sound toggles
    gridContainer.querySelectorAll('.sound-toggle').forEach(toggle => {
        toggle.style.pointerEvents = 'auto';
    });
}

// Initialize all portfolio functionality
function initPortfolio() {
    initSmoothScrolling();
    initSideMenu();
    
    // Initialize appropriate experience based on screen size
    if (window.innerWidth <= 768) {
        initMobileMediaExperience();
    } else {
        initVideoPlayers();
        initMobileSwipe();
    }
    
    animateOnScroll(); // Run once on load
}

// Event listeners
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', initPortfolio);
document.addEventListener('DOMContentLoaded', initPortfolio);

// Re-initialize experience on window resize
window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        // Reload page to reinitialize proper experience
        if ((window.innerWidth <= 768 && !document.querySelector('.mobile-media-experience')) ||
            (window.innerWidth > 768 && document.querySelector('.mobile-media-experience'))) {
            location.reload();
        }
    }, 250);
});
