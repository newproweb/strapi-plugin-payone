import * as React from "react";
import { Accordion, Box, Flex, Typography } from "@strapi/design-system";
import { Link } from "@strapi/design-system";
import CodeBlock from "./CodeBlock";

const ThreeDSecureSection = () => {
  return (
    <Accordion.Item value="3d-secure" id="3d-secure">
      <Accordion.Header>
        <Accordion.Trigger>3D Secure Authentication</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <Flex direction="column" alignItems={"stretch"} gap={4} padding={4}>
          <Typography variant="delta" as="h3" fontWeight="bold">
            3D Secure Authentication
          </Typography>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              How 3D Secure Works:
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                1. Enable 3D Secure in Strapi admin panel (Configuration tab)
              </Typography>
              <Typography variant="pi">
                2. Make a credit card payment request
              </Typography>
              <Typography variant="pi">
                3. If 3DS is required, you'll receive a{" "}
                <code>redirecturl</code> in the response
              </Typography>
              <Typography variant="pi">
                4. Redirect the user to the <code>redirecturl</code> for
                authentication
              </Typography>
              <Typography variant="pi">
                5. User enters password/confirms with bank
              </Typography>
              <Typography variant="pi">
                6. User is redirected back to your <code>successurl</code>,{" "}
                <code>errorurl</code>, or <code>backurl</code>
              </Typography>
              <Typography variant="pi">
                7. Handle the callback and check transaction status
              </Typography>
            </Flex>
          </Box>

          <Box>
            <Typography variant="pi" fontWeight="bold">
              Special 3D Secure Test Cards (from Payone Documentation):
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              marginBottom={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                • <strong>Visa 3DS Test Card:</strong> 4000000000000002
              </Typography>
              <Typography variant="pi">
                • <strong>Mastercard 3DS Test Card:</strong>{" "}
                5453010000059543
              </Typography>
              <Typography variant="pi">
                • <strong>Expiry:</strong> Any future date (e.g., 12/25 =
                "2512")
              </Typography>
              <Typography variant="pi">
                • <strong>CVC:</strong> Any 3 digits (e.g., 123)
              </Typography>
              <Typography variant="pi">
                • <strong>3DS Password:</strong> Usually "123456" or as provided
                by Payone (check your Payone test documentation)
              </Typography>
            </Flex>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone 3D Secure Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/3D+Secure"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/3D+Secure
              </Link>
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Standard Credit Card Test Cards (without 3DS):
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              marginBottom={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                • <strong>Visa:</strong> 4111111111111111
              </Typography>
              <Typography variant="pi">
                • <strong>Mastercard:</strong> 5555555555554444
              </Typography>
              <Typography variant="pi">
                • <strong>Amex:</strong> 378282246310005
              </Typography>
              <Typography variant="pi">
                • <strong>Expiry:</strong> Any future date (e.g., 12/25 =
                "2512")
              </Typography>
              <Typography variant="pi">
                • <strong>CVC:</strong> Any 3 digits (4 digits for Amex)
              </Typography>
            </Flex>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone Test Cards Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Credit+Card+Test+Cards"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Credit+Card+Test+Cards
              </Link>
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Example Flow:
            </Typography>
            <div style={{ marginTop: "12px" }}>
              <CodeBlock>{`// 1. Make payment request
const response = await fetch('/api/strapi-plugin-payone-provider/preauthorization', {
  method: 'POST',
  body: JSON.stringify({
    amount: 1000,
    currency: 'EUR',
    clearingtype: 'cc',
    cardtype: 'V',
    cardpan: '4111111111111111',
    cardexpiredate: '2512',
    cardcvc2: '123',
    successurl: 'https://yoursite.com/payment/success',
    errorurl: 'https://yoursite.com/payment/error',
    backurl: 'https://yoursite.com/payment/back',
    // ... other params
  })
});

const result = await response.json();

// 2. Check if 3DS redirect is required
if (result.status === 'REDIRECT' && result.redirecturl) {
  // 3. Redirect user to 3DS authentication page
  window.location.href = result.redirecturl;
}

// 4. Handle callback (in your success/error/back URL handler)
// The callback will include transaction status and txid`}</CodeBlock>
            </div>
          </Box>
          <Box marginTop={2}>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone 3D Secure Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/3D+Secure"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/3D+Secure
              </Link>
            </Typography>
          </Box>
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default ThreeDSecureSection;

