import React, { useEffect, useMemo, useState } from 'react';
import Carousel from "./library/Carousel/Carousel.jsx";
import Layout from './layouts/Layout';
import { getCommonStyles } from './helper/commonStyle.js';
import { getResponsiveStyles } from './helper/responsiveStyles.js';
import { getCarouselStyles } from './helper/carouselStyles.js';
import { getProLayout } from "./helper/getProLayout.js";
import { getAnimationClasses } from "./helper/motionControl.js";

import GenerateLayoutStyle from "./helper/generateLayoutStyle.js";


function CarouselView({ reviews, settings, viewport, isEditor }) {
    const [ProLayoutComponent, setProLayoutComponent] = useState(null);
    const commonStyles = getCommonStyles(settings);
    const [responsiveStyles, setResponsiveStyles] = useState(
        getResponsiveStyles(settings, viewport, isEditor)
    );

    const [carouselStyles, setCarouselStyles] = useState(
        getCarouselStyles(settings, viewport, isEditor)
    );

    // Animation configuration
    const animationConfig = useMemo(() => {
        const hoverAnimation = settings?.hoverAnimation || "none";
        const config = getAnimationClasses(hoverAnimation);
        return config;
    }, [settings?.hoverAnimation]);

    const layoutType = settings.selectedLayout?.value || 'Card';

    useMemo(() => {
        setProLayoutComponent(() => getProLayout(settings));
    }, [settings?.selectedLayout?.type, settings?.selectedLayout?.value]);

    useEffect(() => {
        const updateStyles = () => {
            setResponsiveStyles(getResponsiveStyles(settings, viewport, isEditor));
            setCarouselStyles(getCarouselStyles(settings, viewport, isEditor));
        };

        if (!isEditor) {
            window.addEventListener('resize', updateStyles);
            return () => {
                window.removeEventListener('resize', updateStyles);
            };
        } else {
            updateStyles();
        }
    }, [settings, viewport, isEditor]);

    return (
        <>
            <div className='flex items-center justify-center relative w-full' style={{...commonStyles, ...responsiveStyles}}>
            <div className="w-full">
                <GenerateLayoutStyle settings={settings} />
                <Carousel
                    slidesToShow={carouselStyles.slidesToShow}
                    slidesToScroll={carouselStyles.slidesToScroll}
                    infinite={carouselStyles.infinite}
                    repeat={carouselStyles.repeat}
                    autoplay={carouselStyles.autoplay}
                    centerMode={carouselStyles.centerMode}
                    transition={carouselStyles.transition}
                    autoplaySpeed={carouselStyles.slideSpeed}
                    gap={carouselStyles.gap}
                    dotStyle={{
                        color: carouselStyles.dotsColor,
                        inactiveColor: '#9CA3AF',
                        size: '14px',
                        gap: '12px',
                    }}
                    navigationStyle={{
                        backgroundColor: carouselStyles.navBgColor,
                        color: carouselStyles.navColor,
                    }}
                >
                {reviews && reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={review.comment_id || index} className="tsreview-carousel"
                             style={{
                                 padding: '1rem',
                                 width: '100%',
                                 boxSizing: 'border-box',
                             }}
                             ref={(el) => {
                                 if (el) el.style.setProperty('padding', carouselStyles.columnGap, 'important');
                             }}
                        >
                            <Layout
                                settings={settings}
                                layoutType={layoutType}
                                review={review}
                                reviews={reviews}
                                animationConfig={animationConfig}
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 w-full">No reviews found.</p>
                )}
            </Carousel>
            </div>
        </div>
            </>
    );
}

export default CarouselView;
