import * as React from "react";
import { Box, Flex, Typography, Link } from "@strapi/design-system";
import RenderInput from "../RenderInput";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const TEST_3DS_CARDS = [
  {
    name: "VISA - 3DS 2.0 (Challenge)",
    cardtype: "V",
    cardpan: "4716971940353559",
    cardexpiredate: "2512",
    cardcvc2: "123",
    description: "3DS 2.0 with challenge - Password: 12345",
  },
  {
    name: "Mastercard - 3DS 2.0 (Challenge)",
    cardtype: "M",
    cardpan: "5404127720739582",
    cardexpiredate: "2512",
    cardcvc2: "123",
    description: "3DS 2.0 with challenge - Password: 12345",
  },
];

const CardDetailsInput = ({
  cardtype,
  setCardtype,
  cardpan,
  setCardpan,
  cardexpiredate,
  setCardexpiredate,
  cardcvc2,
  setCardcvc2,
}) => {
  const { t } = usePluginTranslations();
  const [selectedTestCard, setSelectedTestCard] = React.useState("");
  const isUpdatingFromTestCard = React.useRef(false);

  React.useEffect(() => {
    if (isUpdatingFromTestCard.current) {
      isUpdatingFromTestCard.current = false;
      return;
    }

    const matchingCard = TEST_3DS_CARDS.find(
      (card) => card.cardtype === cardtype && card.cardpan === cardpan
    );

    if (matchingCard) {
      const testCardValue = `${matchingCard.cardtype}-${matchingCard.cardpan}`;
      if (selectedTestCard !== testCardValue) {
        setSelectedTestCard(testCardValue);
      }
    } else if (selectedTestCard) {
      setSelectedTestCard("");
    }
  }, [cardtype, cardpan, selectedTestCard]);

  const handleTestCardSelect = (value) => {
    if (!value || value === "") {
      setSelectedTestCard("");
      return;
    }

    const selectedCard = TEST_3DS_CARDS.find(
      (card) => `${card.cardtype}-${card.cardpan}` === value
    );

    if (selectedCard) {
      isUpdatingFromTestCard.current = true;

      setCardtype(selectedCard.cardtype);
      setCardpan(selectedCard.cardpan);
      setCardexpiredate(selectedCard.cardexpiredate);
      setCardcvc2(selectedCard.cardcvc2);
      setSelectedTestCard(value);
    }
  };

  return (
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Flex direction="row" gap={2} alignItems="flex-start">
          <RenderInput
            name="testCard"
            label={t("card.testCards", "3D Secure Test Cards")}
            value={selectedTestCard || ""}
            onChange={(e) => {
              const value = e.target?.value || e;
              handleTestCardSelect(value);
            }}
            inputType="select"
            placeholder={t("card.selectTestCard", "Select a 3DS test card to auto-fill")}
            tooltipContent={t("card.testCardsTooltip", "These cards will trigger 3DS authentication redirect. Password: 12345")}
            options={[
              { value: "", label: t("card.selectTestCardOption", "-- Select a test card --") },
              ...TEST_3DS_CARDS.map((card, index) => ({
                value: `${card.cardtype}-${card.cardpan}`,
                label: `${card.name} - ${card.description}`,
              })),
            ]}
          />
        </Flex>

        <Flex gap={4} wrap="wrap" alignItems="flex-start">
          <RenderInput
            name="cardtype"
            label={t("card.cardType", "Card Type *")}
            value={cardtype || ""}
            onChange={(e) => {
              const value = e.target?.value || e;
              setCardtype(value);
            }}
            inputType="select"
            required
            tooltipContent={t("card.cardTypeTooltip", "Select credit card type")}
            options={[
              { value: "V", label: "VISA" },
              { value: "M", label: "Mastercard" },
              { value: "A", label: "American Express" },
              { value: "J", label: "JCB" },
              { value: "O", label: "Maestro International" },
              { value: "D", label: "Diners Club" },
            ]}
            style={{ flex: 1, minWidth: "200px" }}
          />

          <RenderInput
            name="cardpan"
            label={t("card.cardNumber", "Card Number (PAN) *")}
            value={cardpan || ""}
            onChange={(e) => setCardpan(e.target.value)}
            inputType="textInput"
            placeholder={t("card.cardNumberPlaceholder", "Enter card number")}
            required
            tooltipContent={t("card.cardNumberTooltip", "Credit card number (PAN)")}
            style={{ flex: 2, minWidth: "300px" }}
          />
        </Flex>

        <Flex gap={4} wrap="wrap" alignItems="flex-start">
          <RenderInput
            name="cardexpiredate"
            label={t("card.expiryDate", "Expiry Date *")}
            value={cardexpiredate || ""}
            onChange={(e) => setCardexpiredate(e.target.value)}
            inputType="textInput"
            placeholder={t("card.expiryPlaceholder", "YYMM (e.g., 2512)")}
            required
            tooltipContent={t("card.expiryTooltip", "Format: YYMM (e.g., 2512 = December 2025)")}
            type="text"
            maxLength={4}
            style={{ flex: 1, minWidth: "150px" }}
          />

          <RenderInput
            name="cardcvc2"
            label={t("card.cvc", "CVC/CVV *")}
            value={cardcvc2 || ""}
            onChange={(e) => setCardcvc2(e.target.value)}
            inputType="textInput"
            placeholder={t("card.cvcPlaceholder", "123 or 1234")}
            required
            tooltipContent={
              cardtype === "A"
                ? t("card.cvcAmex", "4 digits for AMEX")
                : t("card.cvcOther", "3 digits for other cards")
            }
            type="text"
            maxLength={4}
            style={{ flex: 1, minWidth: "150px" }}
          />
        </Flex>

        <Box paddingTop={2}>
          <Typography
            variant="pi"
            textColor="neutral600"
            style={{ textAlign: "left" }}
          >
            {t("card.3dsDocLink", "For all test card numbers (positive, negative, frictionless 3DS), 3D Secure test data, and detailed documentation, please refer to the")}{" "}
            <Link
              href="https://docs.payone.com/security-risk-management/3d-secure#/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("card.3dsDocTitle", "Payone 3D Secure Documentation")}
            </Link>
            .
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default CardDetailsInput;
