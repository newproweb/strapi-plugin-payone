"use strict";

const settingsService = require("./settingsService");
const transactionService = require("./transactionService");
const paymentService = require("./paymentService");
const testConnectionService = require("./testConnectionService");
const applePayService = require("./applePayService");
const transactionStatusService = require("./transactionStatusService");

module.exports = ({ strapi }) => ({
  // Settings
  async getSettings() {
    return await settingsService.getSettings(strapi);
  },

  async updateSettings(settings) {
    return await settingsService.updateSettings(strapi, settings);
  },

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


  async getTransactionHistory({ filters = {}, pagination = {} }) {
    return await transactionService.getTransactionHistory(strapi, { filters, pagination });
  },

  async getTransactionsForExport({ filters = {}, sort_by, sort_order } = {}) {
    return await transactionService.getTransactionsForExport(strapi, { filters, sort_by, sort_order });
  },

  async importTransactions(rows) {
    return await transactionService.importTransactions(strapi, rows);
  },

  // Test connection
  async testConnection() {
    return await testConnectionService.testConnection(strapi);
  },

  // 3D Secure callback handler
  async handle3DSCallback(callbackData, resultType) {
    return await paymentService.handle3DSCallback(strapi, callbackData, resultType);
  },

  // Apple Pay
  async validateApplePayMerchant(params) {
    return await applePayService.validateApplePayMerchant(strapi, params);
  },

  async initializeApplePaySession(params) {
    return await applePayService.initializeApplePaySession(strapi, params);
  },

  // TransactionStatus Notification
  async processTransactionStatus(notificationData) {
    return await transactionStatusService.processTransactionStatus(strapi, notificationData);
  },

});
