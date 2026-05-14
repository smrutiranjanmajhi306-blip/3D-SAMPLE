// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// --- Custom Cursor ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX, ringY = mouseY;

// 3D Parallax Variables
const heroStage = document.querySelector('.hero-3d-stage');
let stageRotateX = 0, stageRotateY = 0;
let targetRotateX = 0, targetRotateY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot follows instantly
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    
    // Calculate 3D target rotation for Hero Stage (-10 to 10 degrees)
    targetRotateX = (mouseY / window.innerHeight - 0.5) * -20; 
    targetRotateY = (mouseX / window.innerWidth - 0.5) * 20;
});

// Animation loop for ring lag and 3D easing
function animateCursor() {
    // Easing for the ring
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    
    // Easing for the 3D Hero Stage
    if (heroStage) {
        stageRotateX += (targetRotateX - stageRotateX) * 0.05; // smooth lag
        stageRotateY += (targetRotateY - stageRotateY) * 0.05;
        heroStage.style.transform = `rotateX(${stageRotateX}deg) rotateY(${stageRotateY}deg)`;
    }
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor Hover Effects
const hoverTargets = document.querySelectorAll('.hover-target, a, button');
hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    target.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
});

// --- Hero Canvas Animation (Particle Mesh) ---
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let w, h;

function initCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particlesArray = [];
    let numberOfParticles = (w * h) / 10000;
    
    // Fallback/Limit
    if (numberOfParticles > 150) numberOfParticles = 150;

    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = Math.random() * w;
        let y = Math.random() * h;
        let dirX = (Math.random() * 1) - 0.5;
        let dirY = (Math.random() * 1) - 0.5;
        let color = '#ffffff';
        particlesArray.push(new Particle(x, y, dirX, dirY, size, color));
    }
}

class Particle {
    constructor(x, y, dirX, dirY, size, color) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.size = size;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = '#6c63ff'; // Accent color for particles
        ctx.fill();
    }
    update() {
        if (this.x > w || this.x < 0) this.dirX = -this.dirX;
        if (this.y > h || this.y < 0) this.dirY = -this.dirY;
        
        // Mouse interaction
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < 150) {
            this.x -= dx * 0.02;
            this.y -= dy * 0.02;
        }

        this.x += this.dirX;
        this.y += this.dirY;
        this.draw();
    }
}

