import React from "react";
import TsProductName from "../__common/components/TsProuductName.jsx";

import "./style.css";

const Card = ({
  settings,
  id,
  title,
  imageUrl,
  productGallery,
  categories,
  price,
  regularPrice,
  salePrice,
  sku,
  stockStatus,
  description,
  cartUrl,
  details,
  animationConfig,
}) => {
  // Calculate discount percentage
  const calculateDiscount = () => {
    if (regularPrice && salePrice) {
      const discount = ((regularPrice - salePrice) / regularPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const discountPercent = calculateDiscount();

  const renderContent = () => (
    <div>
      <div className="relative h-[540px]">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between mt-9">
        <div className="flex flex-col gap-2 " >
          <TsProductName className="text-[30px] font-medium  ">
            {title}
          </TsProductName>
          <div className="flex items-center gap-4">
            <div className="font-medium text-lg text-black">${salePrice}</div>
            <div className="text-[#bcb5b5] text-sm line-through">
              ${regularPrice}
            </div>
          </div>
        </div>
     
          <button className=" py-2 px-3 bg-gradient-to-r from-[#FFBB00] to-[#E910A1] font-medium text-white rounded-full">
            {discountPercent}% Off
          </button>
      
      </div>
    </div>
  );

  // Handle different animation types
  if (!animationConfig) {
    return renderContent();
  }

  if (animationConfig.type === "single") {
    return <div className={animationConfig.class}>{renderContent()}</div>;
  }

  if (animationConfig.type === "wrapper") {
    return (
      <div className={animationConfig.parent}>
        <div className={animationConfig.wrapper}>{renderContent()}</div>
      </div>
    );
  }

  return renderContent();
};

export default Card;
