import React, { useEffect, useMemo, useState } from "react";
import Layout from './layouts/Layout';
import { getAnimationClasses } from './helper/motionControl.js';
import { getTranslations } from '../../common/utils/translations';
import { IconUser } from './icons';

function measureSize(value, fallback) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function viewportFromWidth(width) {
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

function ReviewView({ reviews = [], settings = {}, viewport = 'desktop', isEditor = false, activeRating = 0, onRatingFilter }) {
  const translations = getTranslations();
  const [liveViewport, setLiveViewport] = useState(() => (
    typeof window === 'undefined' ? 'desktop' : viewportFromWidth(window.innerWidth)
  ));

  useEffect(() => {
    if (isEditor) {
      return undefined;
    }
    const onResize = () => setLiveViewport(viewportFromWidth(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isEditor]);

  const activeViewport = isEditor ? (viewport || 'desktop') : liveViewport;
  const layout = settings.selectedView?.value && settings.selectedView.value !== 'carousel'
    ? settings.selectedView.value
    : (settings.layout || 'grid');
  const nestedColumns = settings?.columnSettings?.column?.default;
  const nestedGap = settings?.columnSettings?.gap?.default;
  const fallbackColumns = activeViewport === 'mobile' ? 1 : activeViewport === 'tablet' ? 2 : 3;
  const columns = measureSize(nestedColumns?.[activeViewport] ?? settings.columns, fallbackColumns);
  const columnGap = measureSize(nestedGap?.[activeViewport] ?? settings.column_gap, 20);
  const layoutType = settings.selectedLayout?.value || 'Card';
  const showHistogram = settings.show_histogram !== false;
  const responsiveColumns = Math.max(1, columns);
  const summary = settings.rating_summary || null;
  const summaryTotal = Number(summary?.total ?? reviews.length);
  const summaryAverage = summary
    ? Number(summary.average || 0)
    : (reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0);
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: summary?.counts ? Number(summary.counts[star] || summary.counts[String(star)] || 0) : reviews.filter((review) => Number(review.rating || 0) === star).length,
  }));

  const animationConfig = useMemo(() => {
    const hoverAnimation = settings?.hoverAnimation || "none";
    return getAnimationClasses(hoverAnimation);
  }, [settings?.hoverAnimation]);

  const histogram = showHistogram ? (
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#171717' }}>{summaryAverage.toFixed(1)}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>{translations.reviewsCount.replace('%s', summaryTotal)}</div>
        </div>
        <div style={{ flex: 1, minWidth: '220px', display: 'grid', gap: '8px' }}>
          {ratingBreakdown.map(({ star, count }) => {
            const percentage = summaryTotal ? (count / summaryTotal) * 100 : 0;
            const selected = Number(activeRating) === star;
            const row = (
              <>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>{star}★</span>
                <span style={{ height: '8px', borderRadius: '999px', overflow: 'hidden', background: 'rgba(87,94,207,0.1)' }}>
                  <span style={{ display: 'block', width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #8b7bff 0%, #575ecf 100%)' }} />
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{count}</span>
              </>
            );
            if (!onRatingFilter) {
              return (
                <div key={star} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr) 34px', gap: '10px', alignItems: 'center' }}>
                  {row}
                </div>
              );
            }
            return (
              <button
                key={star}
                type="button"
                onClick={() => onRatingFilter(star)}
                aria-pressed={selected}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px minmax(0,1fr) 34px',
                  gap: '10px',
                  alignItems: 'center',
                  border: 0,
                  background: selected ? 'rgba(87,94,207,0.12)' : 'transparent',
                  borderRadius: 8,
                  padding: '2px 4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {row}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  const reviewItems = reviews.map((review, index) => (
    <Layout
      key={review.comment_id || index}
      settings={settings}
      layoutType={layoutType}
      review={review}
      reviews={reviews}
      animationConfig={animationConfig}
    />
  ));

  const empty = (
    <div className="text-center py-12" style={{ color: '#9ca3af' }}>
      <IconUser size={48} className="mx-auto mb-4 opacity-50" />
      <p>{translations.noReviewsFound}</p>
    </div>
  );

  if (layout === 'list') {
    return (
      <div>
        {histogram}
        {reviews.length ? (
          <div className="tsreview-reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: `${columnGap}px` }}>
            {reviewItems}
          </div>
        ) : empty}
      </div>
    );
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
    gap: `${columnGap}px`,
  };

  return (
    <div>
      {histogram}
      {reviews.length ? (
        <div className="tsreview-reviews-grid" style={gridStyle}>
          {reviewItems}
        </div>
      ) : empty}
    </div>
  );
}

export default ReviewView;
