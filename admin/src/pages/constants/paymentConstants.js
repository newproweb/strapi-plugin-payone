/**
 * Default payment data for testing
 * Used across all payment operations
 * 
 * Note: successurl, errorurl, and backurl are only required for:
 * - 3D Secure enabled credit card payments
 * - Redirect-based payment methods (PayPal, Google Pay, Apple Pay, Sofort)
 * 
 * For non-redirect payments (3DS disabled credit card, SEPA), these URLs are optional
 */
export const DEFAULT_PAYMENT_DATA = {
  firstname: "John",
  lastname: "Doe",
  street: "Test Street 123",
  zip: "12345",
  city: "Test City",
  country: "DE",
  email: "test@example.com",
  salutation: "Herr",
  gender: "m",
  telephonenumber: "01752345678",
  ip: "127.0.0.1",
  customer_is_present: "yes",
  language: "de"
  // Note: successurl, errorurl, backurl are added conditionally based on 3DS setting
};

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = "EUR";

/**
 * Default page size for pagination
 */
export const DEFAULT_PAGE_SIZE = 10;

