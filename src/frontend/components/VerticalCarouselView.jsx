import React, {useEffect, useMemo, useState, useRef} from 'react';
import VerticalCarousel from "./library/Carousel/VerticalCarousel.jsx";
import Layout from './layouts/Layout';
import { getCommonStyles } from './helper/commonStyle.js';
import { getResponsiveStyles } from './helper/responsiveStyles.js';
import { getCarouselStyles } from './helper/carouselStyles.js';
import { getProLayout } from "./helper/getProLayout.js";

import Details from "./details/details.jsx";
import MarqueeSlider from "./library/SliderChild/MarqueeSlider.jsx";


function VerticalCarouselView({ reviews, settings, viewport, isEditor }) {
    const carouselRef = useRef(); // Ref for
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

    const previousSlide = () => {
        if (carouselRef.current) {
            carouselRef.current.prev(); // Call Ant Design Carousel prev method
        } else {
            console.warn("Carousel ref is not defined");
        }
    };

    const nextSlide = () => {
        if (carouselRef.current) {
            carouselRef.current.next(); // Call Ant Design Carousel next method
        } else {
            console.warn("Carousel ref is not defined");
        }
    };

    return (
        <>
            <div className='flex items-center justify-center relative w-full' style={{...commonStyles, ...responsiveStyles}}>
                {/*Previous Button*/}
                {/*{carouselStyles.arrows && (*/}
                {/*    <button*/}
                {/*        className="absolute"*/}
                {/*        style={{*/}
                {/*            left: '10px',*/}
                {/*            zIndex: 10,*/}
                {/*            backgroundColor: '#ddd',*/}
                {/*            border: 'none',*/}
                {/*            borderRadius: '50%',*/}
                {/*            width: '40px',*/}
                {/*            height: '40px',*/}
                {/*            display: 'flex',*/}
                {/*            alignItems: 'center',*/}
                {/*            justifyContent: 'center',*/}
                {/*            fontSize: '16px',*/}
                {/*            cursor: 'pointer',*/}
                {/*        }}*/}
                {/*        onClick={previousSlide}*/}
                {/*    >*/}
                {/*        ←*/}
                {/*    </button>*/}
                {/*)}*/}
                <div className="w-full">
                    {/*<Carousel*/}
                    {/*    ref={carouselRef}*/}
                    {/*    slidesPerRow={carouselStyles.slidesToShow}*/}
                    {/*    slidesToScroll={carouselStyles.slidesToScroll}*/}
                    {/*    draggable={carouselStyles.draggable}*/}
                    {/*    centerMode={carouselStyles.centerMode}*/}
                    {/*    autoplay={carouselStyles.autoplay}*/}
                    {/*>*/}
                    <VerticalCarousel
                        // columns={3} gap="20px"
                        // speed={2}
                        // direction="left"
                        // pauseOnHover={true}
                        // gap={40}
                        slidesToShow={3}
                        slidesToScroll={1}
                        repeat={true}
                        infinite={true}
                        autoplay={true}
                        transition="slide"
                        autoplaySpeed={3000}
                        // containerClassName="px-4"
                        // className="items-center"
                        centerMode={false}
                        responsive={[
                            {
                                breakpoint: 1024,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 1
                                }
                            },
                            {
                                breakpoint: 768,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 1
                                }
                            },
                            {
                                breakpoint: 480,
                                settings: {
                                    slidesToShow: 1,
                                    slidesToScroll: 1
                                }
                            }
                        ]}
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
                    </VerticalCarousel>
                </div>
                {/*Next Button*/}
                {/*{carouselStyles.arrows && (*/}
                {/*    <button*/}
                {/*        className="custom-next-arrow"*/}
                {/*        style={{*/}
                {/*            position: 'relative',*/}
                {/*            right: '10px',*/}
                {/*            zIndex: 10,*/}
                {/*            backgroundColor: '#ddd',*/}
                {/*            border: 'none',*/}
                {/*            borderRadius: '50%',*/}
                {/*            width: '40px',*/}
                {/*            height: '40px',*/}
                {/*            display: 'flex',*/}
                {/*            alignItems: 'center',*/}
                {/*            justifyContent: 'center',*/}
                {/*            fontSize: '16px',*/}
                {/*            cursor: 'pointer',*/}
                {/*        }}*/}
                {/*        onClick={nextSlide}*/}
                {/*    >*/}
                {/*        →*/}
                {/*    </button>*/}
                {/*)}*/}
            </div>
        </>
    );
}

export default VerticalCarouselView;