function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                           ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < (w/7) * (h/7)) {
                opacityValue = 1 - (distance/20000);
                ctx.strokeStyle = `rgba(108, 99, 255, ${opacityValue * 0.5})`; // Purple mesh
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connectParticles();
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animateParticles();

// --- Hero Text Reveal on Load ---
window.addEventListener('load', () => {
    const spans = document.querySelectorAll('.hero h1 span');
    spans.forEach((span, index) => {
        setTimeout(() => {
            span.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
    });

    setTimeout(() => {
        document.querySelector('.hero .subtitle').classList.add('is-visible');
        document.querySelector('.scroll-indicator').classList.add('is-visible');
    }, 600);
});

// --- About Section: 3D Mouse-Hover Tilt (desktop only) ---
const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const aboutScene = document.getElementById('about3dScene');
const aboutCard  = document.getElementById('aboutTiltCard');

if (!isMobile && aboutScene && aboutCard) {
    let cardTiltX = 0, cardTiltY = 0;
    let targetCardX = 0, targetCardY = 0;

    aboutScene.addEventListener('mousemove', (e) => {
        const rect = aboutScene.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        targetCardX = ((e.clientY - cy) / (rect.height / 2)) * -12;
        targetCardY = ((e.clientX - cx) / (rect.width  / 2)) *  12;
    });

    aboutScene.addEventListener('mouseleave', () => {
        targetCardX = 0;
        targetCardY = 0;
    });

    function animateAboutTilt() {
        cardTiltX += (targetCardX - cardTiltX) * 0.08;
        cardTiltY += (targetCardY - cardTiltY) * 0.08;
        aboutCard.style.transform =
            `perspective(1200px) rotateX(${cardTiltX}deg) rotateY(${cardTiltY}deg) translateZ(20px)`;
        requestAnimationFrame(animateAboutTilt);
    }
    animateAboutTilt();
}

// --- Scroll Animations (IntersectionObserver) ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.fade-up, .slide-in-left');
            elements.forEach(el => el.classList.add('is-visible'));
            
            // Trigger about card reveal
            const card = entry.target.querySelector('.about-card-reveal');
            if (card) setTimeout(() => card.classList.add('is-visible'), 150);

            // Trigger counters if in this section
            if (entry.target.classList.contains('about')) {
                startCounters();
            }
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.observer-trigger').forEach(section => {
    observer.observe(section);
});

// Parallax & Horizontal Scroll logic mapped to Lenis
const heroLayers = document.querySelectorAll('.hero-layer');
const parallaxLayers = document.querySelectorAll('.parallax-bg-text'); // keep for other sections
const workSection = document.querySelector('.work-section');
const workCarousel = document.querySelector('.work-carousel');
const revealSection = document.querySelector('.image-reveal-section');
const revealImage = document.querySelector('.reveal-image-container');
const revealImgInside = document.querySelector('.reveal-image-container img');
const serviceSection = document.querySelector('.services-section');
const serviceRows = document.querySelectorAll('.service-row');
const centerRotatingElement = document.querySelector('.rotating-center-element');

lenis.on('scroll', (e) => {
    const scrollY = e.scroll;
    
    // --- DESKTOP ONLY scroll effects ---
    if (!isMobile) {

        // Multi-Layer Hero Parallax Sandwich
        heroLayers.forEach(layer => {
            const velocity = parseFloat(layer.getAttribute('data-velocity'));
            const yPos = scrollY * (1 - velocity);
            let scale = 1;
            if (velocity > 1.0) scale = 1 + (scrollY * 0.0005);
            layer.style.transform = `translateY(${yPos}px) scale(${scale})`;
        });

        // Other Parallax Layers
        parallaxLayers.forEach(layer => {
            const speed = layer.getAttribute('data-speed');
            const yPos = -(scrollY * speed);
            layer.style.transform = `translateY(${yPos}px)`;
        });

        // Horizontal Scroll (Work Section)
        if (workSection && workCarousel) {
            const rect = workSection.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
                const progress = Math.abs(rect.top) / (rect.height - window.innerHeight);
                const maxScroll = workCarousel.scrollWidth - window.innerWidth + window.innerWidth * 0.2;
                workCarousel.style.transform = `translateX(-${progress * maxScroll}px)`;
            }
        }

        // Image Reveal Scale
        if (revealSection && revealImage && revealImgInside) {
            const rect = revealSection.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
                const progress = Math.abs(rect.top) / (rect.height - window.innerHeight);
                const currentWidth  = 30 + (progress * 70);
                const currentHeight = 40 + (progress * 60);
                const currentRadius = 20 - (progress * 20);
                revealImage.style.width        = `${currentWidth}vw`;
                revealImage.style.height       = `${currentHeight}vh`;
                revealImage.style.borderRadius = `${currentRadius}px`;
                revealImgInside.style.transform = `scale(${1.2 - (progress * 0.2)})`;
            } else if (rect.top > 0) {
                revealImage.style.width        = `30vw`;
                revealImage.style.height       = `40vh`;
                revealImage.style.borderRadius = `20px`;
                revealImgInside.style.transform = `scale(1.2)`;
            }
        }

        // Services Horizontal Parallax
        if (serviceSection && serviceRows.length) {
            const rect = serviceSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const scrolled = window.innerHeight - rect.top;
                serviceRows.forEach(row => {
                    const direction = parseInt(row.getAttribute('data-direction') || 1);
                    row.style.transform = `translateX(${(scrolled * 0.5 * direction) - 300}px)`;
                });
            }
        }

    } // end !isMobile
});

// --- Counters Animation ---
let countersStarted = false;
function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // lower is faster

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 10);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

// --- 3D Card Tilt Effect ---
const cards = document.querySelectorAll('.work-card');

cards.forEach(card => {
    const inner = card.querySelector('.card-inner');
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
        const rotateY = ((x - centerX) / centerX) * 15;
        
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        inner.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
    });
});

// --- Magnetic Button ---
const magneticBtns = document.querySelectorAll('.magnetic-btn');

magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        btn.children[0].style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px)`;
        if(btn.children[0]) btn.children[0].style.transform = `translate(0px, 0px)`;
    });
});
