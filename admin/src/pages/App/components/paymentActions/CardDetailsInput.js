import React, { useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Typography,
  TextInput,
  Select,
  Option,
  Link
} from "@strapi/design-system";

// 3DS Test Cards that require redirect (challenge workflow)
const TEST_3DS_CARDS = [
  {
    name: "VISA - 3DS 2.0 (Challenge)",
    cardtype: "V",
    cardpan: "4716971940353559",
    cardexpiredate: "2512",
    cardcvc2: "123",
    description: "3DS 2.0 with challenge - Password: 12345"
  },
  {
    name: "Mastercard - 3DS 2.0 (Challenge)",
    cardtype: "M",
    cardpan: "5404127720739582",
    cardexpiredate: "2512",
    cardcvc2: "123",
    description: "3DS 2.0 with challenge - Password: 12345"
  },
  // {
  //   name: "AMEX - 3DS 2.0 (Challenge)",
  //   cardtype: "A",
  //   cardpan: "375144726036141",
  //   cardexpiredate: "2512",
  //   cardcvc2: "1234",
  //   description: "3DS 2.0 with challenge - Password: 12345"
  // }
];

const CardDetailsInput = ({
  cardtype,
  setCardtype,
  cardpan,
  setCardpan,
  cardexpiredate,
  setCardexpiredate,
  cardcvc2,
  setCardcvc2
}) => {
  const [selectedTestCard, setSelectedTestCard] = React.useState("");
  const isUpdatingFromTestCard = useRef(false);

  useEffect(() => {
    if (isUpdatingFromTestCard.current) {
      isUpdatingFromTestCard.current = false;
      return;
    }

    const matchingCard = TEST_3DS_CARDS.find(
      card => card.cardtype === cardtype && card.cardpan === cardpan
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

    const selectedCard = TEST_3DS_CARDS.find(card =>
      `${card.cardtype}-${card.cardpan}` === value
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
          <Select
            label="3D Secure Test Cards"
            name="testCard"
            value={selectedTestCard}
            placeholder="Select a 3DS test card to auto-fill"
            hint="These cards will trigger 3DS authentication redirect. Password: 12345"
            onChange={handleTestCardSelect}
            className="payment-input"
          >
            <Option value="">-- Select a test card --</Option>
            {TEST_3DS_CARDS.map((card, index) => (
              <Option key={index} value={`${card.cardtype}-${card.cardpan}`}>
                {card.name} - {card.description}
              </Option>
            ))}
          </Select>
        </Flex>

        <Flex gap={4} wrap="wrap" alignItems="flex-start">
          <Select
            label="Card Type *"
            name="cardtype"
            value={cardtype || ""}
            onChange={(value) => setCardtype(value)}
            required
            hint="Select credit card type"
            className="payment-input"
            style={{ flex: 1, minWidth: "200px" }}
          >
            <Option value="V">VISA</Option>
            <Option value="M">Mastercard</Option>
            <Option value="A">American Express</Option>
            <Option value="J">JCB</Option>
            <Option value="O">Maestro International</Option>
            <Option value="D">Diners Club</Option>
          </Select>

          <TextInput
            label="Card Number (PAN) *"
            name="cardpan"
            value={cardpan || ""}
            onChange={(e) => setCardpan(e.target.value)}
            placeholder="Enter card number"
            hint="Credit card number (PAN)"
            required
            className="payment-input"
            style={{ flex: 2, minWidth: "300px" }}
          />
        </Flex>

        <Flex gap={4} wrap="wrap" alignItems="flex-start">
          <TextInput
            label="Expiry Date *"
            name="cardexpiredate"
            value={cardexpiredate || ""}
            onChange={(e) => setCardexpiredate(e.target.value)}
            placeholder="YYMM (e.g., 2512)"
            hint="Format: YYMM (e.g., 2512 = December 2025)"
            required
            maxLength={4}
            className="payment-input"
            style={{ flex: 1, minWidth: "150px" }}
          />

          <TextInput
            label="CVC/CVV *"
            name="cardcvc2"
            value={cardcvc2 || ""}
            onChange={(e) => setCardcvc2(e.target.value)}
            placeholder="123 or 1234"
            hint={cardtype === "A" ? "4 digits for AMEX" : "3 digits for other cards"}
            required
            maxLength={4}
            className="payment-input"
            style={{ flex: 1, minWidth: "150px" }}
          />
        </Flex>

        <Box paddingTop={2}>
          <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
            For all test card numbers (positive, negative, frictionless 3DS), 3D Secure test data, and detailed documentation, please refer to the{" "}
            <Link href="https://docs.payone.com/security-risk-management/3d-secure#/" target="_blank" rel="noopener noreferrer">
              Payone 3D Secure Documentation
            </Link>
            .
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default CardDetailsInput;

