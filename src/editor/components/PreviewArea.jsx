import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import ReviewsView from '../components/layouts/ReviewsView';

function PreviewArea({ showcase }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [showcase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  const settings = showcase?.meta_data?.showcase_settings || {};
  const reviews = showcase?.meta_data?.reviews || [];

  return (
    <div className="p-8 bg-gray-50 h-full overflow-y-auto">
      <div
        className="mx-auto bg-white p-6"
        style={{
          maxWidth: settings.container_width || 1200,
          backgroundColor: settings.background_color || '#fff',
          borderRadius: settings.border_radius || 8,
        }}
      >
        <ReviewsView
          reviews={reviews}
          settings={settings}
        />
      </div>
    </div>
  );
}

export default PreviewArea;
