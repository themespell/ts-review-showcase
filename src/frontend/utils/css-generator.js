class CSSGenerator {
    constructor() {
        this.classStyles = [];
    }

    addClassStyles(className, desktopStyles, tabletStyles = {}, mobileStyles = {}) {
        this.classStyles.push({
            className,
            desktopStyles,
            tabletStyles,
            mobileStyles,
        });
    }

    generateCSS() {
        const cssString = this.classStyles
            .map(({ className, desktopStyles, tabletStyles = {}, mobileStyles = {} }) => {
                const desktopCSS = this.minifyCSS(this.generateCSSForMediaQuery(desktopStyles));
                const tabletCSS = this.minifyCSS(this.generateCSSForMediaQuery(tabletStyles));
                const mobileCSS = this.minifyCSS(this.generateCSSForMediaQuery(mobileStyles));

                const selectorWithParent = this.getParentSelector(className);

                const cssBlocks = [];
                if (desktopCSS) cssBlocks.push(`${selectorWithParent} { ${desktopCSS} }`);
                if (tabletCSS) cssBlocks.push(`@media (max-width: 768px) { ${selectorWithParent} { ${tabletCSS} } }`);
                if (mobileCSS) cssBlocks.push(`@media (max-width: 480px) { ${selectorWithParent} { ${mobileCSS} } }`);

                return cssBlocks.join("\n\n");
            })
            .join("\n\n");

        return cssString.replace(/\s+/g, " ");
    }

    minifyCSS(cssString) {
        return cssString.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s?([:,;{}])\s?/g, "$1");
    }

    generateCSSForMediaQuery(styles) {
        if (Object.keys(styles).length === 0) return "";
        return Object.keys(styles).map((property) => `${property}: ${styles[property]};`).join(" ");
    }

    getParentSelector(className) {
        return this.parentClass ? className.replace(/{{WRAPPER}}/g, this.parentClass) : className;
    }
}

export default CSSGenerator;