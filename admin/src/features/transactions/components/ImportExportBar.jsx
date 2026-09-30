import * as React from "react";
import { Box, Button, Flex } from "@strapi/design-system";
import { ArrowsCounterClockwise, Download, Upload } from "@strapi/icons";
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

/** CSV files are sent as text; JSON files as `{ data: rows }` (a bare array or a `{ data }` wrapper). */
const toImportPayload = (fileName, text) => {
  if ((fileName || "").toLowerCase().endsWith(".csv")) return { format: "csv", data: text };
  const parsed = JSON.parse(text);
  const rows = Array.isArray(parsed) ? parsed : parsed?.data ?? [];
  return { data: Array.isArray(rows) ? rows : [] };
};

export const ImportExportBar = ({ filters, onImportDone, onReset }) => {
  const { t } = usePluginTranslations();
  const { toggleNotification } = useNotification();
  const { exportTransactions, importTransactions } = usePayoneApi();
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await exportTransactions({ format, filters, sort_by: "createdAt", sort_order: "desc" });
      const blob = res?.data ?? res;
      if (!(blob instanceof Blob)) throw new Error("Invalid export response");
      downloadBlob(blob, `transactions.${format}`);
      toggleNotification({ type: "success", message: t("export.success", "Export completed") });
    } catch (err) {
      console.error("Export failed:", err);
      toggleNotification({ type: "danger", message: t("export.error", "Export failed") });
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const res = await importTransactions(toImportPayload(file.name, await readFileAsText(file)));
      const data = res?.data ?? res;
      const imported = data?.imported ?? 0;
      const failed = data?.failed ?? 0;
      if (typeof onImportDone === "function") onImportDone();

      if (failed > 0) {
        toggleNotification({
          type: "warning",
          message: t("import.partial", "Import completed: {{imported}} imported, {{failed}} failed.", { imported, failed }),
        });
      } else {
        toggleNotification({ type: "success", message: t("import.success", "Imported  transactions.", { count: imported }) });
      }
    } catch (err) {
      console.error("Import failed:", err);
      toggleNotification({ type: "danger", message: t("import.error", "Import failed") });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <Flex gap={2} width="100%">
      <Box>
        <Button variant="secondary" size="S" startIcon={<Download />} loading={exporting} onClick={() => handleExport("json")} minWidth="140px">
          {t("export.json", "Export JSON")}
        </Button>
      </Box>
      <Box>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv,application/json,text/csv"
          style={{ display: "none" }}
          onChange={handleImportFile}
          aria-label={t("import.button", "Import")}
        />
        <Button variant="secondary" size="S" startIcon={<Upload />} loading={importing} minWidth="140px" onClick={() => fileInputRef.current?.click()}>
          {t("import.button", "Import")}
        </Button>
      </Box>
      <Button variant="secondary" onClick={onReset} startIcon={<ArrowsCounterClockwise />} size="S" maxWidth="100px">
        {t("filters.reset", "Reset")}
      </Button>
    </Flex>
  );
};
