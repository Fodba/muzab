// ============================================
// MUZAB - JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== HEADER SCROLL EFFECT =====
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class when scrolling down
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    
    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    
    // ===== SCROLL REVEAL ANIMATIONS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                
                // Animate children with delay if they exist
                const children = entry.target.querySelectorAll('.animate-child');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('reveal');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe elements
    const revealElements = document.querySelectorAll(
        '.testimonial-card, .specialty-item, .approach-item, .location-card'
    );
    
    revealElements.forEach(el => {
        el.classList.add('reveal-element');
        observer.observe(el);
    });
    
    
    // ===== SACRED SYMBOL INTERACTION =====
    const sacredSymbol = document.querySelector('.sacred-symbol');
    
    if (sacredSymbol) {
        sacredSymbol.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        sacredSymbol.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    
    // ===== APPROACH NUMBERS COUNTER ANIMATION =====
    const approachNumbers = document.querySelectorAll('.approach-number');
    let hasAnimated = false;
    
    function animateNumbers() {
        if (hasAnimated) return;
        
        const approachSection = document.querySelector('.approach');
        if (!approachSection) return;
        
        const rect = approachSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible) {
            hasAnimated = true;
            
            approachNumbers.forEach((numberEl, index) => {
                setTimeout(() => {
                    numberEl.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        numberEl.style.transform = 'scale(1)';
                    }, 300);
                }, index * 200);
            });
        }
    }
    
    window.addEventListener('scroll', animateNumbers);
    animateNumbers(); // Check on load
    
    
    // ===== PHONE NUMBER CLICK TRACKING (optional analytics) =====
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    phoneLinks.forEach(link => {
        link.addEventListener('click', function() {
            // You can add analytics tracking here
            console.log('Phone call initiated');
            
            // Example: Google Analytics event
            // if (typeof gtag !== 'undefined') {
            //     gtag('event', 'phone_call', {
            //         'event_category': 'contact',
            //         'event_label': 'phone'
            //     });
            // }
        });
    });
    
    
    // ===== WHATSAPP LINK CLICK TRACKING (optional analytics) =====
    const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me"]');
    
    whatsappLinks.forEach(link => {
        link.addEventListener('click', function() {
            // You can add analytics tracking here
            console.log('WhatsApp initiated');
            
            // Example: Google Analytics event
            // if (typeof gtag !== 'undefined') {
            //     gtag('event', 'whatsapp_click', {
            //         'event_category': 'contact',
            //         'event_label': 'whatsapp'
            //     });
            // }
        });
    });
    
    
    // ===== LAZY LOADING OPTIMIZATION =====
    // If you add images later, uncomment this
    /*
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
    */
    
    
    // ===== GOLDEN LINE PARALLAX EFFECT (subtle) =====
    const goldenLine = document.querySelector('.golden-line');
    
    if (goldenLine) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const opacity = Math.max(0.3, 1 - scrolled / 1000);
            goldenLine.style.opacity = opacity;
        });
    }
    
});


// ===== ADD REVEAL ANIMATIONS CSS =====
// This creates the fade-in effect for scroll reveals
const style = document.createElement('style');
style.textContent = `
    .reveal-element {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .reveal-element.reveal {
        opacity: 1;
        transform: translateY(0);
    }
    
    .animate-child {
        opacity: 0;
        transform: translateX(-20px);
        transition: opacity 0.4s ease, transform 0.4s ease;
    }
    
    .animate-child.reveal {
        opacity: 1;
        transform: translateX(0);
    }
    
    .approach-number {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .sacred-symbol {
        transition: transform 0.4s ease;
    }
`;
document.head.appendChild(style);