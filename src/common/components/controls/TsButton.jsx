import globalSettings from '../../utils/globalSettings';

function TsButton({ id, prefix, label, onClick, htmlType, className }) {
    const defaultClassName = "tsteam-button btn btn-primary";
    const buttonClassName = className ? `${className}` : defaultClassName;

    return (
        <>
            <button
                id={id}
                className={`${buttonClassName} btn`}
                onClick={onClick}
                type={htmlType}
            >
                {prefix} {label}
            </button>
        </>
    );
}

export default TsButton;