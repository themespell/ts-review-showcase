import React, { useState, useEffect, useMemo } from 'react';
import Layout from './layouts/Layout';
import { getCommonStyles } from "./helper/commonStyle.js";
import { getResponsiveStyles } from "./helper/responsiveStyles.js";
import { getProLayout } from "./helper/getProLayout.js";

import Details from "./details/details.jsx";

function TableView({ reviews, settings, viewport, isEditor, Details }) {
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

    // Create a render function that will be passed to layout components
    // const renderDetails = (member, settings) => {
    //     return <Details settings={settings} member={member} />;
    // };


    return (
        <div
            className="tsteam-table-container"
            style={{
                ...commonStyles,
                ...responsiveStyles,
            }}
        >
            {ProLayoutComponent ? (
                <ProLayoutComponent
                    settings={settings}
                    reviews={reviews}
                    details={<Details
                        settings={settings}
                        member={reviews}  // Pass all team members instead of a single member
                    />}
                />
            ) : (
                <Layout
                    settings={settings}
                    layoutType={settings.selectedLayout.value}
                    reviews={reviews}
                    details={<Details
                        settings={settings}
                        member={reviews}  // Pass all team members instead of a single member
                    />}
                    // details={<Details
                    //     settings={settings}
                    //     member={member}
                    // />}
                />
            )}
        </div>
    );
}

export default TableView;