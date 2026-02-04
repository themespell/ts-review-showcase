export function elementorLoader(initializeReact) {
    if (!window.elementorFrontend || !window.elementorFrontend.isEditMode()) {
        console.log("Not in Elementor editor mode. Skipping Elementor-specific logic.");
        return;
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const newShowcaseElements = node.querySelectorAll('.tsteam-showcase');
                    newShowcaseElements.forEach((element) => {
                        initializeReact(element);
                    });
                }
            });
        });
    });

    // Start observing the DOM for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for changes to widget settings
    jQuery(window).on('elementor/widget/render_content', function (event, widget) {
        const widgetContainer = widget.$el[0]; // Get the widget container

        // Check if this is a TS Team Showcase widget
        if (widgetContainer.classList.contains('tsteam-showcase')) {
            initializeReact(widgetContainer); // Re-initialize React for this widget
        }
    });
}