import * as React from "react";
import { Accordion, Box, Flex, Typography } from "@strapi/design-system";
import { Link } from "@strapi/design-system";

const TestCredentialsSection = () => {
  return (
    <Accordion.Item value="test-credentials" id="test-credentials">
      <Accordion.Header>
        <Accordion.Trigger>Test Credentials</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <Flex direction="column" alignItems={"stretch"} gap={4} padding={4}>
          <Typography variant="delta" as="h3" fontWeight="bold">
            Test Credentials
          </Typography>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Credit Card Test Cards (Standard):
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
              📚 <strong>Payone Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Test+and+Live+Data"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Test+and+Live+Data
              </Link>
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              3D Secure Test Cards (Special Test Data):
            </Typography>
            <Flex
              direction="column"
              marginBottom={2}
              marginTop={2}
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
                • <strong>3DS Password:</strong> Usually "123456" or as
                provided by Payone
              </Typography>
              <Typography variant="pi">
                • <strong>Expiry:</strong> Any future date (e.g., 12/25 =
                "2512")
              </Typography>
              <Typography variant="pi">
                • <strong>CVC:</strong> Any 3 digits
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
              PayPal Test Data:
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              marginBottom={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                • Use PayPal Sandbox test accounts
              </Typography>
              <Typography variant="pi">
                • Create test accounts in PayPal Developer Dashboard
              </Typography>
              <Typography variant="pi">
                • Test with both buyer and merchant sandbox accounts
              </Typography>
            </Flex>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone PayPal Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/PayPal"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/PayPal
              </Link>
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Google Pay Test Data:
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              marginBottom={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                • Use Google Pay test environment
              </Typography>
              <Typography variant="pi">
                • Test cards are automatically provided by Google Pay SDK
              </Typography>
              <Typography variant="pi">
                • Set <code>environment: 'TEST'</code> in Google Pay
                configuration
              </Typography>
            </Flex>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone Google Pay Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Google+Pay"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Google+Pay
              </Link>
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Apple Pay Test Data:
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              marginBottom={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                • Use Apple Pay test environment
              </Typography>
              <Typography variant="pi">
                • Test cards are available in Wallet app on test devices
              </Typography>
              <Typography variant="pi">
                • Requires registered domain with HTTPS (not localhost)
              </Typography>
            </Flex>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone Apple Pay Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Apple+Pay"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Apple+Pay
              </Link>
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Sofort Banking Test Data:
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              marginBottom={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                • Use Sofort test environment
              </Typography>
              <Typography variant="pi">
                • Test credentials provided by Payone
              </Typography>
            </Flex>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone Sofort Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Sofort"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Sofort
              </Link>
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              SEPA Direct Debit Test Data:
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              marginBottom={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                • <strong>Test IBAN:</strong> DE89370400440532013000
              </Typography>
              <Typography variant="pi">
                • <strong>Test BIC:</strong> COBADEFFXXX
              </Typography>
              <Typography variant="pi">
                • <strong>Account Holder:</strong> Any test name
              </Typography>
            </Flex>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone SEPA Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/SEPA+Direct+Debit"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/SEPA+Direct+Debit
              </Link>
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              General Test Data Resources:
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              marginBottom={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                📚 <strong>Payone Test Data Overview:</strong>{" "}
                <Link
                  href="https://docs.payone.com/display/public/PLATFORM/Test+and+Live+Data"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://docs.payone.com/display/public/PLATFORM/Test+and+Live+Data
                </Link>
              </Typography>
              <Typography variant="pi">
                📚 <strong>Payone Test Cards:</strong>{" "}
                <Link
                  href="https://docs.payone.com/display/public/PLATFORM/Credit+Card+Test+Cards"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://docs.payone.com/display/public/PLATFORM/Credit+Card+Test+Cards
                </Link>
              </Typography>
              <Typography variant="pi">
                📚 <strong>Payone Test Environment:</strong>{" "}
                <Link
                  href="https://docs.payone.com/display/public/PLATFORM/Test+Environment"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://docs.payone.com/display/public/PLATFORM/Test+Environment
                </Link>
              </Typography>
            </Flex>
          </Box>
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default TestCredentialsSection;

