import React, { useState, useEffect, useMemo } from 'react';
import Layout from './layouts/Layout';
import { getCommonStyles } from "./helper/commonStyle.js";
import { getResponsiveStyles } from "./helper/responsiveStyles.js";
import { getProLayout } from "./helper/getProLayout.js";
import GenerateLayoutStyle from "./helper/generateLayoutStyle.js";

function FlexView({ reviews, settings, viewport, isEditor, Details }) {
    const [ProLayoutComponent, setProLayoutComponent] = useState(null);
    const commonStyles = getCommonStyles(settings);
    const [responsiveStyles, setResponsiveStyles] = useState(
        getResponsiveStyles(settings, viewport, isEditor)
    );

    useMemo(() => {
        setProLayoutComponent(() => getProLayout(settings));
    }, [settings?.selectedLayout?.type, settings?.selectedLayout?.value]);

    useEffect(() => {
        const updateResponsiveStyles = () => {
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
            className="tsteam-flex-container"
            style={{
                ...commonStyles,
                ...responsiveStyles,
            }}
        >
            <GenerateLayoutStyle settings={settings} />
            {ProLayoutComponent ? (
                <ProLayoutComponent
                    settings={settings}
                    reviews={reviews}
                    Details={Details}
                />
            ) : (
                <Layout
                    settings={settings}
                    layoutType={settings.selectedLayout.value}
                    reviews={reviews}
                    Details={Details}
                />
            )}
        </div>
    );
}

export default FlexView;