export function wpbakeryLoader(initializeReact) {
    // Check if we're in WPBakery editor mode
    if (!window.vc_iframe && !(typeof window.vc !== 'undefined') && !document.body.classList.contains('vc_editor')) {
        console.log("Not in WPBakery editor mode. Skipping WPBakery-specific logic.");
        return;
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check for direct matches or nested matches
                    const showcaseElements = node.matches('.ts-review-showcase')
                        ? [node]
                        : node.querySelectorAll('.ts-review-showcase');
                    showcaseElements.forEach((element) => {
                        console.log('Initializing React for WPBakery element:', element);
                        initializeReact(element);
                    });
                }
            });
        });
    });

    // Start observing the DOM for changes
    observer.observe(document.body, { childList: true, subtree: true });
}
