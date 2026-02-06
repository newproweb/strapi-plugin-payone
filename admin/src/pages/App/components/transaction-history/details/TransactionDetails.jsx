import * as React from "react";
import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { Box, Flex, Typography } from "@strapi/design-system";
import { getCardTypeName } from "../../../../utils/transactionTableUtils";

const TransactionDetails = ({ transaction }) => {
  return (
    <Flex direction="column" gap={4} alignItems={"stretch"} marginTop={4}>
      {transaction.status === "ERROR" && (
        <Box padding={3} background="danger100" hasRadius>
          <Typography
            variant="pi"
            fontWeight="bold"
            textColor="danger600"
            marginBottom={1}
          >
            Error: {transaction.error_message || "Unknown error"}
          </Typography>
          {transaction.customer_message && (
            <Typography variant="pi" textColor="danger600">
              Customer Message: {transaction.customer_message}
            </Typography>
          )}
        </Box>
      )}

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))",
          gap: "16px",
          marginBottom: "1.5rem",
        }}
      >
        <Flex direction="column" gap={2} alignItems={"stretch"}>
          <Typography
            variant="pi"
            fontWeight="bold"
            textColor="neutral800"
            marginBottom={3}
          >
            Customer Information
          </Typography>
          <Flex gap={3}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              Name:
            </Typography>
            <Typography variant="pi" textColor="neutral800">
              {transaction.raw_request?.firstname || transaction.body?.raw_request?.firstname }{" "}
              {transaction.raw_request?.lastname || transaction.body?.raw_request?.lastname}
            </Typography>
          </Flex>
          <Flex gap={3}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              Email:
            </Typography>
            <Typography variant="pi" textColor="neutral800">
              {transaction.raw_request?.email || transaction.body?.raw_request?.email || "N/A"}
            </Typography>
          </Flex>
          <Flex gap={3}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              Phone:
            </Typography>
            <Typography variant="pi" textColor="neutral800">
              {transaction.raw_request?.telephonenumber || transaction.body?.raw_request?.telephonenumber || "N/A"}
            </Typography>
          </Flex>
          <Flex gap={3}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              Address:
            </Typography>
            <Typography variant="pi" textColor="neutral800">
              {transaction.raw_request?.street || transaction.body?.raw_request?.street}, {transaction.raw_request?.zip || transaction.body?.raw_request?.zip}{" "}
              {transaction.raw_request?.city || transaction.body?.raw_request?.city}
            </Typography>
          </Flex>
        </Flex>
        <Flex direction="column" gap={2} alignItems={"stretch"}>
          <Typography
            variant="pi"
            fontWeight="bold"
            textColor="neutral800"
            marginBottom={3}
          >
            Payment Details
          </Typography>
          <Flex gap={3}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              TX ID:
            </Typography>
            <Typography variant="pi" textColor="neutral800">
              {transaction.txid || "N/A"}
            </Typography>
          </Flex>
          {transaction.raw_request?.clearingtype === "cc"  || transaction.body?.raw_request?.clearingtype === "cc" && (
            <>
              <Flex gap={3}>
                <Typography
                  variant="pi"
                  textColor="neutral600"
                  fontWeight="medium"
                >
                  Card Type:
                </Typography>
                <Typography variant="pi" textColor="neutral800">
                  {getCardTypeName(transaction.raw_request?.cardtype || transaction.body?.raw_request?.cardtype)}
                </Typography>
              </Flex>
              <Flex gap={3}>
                <Typography
                  variant="pi"
                  textColor="neutral600"
                  fontWeight="medium"
                >
                  Card Number:
                </Typography>
                <Typography variant="pi" textColor="neutral800">
                  **** **** ****{" "}
                  {transaction.raw_request?.cardpan?.slice(-4) || transaction.body?.raw_request?.cardpan?.slice(-4) || "****"}
                </Typography>
              </Flex>
            </>
          )}
          <Flex gap={3}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              Mode:
            </Typography>
            <Typography variant="pi" textColor="neutral800">
              {transaction.raw_request?.mode || transaction.body?.raw_request?.mode || "N/A"}
            </Typography>
          </Flex>
        </Flex>
      </Box>

      <Box>
        <Typography variant="pi" fontWeight="bold" textColor="neutral800">
          Transaction Data
        </Typography>
        <Box marginTop={4}>
          <JsonView
            value={transaction?.body}
            style={githubDarkTheme}
            displayDataTypes={false}
            enableClipboard
            collapsed={false}
            displayObjectSize={false}
          />
        </Box>
      </Box>
    </Flex>
  );
};

export default TransactionDetails;
