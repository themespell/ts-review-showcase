import React, { useState, useEffect, useMemo, Fragment } from "react";
import Layout from "./layouts/Layout";
import { getCommonStyles } from "./helper/commonStyle.js";
import { getResponsiveStyles } from "./helper/responsiveStyles.js";
import { getProLayout } from "./helper/getProLayout.js";
import {loadGoogleFont} from "./helper/loadGoogleFont.js";
import {getAnimationClasses} from "./helper/motionControl.js";

import Details from "./details/details.jsx";
import GenerateLayoutStyle from "./helper/generateLayoutStyle.js";

function StaticView({ reviews, settings, viewport, isEditor }) {
  const [ProLayoutComponent, setProLayoutComponent] = useState(null);
  const commonStyles = getCommonStyles(settings);
  const [responsiveStyles, setResponsiveStyles] = useState(
    getResponsiveStyles(settings, viewport, isEditor),
  );

  // Load Google Fonts dynamically based on settings.typography
  useEffect(() => {
    if (settings?.typography) {
      const typographyKeys = ["name", "designation", "description"];

      typographyKeys.forEach((key) => {
        const fontFamily = settings.typography[key];
        if (fontFamily) {
          loadGoogleFont(fontFamily);
        }
      });
    }
  }, [settings?.typography]);

  useMemo(() => {
    setProLayoutComponent(() => getProLayout(settings));
  }, [settings?.selectedLayout?.type, settings?.selectedLayout?.value]);

  useEffect(() => {
    const updateResponsiveStyles = () => {
      setResponsiveStyles(getResponsiveStyles(settings, viewport, isEditor));
    };

    if (isEditor) {
      updateResponsiveStyles();
    } else {
      updateResponsiveStyles();
      window.addEventListener("resize", updateResponsiveStyles);

      return () => {
        window.removeEventListener("resize", updateResponsiveStyles);
      };
    }
  }, [settings, isEditor, viewport]);

  const animationConfig = useMemo(() => {
    const hoverAnimation = settings?.hoverAnimation || "none";
    const config = getAnimationClasses(hoverAnimation);
    return config;
  }, [settings?.hoverAnimation]);

  return (
    <div
      className="tsteam-container"
      style={{
        ...commonStyles,
        ...responsiveStyles,
      }}
    >
      <GenerateLayoutStyle settings={settings} />
      {reviews && reviews.length > 0 ? (
        reviews.map((member, index) => (
          <Fragment key={index}>
            {ProLayoutComponent ? (
              <ProLayoutComponent
                settings={settings}
                imageUrl={member.image_url || member.meta_data?.image}
                id={member.post_id}
                title={member.title}
                categories={member.categories}
                price={member.price}
                regularPrice={member.regular_price}
                salePrice={member.sale_price}
                cartUrl={member.add_to_cart_url}
                description={member.content || member.meta_data?.description}
                productGallery={member.gallery_urls}
                sku={member.sku}
                stockStatus={member.stock_status}
                animationConfig={animationConfig}
              />
            ) : (
              <Layout
                settings={settings}
                layoutType={settings.selectedLayout.value}
                id={member.post_id}
                imageUrl={member.image_url}
                productGallery={member.gallery_urls}
                categories={member.categories}
                title={member.title}
                price={member.price}
                regularPrice={member.regular_price}
                salePrice={member.sale_price}
                sku={member.sku}
                stockStatus={member.stock_status}
                description={member.content}
                cartUrl={member.add_to_cart_url}
                // details={<Details settings={settings} member={member} />}
                animationConfig={animationConfig}
              />
            )}
          </Fragment>
        ))
      ) : (
        <p>No team members found.</p>
      )}
    </div>
  );
}

export default StaticView;
