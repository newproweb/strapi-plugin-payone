import { IconButton, Tooltip } from "@strapi/design-system";
import { Information } from "@strapi/icons";

const InfoTooltip = ({ label, description, id }) => {
  return (
    <Tooltip label={description} description={description} id={id}>
      <IconButton
        noBorder
        background="transparent"
        icon={<Information fontSize={16} color="#c7c8c7" />}
      />
    </Tooltip>
  );
};

export default InfoTooltip;
