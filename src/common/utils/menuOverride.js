export function menuOverride() {
    const submenu = document.getElementById('toplevel_page_ts-review-showcase');

    if (submenu) {
        const currentUrl = window.location.href.split('admin.php')[1] || '';
        const listItems = submenu.querySelectorAll('li');


        listItems.forEach(li => {
            const anchorElement = li.querySelector('a');

            if (anchorElement) {
                const anchorHref = anchorElement.getAttribute('href').split('admin.php')[1] || '';

                if (currentUrl === anchorHref) {
                    li.classList.add('wp-first-item', 'current');
                } else {
                    li.classList.remove('wp-first-item', 'current');
                }
            }
        });
    }
}
