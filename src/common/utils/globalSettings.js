import {getTranslations} from "./translations.js";

const isPro = !!tsreview_settings.is_pro ?? false;

const translations = getTranslations();

const globalSettings = {
    token: {
        colorPrimary: '#2271b1',
        colorBgContainer: '#fff',
        colorText: '#000000',
    },
    components: {
      Table: {
        "headerBg": "#E6F0FF",
        "headerColor": "#111C5C",
        "headerBorderRadius": 15,
        "borderRadius": 15,
        "boxShadowSecondary": 0
      },
      Input: {
        "colorBorder": "#C1DAF8",
        "borderRadius": 12,
        "paddingBlock": 6,
        "paddingBlockLG": 8
      },
    },
    theme: {
      primaryColor: '#2271b1',
      textColor: '#333',
      borderColor: '#ededed',
      borderColorLight: '#DFD5F6'
    },
    navigation: {
      dashboard:{
        link: '?page=ts-review-showcase&path=dashboard',
        label: 'Dashboard',
        icon: ''
      },
      reviewShowcase:{
        link: '?page=ts-review-showcase&path=showcase',
        label: 'Review Showcase',
        icon: ''
      },
      reviewForm:{
        link: '?page=ts-review-showcase&path=review-form',
        label: 'Review Form',
        icon: ''
      },
      settings:{
        link: '?page=ts-review-showcase&path=settings',
        label: 'Settings',
        icon: ''
      },
    },
    topbar: {
      menuitems: {
          dashboard:{
              link: '?page=ts-review-showcase&path=dashboard',
              label: translations.dashboard,
          },
          reviewShowcase:{
              link: '?page=ts-review-showcase&path=showcase',
              label: translations.reviewShowcase,
          },
          reviewForm:{
              link: '?page=ts-review-showcase&path=review-form',
              label: translations.reviewForm,
          },
          settings:{
              link: '?page=ts-review-showcase&path=settings',
              label: translations.settings,
          },
          ...(isPro && {
              account:{
                  link: 'admin.php?page=tsreview-pro-account',
                  label: translations.account,
              }
          }),
          supportForum:{
              link: 'https://wordpress.org/support/plugin/ts-review-showcase',
              label: translations.supportForum,
          },
      },
        ...(isPro ? {} : {
            proLink: {
                link: 'https://themespell.com/ts-review-showcase',
                label: translations.getPro,
            }
        }),
      version: '1.0.0',
    }
};

export default globalSettings;
