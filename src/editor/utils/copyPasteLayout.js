import {toastNotification} from "../../common/utils/toastNotification.js";

const CLIPBOARD_NAMESPACE = "tsreview-editor";

const META_KEYS = ["postID", "postType", "updateState", "common"];
const LAYOUT_KEYS = [
    "selectedView",
    "selectedLayout",
    "containerSettings",
    "columnSettings",
    "carouselSettings",
    "marqueeSettings",
    "showcaseDetails"
];

const sanitizeSettings = (allSettings) => {
    const settingsToCopy = { ...allSettings };

    META_KEYS.forEach((key) => {
        delete settingsToCopy[key];
    });

    return settingsToCopy;
};

const getPayloadByMode = (allSettings, mode = "design") => {
    const sanitizedSettings = sanitizeSettings(allSettings);

    if (mode === "layout") {
        return LAYOUT_KEYS.reduce((accumulator, key) => {
            if (sanitizedSettings[key] !== undefined) {
                accumulator[key] = sanitizedSettings[key];
            }

            return accumulator;
        }, {});
    }

    if (mode === "style") {
        return Object.keys(sanitizedSettings).reduce((accumulator, key) => {
            if (!LAYOUT_KEYS.includes(key)) {
                accumulator[key] = sanitizedSettings[key];
            }

            return accumulator;
        }, {});
    }

    return sanitizedSettings;
};

const getModeLabel = (mode) => {
    if (mode === "style") {
        return "Style";
    }

    if (mode === "layout") {
        return "Layout";
    }

    return "Design";
};

const parseClipboardPayload = (serializedSettings) => {
    const parsedPayload = JSON.parse(serializedSettings);

    if (parsedPayload?.namespace === CLIPBOARD_NAMESPACE && parsedPayload?.settings) {
        return parsedPayload;
    }

    return {
        namespace: CLIPBOARD_NAMESPACE,
        mode: "design",
        settings: parsedPayload
    };
};

export const handleCopySettings = async (allSettings, mode = "design") => {
    try {
        const payload = {
            namespace: CLIPBOARD_NAMESPACE,
            mode,
            settings: getPayloadByMode(allSettings, mode)
        };
        const serializedSettings = JSON.stringify(payload);
        await navigator.clipboard.writeText(serializedSettings);

        toastNotification(
            'success',
            `${getModeLabel(mode)} Copied`,
            `The ${getModeLabel(mode).toLowerCase()} has copied successfully`
        );
    } catch (error) {
        console.error("Failed to copy settings to clipboard:", error);
    }
};

export const handlePasteSettings = async (saveSettings, mode = "design") => {
    try {
        const serializedSettings = await navigator.clipboard.readText();
        const payload = parseClipboardPayload(serializedSettings);
        const pastedSettings = payload.settings || {};

        if (mode !== "design" && payload.mode !== mode) {
            toastNotification(
                'warning',
                `${getModeLabel(mode)} mismatch`,
                `Clipboard has ${getModeLabel(payload.mode).toLowerCase()} data. Copy ${getModeLabel(mode).toLowerCase()} first.`
            );
            return;
        }

        Object.keys(pastedSettings).forEach((key) => {
            saveSettings(key, pastedSettings[key]);
        });

        toastNotification(
            'success',
            `${getModeLabel(mode)} Pasted`,
            `The ${getModeLabel(mode).toLowerCase()} has pasted successfully`
        );
    } catch (error) {
        console.error("Failed to paste settings from clipboard:", error);
    }
};
