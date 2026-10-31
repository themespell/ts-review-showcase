// Views and details styles that TS Review Showcase Pro adds through
// window.tsReviewPro.Views and window.tsReviewPro.Details. The free plugin
// ships none of them; it only renders what Pro registers.

function proEnabled() {
    const isPro = !!window.tsreview_settings?.is_pro;
    const isLicenseInactive = !!window.tsReviewPro?.is_licence_inactive;
    return isPro && !isLicenseInactive;
}

function collect(key) {
    const items = proEnabled() ? window.tsReviewPro?.[key] : null;
    return items && typeof items === 'object' ? items : {};
}

function toOptions(items) {
    return Object.keys(items)
        .filter((value) => typeof items[value]?.Component === 'function')
        .map((value) => ({ label: items[value].label || value, value, type: 'pro' }));
}

export function getProView(value) {
    const view = collect('Views')[value];
    return view && typeof view.Component === 'function' ? view : null;
}

export function getProDetails(value) {
    const details = collect('Details')[value];
    return details && typeof details.Component === 'function' ? details : null;
}

export function proViewOptions() {
    return toOptions(collect('Views'));
}

export function proDetailsOptions() {
    return toOptions(collect('Details'));
}
