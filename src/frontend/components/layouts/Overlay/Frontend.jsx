import React from "react";
import { Rate } from 'antd';
import { User, CheckCircle, Quote } from 'lucide-react';
import "./style.css";

const Overlay = ({
  settings,
  review = {},
  animationConfig,
}) => {
  // Extract review data
  const reviewerName = review.reviewer_name || review.author || 'Anonymous';
  const reviewTitle = review.review_title || review.title || '';
  const reviewContent = review.review_content || review.content || review.excerpt || '';
  const rating = review.rating || 0;
  const isVerified = review.verified || review.is_verified;
  const avatarUrl = review.avatar_url || review.reviewer_avatar || '';

  const starColor = settings?.star_color || '#f5c518';
  const overlayBgColor = settings?.overlay_background_color || 'rgba(0,0,0,0.8)';
  const textColor = settings?.text_color || '#ffffff';
  const borderRadius = settings?.border_radius || 16;
  const showImages = settings?.show_images !== false;
  const showRatings = settings?.show_ratings !== false;
  const showVerifiedBadge = settings?.show_verified_badge !== false;

  const renderStars = (rating) => {
    return (
      <div className="tsreview-overlay-stars" style={{ color: starColor }}>
        <Rate disabled value={rating} style={{ fontSize: '16px' }} />
      </div>
    );
  };

  const renderContent = () => (
    <div className="tsreview-overlay-layout">
      {/* Background Image */}
      <div
        className="tsreview-overlay-background"
        style={{
          backgroundImage: avatarUrl
            ? `url(${avatarUrl})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: `${borderRadius}px`,
        }}
      />

      {/* Overlay - Visible on hover */}
      <div
        className="tsreview-overlay-layout__overlay"
        style={{
          backgroundColor: overlayBgColor,
          borderRadius: `${borderRadius}px`,
        }}
      >
        {/* Quote Icon */}
        <Quote
          size={32}
          className="tsreview-overlay-quote"
          style={{ color: textColor }}
        />

        {/* Reviewer Name */}
        <h4
          className="tsreview-overlay-name"
          style={{ color: textColor }}
        >
          {reviewerName}
        </h4>

        {/* Verified Badge */}
        {isVerified && showVerifiedBadge && (
          <span
            className="tsreview-overlay-verified"
          >
            <CheckCircle size={14} className="mr-1" />
            Verified Reviewer
          </span>
        )}

        {/* Rating */}
        {showRatings && rating > 0 && (
          <div className="tsreview-overlay-rating">
            {renderStars(rating)}
          </div>
        )}

        {/* Review Content */}
        {reviewContent && (
          <p
            className="tsreview-overlay-content"
            style={{ color: textColor, opacity: 0.9 }}
          >
            "{reviewContent}"
          </p>
        )}

        {/* Review Title */}
        {reviewTitle && (
          <p
            className="tsreview-overlay-title"
            style={{ color: textColor, opacity: 0.7 }}
          >
            {reviewTitle}
          </p>
        )}
      </div>

      {/* Default state - Always visible info */}
      <div className="tsreview-overlay-layout__default">
        {showImages && avatarUrl ? (
          <div
            className="tsreview-overlay-avatar"
            style={{
              backgroundImage: `url(${avatarUrl})`,
            }}
          />
        ) : (
          <div
            className="tsreview-overlay-avatar-placeholder"
          >
            {reviewerName.charAt(0).toUpperCase()}
          </div>
        )}
        <h4
          className="tsreview-overlay-default-name"
          style={{ color: '#ffffff' }}
        >
          {reviewerName}
        </h4>
        {showRatings && rating > 0 && (
          <div className="tsreview-overlay-rating">{renderStars(rating)}</div>
        )}
      </div>
    </div>
  );

  // Handle animation
  if (!animationConfig || animationConfig.value === 'none') {
    return renderContent();
  }

  if (animationConfig.type === "single") {
    return <div className={animationConfig.class}>{renderContent()}</div>;
  }

  if (animationConfig.type === "wrapper") {
    return (
      <div className={animationConfig.parent}>
        <div className={animationConfig.wrapper}>{renderContent()}</div>
      </div>
    );
  }

  return renderContent();
};

export default Overlay;
