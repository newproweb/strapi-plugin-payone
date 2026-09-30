import * as React from "react";
import { Button, Dialog, Flex } from "@strapi/design-system";
import { Download, Upload, WarningCircle } from "@strapi/icons";
import { useNotification } from "@strapi/strapi/admin";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { usePayoneApi } from "../../../api/payone.api";

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result ?? "");
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const csvRowCount = (text) => Math.max(0, text.split(/\r?\n/).filter((line) => line.trim() !== "").length - 1);

/** CSV files are sent as text; JSON files as `{ data: rows }` (a bare array or a `{ data }` wrapper). */
const toImportPayload = (fileName, text) => {
  if ((fileName || "").toLowerCase().endsWith(".csv")) return { payload: { format: "csv", data: text }, rowCount: csvRowCount(text) };
  const parsed = JSON.parse(text);
  const rows = Array.isArray(parsed) ? parsed : parsed?.data ?? [];
  const data = Array.isArray(rows) ? rows : [];
  return { payload: { data }, rowCount: data.length };
};

/** Export the filtered list and import a JSON/CSV file after a confirmation step. */
export const ImportExportBar = ({ filters, onImportDone }) => {
  const { t } = usePluginTranslations();
  const { toggleNotification } = useNotification();
  const { exportTransactions, importTransactions } = usePayoneApi();
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [pendingImport, setPendingImport] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportTransactions({ format: "json", filters, sort_by: "createdAt", sort_order: "desc" });
      const blob = res?.data ?? res;
      if (!(blob instanceof Blob)) throw new Error("Invalid export response");
      downloadBlob(blob, "transactions.json");
      toggleNotification({ type: "success", message: t("export.success", "Export completed") });
    } catch (err) {
      console.error("Export failed:", err);
      toggleNotification({ type: "danger", message: t("export.error", "Export failed") });
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPendingImport({ fileName: file.name, ...toImportPayload(file.name, await readFileAsText(file)) });
    } catch (err) {
      console.error("Import failed:", err);
      toggleNotification({ type: "danger", message: t("import.invalidFile", "This file is not valid JSON or CSV.") });
    }
  };

  const handleConfirmImport = async () => {
    const { payload } = pendingImport;
    setPendingImport(null);
    setImporting(true);
    try {
      const res = await importTransactions(payload);
      const data = res?.data ?? res;
      const imported = data?.imported ?? 0;
      const failed = data?.failed ?? 0;
      if (typeof onImportDone === "function") onImportDone();
      toggleNotification({
        type: failed > 0 ? "warning" : "success",
        message: failed > 0 ? `${imported} imported, ${failed} failed` : `${imported} transactions imported`,
      });
    } catch (err) {
      console.error("Import failed:", err);
      toggleNotification({ type: "danger", message: t("import.error", "Import failed") });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Flex gap={2}>
      <Button variant="tertiary" size="S" startIcon={<Download />} loading={exporting} onClick={handleExport}>
        {t("export.json", "Export JSON")}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv,application/json,text/csv"
        style={{ display: "none" }}
        onChange={handleFileSelected}
        aria-label={t("import.button", "Import")}
      />
      <Button variant="tertiary" size="S" startIcon={<Upload />} loading={importing} onClick={() => fileInputRef.current?.click()}>
        {t("import.button", "Import")}
      </Button>

      <Dialog.Root open={!!pendingImport} onOpenChange={(open) => !open && setPendingImport(null)}>
        <Dialog.Content>
          <Dialog.Header>{t("import.confirmTitle", "Import transactions?")}</Dialog.Header>
          <Dialog.Body icon={<WarningCircle fill="warning600" />}>
            {pendingImport &&
              `${pendingImport.rowCount} rows from ${pendingImport.fileName} will be added as new transactions. Rows that already exist are not replaced, so importing the same file twice creates duplicates.`}
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Cancel>
              <Button fullWidth variant="tertiary">
                {t("common.cancel", "Cancel")}
              </Button>
            </Dialog.Cancel>
            <Dialog.Action>
              <Button fullWidth onClick={handleConfirmImport}>
                {t("import.confirmAction", "Import")}
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
};
