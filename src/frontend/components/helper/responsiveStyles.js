// responsiveStyles.js
export const getResponsiveStyles = (settings, viewport, isEditor) => {
    let currentColumns, currentWidth, columnGap;

    if (isEditor) {
        switch (viewport) {
            case 'mobile':
                currentWidth = settings?.containerSettings?.width?.default?.mobile;
                currentColumns = settings?.columnSettings?.column?.default?.mobile || 1;
                columnGap = settings?.columnSettings?.gap?.default?.mobile;
                break;
            case 'tablet':
                currentWidth = settings?.containerSettings?.width?.default?.tablet;
                currentColumns = settings?.columnSettings?.column?.default?.tablet || 2;
                columnGap = settings?.columnSettings?.gap?.default?.tablet;
                break;
            default:
                currentWidth = settings?.containerSettings?.width?.default?.desktop;
                currentColumns = settings?.columnSettings?.column?.default?.desktop || 3;
                columnGap = settings?.columnSettings?.gap?.default?.desktop;
        }
    } else {
        const width = window.innerWidth;
        if (width <= 768) {
            currentWidth = settings?.containerSettings?.width?.default?.mobile;
            currentColumns = settings?.columnSettings?.column?.default?.mobile || 1;
            columnGap = settings?.columnSettings?.gap?.default?.mobile;
        } else if (width <= 1024) {
            currentWidth = settings?.containerSettings?.width?.default?.tablet;
            currentColumns = settings?.columnSettings?.column?.default?.tablet || 2;
            columnGap = settings?.columnSettings?.gap?.default?.tablet;
        } else {
            currentWidth = settings?.containerSettings?.width?.default?.desktop;
            currentColumns = settings?.columnSettings?.column?.default?.desktop || 3;
            columnGap = settings?.columnSettings?.gap?.default?.desktop;
        }
    }

    if (settings?.selectedView?.value === 'grid'){
        return {
            width: currentWidth,
            gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
            gap: columnGap,
        };
    }
    else {
        return {
            width: currentWidth,
        };
    }
};