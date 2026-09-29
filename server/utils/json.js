"use strict";

/** Reads a JSON column that may hold an object, a JSON string or nothing. */
const parseJsonField = (value) => {
  if (value == null || value === "") return {};
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(String(value));
    return typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

module.exports = { parseJsonField };
