/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface SenderDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  logoUrl?: string; // Base64 data URL for company logo
  bankName?: string;
  bankAccount?: string;
  bankRouting?: string;
  paymentDetails?: string; // Freeform payment instructions
  paymentQrLink?: string; // UPI, Stripe, PayPal link or payment details text for generating QR code
  paymentQrImage?: string; // base64 DataURL of custom uploaded QR Code
}

export interface ReceiverDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'advance_paid';
export type InvoiceTemplateId = 'teal' | 'classic' | 'modern' | 'simple' | 'dark' | 'indigo' | 'emerald';

export interface InvoiceTheme {
  primaryColor: string; // Hex code
  accentColor: string;  // Hex code (e.g. warm gold)
  fontFamily: string;   // 'Inter' | 'Space Grotesk' | 'Playfair Display' | 'JetBrains Mono' | 'custom'
  customFontName?: string;
  customFontUrl?: string; // base64 DataURL of custom uploaded font
  templateId: InvoiceTemplateId;
  pdfLayout?: 'compact' | 'standard';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  sender: SenderDetails;
  receiver: ReceiverDetails;
  items: LineItem[];
  taxRate: number; // percentage, e.g. 10
  discountRate: number; // percentage or flat rate
  discountType?: 'percentage' | 'flat';
  shippingFee: number; // raw value
  gstRate?: number; // percentage for GST, e.g. 18
  gstEnabled?: boolean; // whether GST is enabled
  gstSplit?: boolean; // whether to split GST into CGST and SGST
  gstType?: 'igst' | 'cgst_sgst' | 'cgst_utgst' | 'vat' | 'cess'; // type of GST / Tax scheme
  notes: string;
  terms: string;
  theme: InvoiceTheme;
  currency?: string; // e.g. 'USD', 'EUR', 'GBP', 'INR', etc.
  advanceAmount?: number;
  signatureType?: 'text' | 'image' | 'none';
  signatureText?: string;
  signatureImage?: string; // base64 DataURL
  signatureDesignation?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  savedInvoices: Invoice[];
  defaultSender?: SenderDetails;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK' },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', locale: 'ar-SA' },
];

export const getCurrencyFormatter = (currencyCode?: string) => {
  const code = currencyCode || 'USD';
  const option = CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase()) || CURRENCIES[0];
  try {
    return new Intl.NumberFormat(option.locale, {
      style: 'currency',
      currency: option.code,
    });
  } catch (e) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }
};
