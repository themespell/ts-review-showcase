const ajax_url = tsreview_settings.ajax_url;

export const createData = (action, data) => {
    return new Promise((resolve, reject) => {
        jQuery.post(ajax_url, {
            _ajax_nonce: tsreview_settings.nonce,
            action: action,
            ...data,
        }, function(response) {
            if (response.success) {
                resolve(response);
            } else {
                reject(response);
            }
        });
    });
};