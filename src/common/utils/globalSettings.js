import {getTranslations} from "./translations.js";

const isPro = !!tsreview_settings.is_pro ?? false;

const translations = getTranslations();

const globalSettings = {
    token: {
        colorPrimary: '#575ECF',
        colorBgContainer: '#fff',
        colorText: '#000000',
    },
    components: {
      Table: {
        "headerBg": "#F4F1FF",
        "headerColor": "#2B265A",
        "headerBorderRadius": 15,
        "borderRadius": 15,
        "boxShadowSecondary": 0
      },
      Input: {
        "colorBorder": "#D5CFFE",
        "borderRadius": 12,
        "paddingBlock": 6,
        "paddingBlockLG": 8
      },
    },
    theme: {
      primaryColor: '#575ECF',
      textColor: '#333',
      borderColor: '#ededed',
      borderColorLight: '#D5CFFE'
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
      emailTemplates:{
        link: '?page=ts-review-showcase&path=email-templates',
        label: 'Email Templates',
        icon: ''
      },
      settings:{
        link: '?page=ts-review-showcase&path=settings',
        label: 'Settings',
        icon: ''
      },
      addons:{
        link: '?page=ts-review-showcase&path=addons',
        label: 'Addons',
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
          emailTemplates:{
              link: '?page=ts-review-showcase&path=email-templates',
              label: 'Email Templates',
          },
          settings:{
              link: '?page=ts-review-showcase&path=settings',
              label: translations.settings,
          },
          addons:{
              link: '?page=ts-review-showcase&path=addons',
              label: 'Addons',
          },
          ...(isPro && {
              account:{
                  link: 'admin.php?page=tsreview-pro-account',
                  label: translations.account,
              }
          }),
          supportForum:{
              link: '?page=ts-review-showcase&path=support',
              label: translations.supportForum,
          },
      },
        ...(isPro ? {} : {
            proLink: {
                link: 'https://themespell.com/ts-review-showcase',
                label: translations.getPro,
            }
        }),
      version: '1.0.4',
    }
};

export default globalSettings;
