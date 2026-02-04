// Hide WP Admin Elements
export function hideAdminElements() {
    const adminMenuBack = document.getElementById('adminmenuback');
    const adminMenuWrap = document.getElementById('adminmenuwrap');
    const wpadminbar = document.getElementById('wpadminbar');
    const wpfooter = document.getElementById('wpfooter');

    if (adminMenuBack) adminMenuBack.style.display = 'none';
    if (adminMenuWrap) adminMenuWrap.style.display = 'none';
    if (wpadminbar) wpadminbar.style.display = 'none';
    if (wpfooter) wpfooter.style.display = 'none';

    const wpToolbar = document.querySelector('html.wp-toolbar');
    const wpContent = document.getElementById('wpcontent');

    if (wpToolbar && wpContent) {
        wpToolbar.style.paddingTop = '0';
        wpContent.style.paddingLeft = '0';
        wpContent.style.marginLeft = '0';
    }
}