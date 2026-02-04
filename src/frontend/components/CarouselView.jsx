import React, {useEffect, useMemo, useState} from 'react';
import Carousel from "./library/Carousel/Carousel.jsx";
import Layout from './layouts/Layout';
import { getCommonStyles } from './helper/commonStyle.js';
import { getResponsiveStyles } from './helper/responsiveStyles.js';
import { getCarouselStyles } from './helper/carouselStyles.js';
import { getProLayout } from "./helper/getProLayout.js";

import Details from "./details/details.jsx";
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
                    // containerClassName="px-4"
                    // className="items-center"
                >
                {reviews && reviews.length > 0 ? (
                    reviews.map((member, index) => (
                        <div key={index} className="tsteam-carousel"
                             style={{
                                 padding: '1rem', // Add horizontal gap
                                 width: '100%', // Ensure width is consistent
                                 boxSizing: 'border-box', // Include padding in width calculation
                             }}
                             ref={(el) => {
                                 if (el) el.style.setProperty('padding', carouselStyles.columnGap, 'important');
                             }}
                        >
                            {ProLayoutComponent ? (
                                <ProLayoutComponent
                                    settings={settings}
                                    imageUrl={member.image_url || member.meta_data?.image}
                                    id={member.post_id}
                                    title={member.title}
                                    categories={member.categories}
                                    price={member.price}
                                    regularPrice={member.regular_price}
                                    salePrice={member.sale_price}
                                    cartUrl={member.add_to_cart_url}
                                    description={member.content || member.description}
                                    productGallery={member.gallery_urls}
                                    sku={member.sku}
                                    stockStatus={member.stock_status}
                                    animationConfig={animationConfig}
                                />
                            ) : (
                                <Layout
                                    settings={settings}
                                    layoutType={settings.selectedLayout.value}
                                    id={member.post_id}
                                    imageUrl={member.image_url || member.meta_data?.image}
                                    title={member.title}
                                    productGallery={member.gallery_urls}
                                    categories={member.categories}
                                    price={member.price}
                                    regularPrice={member.regular_price}
                                    salePrice={member.sale_price}
                                    sku={member.sku}
                                    stockStatus={member.stock_status}
                                    description={member.content || member.description}
                                    cartUrl={member.add_to_cart_url}
                                    animationConfig={animationConfig}
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <p>No team members found.</p>
                )}
            {/*</Carousel>*/}
            </Carousel>
            </div>
        </div>
            </>
    );
}

export default CarouselView;