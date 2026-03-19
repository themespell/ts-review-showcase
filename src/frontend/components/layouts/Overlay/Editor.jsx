const register_controls = () => {
    return {
        controls: [
            {
                type: 'divider',
                label: 'Overlay Styles'
            },
            {
                type: 'color',
                label: 'Overlay Background',
                name: 'overlay_background_color',
                default: 'rgba(0,0,0,0.8)'
            },
            {
                type: 'switch',
                label: 'Show Avatar',
                name: 'show_images',
                default: true
            },
            {
                type: 'switch',
                label: 'Show Rating',
                name: 'show_ratings',
                default: true
            },
            {
                type: 'switch',
                label: 'Show Verified Badge',
                name: 'show_verified_badge',
                default: true
            },
        ]
    };
};

export { register_controls };
