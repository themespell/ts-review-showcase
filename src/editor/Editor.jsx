import { useState, useEffect } from 'react';
import { hideAdminElements } from './utils/utils.js';
import { fetchData } from '../common/services/fetchData.js';
import { TsLoader } from '../common/components/controls/tsControls.js';
import {getTranslations} from "../common/utils/translations.js";

import editorLocal from "./states/editorLocal.js";
import editorStore from './states/editorStore.js';
import editorFunction from './states/editorFunction.js';
import {handleCopySettings, handlePasteSettings} from "./utils/copyPasteLayout.js";
import proLayouts from "../pro_support/proLayouts.js";

import Topbar from './components/Topbar.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import './components/assets/editorStyle.css';
import './components/assets/editorHover.css';

import ReviewView from '../frontend/components/ReviewView.jsx';
import CarouselView from '../frontend/components/CarouselView.jsx';
import StaticView from '../frontend/components/StaticView.jsx';
import FlexView from "../frontend/components/FlexView.jsx";
import MarqueeView from "../frontend/components/MarqueeView.jsx";
import TableView from "../frontend/components/TableView.jsx";
import ConfettiView from "../frontend/components/ConfettiView.jsx";

function Editor() {
  const translations = getTranslations();
  const isPro = tsreview_settings.is_pro;
  const { isEditor, viewport, setViewport } = editorLocal();
  const { postType } = editorStore();
  const allSettings = editorStore();
  const { saveSettings } = editorFunction();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [postData, setPostData] = useState(null);

  useEffect(() => {
    hideAdminElements();
    setIsLoading(true);

    const queryParams = new URLSearchParams(window.location.search);
    const postIdFromUrl = queryParams.get('post_id');
    const postTypeFromUrl = queryParams.get('type');

    saveSettings('postID', postIdFromUrl);
    saveSettings('postType', postTypeFromUrl);

    if (postIdFromUrl) {
      fetchData(`tsreview/${postTypeFromUrl}/fetch/single`, (response) => {
        if (response && response.success) {
          setPostData(response.data.meta_data);

          const showcaseSettings = response.data.meta_data.showcase_settings;
          Object.keys(showcaseSettings).forEach((key) => {
            const value = showcaseSettings[key];
            saveSettings(key, value);
          });

          setTimeout(() => {
            setIsLoading(false);
            proLayouts();
          }, 1000);
        } else {
          console.error("Error fetching post data:", response);
          setIsLoading(false);
        }
      }, { post_id: postIdFromUrl });
    } else {
      console.error("No post_id found in the URL");
      setIsLoading(false);
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev); // Toggle the sidebar state
  };

  if (isLoading || postData === null) {
    return (
        <TsLoader
            label={translations.loadingEditor}
        />
    );
  }

  return (
      <>
      <Topbar
      type={postType}
      viewport={viewport}
      setViewport={setViewport}
      onCopySettings={() => handleCopySettings(allSettings)}
      onPasteSettings={() => handlePasteSettings(saveSettings)}
      />
      <div className="layout-container">
        <Sidebar
            isOpen={isSidebarOpen}
            selectedLayout={allSettings.selectedLayout.value}
            layoutType={allSettings.selectedLayout.type}
            onToggleSidebar={handleToggleSidebar} // Pass the toggle function
        />
        <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className='flex justify-center items-center min-h-screen mx-auto tsreview__editor_bg'>
            <div
                className={`editor-container editor-hover viewport-${viewport}`}
            >
              {postType === 'review_showcase' ? (
                <ReviewView
                  reviews={postData.reviews}
                  settings={allSettings}
                  viewport={viewport}
                  isEditor={isEditor}
                />
              ) : allSettings.selectedView.value === "flex" ? (
                      <FlexView
                          reviews={postData.reviews}
                          settings={allSettings}
                          viewport={viewport}
                          isEditor={isEditor}
                      />
                  ) : allSettings.selectedView.value === "carousel" ? (
                  <CarouselView
                      reviews={postData.reviews}
                      settings={allSettings}
                      viewport={viewport}
                      isEditor={isEditor}
                  />
              ) : allSettings.selectedView.value === "marquee" && isPro ? (
                  <MarqueeView
                      reviews={postData.reviews}
                      settings={allSettings}
                      viewport={viewport}
                      isEditor={isEditor}
                  />
              ) : allSettings.selectedView.value === "table" && isPro ? (
                      <TableView
                          reviews={postData.reviews}
                          settings={allSettings}
                          viewport={viewport}
                          isEditor={isEditor}
                      />
              ) : allSettings.selectedView.value === "confetti" && isPro ? (
                  <ConfettiView
                      reviews={postData.reviews}
                      settings={allSettings}
                      viewport={viewport}
                      isEditor={isEditor}
                  />
              ) : (
                  <StaticView
                      reviews={postData.reviews}
                      settings={allSettings}
                      viewport={viewport}
                      isEditor={isEditor}
                  />
              )}
            </div>
          </div>
        </div>
      </div>
      </>
  );
}

export default Editor;