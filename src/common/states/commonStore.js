import { create } from 'zustand'

const commonStore = create((set) => ({
    createModal: false,
    updateModal: false,
    crudModal: false,
    reloadData: null,

    saveSettings: (key, value) => {
        set((state) => {
            const keys = key.split('.');
            if (keys.length === 1) {
                return {
                    ...state,
                    [key]: value,
                };
            }

            // Update nested state using deepUpdate function
            const deepUpdate = (obj, keys) => {
                const [firstKey, ...restKeys] = keys;
                if (restKeys.length === 0) {
                    return { ...obj, [firstKey]: value };
                }

                return {
                    ...obj,
                    [firstKey]: deepUpdate(obj[firstKey] !== undefined ? obj[firstKey] : {}, restKeys),
                };
            };
            return deepUpdate(state, keys);
        });
    },
}));

export default commonStore;