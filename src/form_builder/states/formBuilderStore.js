import { create } from 'zustand';
import { getFormTemplates, getFormTemplateById } from '../form_templates';
import { saveFormSettings, createForm, fetchFormById } from '../services/formBuilderService';

/**
 * Form Builder Zustand Store
 * Manages form builder state including templates, current form, and editing state
 */
const useFormBuilderStore = create((set, get) => ({
    // Current form being edited
    currentForm: null,
    formPostId: null,
    formId: null,
    formName: '',
    isSaving: false,

    // Available templates
    templates: getFormTemplates(),

    // UI State
    currentView: 'templates', // 'templates' | 'editor'
    selectedField: null,
    draggedField: null,

    // Form fields
    fields: [],

    // Form settings
    formSettings: {
        submitButtonText: 'Submit Review',
        successMessage: 'Thank you for your review!',
        requireLogin: false,
        autoApprove: true,
        enableAnimation: false,
        multiStep: false
    },

    // Form styles
    formStyles: {
        container: {
            backgroundColor: '#f9fafb',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
        },
        field: {
            marginBottom: '16px'
        },
        label: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
        },
        input: {
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '10px 14px'
        },
        button: {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '12px 24px',
            fontWeight: '600'
        }
    },

    // Actions
    setView: (view) => set({ currentView: view }),

    setCurrentForm: (formId) => set((state) => {
        const template = getFormTemplateById(formId);
        if (template) {
            return {
                currentForm: template,
                formId: template.id,
                formName: template.name,
                fields: [...template.fields],
                formSettings: { ...template.settings },
                formStyles: JSON.parse(JSON.stringify(template.styles)),
                currentView: 'editor'
            };
        }
        return state;
    }),

    // Load existing form from database
    loadForm: (postId) => {
        fetchFormById(postId, (response) => {
            if (response.success && response.data) {
                const { form_data, title } = response.data;
                set({
                    formPostId: postId,
                    formName: title,
                    formId: form_data?.formId || '',
                    fields: form_data?.fields || [],
                    formSettings: form_data?.formSettings || get().formSettings,
                    formStyles: form_data?.formStyles || get().formStyles,
                    currentView: 'editor',
                    currentForm: form_data
                });
            }
        });
    },

    createNewForm: (templateId) => set((state) => {
        const template = getFormTemplateById(templateId);
        if (template) {
            return {
                currentForm: template,
                formId: template.id,
                formName: template.name,
                fields: [...template.fields],
                formSettings: { ...template.settings },
                formStyles: JSON.parse(JSON.stringify(template.styles)),
                currentView: 'editor',
                formPostId: null
            };
        }
        return state;
    }),

    setFormName: (name) => set({ formName: name }),

    updateField: (fieldId, updates) => set((state) => ({
        fields: state.fields.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
        )
    })),

    addField: (fieldType) => set((state) => {
        const newField = {
            id: `field_${Date.now()}`,
            type: fieldType,
            label: `New ${fieldType} Field`,
            placeholder: '',
            required: false,
            visible: true,
            order: state.fields.length + 1
        };

        // Set default options for certain field types
        if (fieldType === 'radio' || fieldType === 'select') {
            newField.options = ['Option 1', 'Option 2', 'Option 3'];
        }

        return {
            fields: [...state.fields, newField],
            selectedField: newField.id
        };
    }),

    removeField: (fieldId) => set((state) => ({
        fields: state.fields.filter(field => field.id !== fieldId),
        selectedField: state.selectedField === fieldId ? null : state.selectedField
    })),

    duplicateField: (fieldId) => set((state) => {
        const fieldToDuplicate = state.fields.find(field => field.id === fieldId);
        if (fieldToDuplicate) {
            const newField = {
                ...fieldToDuplicate,
                id: `field_${Date.now()}`,
                label: `${fieldToDuplicate.label} (Copy)`,
                order: state.fields.length + 1
            };
            return {
                fields: [...state.fields, newField],
                selectedField: newField.id
            };
        }
        return state;
    }),

    setSelectedField: (fieldId) => set({ selectedField: fieldId }),

    reorderFields: (newOrder) => set({ fields: newOrder }),

    updateFormSettings: (settings) => set((state) => ({
        formSettings: { ...state.formSettings, ...settings }
    })),

    updateFormStyles: (path, value) => set((state) => {
        const newStyles = JSON.parse(JSON.stringify(state.formStyles));
        const keys = path.split('.');
        let current = newStyles;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;

        return { formStyles: newStyles };
    }),

    setDraggedField: (fieldId) => set({ draggedField: fieldId }),

    resetForm: () => set({
        currentForm: null,
        formPostId: null,
        formId: null,
        formName: '',
        fields: [],
        formSettings: {
            submitButtonText: 'Submit Review',
            successMessage: 'Thank you for your review!',
            requireLogin: false,
            autoApprove: true
        },
        formStyles: {
            container: {
                backgroundColor: '#f9fafb',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
            },
            field: {
                marginBottom: '16px'
            },
            label: {
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
            },
            input: {
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px 14px'
            },
            button: {
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '12px 24px',
                fontWeight: '600'
            }
        },
        selectedField: null,
        currentView: 'templates'
    }),

    /**
     * Save form to database
     */
    saveForm: () => {
        const state = get();
        set({ isSaving: true });

        const formData = {
            formId: state.formId || `custom_${Date.now()}`,
            formName: state.formName,
            fields: state.fields,
            formSettings: state.formSettings,
            formStyles: state.formStyles
        };

        return new Promise((resolve, reject) => {
            const handleResponse = (response) => {
                set({ isSaving: false });

                if (response.success) {
                    set({
                        formPostId: response.data.post_id,
                        currentForm: formData
                    });
                    resolve(response);
                } else {
                    reject(response);
                }
            };

            if (state.formPostId) {
                // Update existing form
                saveFormSettings(state.formPostId, formData, handleResponse);
            } else {
                // Create new form
                createForm(state.formName, formData, (response) => {
                    if (response.success) {
                        set({ formPostId: response.data.post_id });
                    }
                    handleResponse(response);
                });
            }
        });
    }
}));

export default useFormBuilderStore;
