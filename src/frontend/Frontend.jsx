import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/hover.css';
import './assets/style.css';
import './assets/entrance.css';
import ReviewView from './components/ReviewView.jsx';
import ReviewForm from './components/ReviewForm.jsx';
import CarouselView from './components/CarouselView.jsx';
import { fetchData } from '../common/services/fetchData.js';
import { toastNotification } from "./utils/toast.js";
import { getTranslations } from "../common/utils/translations.js";
import {elementorLoader} from "./utils/elementorLoader.js";
import {gutenbergLoader} from "./utils/gutenbergLoader.js";
import {wpbakeryLoader} from "./utils/wpbakeryLoader.js";

function initializeReact(element) {
    const id = element.getAttribute('data-id');
    const productId = element.getAttribute('data-product-id');
    const showForm = element.getAttribute('data-show-form') === 'true';

    if (!id && !productId) {
        console.error("No data-id or data-product-id found for element:", element);
        return;
    }

    createRoot(element).render(
        <StrictMode>
            <Frontend id={id} productId={productId ? parseInt(productId) : null} showForm={showForm} />
        </StrictMode>
    );
}

function initializeAllWidgets() {
    const showcaseElements = document.querySelectorAll('.ts-review-showcase');
    showcaseElements.forEach((element) => {
        initializeReact(element);
    });
}

// Track initialized forms to avoid duplicate rendering
const initializedForms = new WeakSet();

// Initialize standalone review forms
function initializeReviewForms() {
    const formElements = document.querySelectorAll('.ts-review-form-container');
    formElements.forEach((element) => {
        // Skip if already initialized
        if (initializedForms.has(element)) {
            return;
        }

        const productId = element.getAttribute('data-product-id');
        if (productId) {
            initializedForms.add(element);
            createRoot(element).render(
                <StrictMode>
                    <ReviewForm productId={parseInt(productId)} />
                </StrictMode>
            );
        }
    });
}

// Watch for dynamically added form containers (for WooCommerce tabs)
function observeForms() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Check if the added node is a form container
                    if (node.classList && node.classList.contains('ts-review-form-container')) {
                        const productId = node.getAttribute('data-product-id');
                        if (productId && !initializedForms.has(node)) {
                            initializedForms.add(node);
                            createRoot(node).render(
                                <StrictMode>
                                    <ReviewForm productId={parseInt(productId)} />
                                </StrictMode>
                            );
                        }
                    }
                    // Check if the added node contains form containers
                    const nestedForms = node.querySelectorAll && node.querySelectorAll('.ts-review-form-container');
                    if (nestedForms) {
                        nestedForms.forEach((formElement) => {
                            if (!initializedForms.has(formElement)) {
                                const productId = formElement.getAttribute('data-product-id');
                                if (productId) {
                                    initializedForms.add(formElement);
                                    createRoot(formElement).render(
                                        <StrictMode>
                                            <ReviewForm productId={parseInt(productId)} />
                                        </StrictMode>
                                    );
                                }
                            }
                        });
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    // Handle Elementor's edit mode
    if (window.elementorFrontend && window.elementorFrontend.isEditMode()) {
        elementorLoader(initializeReact);
    }

    // Handle WPBakery editor mode
    if (window.vc_iframe || (typeof window.vc !== 'undefined') || document.body.classList.contains('vc_editor')) {
        wpbakeryLoader(initializeReact);
    }

    // Handle Gutenberg editor
    if (window.wp && window.wp.data && window.wp.data.select) {
        const isGutenbergEditor = !!window.wp.data.select('core/edit-post') || !!window.wp.data.select('core/editor');
        if (isGutenbergEditor) {
            gutenbergLoader(initializeReact);
        }
    }

    // Handle frontend
    if (
        !(window.elementorFrontend && window.elementorFrontend.isEditMode()) &&
        !(window.wp && window.wp.data && window.wp.data.select)
    ) {
        initializeAllWidgets();
        initializeReviewForms();
        // Watch for dynamically added forms (WooCommerce tabs, etc.)
        observeForms();
    }
});

