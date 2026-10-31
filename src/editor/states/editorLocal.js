import { create } from 'zustand';
import editorHelper from "./editorHelper.js";
import proLayouts from "../../pro_support/proLayouts.js";
import { proDetailsOptions, proViewOptions } from "../../pro_support/proRegistry.js";

// Get layouts from Pro version
const loadedLayouts = (() => {
    try {
        const layouts = proLayouts();
        return Array.isArray(layouts) ? layouts : [];
    } catch (error) {
        console.error(error);
        return [];
    }
})();
const pro_layouts = loadedLayouts;

// Split layouts by categories
const gridLayouts = pro_layouts.filter(layout => layout.category === 'grid');


// States Only For use in Editor
const editorLocal = create((set) => ({
    isEditor: true,
    viewport: editorHelper.getViewport(window.innerWidth),
    setViewport: (newViewport) => set({ viewport: newViewport }),

    availableLayouts: [
        { label: 'Card', value: 'Card', type: 'free' },
        { label: 'Overlay', value: 'Overlay', type: 'free' },
        ...gridLayouts,
    ],
    availableViews: [
        { label: 'Grid', value: 'grid', type: 'free' },
        { label: 'List', value: 'list', type: 'free' },
        { label: 'Carousel', value: 'carousel', type: 'free' },
        ...proViewOptions(),
    ],
    availableTransition: [
        { label: 'Slide', value: 'slide', type: 'free' },
        { label: 'Fade', value: 'fade', type: 'free' },
        { label: 'Zoom', value: 'zoom', type: 'free' },
        { label: 'Flip', value: 'flip', type: 'free' },
    ],
    availableDetails: [
        { label: 'No Details', value: 'none', type: 'free' },
        { label: 'Popup', value: 'popup', type: 'free' },
        ...proDetailsOptions(),
    ],
    availableHoverAnimation: [
        { label: 'No Animation', value: 'none', type: 'free' },
        { label: '3D Float', value: 'float3d', type: 'free' },
        { label: 'Tilt', value: 'tilt', type: 'free' },
        { label: 'Blur', value: 'blur', type: 'free' },
        { label: 'Slide Top', value: 'slideTop', type: 'free' },
        { label: 'Shadow Top', value: 'shadowPop', type: 'free' },
        { label: 'Shadow Drop', value: 'shadowDrop', type: 'free' },
        { label: 'Shadow Drop 02', value: 'shadowDrop2', type: 'free' },
        // { label: 'Text', value: 'textPopUp', type: 'free' },
        // { label: 'Flip Scale (Up)', value: 'flipScaleUp', type: 'free' },

    ]
}));

export default editorLocal;
