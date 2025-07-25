// --- DOM Elements ---
const keywordInput = document.getElementById('keywordInput');
const contentDisplay = document.getElementById('contentDisplay');
const highlightButton = document.getElementById('highlightButton');
const clearButton = document.getElementById('clearButton');
const highlightCountsDiv = document.getElementById('highlightCounts');
const prevHighlightButton = document.getElementById('prevHighlightButton');
const nextHighlightButton = document.getElementById('nextHighlightButton');
const matchCounterSpan = document.getElementById('matchCounter');
const clearInputButton = document.getElementById('clearInputButton');
const urlInput = document.getElementById('urlInput');
const loadUrlButton = document.getElementById('loadUrlButton');
const mobileViewButton = document.getElementById('mobileViewButton');
const installButton = document.getElementById('installButton');

let deferredPrompt;
let allHighlightedElements = [];
let currentHighlightIndex = -1;
let mobileStyle = null;

// --- Highlight Colors ---
const highlightColors = [
    'yellow', 'cyan', 'lime', 'magenta', 'orange',
    'pink', 'lightgreen', 'lightblue', 'lavender', 'gold'
];

// --- Event Listeners ---
highlightButton.addEventListener('click', highlightKeywords);
clearButton.addEventListener('click', clearHighlights);
prevHighlightButton.addEventListener('click', navigatePrev);
nextHighlightButton.addEventListener('click', navigateNext);
clearInputButton.addEventListener('click', () => { keywordInput.value = ''; keywordInput.focus(); });
loadUrlButton.addEventListener('click', loadPageFromUrl);
mobileViewButton.addEventListener('click', optimizeForMobile);

// --- PWA Install Prompt ---
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.classList.remove('hidden');
});

installButton.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            installButton.classList.add('hidden');
            deferredPrompt = null;
        });
    }
});

// --- Functions ---
function highlightKeywords() {
    const keywords = keywordInput.value
        .split(/[\n,]/)
        .map(k => k.trim())
        .filter(Boolean);

    if (keywords.length === 0) {
        alert("Please enter at least one keyword.");
        return;
    }

    const text = contentDisplay.innerText;
    const coloredSpans = [];

    contentDisplay.innerHTML = ''; // Clear previous

    let colorIndex = 0;
    const counts = {};

    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        const color = highlightColors[colorIndex % highlightColors.length];
        colorIndex++;

        contentDisplay.innerHTML = contentDisplay.innerHTML.replace(regex, `<mark class="highlighted" data-color="${color}">$1</mark>`);
        contentDisplay.innerHTML = contentDisplay.innerHTML.replace(regex, match => {
            counts[keyword] = (counts[keyword] || 0) + 1;
            return `<mark class="highlighted" style="background:${color};color:black;font-weight:bold;">${match}</mark>`;
        });
    });

    // Update counts
    highlightCountsDiv.innerHTML = '';
    Object.keys(counts).forEach(key => {
        const p = document.createElement('p');
        p.textContent = `${key}: ${counts[key]}`;
        highlightCountsDiv.appendChild(p);
    });
    highlightCountsDiv.classList.remove('hidden');

    // Update highlights list
    allHighlightedElements = Array.from(contentDisplay.querySelectorAll('.highlighted'));
    currentHighlightIndex = allHighlightedElements.length > 0 ? 0 : -1;
    updateNavButtons();
    scrollToHighlight();
}

function clearHighlights() {
    contentDisplay.querySelectorAll('mark').forEach(mark => {
        const text = document.createTextNode(mark.textContent);
        mark.parentNode.replaceChild(text, mark);
    });
    highlightCountsDiv.classList.add('hidden');
    allHighlightedElements = [];
    currentHighlightIndex = -1;
    updateNavButtons();
}

function navigatePrev() {
    if (allHighlightedElements.length > 0) {
        currentHighlightIndex = (currentHighlightIndex - 1 + allHighlightedElements.length) % allHighlightedElements.length;
        scrollToHighlight();
    }
}

function navigateNext() {
    if (allHighlightedElements.length > 0) {
        currentHighlightIndex = (currentHighlightIndex + 1) % allHighlightedElements.length;
        scrollToHighlight();
    }
}

function scrollToHighlight() {
    if (allHighlightedElements[currentHighlightIndex]) {
        allHighlightedElements[currentHighlightIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        updateNavButtons();
    }
}

function updateNavButtons() {
    prevHighlightButton.disabled = allHighlightedElements.length <= 1;
    nextHighlightButton.disabled = allHighlightedElements.length <= 1;
    matchCounterSpan.textContent = allHighlightedElements.length > 0
        ? `${currentHighlightIndex + 1} of ${allHighlightedElements.length}`
        : '';
}

// --- Load Page from URL ---
async function loadPageFromUrl() {
    const url = urlInput.value.trim();
    if (!url) return;

    // ✅ Use corsproxy.io
    const proxyUrl = `https://api.corsproxy.io/?${encodeURIComponent(url)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Optional: Remove scripts for security
        doc.querySelectorAll('script').forEach(s => s.remove());

        contentDisplay.innerHTML = doc.body.innerHTML || '<p>No content found.</p>';
    } catch (err) {
        contentDisplay.innerHTML = `<p style="color:red;">Failed to load page: ${err.message}</p>`;
    }
}

// --- Optimize for Mobile ---
function optimizeForMobile() {
    if (mobileStyle) {
        document.head.removeChild(mobileStyle);
        mobileStyle = null;
        mobileViewButton.textContent = "Optimize for Mobile";
    } else {
        mobileStyle = document.createElement('style');
        mobileStyle.id = 'mobile-friendly-style';
        mobileStyle.textContent = `
            html, body {
                font-size: 115% !important;
                line-height: 1.6 !important;
                word-wrap: break-word;
                overflow-wrap: break-word;
                -webkit-text-size-adjust: 100%;
            }
            table, td, th {
                white-space: normal !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
            }
            img, video {
                max-width: 100% !important;
                height: auto !important;
            }
        `;
        document.head.appendChild(mobileStyle);
        mobileViewButton.textContent = "Reset Mobile View";
    }
}
