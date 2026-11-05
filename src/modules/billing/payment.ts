/**
 * Provider reference only. Card numbers and CVC never enter application code.
 * Checkout uses the provider's hosted Payment Element.
 */
export interface InvoicePaymentReference {
  invoiceId: string;
  locationId: string;
  customerId: string;
  paymentIntentId: string | null;
}
