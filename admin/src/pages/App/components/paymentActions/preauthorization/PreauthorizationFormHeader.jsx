import { Flex, Typography } from "@strapi/design-system";

const PreauthorizationFormHeader = () => {
  return (
    <Flex direction="row" gap={2}>
      <Typography
        variant="omega"
        fontWeight="semiBold"
        textColor="neutral800"
        className="payment-form-title"
      >
        Preauthorization
      </Typography>
      <Typography
        variant="pi"
        textColor="neutral600"
        className="payment-form-description"
      >
        Reserve an amount on a credit card without capturing it immediately.
      </Typography>
    </Flex>
  );
};

export default PreauthorizationFormHeader;


