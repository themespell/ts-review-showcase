import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ConfigProvider } from 'antd';
import globalSettings from './common/utils/globalSettings.js';
import Editor from './editor/Editor.jsx';
import AdminPanel from './admin/Admin.jsx';

import { menuOverride } from "./common/utils/menuOverride.js";

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
