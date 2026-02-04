import TsButton from './TsButton';
import { Image, Form } from 'antd';

function TsMedia({ label, name, form, style, mediaUrl, setMediaUrl }) {
  const openMediaLibrary = () => {
    var wkMedia;

    // Create media library frame or open existing one
    if (wkMedia) {
      wkMedia.open();
      return;
    }

    wkMedia = wp.media.frames.file_frame = wp.media({
      title: `Select ${label}`,
      button: {
        text: `Select ${label}`,
      },
      multiple: false,  // Only allow single selection
    });

    wkMedia.on('select', function () {
      const attachment = wkMedia.state().get('selection').first().toJSON();
      if (setMediaUrl) {
        setMediaUrl(attachment.url);  // Set the media URL through the prop function
      }
      form.setFieldsValue({ [name]: attachment.url }); // Set form field value dynamically using `name`
    });

    wkMedia.open();
  };

  return (
    <>
      <Form.Item
        // label={label}
        name={name}
        rules={[
            {
                required: true,
                message: `Please select ${label}!`
            }
        ]}
      >
        <div className='flex items-center gap-6 w-full'>
          <TsButton 
            label={`Select ${label}`}
            id="wk-button"
            className="ts-media__button"
            htmlType="button"
            onClick={openMediaLibrary}
          />
        </div>
      </Form.Item>
    </>
  );
}

export default TsMedia;