import { useState, useEffect, useMemo } from 'react';

// Synchronous imports for common layouts to avoid dynamic import issues
import Card from './Card/Frontend.jsx';
import Overlay from './Overlay/Frontend.jsx';

const layoutComponents = {
  Card,
  Overlay,
};

function Layout({
  settings,
  layoutType,
  review, // Review data for single item
  reviews, // All reviews for compatibility
  animationConfig
}) {
  const [dynamicComponent, setDynamicComponent] = useState(null);
  const [error, setError] = useState(null);

  // Check if this is a synchronous layout
  const isSynchronousLayout = useMemo(() => {
    return layoutComponents[layoutType] !== undefined;
  }, [layoutType]);

  // Load dynamic component for pro layouts
  useEffect(() => {
    // Skip if this is a synchronous layout
    if (isSynchronousLayout) {
      return;
    }

    if (layoutType) {
      import(`./${layoutType}/Frontend.jsx`)
        .then((module) => {
          const LoadedComponent = module.default;
          setDynamicComponent(() => LoadedComponent);
          setError(null);
        })
        .catch((err) => {
          console.error("Error loading layout component:", layoutType, err);
          setError(`Failed to load layout: ${layoutType}`);
        });
    }
  }, [layoutType, isSynchronousLayout]);

  // Get the component to render
  const GetComponent = () => {
    if (error) {
      return () => (
        <div className="flex items-center justify-center p-4 text-red-400 border border-red-200 rounded">
          {error}
        </div>
      );
    }

    if (isSynchronousLayout) {
      return layoutComponents[layoutType];
    }

    if (dynamicComponent) {
      return dynamicComponent;
    }

    return () => (
      <div className="flex items-center justify-center p-8 text-gray-400">
        Loading {layoutType} layout...
      </div>
    );
  };

  const ComponentToRender = GetComponent();

  return <ComponentToRender
    settings={settings}
    review={review}
    reviews={reviews}
    animationConfig={animationConfig}
  />;
}

export default Layout;
