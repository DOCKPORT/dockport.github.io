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

    // --- Bybit WebSocket Ticker ---
    function initBybitTicker() {
        const ticker = document.getElementById('bybit-ticker');
        if (!ticker) return;

        const symbols = {
            'BTCUSDT': {
                priceEls: ticker.querySelectorAll('.btc-price'),
                changeEls: ticker.querySelectorAll('.btc-change'),
                lastPrice: 0,
                lastPriceStr: "",
                lastUpdate: 0, timer: null, pendingData: null
            },
            'XAUTUSDT': {
                priceEls: ticker.querySelectorAll('.xaut-price'),
                changeEls: ticker.querySelectorAll('.xaut-change'),
                lastPrice: 0,
                lastPriceStr: "",
                lastUpdate: 0, timer: null, pendingData: null
            },
            'NVDAXUSDT': {
                priceEls: ticker.querySelectorAll('.nvdax-price'),
                changeEls: ticker.querySelectorAll('.nvdax-change'),
                lastPrice: 0,
                lastPriceStr: "",
                lastUpdate: 0, timer: null, pendingData: null
            },
            'TSLAXUSDT': {
                priceEls: ticker.querySelectorAll('.tslax-price'),
                changeEls: ticker.querySelectorAll('.tslax-change'),
                lastPrice: 0,
                lastPriceStr: "",
                lastUpdate: 0, timer: null, pendingData: null
            },
            'GOOGLXUSDT': {
                priceEls: ticker.querySelectorAll('.googlx-price'),
                changeEls: ticker.querySelectorAll('.googlx-change'),
                lastPrice: 0,
                lastPriceStr: "",
                lastUpdate: 0, timer: null, pendingData: null
            }
        };

        let socket;
        let reconnectTimeout;

        function updateTickerUI(symbol, priceValue, changeValue) {
            const state = symbols[symbol];
            if (!state) return;

            const currentPrice = parseFloat(priceValue);
            const priceStr = currentPrice.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });
            const changeStr = (parseFloat(changeValue) * 100).toFixed(2);
            const isUp = parseFloat(changeValue) >= 0;

            let flashClass = '';
            let stablePart = priceStr;
            let changingPart = '';

            if (state.lastPriceStr && state.lastPriceStr !== priceStr) {
                if (currentPrice > state.lastPrice) flashClass = 'flash-up';
                else if (currentPrice < state.lastPrice) flashClass = 'flash-down';

                if (state.lastPriceStr.length !== priceStr.length) {
                    stablePart = '';
                    changingPart = priceStr;
                } else {
                    let firstDiff = -1;
                    for (let i = 0; i < priceStr.length; i++) {
                        if (priceStr[i] !== state.lastPriceStr[i]) {
                            firstDiff = i;
                            break;
                        }
                    }
                    if (firstDiff !== -1) {
                        stablePart = priceStr.substring(0, firstDiff);
                        changingPart = priceStr.substring(firstDiff);
                    }
                }
            }

            state.lastPrice = currentPrice;
            state.lastPriceStr = priceStr;

            state.priceEls.forEach(el => {
                if (el) {
                    if (changingPart && flashClass) {
                        el.innerHTML = `$${stablePart}<span class="${flashClass}">${changingPart}</span>`;
                    } else {
                        el.textContent = `$${priceStr}`;
                    }
                }
            });

            state.changeEls.forEach(el => {
                if (el) {
                    el.textContent = `${isUp ? '+' : ''}${changeStr}%`;
                    el.className = `ticker__value ${isUp ? 'ticker__value--up' : 'ticker__value--down'}`;
                }
            });
        }

        function processUpdate(symbol, priceValue, changeValue) {
            const state = symbols[symbol];
            if (!state) return;
            
            const now = Date.now();
            if (now - state.lastUpdate >= 500) {
                state.lastUpdate = now;
                updateTickerUI(symbol, priceValue, changeValue);
            } else {
                state.pendingData = { priceValue, changeValue };
                if (!state.timer) {
                    state.timer = setTimeout(() => {
                        state.lastUpdate = Date.now();
                        updateTickerUI(symbol, state.pendingData.priceValue, state.pendingData.changeValue);
                        state.timer = null;
                        state.pendingData = null;
                    }, 500 - (now - state.lastUpdate));
                }
            }
        }

        async function fetchInitialData() {
            try {
                for (const symbol of Object.keys(symbols)) {
                    const response = await fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}`);
                    const data = await response.json();
                    if (data.result && data.result.list && data.result.list[0]) {
                        const tickerData = data.result.list[0];
                        processUpdate(symbol, tickerData.lastPrice, tickerData.price24hPcnt);
                    }
                }
            } catch (err) {
                console.error('Error fetching initial Bybit data:', err);
            }
        }

        function connect() {
            socket = new WebSocket('wss://stream.bybit.com/v5/public/spot');

            socket.onopen = () => {
                console.log('Bybit WebSocket Connected');
                const subMsg = {
                    "op": "subscribe",
                    "args": Object.keys(symbols).map(s => `tickers.${s}`)
                };
                socket.send(JSON.stringify(subMsg));

                const pingInterval = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ "op": "ping" }));
                    } else {
                        clearInterval(pingInterval);
                    }
                }, 20000);
            };

            socket.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    if (response.topic && response.topic.startsWith('tickers.') && response.data) {
                        const symbol = response.topic.replace('tickers.', '');
                        const tickerData = response.data;
                        processUpdate(symbol, tickerData.lastPrice, tickerData.price24hPcnt);
                    }
                } catch (e) {}
            };

            socket.onclose = () => {
                console.log('Bybit WebSocket Disconnected. Reconnecting...');
                clearTimeout(reconnectTimeout);
                reconnectTimeout = setTimeout(connect, 5000);
            };

            socket.onerror = (err) => {
                console.error('Bybit WebSocket Error:', err);
                socket.close();
            };
        }

        fetchInitialData();
        connect();
    }

    initBybitTicker();

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

            let maxCount = 0;
            let totalContribs = 0;

            weeks.forEach(week => {
                week.forEach(day => {
                    if (day.contributionCount > maxCount) maxCount = day.contributionCount;
                    totalContribs += day.contributionCount;
                });
            });

            weeks.forEach(week => {
                week.forEach(day => {
                    const count = day.contributionCount || 0;
                    let level = 0;
                    if (count > 0 && maxCount > 0) {
                        const ratio = count / maxCount;
                        if (ratio > 0.75) level = 4;
                        else if (ratio > 0.5) level = 3;
                        else if (ratio > 0.25) level = 2;
                        else level = 1;
                    }

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
