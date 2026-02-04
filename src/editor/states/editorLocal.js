import { create } from 'zustand';
import editorHelper from "./editorHelper.js";
import proLayouts from "../../pro_support/proLayouts.js";

// Get layouts from Pro version
const isPro = tsreview_settings.is_pro
const isLicenseInactive = !!window.tsTeamPro?.is_licence_inactive ?? null;
const pro_layouts = proLayouts();

// Split layouts by categories
const gridLayouts = pro_layouts.filter(layout => layout.category === 'grid');
const flexLayouts = pro_layouts.filter(layout => layout.category === 'flex');
const tableLayouts = pro_layouts.filter(layout => layout.category === 'table');

const pro_views = isPro && !isLicenseInactive
    ? [
        // { label: 'Vertical Carousel', value: 'vertical_carousel', type: 'pro' },
        { label: 'Flex', value: 'flex', type: 'pro' },
        { label: 'Marquee', value: 'marquee', type: 'pro' },
        { label: 'Table', value: 'table', type: 'pro' },
        // { label: 'Confetti', value: 'confetti', type: 'pro' },
    ] : [];

const pro_details = isPro && !isLicenseInactive
    ? [
        { label: 'Drawer', value: 'drawer', type: 'pro' },
        // { label: 'Full Screen', value: 'fullscreen', type: 'pro' },
    ] : [];

// States Only For use in Editor
const editorLocal = create((set) => ({
    isEditor: true,
    viewport: editorHelper.getViewport(window.innerWidth),
    setViewport: (newViewport) => set({ viewport: newViewport }),

    availableLayouts: [

        { label: 'CardStandard', value: 'CardStandard', type: 'free' },
        { label: 'CardBasic', value: 'CardBasic', type: 'free' },

        ...gridLayouts,
    ],
    availableFlexLayouts: [
        ...flexLayouts,
    ],
    availableTableLayouts: [
        ...tableLayouts,
    ],
    availableViews: [
        { label: 'Grid', value: 'grid', type: 'free' },
        { label: 'Carousel', value: 'carousel', type: 'free' },
        ...pro_views
    ],
    availableTransition: [
        { label: 'Slide', value: 'slide', type: 'free' },
        { label: 'Fade', value: 'fade', type: 'free' },
        { label: 'Zoom', value: 'zoom', type: 'free' },
        { label: 'Flip', value: 'flip', type: 'free' },
    ],
    availableDelay: [
        { label: 'Left', value: 'left', type: 'pro' },
        { label: 'Right', value: 'right', type: 'pro' },
        // { label: 'Up', value: 'up', type: 'pro' },
        // { label: 'Down', value: 'down', type: 'pro' },
    ],
    availableDetails: [
        { label: 'No Details', value: 'none', type: 'free' },
        { label: 'Popup', value: 'popup', type: 'free' },
        ...pro_details
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
