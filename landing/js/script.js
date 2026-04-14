/**
 * SavdoSklad Landing Script - Premium Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initScrollEffects();
    initParallax();
    initModal();
});

// 1. Scroll Effects
function initScrollEffects() {
    const header = document.getElementById('header');
    const reveals = document.querySelectorAll('.reveal');

    // Header transparency
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 40);
    });

    // Reveal on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => observer.observe(el));

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 2. Parallax Blobs
function initParallax() {
    const blobs = document.querySelectorAll('.blob, .blob-2');
    
    document.addEventListener('mousemove', (e) => {
        const { clientX: x, clientY: y } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        blobs.forEach((blob, i) => {
            const ratio = (i + 1) * 0.05;
            const moveX = (x - centerX) * ratio;
            const moveY = (y - centerY) * ratio;
            blob.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
}

// 3. Modal & Slider
function initModal() {
    const modal = document.getElementById('demo-modal');
    const openBtn = document.getElementById('open-demo');
    const closeBtn = document.querySelector('.modal-close');
    let currentSlide = 0;
    const slidesCount = 3;

    if (!modal) return;

    if (openBtn) openBtn.onclick = () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    if (closeBtn) closeBtn.onclick = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    window.setSlide = (index) => {
        const slides = document.querySelectorAll('.slide-content');
        if (!slides.length) return;

        slides.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });

        const activeSlide = slides[index];
        if (activeSlide) {
            currentSlide = index;
            activeSlide.style.display = 'grid';
            setTimeout(() => activeSlide.classList.add('active'), 20);
        }
    };

    // Auto-rotation hint (optional)
    let autoRotate = setInterval(() => {
        if (modal.classList.contains('active')) {
            const next = (currentSlide + 1) % slidesCount;
            window.setSlide(next);
        }
    }, 6000);
}
