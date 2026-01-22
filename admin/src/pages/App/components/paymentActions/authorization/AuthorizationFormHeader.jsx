import { Flex, Typography } from "@strapi/design-system";

const AuthorizationFormHeader = () => {
  return (
    <Flex direction="row" gap={2}>
      <Typography
        variant="omega"
        fontWeight="semiBold"
        textColor="neutral800"
        className="payment-form-title"
      >
        Authorization
      </Typography>
      <Typography
        variant="pi"
        textColor="neutral600"
        className="payment-form-description"
      >
        Authorize and capture an amount immediately.
      </Typography>
    </Flex>
  );
};

export default AuthorizationFormHeader;


