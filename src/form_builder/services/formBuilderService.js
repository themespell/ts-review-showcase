/**
 * Form Builder AJAX Service
 */

const ajax_url = tsreview_settings.ajax_url;

/**
 * Fetch all forms
 */
export const fetchForms = (callback) => {
    const params = {
        _ajax_nonce: tsreview_settings.nonce,
        action: 'tsreview/form_builder/fetch',
    };

    jQuery.post(ajax_url, params, function(response) {
        if (typeof callback === "function") {
            callback(response);
        }
    });
};

/**
 * Fetch a single form by ID
 */
export const fetchFormById = (formId, callback) => {
    const params = {
        _ajax_nonce: tsreview_settings.nonce,
        action: 'tsreview/form_builder/fetch/single',
        form_id: formId,
    };

    jQuery.post(ajax_url, params, function(response) {
        if (typeof callback === "function") {
            callback(response);
        }
    });
};

/**
 * Create a new form
 */
export const createForm = (title, data, callback) => {
    const params = {
        _ajax_nonce: tsreview_settings.nonce,
        action: 'tsreview/form_builder/create',
        title: title,
        data: data,
    };

    jQuery.post(ajax_url, params, function(response) {
        if (typeof callback === "function") {
            callback(response);
        }
    });
};

/**
 * Update a form
 */
export const updateForm = (data, callback) => {
    const params = {
        _ajax_nonce: tsreview_settings.nonce,
        action: 'tsreview/form_builder/update',
        data: data,
    };

    jQuery.post(ajax_url, params, function(response) {
        if (typeof callback === "function") {
            callback(response);
        }
    });
};

/**
 * Save form settings
 */
export const saveFormSettings = (postId, data, callback) => {
    const params = {
        _ajax_nonce: tsreview_settings.nonce,
        action: 'tsreview/form_builder/save_settings',
        post_id: postId,
        data: data,
    };

    jQuery.post(ajax_url, params, function(response) {
        if (typeof callback === "function") {
            callback(response);
        }
    });
};

/**
 * Duplicate a form
 */
export const duplicateForm = (postId, callback) => {
    const params = {
        _ajax_nonce: tsreview_settings.nonce,
        action: 'tsreview/form_builder/duplicate',
        post_id: postId,
    };

    jQuery.post(ajax_url, params, function(response) {
        if (typeof callback === "function") {
            callback(response);
        }
    });
};

/**
 * Delete a form
 */
export const deleteForm = (postId, callback) => {
    const params = {
        _ajax_nonce: tsreview_settings.nonce,
        action: 'tsreview/form_builder/delete',
        post_id: postId,
    };

    jQuery.post(ajax_url, params, function(response) {
        if (typeof callback === "function") {
            callback(response);
        }
    });
};

/**
 * Submit form from frontend
 */
export const submitForm = (formData, callback) => {
    const params = {
        _ajax_nonce: tsreview_settings.nonce,
        action: 'tsreview/form_builder/submit',
        ...formData,
    };

    jQuery.post(ajax_url, params, function(response) {
        if (typeof callback === "function") {
            callback(response);
        }
    });
};
