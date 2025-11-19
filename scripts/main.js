// Main JavaScript for Singapore Presentation Website
class Presentation {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = document.querySelectorAll('.slide').length;
        this.isAnimating = false;
        this.animationDelay = 800;
        
        this.init();
    }

    init() {
        this.createNavigationDots();
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.animateSlideContent();
        this.updateProgressBar();
        
        // Preload images for better performance
        this.preloadImages();
    }

    createNavigationDots() {
        const navDots = document.querySelector('.nav-dots');
        navDots.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = `nav-dot ${i === 0 ? 'active' : ''}`;
            dot.dataset.slide = i;
            dot.addEventListener('click', () => this.goToSlide(i));
            navDots.appendChild(dot);
        }
    }

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;
            
            switch(e.key) {
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;
            }
        });

        // Button navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSlide());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());

        // Touch swipe support
        this.setupTouchEvents();

        // Mouse wheel support
        this.setupWheelEvents();

        // Intersection Observer for animations
        this.setupIntersectionObserver();
    }

    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        const minSwipeDistance = 50;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (this.isAnimating) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only consider horizontal swipes with minimal vertical movement
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        }, { passive: true });
    }

    setupWheelEvents() {
        let wheelTimeout;
        document.addEventListener('wheel', (e) => {
            if (this.isAnimating) return;

            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (Math.abs(e.deltaY) > 50) {
                    if (e.deltaY > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }
            }, 50);
        }, { passive: true });
    }

    setupSmoothScrolling() {
        // Prevent default scroll behavior
        document.addEventListener('scroll', (e) => {
            if (document.querySelector('.slide.active')) {
                window.scrollTo(0, 0);
            }
        });

        // Ensure we're always at the top
        window.scrollTo(0, 0);
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all stagger items
        document.querySelectorAll('.stagger-item').forEach(item => {
            observer.observe(item);
        });
    }

    async goToSlide(slideIndex) {
        if (this.isAnimating || slideIndex < 0 || slideIndex >= this.totalSlides) {
            return;
        }

        this.isAnimating = true;

        // Hide current slide
        const currentSlide = document.querySelector('.slide.active');
        if (currentSlide) {
            currentSlide.classList.remove('active');
            currentSlide.classList.add('slide-exit');
        }

        // Update current slide index
        this.currentSlide = slideIndex;

        // Show new slide
        const newSlide = document.querySelectorAll('.slide')[slideIndex];
        newSlide.classList.add('active', 'slide-enter');

        // Update navigation
        this.updateNavigation();
        this.updateProgressBar();

        // Animate content after a short delay
        setTimeout(() => {
            this.animateSlideContent();
            
            // Remove animation classes
            if (currentSlide) {
                currentSlide.classList.remove('slide-exit');
            }
            newSlide.classList.remove('slide-enter');
            
            this.isAnimating = false;
        }, this.animationDelay);

        // Track analytics
        this.trackSlideView(slideIndex);
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    updateNavigation() {
        // Update dots
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });

        // Update button states
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
        nextBtn.style.opacity = this.currentSlide === this.totalSlides - 1 ? '0.5' : '1';
    }

    updateProgressBar() {
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
    }

    animateSlideContent() {
        const currentSlide = document.querySelector('.slide.active');
        if (!currentSlide) return;

        // Reset animations
        const animatableElements = currentSlide.querySelectorAll(
            '.title-container, .info-container, .intro-text, .fact-item, ' +
            '.timeline-item, .stat-item, .ethnic-item, .food-item, ' +
            '.attraction-item, .edu-law-item, .point-item, .stagger-item'
        );

        animatableElements.forEach(el => {
            el.style.animation = 'none';
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });

        // Re-trigger animations
        setTimeout(() => {
            animatableElements.forEach((el, index) => {
                el.style.animation = '';
                el.style.opacity = '';
                el.style.transform = '';
                
                // Stagger animation
                if (el.classList.contains('stagger-item')) {
                    el.style.animationDelay = `${index * 0.1}s`;
                }
            });
        }, 100);
    }

    preloadImages() {
        const imageUrls = [
            'images/marina-bay.jpg',
            'images/singapore-map.jpg',
            'images/raffles-history.jpg',
            'images/financial-district.jpg',
            'images/multicultural-people.jpg',
            'images/chilli-crab.jpg',
            'images/gardens-by-bay.jpg',
            'images/nus-university.jpg',
            'images/city-garden.jpg',
            'images/merlion.png'
        ];

        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    trackSlideView(slideIndex) {
        // You can integrate with analytics services here
        console.log(`Viewed slide: ${slideIndex + 1}`);
        
        // Example: Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'slide_view', {
                'event_category': 'Presentation',
                'event_label': `Slide ${slideIndex + 1}`,
                'value': slideIndex + 1
            });
        }
    }

    // Utility methods
    addSlide(slideHtml) {
        const slidesContainer = document.querySelector('.slides-container');
        slidesContainer.insertAdjacentHTML('beforeend', slideHtml);
        this.totalSlides++;
        this.createNavigationDots();
    }

    removeSlide(slideIndex) {
        const slide = document.querySelectorAll('.slide')[slideIndex];
        if (slide) {
            slide.remove();
            this.totalSlides--;
            this.createNavigationDots();
            
            if (this.currentSlide >= this.totalSlides) {
                this.currentSlide = this.totalSlides - 1;
            }
            
            this.goToSlide(this.currentSlide);
        }
    }

    // Fullscreen support
    enterFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Particle System Configuration
class ParticleSystem {
    constructor() {
        this.init();
    }

    init() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: {
                        value: 80,
                        density: {
                            enable: true,
                            value_area: 800
                        }
                    },
                    color: {
                        value: ['#e10600', '#003da5', '#ffffff']
                    },
                    shape: {
                        type: 'circle',
                        stroke: {
                            width: 0,
                            color: '#000000'
                        }
                    },
                    opacity: {
                        value: 0.3,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 1,
                            opacity_min: 0.1,
                            sync: false
                        }
                    },
                    size: {
                        value: 3,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 2,
                            size_min: 0.1,
                            sync: false
                        }
                    },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#e10600',
                        opacity: 0.2,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: 'none',
                        random: true,
                        straight: false,
                        out_mode: 'out',
                        bounce: false,
                        attract: {
                            enable: false,
                            rotateX: 600,
                            rotateY: 1200
                        }
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: {
                            enable: true,
                            mode: 'grab'
                        },
                        onclick: {
                            enable: true,
                            mode: 'push'
                        },
                        resize: true
                    },
                    modes: {
                        grab: {
                            distance: 200,
                            line_linked: {
                                opacity: 0.5
                            }
                        },
                        push: {
                            particles_nb: 4
                        }
                    }
                },
                retina_detect: true
            });
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize presentation
    window.presentation = new Presentation();
    
    // Initialize particle system
    new ParticleSystem();
    
    // Add loading state
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    // Service worker registration for PWA (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Presentation, ParticleSystem };
}
