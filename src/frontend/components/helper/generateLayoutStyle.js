// import React from 'react';
// import CSSGenerator from "../../utils/css-generator.js";
//
// import {
//     getTsTeamMemberNameStyle,
//     getTsTeamMemberDesignationStyle,
//     getTsTeamMemberDescriptionStyle,
//     getTsTeamMemberAvatarStyle,
// } from "./layoutStyles.js";
//
// const GenerateLayoutStyle = ({ settings = {} }) => {
//     // Generate CSS
//     const cssGenerator = new CSSGenerator();
//     cssGenerator.addClassStyles(
//         ".tsteam-member__name",
//         getTsTeamMemberNameStyle(settings)
//     );
//     cssGenerator.addClassStyles(
//         ".tsteam-member__designation",
//         getTsTeamMemberDesignationStyle(settings)
//     );
//     cssGenerator.addClassStyles(
//         ".tsteam-member__description",
//         getTsTeamMemberDescriptionStyle(settings)
//     );
//     cssGenerator.addClassStyles(
//         ".tsteam-member__image",
//         getTsTeamMemberAvatarStyle(settings)
//     );
//     const generatedCSS = cssGenerator.generateCSS();
//
//     return React.createElement('style', null, generatedCSS);
// };
//
// export default GenerateLayoutStyle

// // GenerateLayoutStyle.jsx
// import React, { useState, useEffect } from "react";
// import CSSGenerator from "../../utils/css-generator.js";
// import {
//     getTsTeamMemberNameStyle,
//     getTsTeamMemberDesignationStyle,
//     getTsTeamMemberDescriptionStyle,
//     getTsTeamMemberAvatarStyle,
// } from "./layoutStyles.js";
//
// const GenerateLayoutStyle = ({ settings = {} }) => {
//     const [controls, setControls] = useState([]);
//
//     // Derive layoutType from settings
//     const layoutType = settings?.selectedLayout?.value;
//
//     // Dynamically load the Editor.jsx file for the current layoutType
//     useEffect(() => {
//         if (layoutType) {
//             console.log(`Loading Editor.jsx for layoutType: ${layoutType}`);
//             import(`../layouts/${layoutType}/Editor.jsx`)
//                 .then((module) => {
//                     console.log(`Loaded Editor.jsx for layoutType: ${layoutType}`, module);
//                     const register_controls = module.register_controls;
//                     setControls(register_controls().controls || []);
//                 })
//                 .catch((error) => {
//                     console.error("Error loading Editor.jsx:", error);
//                 });
//         }
//     }, [layoutType]);
//
//     // Initialize CSSGenerator
//     const cssGenerator = new CSSGenerator();
//
//     // Helper function to extract nested values from the settings object
//     const getValueFromSettings = (obj, path) => {
//         return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
//     };
//
//     // Dynamically generate CSS variables based on controls
//     controls.forEach((control) => {
//         if (control.name) {
//             const cssVariableName = `--${control.name.replace(/\./g, "-")}`;
//             const value = getValueFromSettings(settings, control.name) || control.defaultValue;
//
//             console.log(`Control Name: ${control.name}, CSS Variable: ${cssVariableName}, Value: ${value}`);
//
//             if (value) {
//                 cssGenerator.addClassStyles(":root", {
//                     [cssVariableName]: value,
//                 });
//             } else {
//                 console.warn(`Missing value for control: ${control.name}`);
//             }
//         }
//     });
//
//     // Add existing styles
//     cssGenerator.addClassStyles(".tsteam-member__name", getTsTeamMemberNameStyle(settings));
//     cssGenerator.addClassStyles(".tsteam-member__designation", getTsTeamMemberDesignationStyle(settings));
//     cssGenerator.addClassStyles(".tsteam-member__description", getTsTeamMemberDescriptionStyle(settings));
//     cssGenerator.addClassStyles(".tsteam-member__image", getTsTeamMemberAvatarStyle(settings));
//
//     // Generate final CSS
//     const generatedCSS = cssGenerator.generateCSS();
//
//     return React.createElement('style', null, generatedCSS);
// };
//
// export default GenerateLayoutStyle;

// GenerateLayoutStyle.jsx
import React, { useState, useEffect } from "react";
import CSSGenerator from "../../utils/css-generator.js";
import {
    getTsTeamMemberNameStyle,
    getTsTeamMemberDesignationStyle,
    getTsTeamMemberDescriptionStyle,
    getTsTeamMemberAvatarStyle,
} from "./layoutStyles.js";
import proLayouts from "../../../pro_support/proLayouts.js";

const GenerateLayoutStyle = ({ settings = {} }) => {
    const [controls, setControls] = useState([]);

    // Derive layoutType and check if it's a Pro Layout
    const layoutType = settings?.selectedLayout?.value;
    const isProLayout = settings?.selectedLayout?.type === "pro";

    // Dynamically load controls for the current layoutType
    useEffect(() => {
        if (isProLayout) {
            const layout = proLayouts(settings.selectedLayout?.value);
            if (layout && typeof layout.Editor === "function") {
                const register_controls = layout.Editor;
                const controls = register_controls().controls || [];
                setControls(controls);
            } else {
                setControls([]); // Fallback to empty controls
            }
        } else if (layoutType) {
            import(`../layouts/${layoutType}/Editor.jsx`)
                .then((module) => {
                    const register_controls = module.register_controls;
                    setControls(register_controls().controls || []);
                })
                .catch((error) => {
                    console.error("Error loading Editor.jsx:", error);
                });
        }
    }, [layoutType, isProLayout]);

    // Initialize CSSGenerator
    const cssGenerator = new CSSGenerator();

    // Helper function to extract nested values from the settings object
    const getValueFromSettings = (obj, path) => {
        return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    };

    // Dynamically generate CSS variables based on controls
    controls.forEach((control) => {
        if (control.name) {
            const cssVariableName = `--${control.name.replace(/\./g, "-")}`;
            const value = getValueFromSettings(settings, control.name) || control.defaultValue;
            if (value) {
                cssGenerator.addClassStyles(":root", {
                    [cssVariableName]: value,
                });
            } else {
                console.warn(`Missing value for control: ${control.name}`);
            }
        }
    });

    // Add existing styles
    cssGenerator.addClassStyles(".tsteam-member__name", getTsTeamMemberNameStyle(settings));
    cssGenerator.addClassStyles(".tsteam-member__designation", getTsTeamMemberDesignationStyle(settings));
    cssGenerator.addClassStyles(".tsteam-member__description", getTsTeamMemberDescriptionStyle(settings));
    cssGenerator.addClassStyles(".tsteam-member__image", getTsTeamMemberAvatarStyle(settings));

    // Dynamically generate CSS variables for typography
    if (settings?.typography) {
        const { name, designation, description } = settings.typography;

        if (name) {
            cssGenerator.addClassStyles(":root", {
                "--team-member-name-font-family": name,
            });
        }
        if (designation) {
            cssGenerator.addClassStyles(":root", {
                "--team-member-designation-font-family": designation,
            });
        }
        if (description) {
            cssGenerator.addClassStyles(":root", {
                "--team-member-description-font-family": description,
            });
        }
    }

    // Generate final CSS
    const generatedCSS = cssGenerator.generateCSS();

    return React.createElement('style', null, generatedCSS);
};

export default GenerateLayoutStyle;