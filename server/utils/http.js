"use strict";

const { HIDDEN_SECRET } = require("../constants");

const SECRET_SETTINGS = ["key", "serverApiSecret"];

/** Returns `body.data` (or the body itself) and rejects anything that is not an object with 400. */
const readRequestData = (ctx) => {
  const data = ctx.request.body?.data || ctx.request.body;
  if (!data || typeof data !== "object") ctx.throw(400, "Invalid request body");
  return data;
};

const respondWithError = (ctx, error) => {
  const status = error.status || error.response?.status || 500;
  const message = error.message || "Internal server error";

  if (status >= 400) {
    console.log("[Payone] Controller error:", {
      status,
      message,
      error: error.stack || error
    });
  }

  ctx.status = status;
  ctx.body = { error: { status, message, name: error.name || "Error" } };
};

/** Replaces every stored secret with the HIDDEN_SECRET marker before settings leave the server. */
const hideSecrets = (settings) => {
  const visible = { ...settings };
  for (const key of SECRET_SETTINGS) {
    if (visible[key]) visible[key] = HIDDEN_SECRET;
  }
  return visible;
};

/** Keeps the stored secret when the admin form sends it back empty or still masked. */
const keepStoredSecrets = (incoming, current) => {
  const merged = { ...incoming };
  for (const key of SECRET_SETTINGS) {
    if (merged[key] === HIDDEN_SECRET || !merged[key]) merged[key] = current?.[key];
  }
  return merged;
};

module.exports = { readRequestData, respondWithError, hideSecrets, keepStoredSecrets };
