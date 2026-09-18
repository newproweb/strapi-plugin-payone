
export const shouldShowTooltip = (inputType, tooltipContent) => {
  if (!tooltipContent) {
    return false;
  }

  const inputTypesWithTooltip = ["switch", "toggle", "checkbox", "textarea"];

  return inputTypesWithTooltip.includes(inputType);
};


export const getTooltipProps = (tooltipContent) => {
  return {
    label: tooltipContent,
    position: "top",
  };
};
