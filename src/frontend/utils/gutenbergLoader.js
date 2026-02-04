export function gutenbergLoader(initializeReact) {
    // Check if we're in the Gutenberg editor
    if (window.wp && window.wp.data && window.wp.data.select) {
        const isGutenbergEditor = !!window.wp.data.select('core/edit-post') || !!window.wp.data.select('core/editor');

        if (isGutenbergEditor) {
            // Use MutationObserver to detect dynamically added elements
            const observer = new MutationObserver((mutationsList) => {
                mutationsList.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check for direct matches or nested matches
                                const showcaseElements = node.matches('.tsteam-showcase')
                                    ? [node]
                                    : node.querySelectorAll('.tsteam-showcase');
                                showcaseElements.forEach((element) => {
                                    console.log('Initializing React for element:', element);
                                    initializeReact(element);
                                });
                            }
                        });
                    }
                });
            });

            // Observe the entire document for added nodes
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            console.error('Not running in Gutenberg editor. Skipping MutationObserver.');
        }
    } else {
        console.error('window.wp or wp.data.select is not available. Skipping MutationObserver.');
    }
}