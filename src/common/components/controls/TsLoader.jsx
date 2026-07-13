function TsLoader({ label }) {
  const assetPath = tsreview_settings.assets_path;

  return (
    <div className="ts-loader-wrapper">
      <div className="ts-loader-bg-base" />
      <div className="ts-loader-bg-gradient" />
      <div className="ts-loader-bg-pattern" />

      <div className="ts-loader-content">
        <div className="ts-loader-logo-wrapper">
          <img
            src={`${assetPath}/img/tsreview_icon.png`}
            className="ts-loader-logo"
            alt="TS Customer Review"
          />
        </div>

        <div className="ts-loader-brand">
          <div className="ts-loader-title">TS Customer Review</div>
          <div className="ts-loader-subtitle">Review Showcase Studio</div>
        </div>

        <div className="ts-loader-text">
          <span className="ts-loader-label">{label}</span>
          <span className="ts-loader-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>

        <div className="ts-loader-progress-wrapper" aria-hidden="true">
          <div className="ts-loader-progress-bar" />
        </div>
      </div>
    </div>
  );
}

export default TsLoader;
