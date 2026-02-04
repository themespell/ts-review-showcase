// helper/loadGoogleFont.js
const loadedFonts = new Set(); // Track loaded fonts

export function loadGoogleFont(fontFamily) {
    if (!fontFamily || typeof document === 'undefined') {
        console.warn('Invalid font family or document not available.');
        return;
    }

    // Skip if the font is already loaded
    if (loadedFonts.has(fontFamily)) {
        return;
    }

    const formattedFont = fontFamily.replace(/\s+/g, '+');
    const href = `https://fonts.googleapis.com/css2?family=${formattedFont}&display=swap`;

    // Check for existing <link> tags
    const existingLink = document.querySelector(`link[href*="${formattedFont}"]`);
    if (existingLink) {
        loadedFonts.add(fontFamily); // Mark as loaded
        return;
    }

    // Create and append the <link> element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => loadedFonts.add(fontFamily); // Mark as loaded
    document.head.appendChild(link);
}