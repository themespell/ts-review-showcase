import React, { useState, useEffect, useMemo } from 'react';
import Marquee from "react-fast-marquee";
import Layout from './layouts/Layout';
import { getCommonStyles } from "./helper/commonStyle.js";
import { getResponsiveStyles } from "./helper/responsiveStyles.js";
import {getProLayout} from "./helper/getProLayout.js";
import {getMarqueeStyles} from "./helper/marqueeStyles.js";

import Details from "./details/details.jsx";
import GenerateLayoutStyle from "./helper/generateLayoutStyle.js";

function MarqueeView({ reviews, settings, viewport, isEditor }) {
    const [ProLayoutComponent, setProLayoutComponent] = useState(null);
    const commonStyles = getCommonStyles(settings);
    const [responsiveStyles, setResponsiveStyles] = useState(
        getResponsiveStyles(settings, viewport, isEditor)
    );

    const [marqueeStyles, setMarqueeStyles] = useState(
        getMarqueeStyles(settings, viewport, isEditor)
    );

    useMemo(() => {
        setProLayoutComponent(() => getProLayout(settings));
    }, [settings?.selectedLayout?.type, settings?.selectedLayout?.value]);

    useEffect(() => {
        const updateResponsiveStyles = () => {
            setMarqueeStyles(getMarqueeStyles(settings, viewport, isEditor));
            setResponsiveStyles(getResponsiveStyles(settings, viewport, isEditor));
        };

        if (isEditor) {
            updateResponsiveStyles();
        } else {
            updateResponsiveStyles();
            window.addEventListener('resize', updateResponsiveStyles);

            return () => {
                window.removeEventListener('resize', updateResponsiveStyles);
            };
        }
    }, [settings, isEditor, viewport]);

    return (
        <div
            className=""
            style={{
                ...commonStyles,
                ...responsiveStyles,
            }}
        >
            <GenerateLayoutStyle settings={settings} />
            <Marquee
                speed={marqueeStyles.speed}
                autoFill={marqueeStyles.infinite}
                pauseOnClick={marqueeStyles.pauseOnClick}
                pauseOnHover={marqueeStyles.pauseOnHover}
                direction={marqueeStyles.direction}
                delay={0}
                style={{
                    width: '100%'
                }}
            >
            {reviews && reviews.length > 0 ? (
                reviews.map((member, index) => (
                    <div key={index} style={{ marginRight: marqueeStyles.columnGap }}>
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
            </Marquee>
        </div>
    );
}

export default MarqueeView;