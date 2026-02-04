import React, { useEffect, useState } from "react";
import { safeJsonParse } from "../../../../common/utils/safeJsonParse.js";
import renderEditorContent from "../Helper/renderEditorContent.jsx";
import { createPortal } from 'react-dom';

import SkillsBar from "./Child/SkillsBar.jsx";
import CTAButton from "./Child/CTAButton.jsx";
import SocialLinks from "./Child/SocialLinks.jsx";

function DetailsModal({ member }) {
    const [currentMember, setCurrentMember] = useState(null);

    const modalId = `${member.title.replace(/\s+/g, '-').toLowerCase()}-${member.post_id}`;
    const editorData = safeJsonParse(member.meta_data.information);
    const skills = safeJsonParse(member.meta_data.skills);
    const socialLinks = member.meta_data.socialLinks;

    const handleImageClick = (e) => {
        const imageId = e.target.id;
        const modal = document.getElementById(`${imageId}-details`);
        if (modal) {
            modal.setAttribute('open', '');
        }
    };

    const handleButtonClick = (e) => {
        // Get the post ID from the data attribute
        const postId = e.target.getAttribute('data-post-id');

        // Find the member with the matching post_id
        const member = reviews.find(m => m.post_id.toString() === postId.toString());

        if (member) {
            setCurrentMember(member);

            // Generate the modal ID using the member's information
            const modalId = `${member.title.replace(/\s+/g, '-').toLowerCase()}-${member.post_id}-details`;

            // Open the modal
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.setAttribute('open', '');
            }
        }
    };

    // const handleButtonClick = (e) => {
    //     const buttonId = e.target.id;
    //     const modal = document.getElementById(`${buttonId}-details`);
    //     if (modal) {
    //         modal.setAttribute('open', '');
    //     }
    // };

    useEffect(() => {
        const imageElements = document.querySelectorAll('.tsteam-member__image');
        const detailsButtonElements = document.querySelectorAll('.tsteam-member-button__details');

        imageElements.forEach((imageElement) => {
            imageElement.addEventListener('click', handleImageClick);
        });

        detailsButtonElements.forEach((detailsButtonElement) => {
            detailsButtonElement.addEventListener('click', handleButtonClick);
        });

        // Cleanup: Remove the event listeners on component unmount
        return () => {
            imageElements.forEach((imageElement) => {
                imageElement.removeEventListener('click', handleImageClick);
            });

            detailsButtonElements.forEach((detailsButtonElement) => {
                detailsButtonElement.removeEventListener('click', handleButtonClick);
            });
        };
    }, []);

    const modalContent = (
        <dialog
            id={`${modalId}-details`}
            className="modal"
        >
            <div className="modal-box max-w-[80vw] max-h-[80vh] h-[80vh] w-[80vw] overflow-y-auto relative p-0">
                {/* Close Button */}
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-12 top-8 z-50"
                    onClick={() => document.getElementById(`${modalId}-details`).close()}
                >
                    ✕
                </button>

                {/* Top Section with Image and Details */}
                <div className="bg-white p-6 flex relative">
                    {/* Profile Image */}
                    <div className="w-full flex flex-col items-center justify-center mb-4">
                        <img
                            src={member.meta_data.image}
                            alt={member.title}
                            className="w-[450px] h-[450px] object-cover max-w-sm mx-auto rounded-lg"
                        />
                    </div>

                    {/* Personal Info */}
                    <div className="w-full flex flex-col justify-center md:w-2/3 md:pl-8 mt-6 md:mt-0">
                        <div className="text-sm uppercase text-gray-600 mb-1">{member.meta_data.designation}</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{member.title}</h2>

                        <div className="space-y-4">
                            <div className="font-medium">Experience: {member.meta_data.experience}</div>
                            <div className="font-medium">Location: {member.meta_data.location}</div>
                            <div className="font-medium">Email: {member.meta_data.email}</div>
                            <div className="font-medium">Phone: {member.meta_data.phone}</div>
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
                    </div>
                </div>

                {/* Bottom Section with Skills/Info */}
                <div className="bg-indigo-600 text-white flex-grow p-12">
                    <div className="flex max-w-6xl mx-auto">
                        {/* Professional Info */}
                        <div className="w-full md:w-1/2 md:pr-12 mb-8 md:mb-0">
                            <h3 className="text-2xl font-bold mb-6">Overview</h3>
                            <p className="text-indigo-100 leading-relaxed">
                                {member.meta_data.description}
                            </p>
                        </div>

                        {/* Skills */}
                        <div className="w-full md:w-1/2">
                            <h3 className="text-2xl font-bold mb-6">Skills</h3>
                            <SkillsBar skills={skills} />
                        </div>
                    </div>
                </div>

                {/* Additional Content from Editor */}
                {editorData && editorData.blocks && (
                    <div className="bg-white p-12">
                        <div className="max-w-6xl mx-auto">
                            <h3 className="text-2xl font-bold mb-6">Details</h3>
                            {renderEditorContent(editorData.blocks)}
                        </div>
                    </div>
                )}
            </div>
        </dialog>
    );

    return createPortal(modalContent, document.body);
}

export default DetailsModal;