const keywordInput = document.getElementById('keywordInput');
const contentInput = document.getElementById('contentInput');
const contentDisplay = document.getElementById('contentDisplay');
const highlightButton = document.getElementById('highlightButton');
const clearButton = document.getElementById('clearButton');
const highlightCountsDiv = document.getElementById('highlightCounts');
const prevHighlightButton = document.getElementById('prevHighlightButton');
const nextHighlightButton = document.getElementById('nextHighlightButton');
const matchCounterSpan = document.getElementById('matchCounter');

let allHighlightedElements = [];
let currentHighlightIndex = -1;

highlightButton.addEventListener('click', () => {
    const keywords = keywordInput.value.split(/[\n,]/).map(k => k.trim()).filter(Boolean);
    const content = contentInput.value;

    if (keywords.length === 0) {
        alert("Please enter at least one keyword.");
        return;
    }

    contentDisplay.innerHTML = '';
    allHighlightedElements = [];

    const highlightedContent = highlightText(content, keywords);
    contentDisplay.innerHTML = highlightedContent;

    updateHighlightList();
    updateNavButtonsAndCounter();
});

function highlightText(text, keywords) {
    let result = text;
    const counts = {};

    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        result = result.replace(regex, match => {
            counts[keyword] = (counts[keyword] || 0) + 1;
            return `<mark class="highlighted">${match}</mark>`;
        });
    });

    highlightCountsDiv.innerHTML = '';
    highlightCountsDiv.classList.remove('hidden');

    for (const key in counts) {
        const p = document.createElement('p');
        p.textContent = `${key}: ${counts[key]}`;
        highlightCountsDiv.appendChild(p);
    }

    return result;
}

function updateHighlightList() {
    allHighlightedElements = Array.from(document.querySelectorAll('.highlighted'));
    currentHighlightIndex = allHighlightedElements.length > 0 ? 0 : -1;
}

function updateNavButtonsAndCounter() {
    if (allHighlightedElements.length > 1) {
        prevHighlightButton.disabled = false;
        nextHighlightButton.disabled = false;
    } else {
        prevHighlightButton.disabled = true;
        nextHighlightButton.disabled = true;
    }

    if (allHighlightedElements.length > 0 && currentHighlightIndex !== -1) {
        matchCounterSpan.textContent = `${currentHighlightIndex + 1} of ${allHighlightedElements.length}`;
    } else {
        matchCounterSpan.textContent = '';
    }
}

prevHighlightButton.addEventListener('click', () => {
    if (allHighlightedElements.length > 0) {
        currentHighlightIndex = (currentHighlightIndex - 1 + allHighlightedElements.length) % allHighlightedElements.length;
        scrollToHighlight();
        updateNavButtonsAndCounter();
    }
});

nextHighlightButton.addEventListener('click', () => {
    if (allHighlightedElements.length > 0) {
        currentHighlightIndex = (currentHighlightIndex + 1) % allHighlightedElements.length;
        scrollToHighlight();
        updateNavButtonsAndCounter();
    }
});

function scrollToHighlight() {
    if (allHighlightedElements[currentHighlightIndex]) {
        allHighlightedElements[currentHighlightIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

clearButton.addEventListener('click', () => {
    contentDisplay.innerHTML = '';
    highlightCountsDiv.innerHTML = '';
    highlightCountsDiv.classList.add('hidden');
    allHighlightedElements = [];
    currentHighlightIndex = -1;
    updateNavButtonsAndCounter();
});
