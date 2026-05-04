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

    // Custom transition for TallyBook link
    const tallybookLink = document.querySelector('.btn-orange-large');
    if (tallybookLink) {
        tallybookLink.addEventListener('click', function (e) {
            e.preventDefault();
            const url = this.getAttribute('href');
            document.body.classList.add('page-exit');
            setTimeout(() => {
                window.location.href = url;
            }, 450);
        });
    }

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


    // --- Bybit WebSocket Ticker ---
    function initBybitTicker() {
        const ticker = document.getElementById('bybit-ticker');
        if (!ticker) return;

        // State management for multiple symbols
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

        // Function to update the DOM for a specific symbol
        function updateTickerUI(symbol, priceValue, changeValue) {
            const state = symbols[symbol];
            if (!state) return;

            const currentPrice = parseFloat(priceValue);
            const priceStr = currentPrice.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: symbol === 'XAUTUSDT' ? 2 : 2 
            });
            const changeStr = (parseFloat(changeValue) * 100).toFixed(2);
            const isUp = parseFloat(changeValue) >= 0;

            // Determine flash direction and parts
            let flashClass = '';
            let stablePart = priceStr;
            let changingPart = '';

            if (state.lastPriceStr && state.lastPriceStr !== priceStr) {
                if (currentPrice > state.lastPrice) flashClass = 'flash-up';
                else if (currentPrice < state.lastPrice) flashClass = 'flash-down';

                // Find the first character that changed
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

        // Throttle updates to max once every 500ms per symbol
        function processUpdate(symbol, priceValue, changeValue) {
            const state = symbols[symbol];
            if (!state) return;
            
            const now = Date.now();
            if (now - state.lastUpdate >= 500) {
                // Safe to update immediately
                state.lastUpdate = now;
                updateTickerUI(symbol, priceValue, changeValue);
            } else {
                // Too soon. Store latest data and schedule update.
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

        // Fetch initial data via REST API (Bybit V5)
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
                
                // Subscribe to tickers
                const subMsg = {
                    "op": "subscribe",
                    "args": Object.keys(symbols).map(s => `tickers.${s}`)
                };
                socket.send(JSON.stringify(subMsg));

                // Bybit heartbeat: send "ping" every 20s
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
                } catch (e) {
                    // Ignore non-JSON or malformed messages
                }
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
});
