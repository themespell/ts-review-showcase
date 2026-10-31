import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ConfigProvider } from 'antd';
import globalSettings from './common/utils/globalSettings.js';
import Editor from './editor/Editor.jsx';
import AdminPanel from './admin/Admin.jsx';

import { menuOverride } from "./common/utils/menuOverride.js";
import { exposeShared } from "./pro_support/shared.js";
import { TsDivider, TsSelect, TsSlider, TsSwitch } from "./common/components/controls/tsControls.js";
import editorStore from "./editor/states/editorStore.js";

// Pro view controls reuse the editor controls and store.
exposeShared({ editor: { controls: { TsDivider, TsSelect, TsSlider, TsSwitch }, editorStore } });

const RootComponent = () => {
  const currentUrl = window.location.href;
  const isEditor = currentUrl.includes(`&path=editor`);

  useEffect(() => {
    menuOverride();
  }, []);

  return (
    <React.StrictMode>
      <ConfigProvider theme={globalSettings}>
        {isEditor ? <Editor /> : <AdminPanel />}
      </ConfigProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('ts-review-showcase')).render(
  <RootComponent />
);
