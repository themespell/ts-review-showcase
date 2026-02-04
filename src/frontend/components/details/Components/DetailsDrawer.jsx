import React, { useEffect } from "react";
import { safeJsonParse } from "../../../../common/utils/safeJsonParse.js";
import renderEditorContent from "../Helper/renderEditorContent.jsx";
import { createPortal } from 'react-dom';

import SkillsBar from "./Child/SkillsBar.jsx";
import CTAButton from "./Child/CTAButton.jsx";
import SocialLinks from "./Child/SocialLinks.jsx";

function DetailsDrawer({ member }) {
    const drawerId = `${member.title.replace(/\s+/g, '-').toLowerCase()}-${member.post_id}`;
    const editorData = safeJsonParse(member.meta_data.information);
    const skills = safeJsonParse(member.meta_data.skills);
    const socialLinks = member.meta_data.socialLinks;
    console.log(member)

    const handleImageClick = (e) => {
        const imageId = e.target.id;
        const drawer = document.getElementById(`${imageId}-details-toggle`);
        if (drawer) {
            drawer.checked = true; // Open the drawer
        }
    };

    const handleButtonClick = (e) => {
        const buttonId = e.target.id;
        const drawer = document.getElementById(`${buttonId}-details-toggle`);
        if (drawer) {
            drawer.checked = true; // Open the drawer
        }
    };

    useEffect(() => {
        const imageElements = document.querySelectorAll('.tsteam-member__image');
        const detailsButtonElements = document.querySelectorAll('.tsteam-member-button__details');

        imageElements.forEach((imageElement) => {
            imageElement.addEventListener('click', handleImageClick);
        });

        detailsButtonElements.forEach((detailsButtonElement) => {
            detailsButtonElement.addEventListener('click', handleButtonClick);
        });

        // Cleanup: Remove event listeners on component unmount
        return () => {
            imageElements.forEach((imageElement) => {
                imageElement.removeEventListener('click', handleImageClick);
            });

            detailsButtonElements.forEach((detailsButtonElement) => {
                detailsButtonElement.removeEventListener('click', handleButtonClick);
            });
        };
    }, []);

    const drawerContent = (
        <div className="drawer">
            {/* Drawer toggle controlled by JavaScript */}
            <input id={`${drawerId}-details-toggle`} type="checkbox" className="drawer-toggle" />
            <div className="drawer-side">
                {/* Close the drawer when clicking the overlay */}
                <label htmlFor={`${drawerId}-details-toggle`} aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="bg-white min-h-full w-80 p-0 shadow-lg">
                    {/* Profile card based on the screenshot */}
                    <div className="max-w-sm overflow-scroll bg-white">
                        {/* Header with yellow background and profile image */}
                        <div className="relative">
                            {/* Profile image */}
                            <img
                                className="w-[250px] h-[250px] object-cover mt-12 ml-4 rounded-xl"
                                src={member.meta_data.image}
                                alt={member.title}
                            />
                        </div>

                        {/* Profile information */}
                        <div className="p-4 pt-8">
                            <h2 className="text-xl font-bold">{member.title}</h2>
                            <p className="text-sm text-gray-600">{member.meta_data.designation}</p>

                            {/* Overview section */}
                            <div className="mt-4">
                                <h3 className="text-sm font-bold">Overview</h3>
                                <p className="text-xs text-gray-600 mt-1">
                                    {member.meta_data.description}
                                </p>
                            </div>

                            {/* Social Media */}
                            <div className="mt-6">
                                <div className="font-medium mb-2">Social Media</div>
                                <SocialLinks socialLinks={socialLinks} />
                            </div>

                            <div className="mt-6">
                                <div className="font-medium mb-2">Links</div>
                                <CTAButton
                                    donationLink={member.meta_data.donationLink}
                                    hireLink={member.meta_data.hireLink}
                                    website={member.meta_data.website}
                                    resume={member.meta_data.resume}
                                />
                            </div>

                            {/* Skills bars section */}
                            {skills && skills.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-bold">Experience & Skill</h3>
                                    <SkillsBar skills={skills} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Render editor content if available */}
                    <div className="p-4">
                        <h3 className="mb-6">Details</h3>
                        {editorData && editorData.blocks ? renderEditorContent(editorData.blocks) : null}
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(drawerContent, document.body);
}

export default DetailsDrawer;