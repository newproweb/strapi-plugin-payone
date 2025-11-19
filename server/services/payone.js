"use strict";

const settingsService = require("./settingsService");
const transactionService = require("./transactionService");
const paymentService = require("./paymentService");
const testConnectionService = require("./testConnectionService");

/**
 * Main Payone service - aggregates all sub-services
 */
module.exports = ({ strapi }) => ({
  // Settings
  async getSettings() {
    return await settingsService.getSettings(strapi);
  },

  async updateSettings(settings) {
    return await settingsService.updateSettings(strapi, settings);
  },

  // Payment operations
  async preauthorization(params) {
    return await paymentService.preauthorization(strapi, params);
  },

  async authorization(params) {
    return await paymentService.authorization(strapi, params);
  },

  async capture(params) {
    return await paymentService.capture(strapi, params);
  },

  async refund(params) {
    return await paymentService.refund(strapi, params);
  },

  // Transaction history
  async logTransaction(transactionData) {
    return await transactionService.logTransaction(strapi, transactionData);
  },

  async getTransactionHistory(filters = {}) {
    return await transactionService.getTransactionHistory(strapi, filters);
  },

  // Test connection
  async testConnection() {
    return await testConnectionService.testConnection(strapi);
  }
});
