import React from "react";
import { Rate } from 'antd';
import { CheckCircle, Calendar, Gift } from 'lucide-react';
import "./style.css";

const Card = ({
  settings,
  review = {},
  animationConfig,
}) => {
  // Extract review data
  const reviewerName = review.reviewer_name || review.author || 'Anonymous';
  const reviewTitle = review.review_title || review.title || '';
  const reviewContent = review.review_content || review.content || review.excerpt || '';
  const rating = review.rating || 0;
  const reviewDate = review.review_date || review.date;
  const isVerified = review.verified || review.is_verified;
  const avatarUrl = review.avatar_url || review.reviewer_avatar || '';
  const avatarMode = settings?.avatar_mode || 'standard';
  const verifiedLabel = review.verified_label || 'Verified';
  const showIncentivizedBadge = settings?.review_discount_enabled && settings?.incentivized_badge;
  const incentivizedLabel = review.incentivized_label || 'Incentivized';
  const reviewerInitial = reviewerName.charAt(0).toUpperCase();

  const starColor = settings?.star_color || '#f5c518';
  const backgroundColor = settings?.background_color || '#ffffff';
  const textColor = settings?.text_color || '#333333';
  const borderRadius = settings?.border_radius || 12;
  const showImages = settings?.show_images !== false;
  const showRatings = settings?.show_ratings !== false;
  const showDates = settings?.show_dates !== false;
  const showVerifiedBadge = settings?.show_verified_badge !== false;

  const renderStars = (rating) => {
    return (
      <div className="tsreview-card-stars" style={{ color: starColor }}>
        <Rate disabled value={rating} style={{ fontSize: '14px' }} />
      </div>
    );
  };

  const renderContent = () => (
    <div className="tsreview-card-layout" style={{
      backgroundColor,
      borderRadius: `${borderRadius}px`,
    }}>
      {/* Header: Avatar and Name */}
      <div className="tsreview-card-header">
        {showImages && avatarMode !== 'hidden' ? (
          avatarMode === 'initials' || !avatarUrl ? (
            <div className="tsreview-card-avatar flex items-center justify-center bg-primary/10 text-primary font-semibold">
              {reviewerInitial}
            </div>
          ) : (
            <div
              className="tsreview-card-avatar"
              style={{
                backgroundImage: `url(${avatarUrl})`,
              }}
            />
          )
        ) : null}
        <div className="tsreview-card-header-info">
          <h4 className="tsreview-card-name" style={{ color: textColor }}>
            {reviewerName}
          </h4>
          <div className="tsreview-card-badges">
            {isVerified && showVerifiedBadge && (
              <span className="tsreview-card-verified">
                <CheckCircle size={12} />
                {verifiedLabel}
              </span>
            )}
            {review.incentivized && showIncentivizedBadge ? (
              <span className="tsreview-card-verified" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <Gift size={12} />
                {incentivizedLabel}
              </span>
            ) : null}
            {showDates && reviewDate && (
              <div className="tsreview-card-date">
                <Calendar size={12} />
                {new Date(reviewDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating */}
      {showRatings && rating > 0 && (
        <div className="tsreview-card-rating">{renderStars(rating)}</div>
      )}

      {/* Review Title */}
      {reviewTitle && (
        <h5 className="tsreview-card-title" style={{ color: textColor }}>
          "{reviewTitle}"
        </h5>
      )}

      {/* Review Content */}
      {reviewContent && (
        <p className="tsreview-card-content">
          {reviewContent}
        </p>
      )}
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

export default Card;
