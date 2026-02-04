import { Image } from 'antd';
import globalSettings from '../../utils/globalSettings';

function TsImage({ mediaUrl, alt, type = 'default' }) {
  const styles = {
    default: {
        borderRadius: '0px',
        height: '100%',
        width: '100%',
    },
    avatar: {
      borderRadius: '100%',
      height: '10rem',
      width: '10rem',
      border: `1px solid ${globalSettings.theme.borderColorLight}`,
      objectFit: 'cover',
    },
    large: {
      borderRadius: '8px',
      height: '12rem',
      width: '12rem',
    },
    medium: {
      borderRadius: '8px',
      height: '8rem',
      width: '8rem',
    },
    small: {
      borderRadius: '8px',
      height: '4rem',
      width: '4rem',
    },
  };

  const imageStyle = styles[type] || styles.default;

  return (
    <div className="mt-8 mb-4">
        <Image
            src={mediaUrl}
            alt={alt}
            style={imageStyle}
        />
    </div>
  );
}

export default TsImage;
