import { Divider } from "antd";
import globalSettings from '../../utils/globalSettings';

function TsDivider({ label }) {
  return (
    <div className="mb-4">
        <Divider
        style={{
            borderColor: globalSettings.theme.borderColor,
            margin: '0px'
        }}
        >{label}</Divider>
    </div>
  );
}

export default TsDivider;