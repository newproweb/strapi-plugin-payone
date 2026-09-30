import { Button, Flex, Modal } from "@strapi/design-system";
import { StatusBadge } from "../../../components/StatusBadge";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { TransactionDetails } from "./TransactionDetails";

export const TransactionDetailsModal = ({ transaction, onClose }) => {
  const { t } = usePluginTranslations();

  return (
    <Modal.Root open={!!transaction} onOpenChange={(open) => !open && onClose()}>
      <Modal.Content>
        <Modal.Header>
          <Flex gap={3}>
            <Modal.Title>{transaction?.reference || transaction?.txid || t("table.details", "Details")}</Modal.Title>
            {transaction && <StatusBadge status={transaction.status || transaction.body?.status} transaction={transaction} />}
          </Flex>
        </Modal.Header>
        <Modal.Body>{transaction && <TransactionDetails transaction={transaction} />}</Modal.Body>
        <Modal.Footer>
          <Modal.Close>
            <Button variant="tertiary">{t("common.close", "Close")}</Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
