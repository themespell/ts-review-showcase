import StarRating from "../../StarRating";
import { IconCheck, IconCalendar } from "../../icons";

// Full review content, shared by the popup and the details styles Pro adds.
function ReviewDetailsBody({ review = {}, settings = {}, dark = false }) {
    const name = review.reviewer_name || 'Anonymous';
    const showImages = settings.show_images !== false && settings.avatar_mode !== 'hidden';
    const showDates = settings.show_dates !== false;
    const showVerified = settings.show_verified_badge !== false;
    const starColor = settings.star_color || '#f5c518';
    const muted = dark ? 'rgba(255,255,255,0.7)' : '#6b7280';
    const strong = dark ? '#ffffff' : '#111827';

    return (
        <div className="tsreview-details-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                {showImages ? (
                    review.avatar_url && settings.avatar_mode !== 'initials' ? (
                        <img src={review.avatar_url} alt="" width={56} height={56} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <span aria-hidden="true" style={{ width: 56, height: 56, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(87,94,207,0.12)', color: '#575ecf', fontWeight: 600, fontSize: 22 }}>
                            {name.charAt(0).toUpperCase()}
                        </span>
                    )
                ) : null}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 18, color: strong }}>{name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13, color: muted }}>
                        {review.verified && showVerified ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <IconCheck size={12} />
                                {review.verified_label || 'Verified'}
                            </span>
                        ) : null}
                        {showDates && review.review_date ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <IconCalendar size={12} />
                                {new Date(review.review_date).toLocaleDateString()}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>

            {Number(review.rating) > 0 ? (
                <div style={{ marginBottom: 12 }}>
                    <StarRating value={review.rating} disabled color={starColor} size={18} />
                </div>
            ) : null}

            {review.review_title ? (
                <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px', color: strong }}>{review.review_title}</h3>
            ) : null}

            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7, margin: 0, color: dark ? 'rgba(255,255,255,0.9)' : '#374151' }}>
                {review.review_content}
            </p>

            {review.product_name ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : '#e5e7eb'}` }}>
                    {review.product_image ? (
                        <img src={review.product_image} alt="" width={44} height={44} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                    ) : null}
                    {review.product_link ? (
                        <a href={review.product_link} style={{ color: dark ? '#ffffff' : '#575ecf', fontWeight: 500 }}>{review.product_name}</a>
                    ) : (
                        <span style={{ color: strong }}>{review.product_name}</span>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default ReviewDetailsBody;
