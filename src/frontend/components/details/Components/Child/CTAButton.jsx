import React from 'react';
import { Briefcase, Heart, FileText, Globe } from 'lucide-react';

const CTAButton = ({donationLink, hireLink, website, resume}) => {
    return (
        <div className="flex flex-wrap gap-4">
            {website && (
                <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm border-none px-3 py-1.5 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                    <Globe size={14} />
                    <span className="font-medium">Website</span>
                </a>
            )}

            {hireLink && (
                <a
                    href={hireLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm border-none px-3 py-1.5 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                    <Briefcase size={14} />
                    <span className="font-medium">Hire me</span>
                </a>
            )}

            {donationLink && (
                <a
                    href={donationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm border-none px-3 py-1.5 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                    <Heart size={14} />
                    <span className="font-medium">Donation</span>
                </a>
            )}

            {resume && (
                <a
                    href={resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm border-none px-3 py-1.5 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                    <FileText size={14} />
                    <span className="font-medium">CV</span>
                </a>
            )}
        </div>
    );
};

export default CTAButton;