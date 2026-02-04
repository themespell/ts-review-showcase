import { create } from 'zustand'

const editorStore = create((set) => ({
    // Post Data
    postID: null,
    postType: null,
    common: {
        range: {
            min: 0,
            max: 2500,
        },
    },
    selectedLayout: {
        label: 'Card',
        value: 'Card',
        type: 'free'
    },
    selectedView: {
        label: 'Grid',
        value: 'grid',
        type: 'free'
    },
    showcaseDetails: {
        enable: false,
        type: 'modal',
    },

    // Container Tools
    containerSettings: {
        width:{
          range: {
            min: 0,
            max: 2500,
          },
          default: {
           desktop: '1200px',
           tablet: '768px',
           mobile: '100%',
          }
        }
    },
    columnSettings: {
        column:{
          range: {
            min: 1,
            max: 12,
          },
          default: {
            desktop: 3,
            tablet:  2,
            mobile:  1,
          }
        },
        gap:{
            range: {
                min: 1,
                max: 100,
            },
            default:{
                desktop: '10px',
                tablet:  '15px',
                mobile:  '20px',
            }
        }
    },
    carouselSettings:{
        slidesToShow: {
            range: {
                min: 1,
                max: 12,
            },
            default: {
                desktop: 3,
                tablet:  2,
                mobile:  1,
            }
        },
        slidesToScroll:{
            range: {
                min: 1,
                max: 12,
            },
            default: {
                desktop: 1,
                tablet:  1,
                mobile:  1,
            }
        },
        slideSpeed:{
            range: {
                min: 100,
                max: 5000,
            },
            default: 3000
        },
        gap:{
            range: {
                min: 0,
                max: 100,
            },
            default: 20
        },
        transition: 'slide',
        infinite: true,
        repeat: true,
        centerSlide: false,
        autoPlay: true
    },
    marqueeSettings:{
        marqueeSpeed:{
            range: {
                min: 1,
                max: 1000,
            },
            default: 50
        },
        infinite: true,
        pauseOnClick: false,
        pauseOnHover: true,
        direction: "left",
        delay: 0
    },

    updateState: (key, value) => set((state) => {
        const keys = key.split('.');
        if (keys.length === 1) {
            return {
                ...state,
                [key]: value,
            };
        }
        const deepUpdate = (obj, keys) => {
            const [firstKey, ...restKeys] = keys;
            if (restKeys.length === 0) {
                return { ...obj, [firstKey]: value };
            }
            
            return {
                ...obj,
                [firstKey]: deepUpdate(obj[firstKey] !== undefined ? obj[firstKey] : {}, restKeys)
            };
        };
        return deepUpdate(state, keys);
    }),
}))

export default editorStore;
