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

    // ========================================
    // GitHub API — Repositories & Contributions
    // ========================================

    const GITHUB_USER = 'DOCKPORT';

    // Fetch contribution graph data from pre-generated static JSON file
    async function fetchContributions() {
        const container = document.getElementById('gh-contributions');
        if (!container) return;

        try {
            const response = await fetch('assets/data/contributions.json');

            if (!response.ok) throw new Error(`Contributions file error: ${response.status}`);
            const data = await response.json();

            // The file contains { contributions: weeks, total: totalContributions }
            // where weeks is array of { contributionDays: [...] }
            const calendar = data;
            if (!calendar) {
                container.innerHTML = '<div class="gh-contrib-error">no contribution data available</div>';
                return;
            }

            const weeks = calendar.weeks.map(w => w.contributionDays);
            if (weeks.length === 0) {
                container.innerHTML = '<div class="gh-contrib-error">no contribution data available</div>';
                return;
            }

            // Build month labels from each week's first day
            const monthLabels = [];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            let lastMonth = -1;
            let monthSpanStart = 0;
            weeks.forEach((week, wi) => {
                const firstDay = week[0];
                if (!firstDay) return;
                const d = new Date(firstDay.date + 'T00:00:00');
                const m = d.getMonth();
                if (m !== lastMonth) {
                    if (lastMonth !== -1) {
                        monthLabels.push({ label: monthNames[lastMonth], start: monthSpanStart, end: wi });
                    }
                    lastMonth = m;
                    monthSpanStart = wi;
                }
            });
            if (lastMonth !== -1) {
                monthLabels.push({ label: monthNames[lastMonth], start: monthSpanStart, end: weeks.length });
            }
            // Filter out months that span zero columns
            const visibleMonths = monthLabels.filter(m => m.end > m.start);
            // Remove duplicate month at start if same as last (e.g. Jul...Jul → drop first partial Jul, show Aug-Jul)
            if (visibleMonths.length > 1 && visibleMonths[0].label === visibleMonths[visibleMonths.length - 1].label) {
                visibleMonths.shift();
            }

            const containerEl = document.createElement('div');
            containerEl.className = 'gh-contrib-container';

            // Month label row (evenly spaced, like GitHub)
            const monthsRow = document.createElement('div');
            monthsRow.className = 'gh-contrib-months';
            visibleMonths.forEach(m => {
                const label = document.createElement('div');
                label.className = 'gh-contrib-month';
                label.textContent = m.label;
                monthsRow.appendChild(label);
            });

            const grid = document.createElement('div');
            grid.className = 'gh-contrib-grid';
            grid.style.gridTemplateColumns = `repeat(${weeks.length}, 1fr)`;

            let totalContribs = 0;
            weeks.forEach(week => {
                week.forEach(day => {
                    totalContribs += day.contributionCount || 0;
                });
            });

            // Derive levels from contribution counts, not from GitHub's palette.
            // GitHub recolors the calendar for seasonal themes (orange for
            // Halloween, for example), so a fixed color table breaks each season.
            // Quartiles over the active days keep the full 1-4 range visible.
            const activeCounts = weeks
                .flat()
                .map(day => day.contributionCount || 0)
                .filter(count => count > 0)
                .sort((a, b) => a - b);

            const quantile = (p) => {
                if (activeCounts.length === 0) return 0;
                const index = Math.min(
                    activeCounts.length - 1,
                    Math.floor(p * (activeCounts.length - 1))
                );
                return activeCounts[index];
            };

            const levelThresholds = [quantile(0.25), quantile(0.5), quantile(0.75)];

            const levelForCount = (count) => {
                if (count <= 0) return 0;
                let level = 1;
                levelThresholds.forEach((threshold, index) => {
                    if (count > threshold) level = index + 2;
                });
                return level;
            };

            weeks.forEach(week => {
                week.forEach(day => {
                    const count = day.contributionCount || 0;
                    const level = levelForCount(count);

                    const cell = document.createElement('div');
                    cell.className = `gh-contrib-cell level-${level}`;
                    cell.title = `${count} contribution${count !== 1 ? 's' : ''} on ${day.date}`;
                    grid.appendChild(cell);
                });
            });

            const footer = document.createElement('div');
            footer.className = 'gh-contrib-footer';

            const totalLabel = document.createElement('span');
            totalLabel.textContent = `${totalContribs.toLocaleString()} contributions in the last year`;

            const legend = document.createElement('div');
            legend.className = 'gh-contrib-legend';
            legend.innerHTML = `
                <span class="legend-label">Less</span>
                <span class="legend-cell"></span>
                <span class="legend-cell l1"></span>
                <span class="legend-cell l2"></span>
                <span class="legend-cell l3"></span>
                <span class="legend-cell l4"></span>
                <span class="legend-label">More</span>
            `;

            footer.appendChild(totalLabel);
            footer.appendChild(legend);

            containerEl.appendChild(monthsRow);
            containerEl.appendChild(grid);
            containerEl.appendChild(footer);

            container.innerHTML = '';
            container.appendChild(containerEl);

        } catch (err) {
            console.error('Failed to fetch contributions:', err);
            container.innerHTML = `<div class="gh-contrib-error">failed to load contribution data</div>`;
        }
    }

    // Utility: relative time string
    function timeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffDays === 0) {
            if (diffHours === 0) return diffMin <= 1 ? 'just now' : `${diffMin} minutes ago`;
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        }
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    }

    // Utility: escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }


    // Initialize GitHub section
    fetchContributions();
});
