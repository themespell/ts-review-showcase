const ajax_url = tsreview_settings.ajax_url;

export const updateData = (action, data, post_id) => {
    return new Promise((resolve, reject) => {
        jQuery.post(ajax_url, {
            _ajax_nonce: tsreview_settings.nonce,
            action: action,
            post_id: post_id,
            data: { ...data }
        }, function(response) {
            if (response.success) {
                resolve(response);
            } else {
                reject(response);
            }
        });
    });
};