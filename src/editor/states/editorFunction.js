import { create } from 'zustand';
import editorStore from './editorStore';
import { updateData } from '../../common/services/updateData';
import { toastNotification } from '../../common/utils/toastNotification';

const editorFunction = create((set) => ({
    // saveSettings: (key, value) => {
    //     const updateState = editorStore.getState().updateState;
    //     updateState(key, value);
    // },

    saveSettings: (key, value) => {
        const updateState = editorStore.getState().updateState;
        const keyParts = key.split('['); // Split the key into parts to handle nested updates

        if (keyParts.length > 1) {
            // Handle nested keys for responsive settings
            const nestedKey = keyParts
                .map(part => part.replace(']', '')) // Remove the closing brackets
                .join('.'); // Join parts with dots for deep update
            updateState(nestedKey, value); // Call updateState with the formatted nested key
        } else {
            updateState(key, value); // For default key (non-responsive)
        }
    },

    updateSettings: (action) => {
        const state = editorStore.getState();
        const { postID, postType, ...restState } = state;

        const data = Object.keys(restState)
            .filter((key) => typeof restState[key] !== 'function')
            .reduce((obj, key) => {
                obj[key] = restState[key];
                return obj;
            }, {});

        if (postID) {
            updateData(action, data, postID)
                .then((response) => {
                    toastNotification('success', `Successfully Updated`, `The settings have been successfully updated.`);
                    console.log('Tools updated successfully on the server:', response);

                    // Optionally, update local state after server update
                    Object.keys(data).forEach((key) => {
                        editorStore.getState().updateState(key, data[key]);
                    });
                })
                .catch((error) => {
                    toastNotification('error', `Update Failed`, `The settings have failed to update. Error: ${error}`);
                    console.error('Failed to update settings on the server:', error);
                });
        } else {
            console.log('No postID available. Cannot update settings.');
        }
    }
}));

export default editorFunction;