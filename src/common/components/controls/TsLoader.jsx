import globalSettings from '../../utils/globalSettings';

function TsLoader({ label }) {
  const tsteamLogo = tsreview_settings.assets_path;
  return (
      <div
          className="flex flex-col justify-center items-center h-screen"
          style={{backgroundColor: globalSettings.theme.primaryColor}}
      >
        <img src={`${tsteamLogo}/img/tsreview_icon_white.svg`} className="tsreview__topbar-logo w-12 h-12"/>
        <label className="text-white mt-3">{label}</label>
      </div>
  );
}

export default TsLoader;