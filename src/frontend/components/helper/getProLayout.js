import proLayouts from "../../../pro_support/proLayouts.js";

export function getProLayout(settings) {
    if (settings?.selectedLayout?.type === 'pro') {
        const layout = proLayouts(settings.selectedLayout?.value);
        return layout.Frontend;
    }
    return null;
}