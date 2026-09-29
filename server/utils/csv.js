"use strict";

const { TRANSACTION_ATTRS, JSON_COLUMNS } = require("../constants");

const escapeCsvCell = (value) => {
  if (value == null) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const parseCsvLine = (line) => {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && inQuotes && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
};

const parseJsonCell = (value) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const parseCell = (header, rawValue) => {
  const value = rawValue === undefined ? undefined : rawValue.trim();
  if (JSON_COLUMNS.includes(header)) return parseJsonCell(value);
  return value ?? "";
};

const csvToRows = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, i) => [header, parseCell(header, cells[i])]));
  });
};

const rowsToCsv = (rows, attrs = TRANSACTION_ATTRS) => {
  const headerLine = attrs.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) => attrs.map((key) => escapeCsvCell(row[key])).join(","));
  return [headerLine, ...dataLines].join("\n");
};

module.exports = { csvToRows, rowsToCsv };
