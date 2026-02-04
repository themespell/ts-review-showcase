import {toastNotification} from "../../common/utils/toastNotification.js";

export const handleCopySettings = async (allSettings) => {
    try {
        const { postID, ...settingsToCopy } = allSettings;
        const serializedSettings = JSON.stringify(settingsToCopy);
        await navigator.clipboard.writeText(serializedSettings);
        toastNotification('success', `Design Copied`, `The design has copied successfully`);
    } catch (error) {
        console.error("Failed to copy settings to clipboard:", error);
    }
};

export const handlePasteSettings = async (saveSettings) => {
    try {
        const serializedSettings = await navigator.clipboard.readText();
        const pastedSettings = JSON.parse(serializedSettings);
        Object.keys(pastedSettings).forEach((key) => {
            saveSettings(key, pastedSettings[key]);
        });
        toastNotification('success', `Design Pasted`, `The design has pasted successfully`);
    } catch (error) {
        console.error("Failed to paste settings from clipboard:", error);
    }
};
