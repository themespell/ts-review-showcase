import { useCallback, useState } from "react";
import ReviewDetailsModal from "./Components/ReviewDetailsModal.jsx";
import { getProDetails } from "../../../pro_support/proRegistry.js";

// Opens the showcase's details style when a review card is clicked.
// 'popup' ships with the free plugin; other styles come from Pro.
function useReviewDetails(settings = {}) {
    const [active, setActive] = useState(null);
    const style = settings.selectedDetails?.value || 'none';
    const DetailsComponent = style === 'popup' ? ReviewDetailsModal : getProDetails(style)?.Component;
    const close = useCallback(() => setActive(null), []);

    const wrap = (node, review, key) => {
        if (!DetailsComponent) {
            return node;
        }

        return (
            <div
                key={key}
                className="tsreview-details-trigger"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                style={{ cursor: 'pointer' }}
                onClick={() => setActive(review)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setActive(review);
                    }
                }}
            >
                {node}
            </div>
        );
    };

    const details = DetailsComponent && active
        ? <DetailsComponent review={active} settings={settings} onClose={close} />
        : null;

    // open() and enabled let views that cannot wrap cards (a table row) open details themselves.
    return { wrap, details, open: setActive, enabled: Boolean(DetailsComponent) };
}

export default useReviewDetails;
