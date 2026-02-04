import globalSettings from '../../utils/globalSettings';
import TsButton from "./TsButton.jsx";
import './style.css';

function TsNotice({ heading, description, label, ctalink, onClick }) {
    return (
        <div className="flex justify-between items-center bg-white tsreview__global--border pt-2 pb-2 pl-6 pr-6">
            <div className="mt-4">
                {/* Heading */}
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {heading}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 w-4/6">
                    {description}
                </p>
            </div>

            {/* Button */}
            <div className="flex justify-end">
                {ctalink ? (
                    <a className="tsteam-button btn btn-primary" href={ctalink}>
                        {label}
                    </a>
                ) : (
                    <TsButton
                        label={label}
                        onClick={onClick}
                    />
                )}
            </div>
        </div>
    );
}

export default TsNotice;