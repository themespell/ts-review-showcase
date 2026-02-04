const editorHelper = {
    getViewport: (width) => {
        if (width <= 768) {
            return 'mobile';
        } else if (width <= 1024) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    },
};

export default editorHelper;