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
            constructor(char, fontFamily) {
                this.text = char;
                this.fontFamily = fontFamily;
                this.isGrid = false;
            }

            setRadial(angle, radius, speed, maxRadius) {
                this.baseAngle = angle;
                this.radius = radius;
                this.rotationSpeed = speed;
                this.maxRadius = maxRadius;
                this.isGrid = false;
            }

            setGrid(x, y, opacity) {
                this.x = x;
                this.y = y;
                this.fixedOpacity = opacity;
                this.isGrid = true;
            }

            draw(time) {
                let drawX, drawY, size, opacity;
                
                if (this.isGrid) {
                    drawX = this.x;
                    drawY = this.y;
                    size = this.isMobile ? 12 : 15; 
                    
                    // Dynamic focal point intensity
                    const dx = drawX - focalX;
                    const dy = drawY - focalY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const range = Math.max(width, height) * 0.6;
                    const flow = Math.max(0, 1 - (dist / range));
                    
                    // Bright, shifting contrast
                    opacity = (this.fixedOpacity * 0.3) + (Math.pow(flow, 1.5) * 0.75);
                    opacity = Math.min(0.9, opacity);
                } else {
                    const currentAngle = this.baseAngle + (time * this.rotationSpeed);
                    drawX = Math.cos(currentAngle) * this.radius + width / 2;
                    drawY = Math.sin(currentAngle) * this.radius + height / 2;
                    const sizeBase = 34;
                    const sizeMin = 12;
                    size = Math.max(sizeMin, (this.radius / this.maxRadius) * sizeBase);
                    const pulse = Math.sin(time * 0.0005 - this.radius * 0.008); 
                    const baseOpacity = Math.max(0.15, Math.pow(this.radius / (this.maxRadius), 0.7) * 1.15);
                    opacity = Math.min(1.0, baseOpacity * (0.55 + pulse * 0.45));
                }

                ctx.font = `${size}px ${this.fontFamily}`;
                ctx.fillStyle = color;
                ctx.globalAlpha = opacity;
                ctx.fillText(this.text, drawX, drawY);
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
            const pool = [...binaryChars, ...currencyChars];
            
            // Grid sizing: denser on mobile, broader on desktop
            const spacing = isMobile ? 40 : 56;
            const cols = Math.ceil(width / spacing) + 1;
            const rows = Math.ceil(height / spacing) + 1;
            
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const char = pool[Math.floor(Math.random() * pool.length)];
                    // Strategic subtle opacity for depth
                    const opacity = isMobile ? (0.15 + Math.random() * 0.25) : (0.15 + Math.random() * 0.35);
                    const p = new BinaryParticle(char, fontStack);
                    
                    // Add subtle randomness to position for a "digitized" feel rather than rigid grid
                    const offsetX = (Math.random() - 0.5) * (spacing * 0.3);
                    const offsetY = (Math.random() - 0.5) * (spacing * 0.3);
                    
                    p.setGrid(i * spacing + offsetX, j * spacing + offsetY, opacity);
                    // Pass mobile state for resizing
                    p.isMobile = isMobile;
                    particles.push(p);
                }
            }
        }

        window.addEventListener('resize', resize);
        resize();

        let focalX = 0;
        let focalY = 0;

        function animate(time) {
            ctx.clearRect(0, 0, width, height);
            
            // Programmatically move searchlight focal point
            focalX = (Math.sin(time * 0.0003) * 0.45 + 0.5) * width;
            focalY = (Math.cos(time * 0.0004) * 0.45 + 0.5) * height;

            particles.forEach(p => p.draw(time));
            requestAnimationFrame(animate);
        }

        animate(0);
    }

    // --- Welcome Message ---
    console.log('%c DockPort Terminal Activated ', 'background: #00c4b4; color: #121212; font-weight: bold; border-radius: 4px; padding: 4px;');
});
