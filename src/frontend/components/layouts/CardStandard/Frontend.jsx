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
        <div className="absolute inset-0 ">
          <div className="relative h-full flex flex-col">
            <button className="absolute top-3 right-3 py-[10px] px-[26px] bg-gradient-to-r from-[#FFBB00] to-[#E910A1] font-medium text-white rounded-md z-10">
              {discountPercent}% Off
            </button>

            <a
              href={cartUrl}
              className="mt-auto mb-10 mx-[5%] w-[90%] text-center text-lg font-medium bg-white text-black hover:bg-black hover:text-white transition-all duration-300 py-5 rounded-md"
            >
              Add To Cart
            </a>
          </div>
        </div>
      </div>
      <div>
        <TsProductName className="text-center text-[22px] font-medium mt-6 mb-3 ">
          {title}
        </TsProductName>
        <div className="flex justify-center items-center gap-4">
          <div className="font-medium text-lg text-black">${salePrice}</div>
          <div className="text-[#bcb5b5] text-sm line-through">
            ${regularPrice}
          </div>
        </div>
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
