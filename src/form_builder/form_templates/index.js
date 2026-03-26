/**
 * Form Templates for TS Review Showcase
 * Free and Pro form designs
 */

// Get Pro status
const isPro = window.tsreview_settings?.is_pro || false;
const isLicenseInactive = window.tsTeamPro?.is_licence_inactive || false;

/**
 * Free Form Templates
 */
const freeFormTemplates = [
    {
        id: 'classic',
        name: 'Classic Form',
        type: 'free',
        preview: 'classic-preview.jpg',
        description: 'Clean and simple form design',
        fields: [
            {
                id: 'rating',
                type: 'rating',
                label: 'Rating',
                required: true,
                visible: true,
                order: 1
            },
            {
                id: 'review_title',
                type: 'text',
                label: 'Review Title',
                placeholder: 'Summarize your review',
                required: true,
                visible: true,
                order: 2
            },
            {
                id: 'review_body',
                type: 'textarea',
                label: 'Review',
                placeholder: 'Share your experience with this product',
                required: true,
                visible: true,
                order: 3
            },
            {
                id: 'reviewer_name',
                type: 'text',
                label: 'Your Name',
                placeholder: 'Enter your name',
                required: true,
                visible: true,
                order: 4
            },
            {
                id: 'reviewer_email',
                type: 'email',
                label: 'Your Email',
                placeholder: 'Enter your email',
                required: true,
                visible: true,
                order: 5
            }
        ],
        styles: {
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
        settings: {
            submitButtonText: 'Submit Review',
            successMessage: 'Thank you for your review!',
            requireLogin: false,
            autoApprove: true
        }
    },
    {
        id: 'minimal',
        name: 'Minimal Form',
        type: 'free',
        preview: 'minimal-preview.jpg',
        description: 'Streamlined design with minimal elements',
        fields: [
            {
                id: 'rating',
                type: 'rating',
                label: 'Rating',
                required: true,
                visible: true,
                order: 1
            },
            {
                id: 'review_body',
                type: 'textarea',
                label: 'Your Review',
                placeholder: 'What did you think?',
                required: true,
                visible: true,
                order: 2
            },
            {
                id: 'reviewer_name',
                type: 'text',
                label: 'Name',
                placeholder: 'Your name',
                required: false,
                visible: true,
                order: 3
            }
        ],
        styles: {
            container: {
                backgroundColor: 'transparent',
                padding: '16px',
                borderRadius: '0',
                border: 'none'
            },
            field: {
                marginBottom: '12px'
            },
            label: {
                fontSize: '13px',
                fontWeight: '500',
                color: '#6b7280'
            },
            input: {
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px 12px'
            },
            button: {
                backgroundColor: '#000000',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '10px 20px',
                fontWeight: '500'
            }
        },
        settings: {
            submitButtonText: 'Submit',
            successMessage: 'Thanks for your feedback!',
            requireLogin: false,
            autoApprove: false
        }
    },
    {
        id: 'modern',
        name: 'Modern Form',
        type: 'free',
        preview: 'modern-preview.jpg',
        description: 'Contemporary design with shadows',
        fields: [
            {
                id: 'review_title',
                type: 'text',
                label: 'Review Title',
                placeholder: 'Summarize your review',
                required: true,
                visible: true,
                order: 1
            },
            {
                id: 'rating',
                type: 'rating',
                label: 'Rating',
                required: true,
                visible: true,
                order: 2
            },
            {
                id: 'review_body',
                type: 'textarea',
                label: 'Your Review',
                placeholder: 'Share your detailed experience',
                required: true,
                visible: true,
                order: 3
            },
            {
                id: 'reviewer_name',
                type: 'text',
                label: 'Your Name',
                placeholder: 'Enter your name',
                required: true,
                visible: true,
                order: 4
            },
            {
                id: 'reviewer_email',
                type: 'email',
                label: 'Email Address',
                placeholder: 'Enter your email',
                required: true,
                visible: true,
                order: 5
            },
            {
                id: 'attachments',
                type: 'file',
                label: 'Add Photos (Optional)',
                placeholder: '',
                required: false,
                visible: true,
                order: 6,
                maxFiles: 3
            }
        ],
        styles: {
            container: {
                backgroundColor: '#ffffff',
                padding: '32px',
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            },
            field: {
                marginBottom: '20px'
            },
            label: {
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937'
            },
            input: {
                backgroundColor: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                padding: '12px 16px',
                transition: 'all 0.2s'
            },
            inputFocus: {
                borderColor: '#6366f1',
                backgroundColor: '#ffffff'
            },
            button: {
                backgroundColor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '14px 28px',
                fontWeight: '600',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }
        },
        settings: {
            submitButtonText: 'Submit Review',
            successMessage: 'Thank you! Your review has been submitted.',
            requireLogin: false,
            autoApprove: true
        }
    }
];

/**
 * Pro Form Templates
 */
const proFormTemplates = [
    {
        id: 'elegant',
        name: 'Elegant Form',
        type: 'pro',
        preview: 'elegant-preview.jpg',
        description: 'Premium design with animations',
        fields: [
            {
                id: 'rating',
                type: 'rating',
                label: 'Overall Rating',
                required: true,
                visible: true,
                order: 1
            },
            {
                id: 'review_title',
                type: 'text',
                label: 'Review Title',
                placeholder: 'Summarize your experience',
                required: true,
                visible: true,
                order: 2
            },
            {
                id: 'review_body',
                type: 'textarea',
                label: 'Detailed Review',
                placeholder: 'Tell us about your experience',
                required: true,
                visible: true,
                order: 3
            },
            {
                id: 'reviewer_name',
                type: 'text',
                label: 'Your Name',
                placeholder: 'Enter your name',
                required: true,
                visible: true,
                order: 4
            },
            {
                id: 'reviewer_email',
                type: 'email',
                label: 'Email Address',
                placeholder: 'Enter your email',
                required: true,
                visible: true,
                order: 5
            },
            {
                id: 'attachments',
                type: 'file',
                label: 'Upload Photos/Videos',
                placeholder: '',
                required: false,
                visible: true,
                order: 6,
                maxFiles: 5,
                accept: 'image/*,video/*'
            },
            {
                id: 'recommend',
                type: 'radio',
                label: 'Would you recommend this product?',
                required: true,
                visible: true,
                order: 7,
                options: ['Yes, definitely', 'Maybe', 'No']
            },
            {
                id: 'pros_cons',
                type: 'textarea_split',
                label: 'Pros and Cons',
                required: false,
                visible: true,
                order: 8
            }
        ],
        styles: {
            container: {
                backgroundColor: '#ffffff',
                padding: '40px',
                borderRadius: '20px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                animation: 'fadeIn 0.5s ease'
            },
            field: {
                marginBottom: '24px'
            },
            label: {
                fontSize: '15px',
                fontWeight: '700',
                color: '#111827'
            },
            input: {
                backgroundColor: '#fafafa',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '14px 18px',
                transition: 'all 0.3s ease'
            },
            button: {
                backgroundColor: '#111827',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '16px 32px',
                fontWeight: '700',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s ease'
            }
        },
        settings: {
            submitButtonText: 'Submit Review',
            successMessage: 'Thank you for your detailed review!',
            requireLogin: false,
            autoApprove: true,
            enableAnimation: true
        }
    },
    {
        id: 'card-based',
        name: 'Card Based Form',
        type: 'pro',
        preview: 'card-preview.jpg',
        description: 'Multi-step card layout',
        fields: [
            {
                id: 'rating',
                type: 'rating',
                label: 'Step 1: Rate your experience',
                required: true,
                visible: true,
                order: 1
            },
            {
                id: 'review_title',
                type: 'text',
                label: 'Step 2: Add a title',
                placeholder: 'Summarize your review',
                required: true,
                visible: true,
                order: 2
            },
            {
                id: 'review_body',
                type: 'textarea',
                label: 'Step 3: Write your review',
                placeholder: 'Share your thoughts',
                required: true,
                visible: true,
                order: 3
            },
            {
                id: 'reviewer_name',
                type: 'text',
                label: 'Step 4: Your details',
                placeholder: 'Your name',
                required: true,
                visible: true,
                order: 4
            },
            {
                id: 'reviewer_email',
                type: 'email',
                label: '',
                placeholder: 'Your email',
                required: true,
                visible: true,
                order: 5
            },
            {
                id: 'attachments',
                type: 'file',
                label: 'Step 5: Add media (optional)',
                placeholder: '',
                required: false,
                visible: true,
                order: 6,
                maxFiles: 5
            }
        ],
        styles: {
            container: {
                backgroundColor: '#f8fafc',
                padding: '0',
                borderRadius: '16px',
                border: 'none'
            },
            card: {
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            },
            field: {
                marginBottom: '0'
            },
            label: {
                fontSize: '16px',
                fontWeight: '700',
                color: '#0f172a'
            },
            input: {
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px'
            },
            button: {
                backgroundColor: '#0ea5e9',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '14px 28px',
                fontWeight: '600'
            },
            progressIndicator: true,
            stepNavigation: true
        },
        settings: {
            submitButtonText: 'Complete Review',
            successMessage: 'Review completed successfully!',
            requireLogin: false,
            autoApprove: true,
            multiStep: true
        }
    },
    {
        id: 'interactive',
        name: 'Interactive Form',
        type: 'pro',
        preview: 'interactive-preview.jpg',
        description: 'Dynamic and engaging form experience',
        fields: [
            {
                id: 'rating',
                type: 'rating_emoji',
                label: 'How was your experience?',
                required: true,
                visible: true,
                order: 1
            },
            {
                id: 'review_body',
                type: 'textarea',
                label: 'Tell us more',
                placeholder: 'Share your experience...',
                required: true,
                visible: true,
                order: 2
            },
            {
                id: 'reviewer_name',
                type: 'text',
                label: 'Your Name',
                placeholder: 'What should we call you?',
                required: true,
                visible: true,
                order: 3
            },
            {
                id: 'reviewer_email',
                type: 'email',
                label: 'Email',
                placeholder: 'Your email address',
                required: true,
                visible: true,
                order: 4
            },
            {
                id: 'attachments',
                type: 'file',
                label: 'Add photos',
                placeholder: '',
                required: false,
                visible: true,
                order: 5,
                maxFiles: 4
            },
            {
                id: 'recommend',
                type: 'toggle',
                label: 'Recommend this product?',
                required: false,
                visible: true,
                order: 6
            }
        ],
        styles: {
            container: {
                backgroundColor: '#ffffff',
                padding: '36px',
                borderRadius: '24px',
                border: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            },
            field: {
                marginBottom: '22px'
            },
            label: {
                fontSize: '15px',
                fontWeight: '600',
                color: '#1e293b'
            },
            input: {
                backgroundColor: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px 18px'
            },
            button: {
                backgroundColor: '#10b981',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '16px 32px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            },
            interactiveElements: true,
            hoverEffects: true
        },
        settings: {
            submitButtonText: 'Submit Review',
            successMessage: 'Thanks for sharing!',
            requireLogin: false,
            autoApprove: true
        }
    }
];

/**
 * Get all available form templates
 */
const getFormTemplates = () => {
    const templates = [...freeFormTemplates];

    // Add pro templates if pro is active
    if (isPro && !isLicenseInactive) {
        templates.push(...proFormTemplates);
    }

    return templates;
};

/**
 * Get form template by ID
 */
const getFormTemplateById = (id) => {
    const allTemplates = [...freeFormTemplates, ...proFormTemplates];
    return allTemplates.find(template => template.id === id);
};

/**
 * Get free form templates only
 */
const getFreeFormTemplates = () => {
    return freeFormTemplates;
};

/**
 * Get pro form templates only
 */
const getProFormTemplates = () => {
    return proFormTemplates;
};

/**
 * Get available field types
 */
const getFieldTypes = () => {
    const freeFieldTypes = [
        { value: 'text', label: 'Text Input', type: 'free' },
        { value: 'textarea', label: 'Text Area', type: 'free' },
        { value: 'email', label: 'Email', type: 'free' },
        { value: 'rating', label: 'Star Rating', type: 'free' },
        { value: 'file', label: 'File Upload', type: 'free' }
    ];

    const proFieldTypes = isPro && !isLicenseInactive ? [
        { value: 'rating_emoji', label: 'Emoji Rating', type: 'pro' },
        { value: 'radio', label: 'Radio Buttons', type: 'pro' },
        { value: 'checkbox', label: 'Checkbox', type: 'pro' },
        { value: 'select', label: 'Dropdown Select', type: 'pro' },
        { value: 'toggle', label: 'Toggle Switch', type: 'pro' },
        { value: 'textarea_split', label: 'Split Text Area (Pros/Cons)', type: 'pro' },
        { value: 'date', label: 'Date Picker', type: 'pro' }
    ] : [];

    return [...freeFieldTypes, ...proFieldTypes];
};

export {
    freeFormTemplates,
    proFormTemplates,
    getFormTemplates,
    getFormTemplateById,
    getFreeFormTemplates,
    getProFormTemplates,
    getFieldTypes
};
