import {
  TextInput,
  NumberInput,
  SingleSelect,
  SingleSelectOption,
  Switch,
  Tooltip,
  Textarea,
  Toggle,
  Checkbox,
  Typography
} from "@strapi/design-system";
import { Information } from "@strapi/icons";

const TooltipIcon = ({ tooltipContent }) => {
  if (!tooltipContent) return null;
  return (
    <Tooltip label={tooltipContent ?? ""}>
      <Information
        style={{
          cursor: "pointer"
        }}
      />
    </Tooltip>
  );
};

export const InputComponent = ({
  inputType,
  name,
  value,
  onChange,
  tooltipContent,
  options,
  required = false,
  placeholder = "",
  onLabel = "True",
  offLabel = "False",
  className = "payment-input",
  type = "text",
  ...props
}) => {
  switch (inputType) {
    case "textInput":
      return (
        <TextInput
          className={className}
          name={name}
          value={value ?? ""}
          id={name}
          placeholder={placeholder}
          required={required}
          onChange={onChange}
          type={type}
          endAction={
            tooltipContent ? (
              <TooltipIcon tooltipContent={tooltipContent} />
            ) : null
          }
          {...props}
        />
      );

    case "numberInput":
      return (
        <NumberInput
          className={className}
          onValueChange={onChange}
          value={value ?? ""}
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          startAction={
            tooltipContent ? (
              <TooltipIcon tooltipContent={tooltipContent} />
            ) : null
          }
          {...props}
        />
      );

    case "textarea":
      return (
        <Textarea
          className={className}
          name={name}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          id={name}
          placeholder={placeholder}
          required={required}
          cols={9}
          rows={3}
          {...props}
        />
      );

    case "toggle":
      return (
        <Toggle
          className={className}
          name={name}
          checked={value === true}
          onChange={onChange}
          id={name}
          required={required}
          onLabel={onLabel}
          offLabel={offLabel}
          {...props}
        />
      );

    case "checkbox":
      return (
        <Checkbox
          className={className}
          name={name}
          checked={value === true}
          onCheckedChange={onChange}
          id={name}
          required={required}
          {...props}
        />
      );

    case "dateInput":
      return (
        <TextInput
          className={className}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type="date"
          startAction={
            tooltipContent ? (
              <TooltipIcon tooltipContent={tooltipContent} />
            ) : null
          }
          {...props}
        />
      );

    case "switch":
      return (
        <Switch
          className={className}
          onCheckedChange={onChange}
          checked={value === true}
          {...props}
        />
      );

    case "select":
      return (
        <SingleSelect
          className={className}
          name={name}
          value={value ?? ""}
          onChange={(selectedValue) => {
            if (typeof onChange === "function") {
              const syntheticEvent = {
                target: { value: selectedValue },
                currentTarget: { value: selectedValue }
              };
              onChange(syntheticEvent);
            }
          }}
          required={required}
          placeholder={placeholder}
          startIcon={
            tooltipContent ? (
              <TooltipIcon tooltipContent={tooltipContent} />
            ) : null
          }
          {...props}
        >
          {options.map((option) => (
            <SingleSelectOption
              className={className}
              key={option.value}
              value={option.value}
              disabled={option.disabled || false}
            >
              {option.label}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      );

    default:
      return (
        <Typography variant="omega" fontWeight="semiBold">
          Invalid input type: {inputType}
        </Typography>
      );
  }
};
