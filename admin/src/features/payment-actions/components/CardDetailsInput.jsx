import { Box, Flex, Link, Typography } from "@strapi/design-system";
import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { CARD_TYPE_OPTIONS, PAYONE_3DS_DOCS_URL, TEST_3DS_CARDS } from "../../../constants/payment";

const testCardValue = (card) => `${card.cardtype}-${card.cardpan}`;
const CARD_FIELDS = ["cardtype", "cardpan", "cardexpiredate", "cardcvc2"];

/** Card type, PAN, expiry and CVC inputs, plus a picker that fills in a Payone 3-D Secure test card. */
export const CardDetailsInput = ({ cardtype, cardpan, cardexpiredate, cardcvc2, onFieldChange }) => {
  const { t } = usePluginTranslations();
  const matchingCard = TEST_3DS_CARDS.find((card) => card.cardtype === cardtype && card.cardpan === cardpan);
  const selectedTestCard = matchingCard ? testCardValue(matchingCard) : "";

  const handleTestCardSelect = (value) => {
    const selectedCard = TEST_3DS_CARDS.find((card) => testCardValue(card) === value);
    if (!selectedCard) return;
    CARD_FIELDS.forEach((field) => onFieldChange(field, selectedCard[field]));
  };

  const testCardOptions = TEST_3DS_CARDS.map((card) => ({ value: testCardValue(card), label: `${card.name} - ${card.description}` }));

  return (
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Flex direction="row" gap={2} alignItems="flex-start">
          <FormField
            name="testCard"
            label={t("card.testCards", "3D Secure Test Cards")}
            value={selectedTestCard}
            onChange={(e) => handleTestCardSelect(e.target?.value || e)}
            inputType="select"
            placeholder={t("card.selectTestCard", "Select a 3DS test card to auto-fill")}
            tooltipContent={t("card.testCardsTooltip", "These cards will trigger 3DS authentication redirect. Password: 12345")}
            options={testCardOptions}
          />
        </Flex>

        <Flex gap={4} wrap="wrap" alignItems="flex-start">
          <FormField
            name="cardtype"
            label={t("card.cardType", "Card Type *")}
            value={cardtype || ""}
            onChange={(e) => onFieldChange("cardtype", e.target?.value || e)}
            inputType="select"
            required
            tooltipContent={t("card.cardTypeTooltip", "Select credit card type")}
            options={CARD_TYPE_OPTIONS}
            style={{ flex: 1, minWidth: "200px" }}
          />
          <FormField
            name="cardpan"
            label={t("card.cardNumber", "Card Number (PAN) *")}
            value={cardpan || ""}
            onChange={(e) => onFieldChange("cardpan", e.target.value)}
            inputType="textInput"
            placeholder={t("card.cardNumberPlaceholder", "Enter card number")}
            required
            tooltipContent={t("card.cardNumberTooltip", "Credit card number (PAN)")}
            style={{ flex: 2, minWidth: "300px" }}
          />
        </Flex>

        <Flex gap={4} wrap="wrap" alignItems="flex-start">
          <FormField
            name="cardexpiredate"
            label={t("card.expiryDate", "Expiry Date *")}
            value={cardexpiredate || ""}
            onChange={(e) => onFieldChange("cardexpiredate", e.target.value)}
            inputType="textInput"
            placeholder={t("card.expiryPlaceholder", "YYMM (e.g., 2512)")}
            required
            tooltipContent={t("card.expiryTooltip", "Format: YYMM (e.g., 2512 = December 2025)")}
            type="text"
            maxLength={4}
            style={{ flex: 1, minWidth: "150px" }}
          />
          <FormField
            name="cardcvc2"
            label={t("card.cvc", "CVC/CVV *")}
            value={cardcvc2 || ""}
            onChange={(e) => onFieldChange("cardcvc2", e.target.value)}
            inputType="textInput"
            placeholder={t("card.cvcPlaceholder", "123 or 1234")}
            required
            tooltipContent={cardtype === "A" ? t("card.cvcAmex", "4 digits for AMEX") : t("card.cvcOther", "3 digits for other cards")}
            type="text"
            maxLength={4}
            style={{ flex: 1, minWidth: "150px" }}
          />
        </Flex>

        <Box paddingTop={2}>
          <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
            {t("card.3dsDocLink", "For all test card numbers (positive, negative, frictionless 3DS), 3D Secure test data, and detailed documentation, please refer to the")}{" "}
            <Link href={PAYONE_3DS_DOCS_URL} target="_blank" rel="noopener noreferrer">
              {t("card.3dsDocTitle", "Payone 3D Secure Documentation")}
            </Link>
            .
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};
