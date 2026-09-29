"use strict";

const axios = require("axios");
const { POST_GATEWAY_URL, REQUEST_TIMEOUT_MS, FORM_CONTENT_TYPE } = require("../constants");

/**
 * Posts a form-encoded request to the Payone post-gateway.
 *
 * @param body - URLSearchParams or an already encoded string
 * @param options.path - Appended to the gateway URL (e.g. "Genericpayment")
 * @param options.headers - Extra headers next to the form content type
 * @param options.validateStatus - Axios status validator, left to axios when omitted
 */
const postToGateway = (body, { path = "", headers = {}, validateStatus } = {}) => {
  const config = {
    headers: { "Content-Type": FORM_CONTENT_TYPE, ...headers },
    timeout: REQUEST_TIMEOUT_MS
  };
  if (validateStatus) config.validateStatus = validateStatus;

  return axios.post(`${POST_GATEWAY_URL}${path}`, body, config);
};

module.exports = { postToGateway };
