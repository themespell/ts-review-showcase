import {stringToBoolean} from "../../../editor/utils/stringToBoolean.js";

export const getMarqueeStyles = (settings, viewport, isEditor) => {
    const { marqueeSettings } = settings || {};

    let slidesToShow, slidesToScroll, columnGap;

    if (isEditor) {
        switch (viewport) {
            case 'mobile':
                columnGap = settings?.columnSettings?.gap?.default?.mobile;
                break;
            case 'tablet':
                columnGap = settings?.columnSettings?.gap?.default?.tablet;
                break;
            case 'desktop':
            default:
                columnGap = settings?.columnSettings?.gap?.default?.desktop;
                break;
        }
    } else {
        const width = window.innerWidth;
        if (width <= 768) {
            columnGap = settings?.columnSettings?.gap?.default?.mobile;
        } else if (width <= 1024) {
            columnGap = settings?.columnSettings?.gap?.default?.tablet;
        } else {
            columnGap = settings?.columnSettings?.gap?.default?.desktop;
        }
    }

    const speed = marqueeSettings?.marqueeSpeed.default;
    const direction = marqueeSettings.direction;
    const infinite = stringToBoolean(marqueeSettings.infinite);
    const pauseOnClick = stringToBoolean(marqueeSettings.pauseOnClick);
    const pauseOnHover = stringToBoolean(marqueeSettings.pauseOnHover);

    return {
        speed,
        direction,
        infinite,
        pauseOnClick,
        pauseOnHover,
        columnGap
    };
};