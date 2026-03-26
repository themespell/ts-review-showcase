/**
 * Form Builder Helper Functions
 */

/**
 * Check if a field type is Pro only
 */
export const isProFieldType = (fieldType) => {
    const proFieldTypes = [
        'rating_emoji',
        'radio',
        'checkbox',
        'select',
        'toggle',
        'textarea_split',
        'date'
    ];
    return proFieldTypes.includes(fieldType);
};

/**
 * Get field icon based on field type
 */
export const getFieldIcon = (fieldType) => {
    const icons = {
        text: 'T',
        textarea: '¶',
        email: '@',
        rating: '★',
        rating_emoji: '😊',
        file: '📎',
        radio: '●',
        checkbox: '☑',
        select: '▼',
        toggle: '◯',
        textarea_split: '⇄',
        date: '📅'
    };
    return icons[fieldType] || '•';
};

/**
 * Generate CSS from style object
 */
export const generateCSS = (styles, formId) => {
    let css = `.ts-form-${formId} {`;

    // Container styles
    if (styles.container) {
        Object.entries(styles.container).forEach(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            if (cssKey !== 'boxshadow' && cssKey !== 'animation') {
                css += `${cssKey}: ${value};`;
            }
        });
    }

    css += '}';

    // Field styles
    if (styles.field) {
        css += `.ts-form-${formId} .ts-form-field {`;
        Object.entries(styles.field).forEach(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `${cssKey}: ${value};`;
        });
        css += '}';
    }

    // Label styles
    if (styles.label) {
        css += `.ts-form-${formId} .ts-form-label {`;
        Object.entries(styles.label).forEach(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `${cssKey}: ${value};`;
        });
        css += '}';
    }

    // Input styles
    if (styles.input) {
        css += `.ts-form-${formId} .ts-form-input, .ts-form-${formId} textarea, .ts-form-${formId} select {`;
        Object.entries(styles.input).forEach(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `${cssKey}: ${value};`;
        });
        css += '}';
    }

    // Button styles
    if (styles.button) {
        css += `.ts-form-${formId} .ts-form-submit {`;
        Object.entries(styles.button).forEach(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `${cssKey}: ${value};`;
        });
        css += '}';
    }

    return css;
};

/**
 * Validate form fields
 */
export const validateForm = (fields, values) => {
    const errors = {};

    fields.forEach(field => {
        if (field.required && !values[field.id]) {
            errors[field.id] = `${field.label} is required`;
        }

        // Email validation
        if (field.type === 'email' && values[field.id]) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(values[field.id])) {
                errors[field.id] = 'Please enter a valid email address';
            }
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Export form configuration
 */
export const exportFormConfig = (form) => {
    return JSON.stringify(form, null, 2);
};

/**
 * Import form configuration
 */
export const importFormConfig = (configString) => {
    try {
        return JSON.parse(configString);
    } catch (error) {
        console.error('Invalid form configuration:', error);
        return null;
    }
};

/**
 * Check if form template is Pro
 */
export const isProTemplate = (template) => {
    return template.type === 'pro';
};

/**
 * Get Pro badge JSX
 */
export const getProBadge = (template) => {
    if (isProTemplate(template)) {
        return (
            <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                PRO
            </span>
        );
    }
    return null;
};
