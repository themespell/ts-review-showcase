import globalSettings from '../../utils/globalSettings';
import { Drawer } from 'antd';

function TsDrawer({ label, isOpen, onClose, position, children }) {
  return (
    <Drawer 
      title={label}
      onClose={onClose}
      open={isOpen}
      placement={position}
      mask={false}
    >
      {children}
    </Drawer>
  );
}

export default TsDrawer;