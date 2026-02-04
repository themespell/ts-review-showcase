const ajax_url = tsreview_settings.ajax_url;

export const duplicateData = (action, post_id) => {
    return new Promise((resolve, reject) => {
        jQuery.post(ajax_url, {
            _ajax_nonce: tsreview_settings.nonce,
            action: action,
            post_id,
        })
            .done((response) => {
                response.success ? resolve(response) : reject(response);
            })
            .fail(reject);
    });
};