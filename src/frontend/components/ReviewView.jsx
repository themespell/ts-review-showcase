import React, { useMemo } from "react";
import { User } from 'lucide-react';
import Layout from './layouts/Layout';
import { getAnimationClasses } from './helper/motionControl.js';

function ReviewView({ reviews = [], settings = {}, viewport = 'desktop', isEditor = false }) {
  // Get settings with defaults
  const layout = settings.layout || 'grid';
  const columns = settings.columns || 3;
  const columnGap = settings.column_gap || 20;
  const layoutType = settings.selectedLayout?.value || 'Card';

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
        {reviews.map((review, index) => (
          <Layout
            key={review.comment_id || index}
            settings={settings}
            layoutType={layoutType}
            review={review}
            reviews={reviews}
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
    <div className="tsreview-reviews-grid" style={gridStyle}>
      {reviews.map((review, index) => (
        <Layout
          key={review.comment_id || index}
          settings={settings}
          layoutType={layoutType}
          review={review}
          reviews={reviews}
          animationConfig={animationConfig}
        />
      ))}
    </div>
  );
}

export default ReviewView;
