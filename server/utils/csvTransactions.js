"use strict";

const TRANSACTION_ATTRS = [
  "txid", "reference", "invoiceid", "amount", "currency", "status",
  "error_code", "request_type", "error_message", "customer_message",
  "body", "raw_request", "raw_response", "createdAt", "updatedAt"
];

function escapeCsvCell(val) {
  if (val == null) return "";
  const str = typeof val === "object" ? JSON.stringify(val) : String(val);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (inQuotes) {
      cur += c;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function csvToRows(csvText) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, j) => {
      let v = cells[j];
      if (v !== undefined) v = v.trim();
      if (v === "" && (h === "body" || h === "raw_request" || h === "raw_response")) {
        row[h] = {};
      } else if (h === "body" || h === "raw_request" || h === "raw_response") {
        try {
          row[h] = typeof v === "string" && v ? JSON.parse(v) : {};
        } catch {
          row[h] = {};
        }
      } else {
        row[h] = v ?? "";
      }
    });
    rows.push(row);
  }
  return rows;
}

function rowsToCsv(rows, attrs = TRANSACTION_ATTRS) {
  const headerLine = attrs.map(escapeCsvCell).join(",");
  const dataLines = rows.map((r) =>
    attrs.map((key) => escapeCsvCell(r[key])).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}

module.exports = {
  TRANSACTION_ATTRS,
  csvToRows,
  rowsToCsv,
};
