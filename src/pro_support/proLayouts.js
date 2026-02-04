const formatName = (name) => {
    return name.replace(/([A-Z])/g, ' $1').trim();
};

function proLayouts(selectedLayout) {
    const isPro = !!tsreview_settings.is_pro ?? null;
    const isLicenseInactive = !!window.tsTeamPro?.is_licence_inactive ?? null;

    if (!isPro || isLicenseInactive) {
        return [];
    }

    const layouts = window.tsTeamPro?.Layouts;

    if (!layouts) {
        console.error("window.tsTeamPro.Layouts is not defined.");
        return [];
    }

    if (selectedLayout) {
        const layout = layouts[selectedLayout];
        if (!layout) {
            console.error(`Layout "${selectedLayout}" not found in window.tsTeamPro.Layouts.`);
            return null;
        }

        // Ensure the layout has a Frontend component
        if (typeof layout.Frontend !== "function") {
            console.error(`Invalid layout configuration for "${selectedLayout}". Missing Frontend.`);
            return null;
        }

        // Provide a fallback for missing Editor or register_controls
        if (!layout.Editor || typeof layout.Editor !== "function") {
            console.warn(`No Editor or register_controls found for Pro Layout: ${selectedLayout}`);
            layout.Editor = () => ({ controls: [] }); // Fallback to empty controls
        }

        return layout;
    } else {
        // Return all layouts with metadata
        return Object.keys(layouts).map((layoutName) => ({
            label: formatName(layoutName),
            value: layoutName,
            type: "pro",
            category: layouts[layoutName].category,
        }));
    }
}

export default proLayouts;
// const formatName = (name) => {
//     return name.replace(/([A-Z])/g, ' $1').trim();
// };
//
// function proLayouts(selectedLayout) {
//     const isPro = !!tsreview_settings.is_pro ?? null;
//     const isLicenseInactive = !!window.tsTeamPro?.is_licence_inactive ?? null;
//
//     if (!isPro) {
//         return [];
//     }
//
//     else if (isLicenseInactive) {
//         return [];
//     }
//
//
//
//     else {
//         if (selectedLayout) {
//             const layout = window.tsTeamPro?.Layouts[selectedLayout];
//             return layout;
//         }
//         else {
//             const layouts = window.tsTeamPro?.Layouts;
//             const layoutNames = Object.keys(layouts).map((layoutName) => ({
//                 label: formatName(layoutName),
//                 value: layoutName,
//                 type: 'pro',
//                 category: layouts[layoutName].category
//             }));
//
//             return layoutNames;
//         }
//     }
// }
//
// export default proLayouts;