function Frontend({ id, productId, showForm = false }) {
    const translations = getTranslations();
    const featureSettings = tsreview_settings.feature_settings || {};
    const extensionSettings = featureSettings.review_extensions || {};
    const [reviews, setReviews] = useState([]);
    const [reviewPage, setReviewPage] = useState(1);
    const [reviewTotal, setReviewTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState(extensionSettings.sort_order || 'recent');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [ratingSummary, setRatingSummary] = useState(null);
    const devMode = Boolean(tsreview_settings.devmode);
    const [isHovering, setIsHovering] = useState(false);

    const effectiveProductId = productId || (settings.product_id);

    const applyShowcaseResponse = (response, append) => {
        const meta = response.data.meta_data || {};
        const nextReviews = meta.reviews || [];
        setReviews((current) => append ? current.concat(nextReviews) : nextReviews);
        setReviewTotal(Number(meta.reviews_total || 0));
        setReviewPage(Number(meta.reviews_page || 1));
        setRatingSummary(meta.rating_summary || null);
        if (!append) {
            const showcaseSettings = meta.showcase_settings || {};
            setSettings({
                ...showcaseSettings,
                ...extensionSettings,
                review_discount_enabled: !!featureSettings.review_discount?.enabled,
                incentivized_badge: !!featureSettings.review_discount?.incentivized_badge,
                rating_summary: meta.rating_summary || null,
            });
        }
    };

    const handleReviewSubmitted = () => {
        if (id) {
            fetchData(`tsreview/review_showcase/fetch/single`, (response) => {
                if (response && response.success) {
                    applyShowcaseResponse(response, false);
                }
            }, { post_id: id, page: 1, sort: sortOrder, rating: ratingFilter || '', product_id: productId || '' });
        }
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    useEffect(() => {
        if (id) {
            setLoading(true);
            setError(null);
            fetchData(`tsreview/review_showcase/fetch/single`, (response) => {
                setLoading(false);
                if (response && response.success) {
                    applyShowcaseResponse(response, false);
                } else {
                    setError(translations.failedToLoadReviews);
                    console.error("Error fetching post data:", response);
                }
            }, { post_id: id, page: 1, sort: sortOrder, rating: ratingFilter || '', product_id: productId || '' });
        } else {
            setLoading(false);
        }
    }, [id, sortOrder, ratingFilter, productId]);

    // Function to copy settings to the clipboard
    const handleCopySettings = async () => {
        try {
            const { postID, ...settingsToCopy } = settings;
            const serializedSettings = JSON.stringify(settingsToCopy);
            await navigator.clipboard.writeText(serializedSettings);
            toastNotification('success', `Design Copied`, `The design has copied successfully`);
        } catch (error) {
            console.error("Failed to copy settings to clipboard:", error);
        }
    };


    const renderControls = () => (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#4b5563' }}>
                {translations.sort}
                <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    style={{ marginLeft: 8, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 8px' }}
                >
                    <option value="recent">{translations.recent}</option>
                    <option value="rating_high">{translations.highestRated}</option>
                    <option value="rating_low">{translations.lowestRated}</option>
                </select>
            </label>
            {ratingFilter ? (
                <button type="button" onClick={() => setRatingFilter(0)} style={{ border: 0, background: '#eef2ff', color: '#4338ca', borderRadius: 999, padding: '6px 12px', cursor: 'pointer' }}>
                    {translations.clearStarFilter.replace('%s', ratingFilter)}
                </button>
            ) : null}
        </div>
    );

    const renderViewComponent = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    <div style={{ fontSize: '14px' }}>{translations.loadingReviews}</div>
                </div>
            );
        }

        if (error) {
            return (
                <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                    <div style={{ fontSize: '14px' }}>{error}</div>
                </div>
            );
        }

        const view = settings.selectedView?.value || settings.layout || 'grid';
        const controls = renderControls();
        const viewProps = {
            reviews,
            settings: { ...settings, rating_summary: ratingSummary },
            isEditor: false,
            activeRating: ratingFilter,
            onRatingFilter: (star) => setRatingFilter((current) => current === star ? 0 : star),
        };
        if (view === 'carousel') {
            return (
                <>
                    {controls}
                    <CarouselView reviews={reviews} settings={settings} isEditor={false} />
                </>
            );
        }

        return (
            <>
                {controls}
                <ReviewView {...viewProps} />
                {reviews.length < reviewTotal ? (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                        <button
                            type="button"
                            disabled={loadingMore}
                            onClick={() => {
                                setLoadingMore(true);
                                fetchData(`tsreview/review_showcase/fetch/single`, (response) => {
                                    setLoadingMore(false);
                                    if (response && response.success) {
                                        applyShowcaseResponse(response, true);
                                    }
                                }, { post_id: id, page: reviewPage + 1, sort: sortOrder, rating: ratingFilter || '', product_id: productId || '' });
                            }}
                        >
                            {loadingMore ? translations.loading : translations.loadMoreReviews}
                        </button>
                    </div>
                ) : null}
            </>
        );
    };

    return (
        <>
            {showForm && effectiveProductId ? (
                <ReviewForm productId={effectiveProductId} onSuccess={handleReviewSubmitted} />
            ) : (
                <>
                    {devMode ? (
                        <div className="relative">
                            <div
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                            >
                                {renderViewComponent()}

                                <div
                                    id="tsreview__copy-design"
                                    style={{
                                        opacity: isHovering ? '1' : '0',
                                        visibility: isHovering ? 'visible' : 'hidden',
                                    }}
                                >
                                    <button
                                        className="bg-purple-600 text-white px-4 py-2 rounded-full flex items-center shadow-lg z-50"
                                        onClick={handleCopySettings}
                                    >
                                        <span>Copy Design</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderViewComponent()
                    )}
                </>
            )}
        </>
    );
}

export default Frontend;
