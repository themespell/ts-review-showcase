import React, { useEffect, useMemo, useState } from "react";
import { User } from 'lucide-react';
import Layout from './layouts/Layout';
import { getAnimationClasses } from './helper/motionControl.js';

function ReviewView({ reviews = [], settings = {}, viewport = 'desktop', isEditor = false }) {
  // Get settings with defaults
  const layout = settings.layout || 'grid';
  const columns = settings.columns || 3;
  const columnGap = settings.column_gap || 20;
  const layoutType = settings.selectedLayout?.value || 'Card';
  const sortOrder = settings.sort_order || 'recent';
  const reviewsPerPage = Math.max(1, Number(settings.reviews_per_page || 6));
  const showHistogram = settings.show_histogram !== false;
  const [visibleCount, setVisibleCount] = useState(reviewsPerPage);

  // Calculate responsive columns based on viewport
  const getResponsiveColumns = () => {
    if (viewport === 'mobile') return 1;
    if (viewport === 'tablet') return Math.min(columns, 2);
    return columns;
  };

  const responsiveColumns = getResponsiveColumns();

  // Animation configuration
  const animationConfig = useMemo(() => {
    const hoverAnimation = settings?.hoverAnimation || "none";
    const config = getAnimationClasses(hoverAnimation);
    return config;
  }, [settings?.hoverAnimation]);

  const sortedReviews = useMemo(() => {
    const nextReviews = [...reviews];

    if (sortOrder === 'rating_high') {
      nextReviews.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      return nextReviews;
    }

    if (sortOrder === 'rating_low') {
      nextReviews.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0));
      return nextReviews;
    }

    nextReviews.sort((a, b) => new Date(b.review_date || 0) - new Date(a.review_date || 0));
    return nextReviews;
  }, [reviews, sortOrder]);

  const ratingBreakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: sortedReviews.filter((review) => Number(review.rating || 0) === star).length,
    }));
  }, [sortedReviews]);

  const averageRating = useMemo(() => {
    if (!sortedReviews.length) {
      return 0;
    }

    const total = sortedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / sortedReviews.length;
  }, [sortedReviews]);

  useEffect(() => {
    setVisibleCount(reviewsPerPage);
  }, [reviewsPerPage, sortedReviews.length]);

  const visibleReviews = sortedReviews.slice(0, visibleCount);

  // No reviews state
  if (!reviews || reviews.length === 0) {
    return (
      <div
        className="text-center py-12"
        style={{ color: '#9ca3af' }}
      >
        <User size={48} className="mx-auto mb-4 opacity-50" />
        <p>No reviews found</p>
      </div>
    );
  }

  // List layout
  if (layout === 'list') {
    return (
      <div className="tsreview-reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: `${columnGap}px` }}>
        {visibleReviews.map((review, index) => (
          <Layout
            key={review.comment_id || index}
            settings={settings}
            layoutType={layoutType}
            review={review}
            reviews={visibleReviews}
            animationConfig={animationConfig}
          />
        ))}
      </div>
    );
  }

  // Grid layout (default)
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
    gap: `${columnGap}px`,
  };

  return (
    <div>
      {showHistogram && sortedReviews.length > 0 ? (
        <div
          className="tsreview-review-summary"
          style={{
            marginBottom: '24px',
            padding: '18px',
            border: '1px solid rgba(87,94,207,0.12)',
            borderRadius: '16px',
            background: 'rgba(87,94,207,0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ minWidth: '120px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#171717' }}>{averageRating.toFixed(1)}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{sortedReviews.length} reviews</div>
            </div>

            <div style={{ flex: 1, minWidth: '220px', display: 'grid', gap: '8px' }}>
              {ratingBreakdown.map(({ star, count }) => {
                const percentage = sortedReviews.length ? (count / sortedReviews.length) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr) 34px', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>{star}★</span>
                    <span style={{ height: '8px', borderRadius: '999px', overflow: 'hidden', background: 'rgba(87,94,207,0.1)' }}>
                      <span style={{ display: 'block', width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #8b7bff 0%, #575ecf 100%)' }} />
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div className="tsreview-reviews-grid" style={gridStyle}>
        {visibleReviews.map((review, index) => (
          <Layout
            key={review.comment_id || index}
            settings={settings}
            layoutType={layoutType}
            review={review}
            reviews={visibleReviews}
            animationConfig={animationConfig}
          />
        ))}
      </div>

      {!isEditor && visibleCount < sortedReviews.length ? (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + reviewsPerPage)}
            style={{
              border: '1px solid rgba(87,94,207,0.16)',
              background: '#ffffff',
              color: '#575ecf',
              fontWeight: 600,
              borderRadius: '999px',
              padding: '12px 18px',
              cursor: 'pointer',
            }}
          >
            Load More Reviews
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ReviewView;
