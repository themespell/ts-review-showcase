export const getCommonStyles = (settings) => ({
    //width: `${settings?.containerSettings?.width?.default?.desktop || '100%'}`,
    //gridTemplateColumns: `repeat(${settings?.columnSettings?.column?.default?.desktop || 1}, 1fr)`,
    //gap: `${settings?.columnSettings?.gap?.default?.desktop}`,
    marginTop: `${settings?.containerSettings?.margin_top || 0}px`,
    marginRight: `${settings?.containerSettings?.margin_right || 0}px`,
    marginBottom: `${settings?.containerSettings?.margin_bottom || 0}px`,
    marginLeft: `${settings?.containerSettings?.margin_left || 0}px`,
    paddingTop: `${settings?.containerSettings?.padding_top || 0}px`,
    paddingRight: `${settings?.containerSettings?.padding_right || 0}px`,
    paddingBottom: `${settings?.containerSettings?.padding_bottom || 0}px`,
    paddingLeft: `${settings?.containerSettings?.padding_left || 0}px`,
    borderTopLeftRadius: `${settings?.containerSettings?.borderRadius_top || 0}px`,
    borderTopRightRadius: `${settings?.containerSettings?.borderRadius_right || 0}px`,
    borderBottomLeftRadius: `${settings?.containerSettings?.borderRadius_bottom || 0}px`,
    borderBottomRightRadius: `${settings?.containerSettings?.borderRadius_left || 0}px`,
    backgroundColor: settings.containerSettings?.backgroundColor,
    animation: 'tsreview__entrance-fadeIn 1.5s ease-out'
});