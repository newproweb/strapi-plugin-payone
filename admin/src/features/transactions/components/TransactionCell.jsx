import { Flex, IconButton, Typography } from "@strapi/design-system";
import { Eye } from "@strapi/icons";
import { StatusBadge } from "../../../components/StatusBadge";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { formatAmount, formatDate, getPaymentMethodDisplay, requestField } from "../../../utils/transaction-format";

/** One table cell of the transaction list, chosen by the column name. */
export const TransactionCell = ({ column, transaction, onOpenDetails }) => {
  const { t } = usePluginTranslations();
  const notAvailable = t("table.na", "N/A");

  switch (column) {
    case "order":
      return (
        <Flex direction="column" alignItems="flex-start">
          <Typography variant="omega" fontWeight="semiBold">
            {transaction.reference || notAvailable}
          </Typography>
          <Typography variant="pi" textColor="neutral600">
            {transaction.txid || notAvailable}
          </Typography>
        </Flex>
      );
    case "amount":
      return (
        <Typography variant="omega" textAlign="right" display="block">
          {formatAmount(transaction.amount, transaction.currency)}
        </Typography>
      );
    case "paymentMethod": {
      const { category, subtype } = getPaymentMethodDisplay(
        requestField(transaction, "clearingtype"),
        requestField(transaction, "wallettype"),
        requestField(transaction, "cardtype")
      );
      return (
        <Typography variant="omega">
          {subtype || category}
          {subtype && (
            <Typography variant="pi" textColor="neutral600">
              {" "}
              · {category}
            </Typography>
          )}
        </Typography>
      );
    }
    case "type":
      return (
        <Typography variant="omega" textColor="neutral700">
          {transaction.request_type || transaction.body?.request_type || notAvailable}
        </Typography>
      );
    case "status":
      return <StatusBadge status={transaction.status || transaction.body?.status} transaction={transaction} />;
    case "created_at":
      return (
        <Typography variant="pi" textColor="neutral600">
          {formatDate(transaction.created_at ?? transaction.createdAt)}
        </Typography>
      );
    case "updated_at":
      return (
        <Typography variant="pi" textColor="neutral600">
          {formatDate(transaction.updated_at ?? transaction.updatedAt)}
        </Typography>
      );
    case "details":
      return (
        <IconButton
          label={t("table.viewDetails", "View details")}
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(transaction);
          }}
        >
          <Eye />
        </IconButton>
      );
    default:
      return null;
  }
};
