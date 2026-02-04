// Helper function to add !important to all CSS values
const addImportantToStyles = (styleObject) => {
    const importantStyles = {};

    for (const property in styleObject) {
        if (styleObject.hasOwnProperty(property)) {
            const value = styleObject[property];
            // Check if the value already has !important
            if (typeof value === 'string' && !value.includes('!important')) {
                importantStyles[property] = value + ' !important';
            } else {
                importantStyles[property] = value;
            }
        }
    }

    return importantStyles;
};

export const getTsTeamMemberNameStyle = (settings) => {
    const tsTeamMemberNameCSS = {};

    if(settings?.layout?.color?.memberName){
        tsTeamMemberNameCSS['--team-member-name-color'] = settings?.layout?.color?.memberName;
    }
    if(settings?.typography?.name){
        tsTeamMemberNameCSS['--team-member-name-font-family'] = settings?.typography?.name;
    }
    if(settings?.typography?.name_fontSize){
        tsTeamMemberNameCSS['--team-member-name-font-size'] = settings?.typography?.name_fontSize;
    }
    if(settings?.typography?.name_fontWeight){
        tsTeamMemberNameCSS['--team-member-name-font-weight'] = settings?.typography?.name_fontWeight;
    }
    if(settings?.typography?.name_textTransform){
        tsTeamMemberNameCSS['--team-member-name-text-transform'] = settings?.typography?.name_textTransform;
    }
    if(settings?.typography?.name_letterSpacing){
        tsTeamMemberNameCSS['--team-member-name-letter-spacing'] = settings?.typography?.name_letterSpacing;
    }
    if(settings?.typography?.name_lineHeight){
        tsTeamMemberNameCSS['--team-member-name-line-height'] = settings?.typography?.name_lineHeight;
    }

    return addImportantToStyles(tsTeamMemberNameCSS);
}

export const getTsTeamMemberDesignationStyle = (settings) => {
    const tsTeamMemberDesignationCSS = {};

    if (settings?.layout?.color?.designation) {
        tsTeamMemberDesignationCSS['--team-member-designation-color'] = settings.layout.color.designation;
    }
    if (settings?.typography?.designation) {
        tsTeamMemberDesignationCSS['--team-member-designation-font-family'] = settings.typography.designation;
    }
    if (settings?.typography?.designation_fontSize) {
        tsTeamMemberDesignationCSS['--team-member-designation-font-size'] = settings.typography.designation_fontSize;
    }
    if (settings?.typography?.designation_fontWeight) {
        tsTeamMemberDesignationCSS['--team-member-designation-font-weight'] = settings.typography.designation_fontWeight;
    }
    if (settings?.typography?.designation_textTransform) {
        tsTeamMemberDesignationCSS['--team-member-designation-text-transform'] = settings.typography.designation_textTransform;
    }
    if (settings?.typography?.designation_letterSpacing) {
        tsTeamMemberDesignationCSS['--team-member-designation-letter-spacing'] = `${settings.typography.designation_letterSpacing}px`;
    }
    if (settings?.typography?.designation_lineHeight) {
        tsTeamMemberDesignationCSS['--team-member-designation-line-height'] = settings.typography.designation_lineHeight;
    }

    return addImportantToStyles(tsTeamMemberDesignationCSS);
};

export const getTsTeamMemberDescriptionStyle = (settings) => {
    const tsTeamMemberDescriptionCSS = {};

    if (settings?.layout?.color?.description) {
        tsTeamMemberDescriptionCSS['--team-member-description-color'] = settings.layout.color.description;
    }
    if (settings?.typography?.description) {
        tsTeamMemberDescriptionCSS['--team-member-description-font-family'] = settings.typography.description;
    }
    if (settings?.typography?.description_fontSize) {
        tsTeamMemberDescriptionCSS['--team-member-description-font-size'] = settings.typography.description_fontSize;
    }
    if (settings?.typography?.description_fontWeight) {
        tsTeamMemberDescriptionCSS['--team-member-description-font-weight'] = settings.typography.description_fontWeight;
    }
    if (settings?.typography?.description_textTransform) {
        tsTeamMemberDescriptionCSS['--team-member-description-text-transform'] = settings.typography.description_textTransform;
    }
    if (settings?.typography?.description_letterSpacing) {
        tsTeamMemberDescriptionCSS['--team-member-description-letter-spacing'] = `${settings.typography.description_letterSpacing}px`;
    }
    if (settings?.typography?.description_lineHeight) {
        tsTeamMemberDescriptionCSS['--team-member-description-line-height'] = settings.typography.description_lineHeight;
    }

    return addImportantToStyles(tsTeamMemberDescriptionCSS);
};

export const getTsTeamMemberAvatarStyle = (settings) => {
    const tsTeamMemberAvatarCSS = {};

    tsTeamMemberAvatarCSS['--team-member-avatar-border-style'] = "solid";

    if (settings?.layout?.borderWidth?.image) {
        tsTeamMemberAvatarCSS['--team-member-avatar-border-width'] = settings.layout.borderWidth.image;
    }
    if (settings?.layout?.borderRadius?.image) {
        tsTeamMemberAvatarCSS['--team-member-avatar-border-radius'] = settings.layout.borderRadius.image;
    }
    if (settings?.layout?.color?.imageBorder) {
        tsTeamMemberAvatarCSS['--team-member-avatar-border-color'] = settings.layout.color.imageBorder;
    }

    return addImportantToStyles(tsTeamMemberAvatarCSS);
};