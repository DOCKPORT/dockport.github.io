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

    // --- Binary Effect Removed per Request ---
});
