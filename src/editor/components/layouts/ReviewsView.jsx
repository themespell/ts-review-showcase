import React from 'react';

function ReviewsView({ reviews, settings }) {
  const layout = settings.layout || 'grid';
  const columns = settings.columns || 3;
  const columnGap = settings.column_gap || 20;
  const showImages = settings.show_images !== false;
  const showRatings = settings.show_ratings !== false;
  const showDates = settings.show_dates !== false;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1" style={{ color: settings.star_color || '#f5c518' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? '' : 'opacity-30'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderReview = (review) => (
    <div
      key={review.comment_id}
      className="border border-gray-200 p-4"
      style={{ borderRadius: settings.border_radius || 8 }}
    >
      {showImages && review.avatar_url && (
        <img
          src={review.avatar_url}
          alt={review.reviewer_name}
          className="w-12 h-12 rounded-full mb-3"
        />
      )}

      <h4 className="font-semibold mb-1">{review.reviewer_name}</h4>

      {showDates && (
        <span className="text-sm text-gray-500">
          {new Date(review.review_date).toLocaleDateString()}
        </span>
      )}

      {showRatings && renderStars(review.rating)}

      {review.review_title && (
        <h5 className="font-medium mt-3">{review.review_title}</h5>
      )}

      <p className="text-gray-600 mt-2">{review.review_content}</p>

      {review.verified && (
        <span className="text-xs text-green-600 mt-2 inline-block">
          ✓ {tsreview_i18n?.verified_purchase || 'Verified Purchase'}
        </span>
      )}
    </div>
  );

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {tsreview_i18n?.no_reviews_found || 'No reviews found'}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {reviews.map(renderReview)}
      </div>
    );
  }

  // Grid or Masonry layout
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${columnGap}px`,
  };

  return (
    <div style={gridStyle}>
      {reviews.map(renderReview)}
    </div>
  );
}

export default ReviewsView;
