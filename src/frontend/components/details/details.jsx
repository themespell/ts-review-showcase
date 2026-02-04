import DetailsModal from "./Components/DetailsModal.jsx";
import DetailsDrawer from "./Components/DetailsDrawer.jsx";
import DetailsFullScreen from "./Components/DetailsFullScreen.jsx";

function Details({ settings, member }) {
    if (settings.selectedDetails?.value === 'none') {
        return null;
    }

    switch (settings.selectedDetails?.value) {
        case 'popup':
            return (
                <DetailsModal
                    member={member}
                />
            );
        case 'drawer':
            return (
                <DetailsDrawer
                    member={member}
                />
            );
        case 'fullscreen':
            return (
                <DetailsFullScreen
                    member={member}
                />
            );
        default:
            return null;
    }
}

export default Details;