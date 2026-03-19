import { useState, useEffect, useMemo } from 'react';
import { hideAdminElements } from './utils/utils.js';
import { fetchData } from '../common/services/fetchData.js';
import { TsLoader } from '../common/components/controls/tsControls.js';
import { getTranslations } from "../common/utils/translations.js";

import editorLocal from "./states/editorLocal.js";
import editorStore from './states/editorStore.js';
import editorFunction from './states/editorFunction.js';
import { handleCopySettings, handlePasteSettings } from "./utils/copyPasteLayout.js";
import proLayouts from "../pro_support/proLayouts.js";

import Topbar from './components/Topbar.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import './components/assets/editorStyle.css';
import './components/assets/editorHover.css';

import ReviewView from '../frontend/components/ReviewView.jsx';
import CarouselView from '../frontend/components/CarouselView.jsx';
import StaticView from '../frontend/components/StaticView.jsx';
import FlexView from "../frontend/components/FlexView.jsx";
import MarqueeView from "../frontend/components/MarqueeView.jsx";
import TableView from "../frontend/components/TableView.jsx";
import ConfettiView from "../frontend/components/ConfettiView.jsx";

/**
 * Transform settings to add flat properties while preserving nested structure
 * The helpers (carouselStyles, responsiveStyles) expect nested format like:
 * settings.columnSettings.column.default.mobile
 * But ReviewView expects flat format like: settings.columns, settings.column_gap
 *
 * This function adds both formats to the settings object.
 */
const transformSettings = (allSettings, viewport = 'desktop') => {
    // Get viewport-specific value from nested setting object
    const getViewportValue = (setting) => {
        if (typeof setting === 'object' && setting !== null) {
            return setting[viewport] || setting.desktop || setting.default;
        }
        return setting;
    };

    // Extract column settings
    const columnSetting = allSettings.columnSettings?.column?.default || {};
    const gapSetting = allSettings.columnSettings?.gap?.default || {};

    // Create a new settings object that preserves the nested structure
    // but also adds flat properties for ReviewView
    return {
        // Preserve ALL original settings (nested format for helpers)
        ...allSettings,

        // Add flat format properties for ReviewView
        layout: allSettings.selectedView?.value || 'grid',
        columns: getViewportValue(columnSetting),
        column_gap: getViewportValue(gapSetting),

        // Visual settings with defaults
        show_images: allSettings.show_images !== false,
        show_ratings: allSettings.show_ratings !== false,
        show_dates: allSettings.show_dates !== false,
        show_product_name: allSettings.show_product_name !== false,
        show_verified_badge: allSettings.show_verified_badge !== false,
        star_color: allSettings.star_color || '#f5c518',
        border_radius: allSettings.border_radius || 8,
        background_color: allSettings.background_color || '#ffffff',
        text_color: allSettings.text_color || '#333333',
    };
};

function Editor() {
    const translations = getTranslations();
    const isPro = tsreview_settings.is_pro;
    const { isEditor, viewport, setViewport } = editorLocal();
    const { postType } = editorStore();
    const allSettings = editorStore();
    const { saveSettings } = editorFunction();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [postData, setPostData] = useState(null);

    // Transform settings for view components - memoized for performance
    const transformedSettings = useMemo(() => {
        return transformSettings(allSettings, viewport);
    }, [allSettings, viewport]);

    useEffect(() => {
        hideAdminElements();
        setIsLoading(true);

        const queryParams = new URLSearchParams(window.location.search);
        const postIdFromUrl = queryParams.get('post_id');
        const postTypeFromUrl = queryParams.get('type');

        saveSettings('postID', postIdFromUrl);
        saveSettings('postType', postTypeFromUrl);

        if (postIdFromUrl) {
            fetchData(`tsreview/${postTypeFromUrl}/fetch/single`, (response) => {
                if (response && response.success) {
                    setPostData(response.data.meta_data);

                    const showcaseSettings = response.data.meta_data.showcase_settings;
                    Object.keys(showcaseSettings).forEach((key) => {
                        const value = showcaseSettings[key];
                        saveSettings(key, value);
                    });

                    setTimeout(() => {
                        setIsLoading(false);
                        proLayouts();
                    }, 1000);
                } else {
                    console.error("Error fetching post data:", response);
                    setIsLoading(false);
                }
            }, { post_id: postIdFromUrl });
        } else {
            console.error("No post_id found in the URL");
            setIsLoading(false);
        }
    }, []);

    const handleToggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    // Render the appropriate view based on selectedView
    const renderView = () => {
        // Get selected view, default to 'grid', and migrate 'static' to 'grid'
        let selectedView = allSettings.selectedView?.value || 'grid';
        if (selectedView === 'static') {
            selectedView = 'grid';
            // Auto-migrate the setting
            if (allSettings.selectedView) {
                saveSettings('selectedView', { label: 'Grid', value: 'grid', type: 'free' });
            }
        }

        const reviews = postData.reviews || [];

        const commonProps = {
            reviews,
            settings: transformedSettings,
            viewport,
            isEditor
        };

        switch (selectedView) {
            case 'carousel':
                return <CarouselView {...commonProps} />;

            case 'flex':
                return <FlexView {...commonProps} />;

            case 'marquee':
                return isPro ? <MarqueeView {...commonProps} /> : <ReviewView {...commonProps} />;

            case 'table':
                return isPro ? <TableView {...commonProps} /> : <ReviewView {...commonProps} />;

            case 'confetti':
                return isPro ? <ConfettiView {...commonProps} /> : <ReviewView {...commonProps} />;

            case 'grid':
            default:
                return <ReviewView {...commonProps} />;
        }
    };

    if (isLoading || postData === null) {
        return (
            <TsLoader
                label={translations.loadingEditor}
            />
        );
    }

    return (
        <>
            <Topbar
                type={postType}
                viewport={viewport}
                setViewport={setViewport}
                onCopySettings={() => handleCopySettings(allSettings)}
                onPasteSettings={() => handlePasteSettings(saveSettings)}
            />
            <div className="layout-container">
                <Sidebar
                    isOpen={isSidebarOpen}
                    selectedLayout={allSettings.selectedLayout.value}
                    layoutType={allSettings.selectedLayout.type}
                    onToggleSidebar={handleToggleSidebar}
                />
                <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <div className='flex justify-center items-center min-h-screen mx-auto tsreview__editor_bg'>
                        <div className={`editor-container editor-hover viewport-${viewport}`}>
                            {renderView()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Editor;