import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Stack,
  Typography,
  Badge,
  Button,
} from '@strapi/design-system';
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from './icons';
const TransactionHistoryItem = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);


  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'ERROR':
        return 'danger';
      case 'PENDING':
        return 'warning';
      default:
        return 'neutral';
    }
  };


  const getPaymentMethodName = (clearingtype, wallettype) => {
    switch (clearingtype) {
      case 'cc':
        return 'Credit Card';
      case 'sb':
        return 'Online Banking';
      case 'wlt':
        return wallettype === 'PPE' ? 'PayPal' : 'Wallet';
      case 'elv':
        return 'Direct Debit (SEPA)';
      default:
        return 'Unknown';
    }
  };

  const formatAmount = (amount, currency) => {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCardTypeName = (cardtype) => {
    switch (cardtype) {
      case 'V':
        return 'Visa';
      case 'M':
        return 'Mastercard';
      case 'A':
        return 'American Express';
      default:
        return cardtype || 'Unknown';
    }
  };

  return (
    <Card
      className="payment-transaction-item"
      background="neutral0"
      hasRadius
      shadow="filterShadow"
      style={{
        marginBottom: '16px',
      }}
    >
      <CardBody padding={6} style={{ display: "flex", flexDirection: 'column', gap: '6px' }}>
        {/* Main Values in Column Format */}
        <Stack spacing={3} marginBottom={4}>
          {/* Reference */}
          <Flex alignItems="center" gap={2}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              Reference:
            </Typography>
            <Typography variant="pi" textColor="neutral800">
              {transaction.reference}
            </Typography>
          </Flex>
          {/* Date */}
          <Flex alignItems="center" gap={2}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              Date:
            </Typography>
            <Typography variant="pi" textColor="neutral800">
              {formatDate(transaction.timestamp)}
            </Typography>
          </Flex>

          {/* Payment Method */}
          <Flex alignItems="center" gap={2}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              Method:
            </Typography>
            <Typography variant="pi" textColor="neutral800">
              {getPaymentMethodName(transaction.raw_request?.clearingtype, transaction.raw_request?.wallettype)}
            </Typography>
            {transaction.txid && (
              <>
                <Typography variant="pi" textColor="neutral500">•</Typography>
                <Typography variant="pi" textColor="neutral600">
                  TX: {transaction.txid}
                </Typography>
              </>
            )}
          </Flex>

          {/* Amount */}
          <Flex alignItems="center" gap={2}>
            <Typography variant="pi" textColor="neutral600" fontWeight="medium">
              Amount:
            </Typography>
            <Typography variant="pi" fontWeight="bold" textColor="primary600" fontSize={2}>
              {formatAmount(transaction.amount, transaction.currency)}
            </Typography>
            <Badge
              backgroundColor={getStatusColor(transaction.status)}
              textColor="neutral0"
            >
              {transaction.status}
            </Badge>
          </Flex>
        </Stack>



        {/* Expand/Collapse Button */}
        <Flex justifyContent="center">
          <Button
            size="S"
            onClick={() => setIsExpanded(!isExpanded)}
            startIcon={isExpanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
            className="payment-button payment-button-primary"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </Flex>

        {/* Expanded Details */}
        {isExpanded && (
          <Box marginTop={4} style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <Stack spacing={4}>
              {/* Error Message */}
              {transaction.status === 'ERROR' && (
                <Box
                  marginBottom={4}
                  padding={3}
                  background="danger100"
                  hasRadius
                  className="payment-alert"
                  style={{
                    border: '1px solid',
                    borderColor: 'var(--strapi-colors-danger200)',
                  }}
                >
                  <Typography variant="pi" fontWeight="bold" textColor="danger600" marginBottom={1}>
                    Error: {transaction.error_message}
                  </Typography>
                  {transaction.customer_message && (
                    <Typography variant="pi" textColor="danger600">
                      Customer Message: {transaction.customer_message}
                    </Typography>
                  )}
                </Box>
              )}
              {/* Customer Information */}
              <Box>
                <Flex alignItems="center" gap={2} marginBottom={3}>
                  <Typography variant="pi" fontWeight="bold" textColor="neutral800">
                    Customer Information
                  </Typography>
                </Flex>
                <Box paddingLeft={4}>
                  <Stack spacing={2}>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Name:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.raw_request?.firstname} {transaction.raw_request?.lastname}
                      </Typography>
                    </Flex>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Email:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.raw_request?.email}
                      </Typography>
                    </Flex>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Phone:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.raw_request?.telephonenumber}
                      </Typography>
                    </Flex>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Address:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.raw_request?.street}, {transaction.raw_request?.zip} {transaction.raw_request?.city}
                      </Typography>
                    </Flex>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Country:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.raw_request?.country}
                      </Typography>
                    </Flex>
                  </Stack>
                </Box>
              </Box>

              {/* Payment Method Details */}
              <Box>
                <Flex alignItems="center" gap={2} marginBottom={3}>
                  <Typography variant="pi" fontWeight="bold" textColor="neutral800">
                    Payment Method Details
                  </Typography>
                </Flex>
                <Box paddingLeft={4}>
                  <Stack spacing={2}>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Type:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {getPaymentMethodName(transaction.raw_request?.clearingtype, transaction.raw_request?.wallettype)}
                      </Typography>
                    </Flex>

                    {transaction.raw_request?.clearingtype === 'cc' && (
                      <>
                        <Flex justifyContent="space-between" gap={3}>
                          <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                            Card Type:
                          </Typography>
                          <Typography variant="pi" textColor="neutral800">
                            {getCardTypeName(transaction.raw_request?.cardtype)}
                          </Typography>
                        </Flex>
                        <Flex justifyContent="space-between" gap={3}>
                          <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                            Card Number:
                          </Typography>
                          <Typography variant="pi" textColor="neutral800">
                            **** **** **** {transaction.raw_request?.cardpan?.slice(-4)}
                          </Typography>
                        </Flex>
                        <Flex justifyContent="space-between" gap={3}>
                          <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                            Expiry:
                          </Typography>
                          <Typography variant="pi" textColor="neutral800">
                            {transaction.raw_request?.cardexpiredate}
                          </Typography>
                        </Flex>
                      </>
                    )}

                    {transaction.raw_request?.clearingtype === 'wlt' && transaction.raw_request?.wallettype && (
                      <Flex justifyContent="space-between" gap={3}>
                        <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                          Wallet Type:
                        </Typography>
                        <Typography variant="pi" textColor="neutral800">
                          {transaction.raw_request.wallettype}
                        </Typography>
                      </Flex>
                    )}

                    {transaction.raw_request?.clearingtype === 'sb' && (
                      <>
                        <Flex justifyContent="space-between" gap={3}>
                          <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                            Bank Transfer Type:
                          </Typography>
                          <Typography variant="pi" textColor="neutral800">
                            {transaction.raw_request?.onlinebanktransfertype}
                          </Typography>
                        </Flex>
                        <Flex justifyContent="space-between" gap={3}>
                          <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                            Bank Country:
                          </Typography>
                          <Typography variant="pi" textColor="neutral800">
                            {transaction.raw_request?.bankcountry}
                          </Typography>
                        </Flex>
                      </>
                    )}
                  </Stack>
                </Box>
              </Box>

              {/* Technical Details */}
              <Box>
                <Typography variant="pi" fontWeight="bold" textColor="neutral800" marginBottom={3}>
                  Technical Details
                </Typography>
                <Box paddingLeft={4}>
                  <Stack spacing={2}>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Request Type:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.request_type}
                      </Typography>
                    </Flex>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Mode:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.raw_request?.mode}
                      </Typography>
                    </Flex>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        IP Address:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.raw_request?.ip}
                      </Typography>
                    </Flex>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Language:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.raw_request?.language}
                      </Typography>
                    </Flex>
                    <Flex justifyContent="space-between" gap={3}>
                      <Typography variant="pi" textColor="neutral600" fontWeight="medium">
                        Customer Present:
                      </Typography>
                      <Typography variant="pi" textColor="neutral800">
                        {transaction.raw_request?.customer_is_present}
                      </Typography>
                    </Flex>
                  </Stack>
                </Box>
              </Box>
            </Stack>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

export default TransactionHistoryItem;
