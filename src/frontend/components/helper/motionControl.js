export const animations = {
    none: {
        type: 'single',
        class: ''
    },
    blur: {
        type: 'single',
        class: 'blur-animation'
    },
    slideTop: {
        type: 'single',
        class: 'tsh-slide-top'
    },
    shadowPop: {
        type: 'single',
        class: 'tsh-shadow-pop-tr'
    },
    shadowDrop: {
        type: 'single',
        class: 'tsh-shadow-drop-center'
    },
    shadowDrop2: {
        type: 'single',
        class: 'tsh-shadow-drop-2-tr'
    },
    textPopUp: {
        type: 'single',
        class: 'text-pop-up-top'
    },
    flipScaleUp: {
        type: 'single',
        class: 'flip-scale-up-hor'
    },
    gradient: {
        type: 'single',
        class: 'tsreview__gradient-hover'
    },

    // Wrapper-based animations (need parent + wrapper)
    float3d: {
        type: 'wrapper',
        parent: 'tsh-3d-float',
        wrapper: 'tsh-3d-float__wrapper'
    },
    tilt: {
        type: 'wrapper',
        parent: 'tsh-tilt',
        wrapper: 'tsh-tilt__wrapper'
    }
};

export const getAnimationClasses = (animationType) => {
    const config = animations[animationType];
    if (!config) return null;

    return config;
};
