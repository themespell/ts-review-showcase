import { useState, useEffect } from 'react';

function Layout({
                    settings,
                    layoutType,
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
                    details, animationConfig }) {
    const [Component, setComponent] = useState(null);

    useEffect(() => {
        if (layoutType) {
            import(`./${layoutType}/Frontend.jsx`)
                .then((module) => {
                    const LoadedComponent = module.default;
                    setComponent(() => LoadedComponent);
                })
                .catch((error) => {
                    console.error("Error loading component:", error);
                });
        }
    }, [layoutType]);

    if (!Component) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Component
                settings={settings}
                id={id}
                title={title}
                imageUrl={imageUrl}
                productGallery={productGallery}
                categories={categories}
                price={price}
                regularPrice={regularPrice}
                salePrice={salePrice}
                sku={sku}
                stockStatus={stockStatus}
                description={description}
                cartUrl={cartUrl}
                details={details}
                animationConfig={animationConfig}
            />
        </div>
    );
}

export default Layout;