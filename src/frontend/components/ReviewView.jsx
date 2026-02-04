import React, { useMemo } from "react";
import { Rate, Avatar } from 'antd';
import { User, Star, CheckCircle, Calendar } from 'lucide-react';

function ReviewView({ reviews = [], settings = {}, viewport = 'desktop', isEditor = false }) {
  // Get settings with defaults
  const layout = settings.layout || 'grid';
  const columns = settings.columns || 3;
  const columnGap = settings.column_gap || 20;
  const showImages = settings.show_images !== false;
  const showRatings = settings.show_ratings !== false;
  const showDates = settings.show_dates !== false;
  const showProductName = settings.show_product_name !== false;
  const showVerifiedBadge = settings.show_verified_badge !== false;
  const starColor = settings.star_color || '#f5c518';
  const borderRadius = settings.border_radius || 8;
  const backgroundColor = settings.background_color || '#ffffff';
  const textColor = settings.text_color || '#333333';

  // Calculate responsive columns based on viewport
  const getResponsiveColumns = () => {
    if (viewport === 'mobile') return 1;
    if (viewport === 'tablet') return Math.min(columns, 2);
    return columns;
  };

  const responsiveColumns = getResponsiveColumns();

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1" style={{ color: starColor }}>
        <Rate disabled value={rating} style={{ fontSize: '14px' }} />
      </div>
    );
  };

  // Render single review card
  const renderReviewCard = (review, index) => {
    const reviewerName = review.reviewer_name || 'Anonymous';
    const reviewTitle = review.review_title || '';
    const reviewContent = review.review_content || '';
    const rating = review.rating || 0;
    const reviewDate = review.review_date;
    const isVerified = review.verified;
    const productName = review.product_name || '';
    const productImage = review.product_image || '';
    const avatarUrl = review.avatar_url || '';

    return (
      <div
        key={review.comment_id || index}
        className="tsreview-review-card"
        style={{
          backgroundColor,
          borderRadius: `${borderRadius}px`,
          padding: '20px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: '100%',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Header: Avatar and Name */}
        <div className="flex items-start gap-3">
          {showImages && (
            <Avatar
              src={avatarUrl}
              icon={<User size={20} />}
              size={48}
              style={{ flexShrink: 0 }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className="font-semibold truncate"
                style={{ color: textColor, margin: 0 }}
              >
                {reviewerName}
              </h4>
              {isVerified && showVerifiedBadge && (
                <span className="flex items-center text-green-600 text-xs">
                  <CheckCircle size={12} className="mr-1" />
                  Verified
                </span>
              )}
            </div>

            {showDates && reviewDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Calendar size={12} />
                {new Date(reviewDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        {showRatings && rating > 0 && (
          <div>{renderStars(rating)}</div>
        )}

        {/* Review Title */}
        {reviewTitle && (
          <h5
            className="font-medium"
            style={{ color: textColor, margin: 0 }}
          >
            {reviewTitle}
          </h5>
        )}

        {/* Review Content */}
        {reviewContent && (
          <p
            className="text-gray-600 text-sm leading-relaxed"
            style={{ margin: 0, flexGrow: 1 }}
          >
            {reviewContent}
          </p>
        )}

        {/* Product Info */}
        {showProductName && productName && (
          <div className="pt-2 mt-auto border-t border-gray-100">
            <div className="flex items-center gap-2">
              {productImage && (
                <img
                  src={productImage}
                  alt={productName}
                  className="w-8 h-8 object-cover rounded"
                />
              )}
              <span className="text-xs text-gray-500">
                Reviewed: {productName}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

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
        {reviews.map((review, index) => renderReviewCard(review, index))}
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
      {reviews.map((review, index) => renderReviewCard(review, index))}
    </div>
  );
}

export default ReviewView;
