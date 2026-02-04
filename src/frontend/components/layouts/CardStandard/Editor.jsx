const register_controls = () => {
    return {
        controls: [
            {
                type: 'divider',
                label: 'Card Styles'
            },
            {
                type: 'color',
                label: 'Separator Color',
                name: 'tscard.color.separator',
            },
        ]
    };
};

export { register_controls };