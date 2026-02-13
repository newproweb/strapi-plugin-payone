import { Field, Flex, Tooltip, Typography } from "@strapi/design-system";
import { Information } from "@strapi/icons";
import { InputComponent } from "../../utils/getInputComponent";
import { shouldShowTooltip } from "../../utils/tooltipHelpers";

const RenderInput = ({
  hint,
  label,
  name,
  value,
  onChange,
  inputType = "textInput",
  options = [],
  tooltipContent = "",
  additionalMessage = "",
  required = false,
  placeholder,
  onLabel,
  offLabel,
  type = "text",
  className = "payment-input",
  labelStyle = {},
  labelDirection = "column",
  ...props
}) => {
  const getLabelStyle = () => {
    if (labelDirection === "row") {
      return {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
      };
    }
    return { display: "flex", flexDirection: "column" };
  };

  return (
    <Flex direction="column" gap={2} alignItems={"stretch"} width={"100%"}>
      <Field.Root hint={hint} width={"100%"} style={getLabelStyle()}>
        <Flex alignItems="center" gap={1} style={{ marginBottom: "5px" }}>
          <Field.Label style={labelStyle}>{label}</Field.Label>
          {shouldShowTooltip(inputType, tooltipContent) && (
            <Tooltip label={tooltipContent}>
              <Information
                style={{
                  cursor: "pointer"
                }}
              />
            </Tooltip>
          )}
        </Flex>
        <InputComponent
          inputType={inputType}
          name={name}
          value={value}
          onChange={onChange}
          tooltipContent={tooltipContent}
          options={options}
          required={required}
          className={className}
          placeholder={placeholder}
          onLabel={onLabel}
          offLabel={offLabel}
          type={type}
          {...props}
        />
        <Field.Hint />
      </Field.Root>
      {additionalMessage && (
        <Typography variant="pi" textColor={"ActiveText"}>
          {additionalMessage}
        </Typography>
      )}
    </Flex>
  );
};

export default RenderInput;
