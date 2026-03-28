document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Fade-in animations for section titles and cards
    const revealElements = document.querySelectorAll('.feature-card, .section-title, .infra-content, .infra-visual');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // Handle visible state in JS as adding helper class
    document.addEventListener('scroll', () => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Handle Contact Dropdown Toggle
    const dropdownWrapper = document.querySelector('.nav-dropdown-wrapper');
    const dropdown = document.querySelector('.nav-dropdown');
    
    if (dropdownWrapper && dropdown) {
        dropdownWrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    }

    const copyBtn = document.getElementById('copy-email-btn');
    const emailText = document.getElementById('contact-email');
    
    if (copyBtn && emailText) {
        const copyIcon = copyBtn.querySelector('.copy-icon');
        const checkIcon = copyBtn.querySelector('.check-icon');
        
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const email = emailText.textContent;
            navigator.clipboard.writeText(email).then(() => {
                copyIcon.style.display = 'none';
                checkIcon.style.display = 'block';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyIcon.style.display = 'block';
                    checkIcon.style.display = 'none';
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }

    // --- Translation Logic ---
    const translations = {
        en: {
            "meta-desc": "DockPort - Software solutions specializing in custom desktop applications, fintech systems, and inventory management.",
            "hero-title": "Software solutions",
            "hero-subtitle": "&mdash; for you.",
            "section-title": "What we specialize in:",
            "spec1-title": "Desktop Application Development",
            "spec1-desc1": "We build custom, self-contained desktop applications. Tailored exactly to your needs with high performance, strong security, and complete data ownership. Ideal for business tools, analyzers, and inventory systems.",
            "spec1-desc2": "Simple, reliable, and fully yours.",
            "spec2-title": "Fintech Specialization",
            "spec2-desc1": "Specialized in finance-focused desktop applications: real-time price feeds, portfolio valuation, technical analysis & charting, quantitative analytics, and secure ledger/database management.",
            "spec2-desc2": "High-performance, secure, and fully owned.",
            "spec3-title": "Customer Information Display",
            "spec3-desc1": "Application built with your database and modern UI. Automatically shows live schedules, pricing, service notices, and critical updates on customer-facing screens.",
            "spec3-desc2": "Simple, reliable, and fully yours.",
            "spec4-title": "Inventory & Accounting Management",
            "spec4-desc1": "Desktop applications for business bookkeeping and inventory control: asset valuations, ledger management, and financial reporting.",
            "spec4-desc2": "High-performance, secure, and fully owned.",
            "footer-text": "&copy; 2025 DockPort. All rights reserved."
        },
        es: {
            "meta-desc": "DockPort - Soluciones de software especializadas en aplicaciones de escritorio personalizadas, sistemas fintech y gestión de inventario.",
            "hero-title": "Soluciones de software",
            "hero-subtitle": "&mdash; para ti.",
            "section-title": "En qué nos especializamos:",
            "spec1-title": "Desarrollo de Aplicaciones de Escritorio",
            "spec1-desc1": "Construimos aplicaciones de escritorio personalizadas e independientes. Adaptadas exactamente a sus necesidades con alto rendimiento, máxima seguridad y control total de sus datos. Ideales para herramientas comerciales, analizadores y sistemas de inventario.",
            "spec1-desc2": "Simples, confiables y totalmente suyas.",
            "spec2-title": "Especialización Fintech",
            "spec2-desc1": "Especializados en aplicaciones de escritorio enfocadas en finanzas: fuentes de precios en vivo, valoración de carteras, análisis técnico y gráficos, analítica cuantitativa y gestión segura de bases de datos y libros contables.",
            "spec2-desc2": "De alto rendimiento, seguras y de control total.",
            "spec3-title": "Pantallas de Información al Cliente",
            "spec3-desc1": "Aplicaciones construidas con su base de datos y UI moderna. Muestran automáticamente horarios en vivo, precios, avisos de servicio y actualizaciones críticas en pantallas orientadas al cliente.",
            "spec3-desc2": "Simples, confiables y totalmente suyas.",
            "spec4-title": "Gestión de Inventario y Contabilidad",
            "spec4-desc1": "Aplicaciones de escritorio para contabilidad empresarial y control de inventario: valoración de activos, gestión de libros mayores y reportes financieros.",
            "spec4-desc2": "De alto rendimiento, seguras y de control total.",
            "footer-text": "&copy; 2025 DockPort. Todos los derechos reservados."
        }
    };

    const langEnBtn = document.getElementById('lang-en');
    const langEsBtn = document.getElementById('lang-es');

    function setLanguage(lang) {
        if (!translations[lang]) return;
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = translations[lang][key];
            if (translation) {
                if (el.tagName === 'META') {
                    el.setAttribute('content', translation);
                } else {
                    el.innerHTML = translation;
                }
            }
        });

        if (lang === 'en') {
            if (langEnBtn) langEnBtn.classList.add('active');
            if (langEsBtn) langEsBtn.classList.remove('active');
        } else {
            if (langEsBtn) langEsBtn.classList.add('active');
            if (langEnBtn) langEnBtn.classList.remove('active');
        }
    }

    if (langEnBtn && langEsBtn) {
        langEnBtn.addEventListener('click', () => setLanguage('en'));
        langEsBtn.addEventListener('click', () => setLanguage('es'));
    }

    // --- Binary Effect Removed per Request ---
});
