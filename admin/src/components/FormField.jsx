import {
  Checkbox,
  Field,
  Flex,
  NumberInput,
  SingleSelect,
  SingleSelectOption,
  Switch,
  Textarea,
  TextInput,
  Toggle,
  Tooltip,
  Typography,
} from "@strapi/design-system";
import { Information } from "@strapi/icons";

const LABEL_TOOLTIP_TYPES = ["switch", "toggle", "checkbox", "textarea"];

const LABEL_LAYOUTS = {
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between" },
  column: { display: "flex", flexDirection: "column" },
};

const TooltipIcon = ({ content }) => {
  if (!content) return null;
  return (
    <Tooltip label={content}>
      <Information style={{ cursor: "pointer" }} />
    </Tooltip>
  );
};

const toSyntheticEvent = (value) => ({ target: { value }, currentTarget: { value } });

const FieldInput = ({ inputType, name, value, onChange, tooltipContent, options = [], required, placeholder = "", onLabel = "True", offLabel = "False", type = "text", ...props }) => {
  const tooltip = tooltipContent ? <TooltipIcon content={tooltipContent} /> : null;

  switch (inputType) {
    case "textInput":
      return <TextInput name={name} value={value ?? ""} id={name} placeholder={placeholder} required={required} onChange={onChange} type={type} endAction={tooltip} {...props} />;
    case "numberInput":
      return <NumberInput onValueChange={onChange} value={value ?? ""} id={name} name={name} placeholder={placeholder} required={required} startAction={tooltip} {...props} />;
    case "textarea":
      return <Textarea name={name} value={value ?? ""} onChange={(e) => onChange(e.target.value)} id={name} placeholder={placeholder} required={required} cols={9} rows={3} {...props} />;
    case "toggle":
      return <Toggle name={name} checked={value === true} onChange={onChange} id={name} required={required} onLabel={onLabel} offLabel={offLabel} {...props} />;
    case "checkbox":
      return <Checkbox name={name} checked={value === true} onCheckedChange={onChange} id={name} required={required} {...props} />;
    case "dateInput":
      return <TextInput name={name} value={value ?? ""} onChange={onChange} placeholder={placeholder} required={required} type="date" startAction={tooltip} {...props} />;
    case "switch":
      return <Switch onCheckedChange={onChange} checked={value === true} {...props} />;
    case "select":
      return (
        <SingleSelect
          name={name}
          value={value ?? ""}
          onChange={(selectedValue) => typeof onChange === "function" && onChange(toSyntheticEvent(selectedValue))}
          required={required}
          placeholder={placeholder}
          startIcon={tooltip}
          {...props}
        >
          {options.map((option) => (
            <SingleSelectOption key={option.value} value={option.value} disabled={option.disabled || false}>
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

/**
 * Labelled form control. Text inputs call `onChange(event)`, selects call it with a
 * `{ target: { value } }` event, switches/checkboxes with the boolean and textareas with the value.
 */
export const FormField = ({
  hint,
  label,
  inputType = "textInput",
  tooltipContent = "",
  additionalMessage = "",
  labelStyle = {},
  labelDirection = "column",
  ...inputProps
}) => (
  <Flex direction="column" gap={2} alignItems="stretch" width="100%">
    <Field.Root hint={hint} width="100%" style={LABEL_LAYOUTS[labelDirection] || LABEL_LAYOUTS.column}>
      <Flex alignItems="center" gap={1} style={{ marginBottom: "5px" }}>
        <Field.Label style={labelStyle}>{label}</Field.Label>
        {tooltipContent && LABEL_TOOLTIP_TYPES.includes(inputType) && <TooltipIcon content={tooltipContent} />}
      </Flex>
      <FieldInput inputType={inputType} tooltipContent={tooltipContent} {...inputProps} />
      <Field.Hint />
    </Field.Root>
    {additionalMessage && (
      <Typography variant="pi" textColor="ActiveText">
        {additionalMessage}
      </Typography>
    )}
  </Flex>
);
