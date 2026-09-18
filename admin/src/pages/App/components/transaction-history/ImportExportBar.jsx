import * as React from "react";
import { Box, Button, Flex } from "@strapi/design-system";
import { ArrowsCounterClockwise, Download, Upload } from "@strapi/icons";
import { useNotification } from "@strapi/strapi/admin";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import usePayoneRequests from "../../../utils/api";

const ImportExportBar = ({ filters, sortBy = "createdAt", sortOrder = "desc", onImportDone, handleReset }) => {
  const { t } = usePluginTranslations();
  const { toggleNotification } = useNotification();
  const { exportTransactions, importTransactions } = usePayoneRequests();
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await exportTransactions({
        format,
        filters,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      const blob = res?.data ?? res;
      if (!(blob instanceof Blob)) {
        throw new Error("Invalid export response");
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toggleNotification({ type: "success", message: t("export.success", "Export completed") });
    } catch (err) {
      console.error("Export failed:", err);
      toggleNotification({ type: "danger", message: t("export.error", "Export failed") });
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result ?? "");
        r.onerror = reject;
        r.readAsText(file, "utf-8");
      });
      const ext = (file.name || "").toLowerCase();
      let payload;
      if (ext.endsWith(".csv")) {
        payload = { format: "csv", data: text };
      } else {
        const parsed = JSON.parse(text);
        payload = Array.isArray(parsed) ? parsed : (parsed?.data ?? []);
        if (!Array.isArray(payload)) payload = [];
        payload = { data: payload };
      }
      const res = await importTransactions(payload);
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
        toggleNotification({
          type: "success",
          message: t("import.success", "Imported  transactions.", { count: imported }),
        });
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
    <Flex gap={2}  width={"100%"}>
      <Box>
        <Button
          variant="secondary"
          size="S"
          startIcon={<Download />}
          loading={exporting}
          onClick={() => handleExport("json")}
          minWidth={"140px"}
        >
          {t("export.json", "Export JSON")}
        </Button>
      </Box>
      {/* <Box>
        <Button
          variant="secondary"
          size="S"
          startIcon={<Download />}
          loading={exporting}
          onClick={() => handleExport("csv")}
          minWidth={"140px"}
        >
          {t("export.csv", "Export CSV")}
        </Button>
      </Box> */}
      <Box>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv,application/json,text/csv"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
        <Button
          variant="secondary"
          size="S"
          startIcon={<Upload/>}
          loading={importing}
          minWidth={"140px"}
          onClick={handleImportClick}
        >
          {t("import.button", "Import")}
        </Button>
      </Box>

      <Button
        variant="secondary"
        onClick={handleReset}
        startIcon={<ArrowsCounterClockwise />}
        size="S"
        maxWidth="100px"
      >
        {t("filters.reset", "Reset")}
      </Button>
    </Flex>
  );
};

export default ImportExportBar;
