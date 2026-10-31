import React from 'react';
import * as ReactDOM from 'react-dom';
import * as jsxRuntime from 'react/jsx-runtime';
import Layout from '../frontend/components/layouts/Layout.jsx';
import ReviewView from '../frontend/components/ReviewView.jsx';
import StarRating from '../frontend/components/StarRating.jsx';
import ReviewDetailsBody from '../frontend/components/details/Components/ReviewDetailsBody.jsx';
import useReviewDetails from '../frontend/components/details/useReviewDetails.jsx';
import GenerateLayoutStyle from '../frontend/components/helper/generateLayoutStyle.js';
import { getAnimationClasses } from '../frontend/components/helper/motionControl.js';
import { getCommonStyles } from '../frontend/components/helper/commonStyle.js';
import { getResponsiveStyles } from '../frontend/components/helper/responsiveStyles.js';
import { getTranslations } from '../common/utils/translations.js';

// Shares this bundle's React and review components with TS Review Showcase Pro,
// so Pro views render inside the same React tree instead of bundling a second copy.
export function exposeShared(extra = {}) {
    const current = window.tsReviewShared || {};

    window.tsReviewShared = {
        ...current,
        React,
        ReactDOM,
        jsxRuntime,
        components: {
            ...(current.components || {}),
            Layout,
            ReviewView,
            StarRating,
            ReviewDetailsBody,
            GenerateLayoutStyle,
            ...(extra.components || {}),
        },
        helpers: {
            ...(current.helpers || {}),
            useReviewDetails,
            getAnimationClasses,
            getCommonStyles,
            getResponsiveStyles,
            getTranslations,
            ...(extra.helpers || {}),
        },
        ...(extra.editor ? { editor: extra.editor } : {}),
    };
}
