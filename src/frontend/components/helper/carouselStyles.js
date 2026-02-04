import {stringToBoolean} from "../../../editor/utils/stringToBoolean.js";
import {TsColor} from "../../../common/components/controls/tsControls.js";
export const getCarouselStyles = (settings, viewport, isEditor) => {
    const { carouselSettings } = settings || {};

    let slidesToShow, slidesToScroll, columnGap;

    if (isEditor) {
        switch (viewport) {
            case 'mobile':
                slidesToShow = carouselSettings?.slidesToShow?.default?.mobile || 1;
                slidesToScroll = carouselSettings?.slidesToScroll?.default?.mobile || 1;
                columnGap = settings?.columnSettings?.gap?.default?.mobile;
                break;
            case 'tablet':
                slidesToShow = carouselSettings?.slidesToShow?.default?.tablet || 2;
                slidesToScroll = carouselSettings?.slidesToScroll?.default?.tablet || 1;
                columnGap = settings?.columnSettings?.gap?.default?.tablet;
                break;
            case 'desktop':
            default:
                slidesToShow = carouselSettings?.slidesToShow?.default?.desktop || 3;
                slidesToScroll = carouselSettings?.slidesToScroll?.default?.desktop || 1;
                columnGap = settings?.columnSettings?.gap?.default?.desktop;
                break;
        }
    } else {
        const width = window.innerWidth;
        if (width <= 768) {
            slidesToShow = carouselSettings?.slidesToShow?.default?.mobile || 1;
            slidesToScroll = carouselSettings?.slidesToScroll?.default?.mobile || 1;
            columnGap = settings?.columnSettings?.gap?.default?.mobile;
        } else if (width <= 1024) {
            slidesToShow = carouselSettings?.slidesToShow?.default?.tablet || 2;
            slidesToScroll = carouselSettings?.slidesToScroll?.default?.tablet || 1;
            columnGap = settings?.columnSettings?.gap?.default?.tablet;
        } else {
            slidesToShow = carouselSettings?.slidesToShow?.default?.desktop || 3;
            slidesToScroll = carouselSettings?.slidesToScroll?.default?.desktop || 1;
            columnGap = settings?.columnSettings?.gap?.default?.desktop;
        }
    }

    const slideSpeed = carouselSettings?.slideSpeed?.default;
    const gap = carouselSettings?.gap?.default;
    const transition = carouselSettings?.transition;
    const infinite = stringToBoolean(carouselSettings?.infinite);
    const repeat = stringToBoolean(carouselSettings?.repeat);
    const centerMode = stringToBoolean(carouselSettings?.centerSlide);
    const autoplay = stringToBoolean(carouselSettings?.autoPlay);
    const dotsColor = carouselSettings.dotsColor || '#703fd6';
    const navBgColor = carouselSettings.navBgColor;
    const navColor = carouselSettings.navColor;

    return {
        slidesToShow,
        slidesToScroll,
        columnGap,
        slideSpeed,
        gap,
        transition,
        infinite,
        repeat,
        centerMode,
        autoplay,
        dotsColor,
        navBgColor,
        navColor
    };
};