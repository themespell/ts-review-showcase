import React from "react";

const TsProductName = ({ children , className }) => {
    return <h3 className={`text-[16px] font-semibold mb-0.5 tsteam-member__name ${className}`}    >{children}</h3>;
};

export default TsProductName;