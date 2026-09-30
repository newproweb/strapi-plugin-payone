import { Button, Typography } from "@strapi/design-system";
import { StatusBadge } from "../../../components/StatusBadge";
import { ChevronDownIcon } from "../../../components/icons/ChevronDownIcon";
import { ChevronUpIcon } from "../../../components/icons/ChevronUpIcon";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { formatAmount, formatDate, getPaymentMethodDisplay, requestField } from "../../../utils/transaction-format";

/** One table cell of the transaction list, chosen by the column name. */
export const TransactionCell = ({ column, transaction, isSelected, onToggleDetails }) => {
  const { t } = usePluginTranslations();
  const notAvailable = t("table.na", "N/A");

  switch (column) {
    case "txid":
      return (
        <Typography variant="pi" textColor="neutral600">
          {transaction.txid || notAvailable}
        </Typography>
      );
    case "reference":
      return (
        <Typography variant="pi" fontWeight="medium">
          {transaction.reference || notAvailable}
        </Typography>
      );
    case "amount":
      return (
        <Typography variant="pi" textColor="neutral600">
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
        <Typography variant="pi">
          {category}
          {subtype ? ` / ${subtype}` : ""}
        </Typography>
      );
    }
    case "type":
      return (
        <Typography variant="pi" fontWeight="semiBold">
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
        <Button
          size="S"
          variant="tertiary"
          minWidth="100px"
          onClick={() => onToggleDetails(transaction)}
          startIcon={isSelected ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        >
          {isSelected ? t("table.hide", "Hide") : t("table.details", "Details")}
        </Button>
      );
    default:
      return null;
  }
};
