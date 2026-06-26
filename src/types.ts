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
}

export interface ReceiverDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
export type InvoiceTemplateId = 'teal' | 'classic' | 'modern' | 'simple' | 'dark' | 'indigo' | 'emerald';

export interface InvoiceTheme {
  primaryColor: string; // Hex code
  accentColor: string;  // Hex code (e.g. warm gold)
  fontFamily: string;   // 'Inter' | 'Space Grotesk' | 'Playfair Display' | 'JetBrains Mono' | 'custom'
  customFontName?: string;
  customFontUrl?: string; // base64 DataURL of custom uploaded font
  templateId: InvoiceTemplateId;
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
  discountRate: number; // percentage, e.g. 5
  shippingFee: number; // raw value
  notes: string;
  terms: string;
  theme: InvoiceTheme;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  savedInvoices: Invoice[];
  defaultSender?: SenderDetails;
}
