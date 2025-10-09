/* ============================================
   MUZAB LANDING PAGE - JAVASCRIPT
   Fonctionnalités: Scroll effects, animations, tracking
   ============================================ */

(function() {
    'use strict';

    /* ============================================
       CONFIGURATION
       ============================================ */

    const CONFIG = {
        // Animations
        animationDelay: 100,
        animationDuration: 800,
        
        // Scroll
        scrollOffset: 100,
        headerScrollThreshold: 50,
        
        // Performance
        debounceDelay: 150,
        
        // Tracking
        trackingEnabled: true, // Mettre à false en développement
        gaId: 'G-XXXXXXXXXX' // À remplacer par le vrai ID Google Analytics
    };

    /* ============================================
       UTILITIES
       ============================================ */

    // Debounce pour optimiser les événements répétitifs
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Détection du support de reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fonction pour logger les événements (développement)
    function log(message, data = null) {
        if (console && console.log) {
            console.log(`[Muzab] ${message}`, data || '');
        }
    }

    /* ============================================
       HEADER SCROLL EFFECT
       ============================================ */

    function initHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;

            // Ajouter classe "scrolled" après le seuil
            if (scrollY > CONFIG.headerScrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScrollY = scrollY;
            ticking = false;
        }

        // Utiliser requestAnimationFrame pour optimiser la performance
        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Initial check
        updateHeader();

        log('Header scroll effect initialized');
    }

    /* ============================================
       SMOOTH SCROLL POUR LIENS INTERNES
       ============================================ */

    function initSmoothScroll() {
        // Sélectionner tous les liens internes (href commençant par #)
        const internalLinks = document.querySelectorAll('a[href^="#"]');

        internalLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                // Ignorer si c'est juste "#"
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();

                    // Calculer la position avec offset pour le header fixe
                    const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;

                    // Smooth scroll
                    window.scrollTo({
                        top: targetPosition,
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });

                    // Tracking
                    trackEvent('Navigation', 'Smooth Scroll', targetId);

                    log('Smooth scroll to:', targetId);
                }
            });
        });

        log('Smooth scroll initialized for', internalLinks.length, 'links');
    }

    /* ============================================
       INTERSECTION OBSERVER - ANIMATIONS AU SCROLL
       ============================================ */

    function initScrollAnimations() {
        // Si reduced motion, ne pas animer
        if (prefersReducedMotion) {
            // Rendre tous les éléments visibles immédiatement
            document.querySelectorAll('.fade-in').forEach(el => {
                el.classList.add('visible');
            });
            log('Scroll animations disabled (prefers-reduced-motion)');
            return;
        }

        // Sélectionner les éléments à animer
        const animatedElements = document.querySelectorAll(
            '.service-card, .testimonial-card, .process-step, .faq-item, .stat-item'
        );

        // Ajouter la classe fade-in si pas déjà présente
        animatedElements.forEach(el => {
            if (!el.classList.contains('fade-in')) {
                el.classList.add('fade-in');
            }
        });

        // Configuration de l'observer
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px', // Trigger un peu avant que l'élément soit visible
            threshold: 0.1
        };

        // Callback de l'observer
        const observerCallback = (entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Ajouter un délai progressif pour effet cascade
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * CONFIG.animationDelay);

                    // Arrêter d'observer une fois animé
                    observer.unobserve(entry.target);
                }
            });
        };

        // Créer l'observer
        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observer tous les éléments
        animatedElements.forEach(el => observer.observe(el));

        log('Scroll animations initialized for', animatedElements.length, 'elements');
    }

    /* ============================================
       ANIMATION CHEMIN QUI S'OUVRE (HERO)
       ============================================ */

    function initPathAnimation() {
        if (prefersReducedMotion) return;

        const pathOpening = document.querySelector('.path-opening');
        if (!pathOpening) return;

        // Observer pour déclencher l'animation quand visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    pathOpening.style.animation = 'pathOpening 3s ease-out forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const blockedPath = document.querySelector('.blocked-path');
        if (blockedPath) {
            observer.observe(blockedPath);
        }

        log('Path animation initialized');
    }

    /* ============================================
       SYMBOLES INTERACTIFS (HERO)
       ============================================ */

    function initSymbolInteractions() {
        if (prefersReducedMotion) return;

        const symbols = document.querySelectorAll('.hero-symbol');
        if (symbols.length === 0) return;

        // Ajouter interaction au survol
        symbols.forEach((symbol, index) => {
            symbol.addEventListener('mouseenter', function() {
                this.style.animationPlayState = 'paused';
                this.style.transform = 'scale(1.2)';
                this.style.opacity = '0.3';
            });

            symbol.addEventListener('mouseleave', function() {
                this.style.animationPlayState = 'running';
                this.style.transform = '';
                this.style.opacity = '';
            });
        });

        log('Symbol interactions initialized for', symbols.length, 'symbols');
    }

    /* ============================================
       TRACKING / ANALYTICS
       ============================================ */

    function trackEvent(category, action, label = '', value = null) {
        if (!CONFIG.trackingEnabled) {
            log('Tracking (disabled):', { category, action, label, value });
            return;
        }

        // Google Analytics 4 (gtag.js)
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
            log('Event tracked:', { category, action, label });
        }

        // Fallback : Google Analytics Universal (ga.js) - si encore utilisé
        else if (typeof ga !== 'undefined') {
            ga('send', 'event', category, action, label, value);
            log('Event tracked (UA):', { category, action, label });
        }

        // Pas de tracking configuré
        else {
            log('No tracking library found. Install gtag.js or ga.js');
        }
    }

    function initTracking() {
        // Tracking des clics sur boutons téléphone
        const phoneButtons = document.querySelectorAll('a[href^="tel:"]');
        phoneButtons.forEach(button => {
            button.addEventListener('click', function() {
                const phoneNumber = this.getAttribute('href').replace('tel:', '');
                trackEvent('Contact', 'Phone Click', phoneNumber);
                log('Phone click:', phoneNumber);
            });
        });

        // Tracking des clics sur boutons WhatsApp
        const whatsappButtons = document.querySelectorAll('a[href^="https://wa.me"]');
        whatsappButtons.forEach(button => {
            button.addEventListener('click', function() {
                trackEvent('Contact', 'WhatsApp Click', this.getAttribute('href'));
                log('WhatsApp click');
            });
        });

        // Tracking du temps passé sur la page
        let timeOnPage = 0;
        const timeInterval = setInterval(() => {
            timeOnPage += 10;
            // Logger toutes les 30 secondes
            if (timeOnPage % 30 === 0) {
                trackEvent('Engagement', 'Time on Page', `${timeOnPage}s`, timeOnPage);
            }
        }, 10000); // Toutes les 10 secondes

        // Tracking du scroll profondeur
        let maxScroll = 0;
        const trackScroll = debounce(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Tracker des jalons de scroll
                if (maxScroll >= 25 && maxScroll < 50) {
                    trackEvent('Engagement', 'Scroll Depth', '25%', 25);
                } else if (maxScroll >= 50 && maxScroll < 75) {
                    trackEvent('Engagement', 'Scroll Depth', '50%', 50);
                } else if (maxScroll >= 75 && maxScroll < 90) {
                    trackEvent('Engagement', 'Scroll Depth', '75%', 75);
                } else if (maxScroll >= 90) {
                    trackEvent('Engagement', 'Scroll Depth', '90%', 90);
                }
            }
        }, 500);

        window.addEventListener('scroll', trackScroll, { passive: true });

        // Tracking de sortie de page
        window.addEventListener('beforeunload', function() {
            trackEvent('Engagement', 'Page Exit', `After ${timeOnPage}s`, timeOnPage);
            clearInterval(timeInterval);
        });

        log('Tracking initialized');
    }

    /* ============================================
       FAQ ACCORDION (OPTIONNEL)
       ============================================ */

    function initFAQAccordion() {
        // Pour l'instant, toutes les réponses sont visibles
        // Si on veut un accordion, décommenter ce code :

        /*
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) return;
            
            // Cacher la réponse initialement
            answer.style.display = 'none';
            question.style.cursor = 'pointer';
            
            // Toggle au clic
            question.addEventListener('click', function() {
                const isOpen = answer.style.display === 'block';
                
                // Fermer toutes les autres
                document.querySelectorAll('.faq-answer').forEach(a => {
                    a.style.display = 'none';
                });
                
                // Toggle celle-ci
                answer.style.display = isOpen ? 'none' : 'block';
                
                // Tracking
                trackEvent('Engagement', 'FAQ Click', question.textContent);
            });
        });
        
        log('FAQ accordion initialized');
        */
    }

    /* ============================================
       URGENCY TIMER (OPTIONNEL)
       ============================================ */

    function initUrgencyTimer() {
        // Si on veut ajouter un compte à rebours pour créer de l'urgence
        // Exemple : "Offre valable encore 2h35m"
        
        /*
        const timerElement = document.querySelector('.urgency-timer');
        if (!timerElement) return;
        
        let timeLeft = 2 * 60 * 60; // 2 heures en secondes
        
        function updateTimer() {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            timerElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
            
            if (timeLeft > 0) {
                timeLeft--;
            } else {
                clearInterval(timerInterval);
            }
        }
        
        const timerInterval = setInterval(updateTimer, 1000);
        updateTimer();
        
        log('Urgency timer initialized');
        */
    }

    /* ============================================
       LAZY LOADING IMAGES (OPTIONNEL)
       ============================================ */

    function initLazyLoading() {
        // Si des images sont ajoutées avec data-src
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if (lazyImages.length === 0) return;

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                    log('Lazy loaded image:', img.src);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));

        log('Lazy loading initialized for', lazyImages.length, 'images');
    }

    /* ============================================
       FORM VALIDATION (SI FORMULAIRE AJOUTÉ)
       ============================================ */

    function initFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        if (forms.length === 0) return;

        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validation basique
                const inputs = form.querySelectorAll('input[required], textarea[required]');
                let isValid = true;

                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });

                if (isValid) {
                    // Soumettre le formulaire
                    trackEvent('Form', 'Submit', form.id || 'contact-form');
                    log('Form submitted');
                    // form.submit(); // Décommenter pour vraie soumission
                } else {
                    log('Form validation failed');
                }
            });
        });

        log('Form validation initialized');
    }

    /* ============================================
       PERFORMANCE MONITORING
       ============================================ */

    function monitorPerformance() {
        // Utiliser l'API Performance pour mesurer les temps de chargement
        if (!window.performance) return;

        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const connectTime = perfData.responseEnd - perfData.requestStart;
                const renderTime = perfData.domComplete - perfData.domLoading;

                log('Performance:', {
                    pageLoad: `${pageLoadTime}ms`,
                    connect: `${connectTime}ms`,
                    render: `${renderTime}ms`
                });

                // Tracker si le chargement est trop lent (> 3s)
                if (pageLoadTime > 3000) {
                    trackEvent('Performance', 'Slow Load', `${pageLoadTime}ms`, pageLoadTime);
                }
            }, 0);
        });
    }

    /* ============================================
       ERROR HANDLING
       ============================================ */

    function initErrorHandling() {
        window.addEventListener('error', function(e) {
            log('JavaScript Error:', {
                message: e.message,
                source: e.filename,
                line: e.lineno,
                column: e.colno
            });
            
            // Tracker les erreurs critiques
            trackEvent('Error', 'JavaScript Error', e.message);
        });
    }

    /* ============================================
       INITIALISATION PRINCIPALE
       ============================================ */

    function init() {
        log('Initializing Muzab Landing Page...');

        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }
    }

    function initAll() {
        try {
            // Core features
            initHeaderScroll();
            initSmoothScroll();
            initScrollAnimations();
            initPathAnimation();
            
            // Interactions
            initSymbolInteractions();
            
            // Tracking & Analytics
            initTracking();
            
            // Optional features
            initFAQAccordion();
            initLazyLoading();
            initFormValidation();
            
            // Monitoring
            monitorPerformance();
            initErrorHandling();

            log('✅ All features initialized successfully');

            // Tracker le chargement réussi
            trackEvent('Page', 'Loaded', window.location.pathname);

        } catch (error) {
            console.error('[Muzab] Initialization error:', error);
            trackEvent('Error', 'Init Failed', error.message);
        }
    }

    /* ============================================
       EASTER EGG (OPTIONNEL - POUR LE FUN)
       ============================================ */

    function initEasterEgg() {
        // Konami Code : ↑ ↑ ↓ ↓ ← → ← → B A
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;

        document.addEventListener('keydown', function(e) {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    // Easter egg activé !
                    document.body.style.animation = 'rainbow 5s linear infinite';
                    log('🎉 Easter egg activated!');
                    trackEvent('Easter Egg', 'Konami Code', 'Activated');
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }

    // Démarrer l'initialisation
    init();

    // Export pour debug dans la console (développement uniquement)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.MuzabDebug = {
            trackEvent,
            log,
            config: CONFIG
        };
        log('Debug mode enabled. Access via window.MuzabDebug');
    }

})();