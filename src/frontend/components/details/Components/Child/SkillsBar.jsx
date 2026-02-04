import React from 'react';

const SkillsBar = ({ skills }) => {
    return (
        <div className="space-y-6">
            {skills.map((skill, index) => (
                <div key={index} className="mt-2">
                    <div className="flex justify-between items-center">
                        <span>{skill.skill}</span>
                        <span>{skill.rating}%</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-1.5 mt-1">
                        <div
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{ width: `${skill.rating}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkillsBar;