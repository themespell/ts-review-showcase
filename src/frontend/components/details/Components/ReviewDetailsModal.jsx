import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ReviewDetailsBody from "./ReviewDetailsBody.jsx";

function ReviewDetailsModal({ review, settings, onClose }) {
    const closeRef = useRef(null);

    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKey);
        closeRef.current?.focus();
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return createPortal(
        <div
            className="tsreview-details-overlay"
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(17,24,39,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={review.review_title || review.reviewer_name || 'Review'}
                onClick={(event) => event.stopPropagation()}
                style={{ position: 'relative', background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', padding: 28, boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}
            >
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    style={{ position: 'absolute', top: 12, right: 12, border: 0, background: 'transparent', fontSize: 22, lineHeight: 1, cursor: 'pointer', color: '#6b7280' }}
                >
                    ✕
                </button>
                <ReviewDetailsBody review={review} settings={settings} />
            </div>
        </div>,
        document.body
    );
}

export default ReviewDetailsModal;
