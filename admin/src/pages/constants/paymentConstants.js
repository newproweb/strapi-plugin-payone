
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
};


export const DEFAULT_CURRENCY = "EUR";


export const DEFAULT_PAGE_SIZE = 10;

export const filterOptions = [
  {
    name: "status",
    label: "Status",
    type: "enumeration",
    options: [
      { value: "APPROVED", label: "Approved" },
      { value: "ERROR", label: "Error" },
      { value: "REDIRECT", label: "Redirect" },
      { value: "INVALID", label: "Invalid" },
      { value: "PENDING", label: "Pending" },
      { value: "CANCELLED", label: "Cancelled" },
    ],
  },
  {
    name: "request_type",
    label: "Request Type",
    type: "enumeration",
    options: [
      { value: "preauthorization", label: "Preauthorization" },
      { value: "authorization", label: "Authorization" },
      { value: "capture", label: "Capture" },
      { value: "refund", label: "Refund" },
    ],
  },
  {
    name: "payment_method",
    label: "Payment Method",
    type: "enumeration",
    options: [
      { value: "credit_card", label: "Credit Card" },
      { value: "paypal", label: "PayPal" },
      { value: "google_pay", label: "Google Pay" },
      { value: "apple_pay", label: "Apple Pay" },
      { value: "sofort", label: "Sofort Banking" },
      { value: "sepa", label: "SEPA Direct Debit" },
    ],
  },
  {
    name: "date_from",
    label: "Date From",
    type: "date",
  },
  {
    name: "date_to",
    label: "Date To",
    type: "date",
  },
];