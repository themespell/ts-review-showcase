const register_controls = () => {
    return {
        controls: [
            {
                type: 'divider',
                label: 'Card Styles'
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
                label: 'Show Dates',
                name: 'show_dates',
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
