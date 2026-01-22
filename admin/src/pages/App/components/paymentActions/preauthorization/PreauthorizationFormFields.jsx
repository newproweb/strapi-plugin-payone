import { Flex, TextInput } from "@strapi/design-system";

const PreauthorizationFormFields = ({
  paymentAmount,
  setPaymentAmount,
  preauthReference,
  setPreauthReference,
}) => {
  return (
    <Flex gap={4} wrap="wrap">
      <TextInput
        label="Amount (in cents) *"
        name="paymentAmount"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
        placeholder="Enter amount (e.g., 1000 for €10.00)"
        hint="Amount in cents (e.g., 1000 = €10.00)"
        required
        className="payment-input"
        style={{ flex: 1, minWidth: "250px" }}
      />

      <TextInput
        label="Reference *"
        name="preauthReference"
        value={preauthReference}
        onChange={(e) => setPreauthReference(e.target.value)}
        placeholder="Auto-generated if empty"
        hint="Reference will be auto-generated if left empty"
        className="payment-input"
        style={{ flex: 1, minWidth: "250px" }}
      />
    </Flex>
  );
};

export default PreauthorizationFormFields;


