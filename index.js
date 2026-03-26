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

    // --- Binary Digital Tunnel Effect (Structured & Symmetrical) ---
    const canvas = document.getElementById('binary-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles;
        const color = '#00c4b4';

        class BinaryParticle {
            constructor(angle, radius, char, rotationSpeed, fontFamily) {
                this.baseAngle = angle;
                this.radius = radius;
                this.text = char;
                this.rotationSpeed = rotationSpeed;
                this.fontFamily = fontFamily;
            }

            draw(time) {
                // Precise rotational positioning per requested slow pace
                const currentAngle = this.baseAngle + (time * this.rotationSpeed);
                const x = Math.cos(currentAngle) * this.radius + width / 2;
                const y = Math.sin(currentAngle) * this.radius + height / 2;
                
                // Responsive technical scale
                const sizeBase = this.isMobile ? 18 : 34;
                const sizeMin = this.isMobile ? 8 : 12;
                const size = Math.max(sizeMin, (this.radius / this.maxRadius) * sizeBase);
                
                const pulse = Math.sin(time * 0.0005 - this.radius * 0.008); 
                // Enhanced "Radial Glow" Opacity
                const baseOpacity = Math.max(0.15, Math.pow(this.radius / (this.maxRadius), 0.7) * 1.15);
                const finalOpacity = Math.min(1.0, baseOpacity * (0.55 + pulse * 0.45));

                // Absolute focus on Consolas for technical data
                ctx.font = `${size}px ${this.fontFamily}`;
                ctx.fillStyle = color;
                ctx.globalAlpha = finalOpacity;
                ctx.fillText(this.text, x, y);
            }
        }

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            
            const isMobile = width < 768;
            const binaryChars = ['1', '0', '1', '0', '1', '0', '+', '[]'];
            const currencyChars = ['$', '£', '€', '¥', '₿', '$', '£', '€', '¥', '₿', '▲', '▼', '%', '%', '%'];
            const fontStack = "'Consolas', 'Fira Code', 'Source Code Pro', monospace";
            
            // Responsive ring configuration
            const ringCount = isMobile ? 8 : 14; 
            const maxRadius = Math.max(width, height) * (isMobile ? 0.7 : 0.9);
            
            for (let r = 1; r < ringCount; r++) {
                const radius = (r / ringCount) * maxRadius;
                // Fewer particles on mobile for clarity
                const particlesInRing = isMobile ? (6 + (r * 4)) : (12 + (r * 10)); 
                
                const isCurrencyRing = (r % 2 === 0);
                const currentPool = isCurrencyRing ? currencyChars : binaryChars;
                const rotationSpeed = (r % 2 === 0) ? 0.00001 : -0.00001;

                let lastChar = '';
                for (let i = 0; i < particlesInRing; i++) {
                    const angle = (i / particlesInRing) * Math.PI * 2;
                    let char;
                    do {
                        char = currentPool[Math.floor(Math.random() * currentPool.length)];
                    } while (char === lastChar);
                    
                    lastChar = char;
                    const p = new BinaryParticle(angle, radius, char, rotationSpeed, fontStack);
                    // Attach context for responsive sizing in draw()
                    p.isMobile = isMobile;
                    p.maxRadius = maxRadius;
                    particles.push(p);
                }
            }
        }

        window.addEventListener('resize', resize);
        resize();

        function animate(time) {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => p.draw(time));
            requestAnimationFrame(animate);
        }

        animate(0);
    }

    // --- Welcome Message ---
    console.log('%c DockPort Terminal Activated ', 'background: #00c4b4; color: #121212; font-weight: bold; border-radius: 4px; padding: 4px;');
});
