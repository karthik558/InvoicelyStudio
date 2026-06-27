/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Invoice } from '../types';

export const sampleInvoice: Invoice = {
  id: 'demo-invoice-1',
  invoiceNumber: 'INV-2026-0042',
  issueDate: '2026-06-26',
  dueDate: '2026-07-10',
  status: 'pending',
  sender: {
    name: 'Aesthetic Design Agency Inc.',
    email: 'hello@aesthetic.studio',
    phone: '+1 (555) 123-4567',
    address: '123 Creative Blvd, Suite 400\nSan Francisco, CA 94107',
    taxId: 'US-8822910-A',
    bankName: 'Sovereign Mutual Bank',
    bankAccount: '1029-3847-5561-9022',
    bankRouting: '122105155',
    paymentDetails: 'Wire Transfer / ACH is preferred. Please include the invoice number in the payment reference details.'
  },
  receiver: {
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1 (555) 987-6543',
    address: '987 Enterprise Way, Building B\nAustin, TX 78701',
    taxId: 'TX-11223344-B'
  },
  items: [
    {
      id: 'item-1',
      description: 'Brand Identity Strategy & Complete Design System (Guideline book, responsive asset exports, logo files, typography pair library)',
      quantity: 1,
      rate: 3500.00,
      amount: 3500.00
    },
    {
      id: 'item-2',
      description: 'NextJS Frontend Engineering & Integration (Responsive UI development, Framer Motion layouts, API integrations)',
      quantity: 45,
      rate: 110.00,
      amount: 4950.00
    },
    {
      id: 'item-3',
      description: 'SEO Strategy, Copywriting & Marketing Messaging (Core landing pages copy, visual copy boards, metadata setup)',
      quantity: 4,
      rate: 450.00,
      amount: 1800.00
    }
  ],
  taxRate: 8.25,
  discountRate: 10.00,
  shippingFee: 75.00,
  gstRate: 18,
  gstEnabled: false,
  gstSplit: false,
  gstType: 'igst',
  notes: 'Thank you for partnering with Aesthetic Design Agency Inc. We sincerely appreciate your business and look forward to collaborating again on future milestones.',
  terms: 'Please pay this invoice within 14 days of issue. Balance is overdue after July 10, 2026. A 1.5% late interest fee per month will be applied to all past-due balances.',
  theme: {
    primaryColor: '#0f766e', // Deep Teal
    accentColor: '#b45309',  // Warm Amber/Gold
    fontFamily: 'Inter',
    templateId: 'teal'
  },
  currency: 'USD',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

export const sampleInvoicesList: Invoice[] = [
  sampleInvoice,
  {
    ...sampleInvoice,
    id: 'demo-invoice-2',
    invoiceNumber: 'INV-2026-0038',
    issueDate: '2026-05-15',
    dueDate: '2026-05-29',
    status: 'paid',
    items: [
      {
        id: 'item-2-1',
        description: 'Discovery Workshop, UI/UX Mockups & Interactive Wireframes',
        quantity: 1,
        rate: 2200.00,
        amount: 2200.00
      }
    ],
    taxRate: 5,
    discountRate: 0,
    shippingFee: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    theme: {
      primaryColor: '#1e3a8a', // Corporate Blue
      accentColor: '#3b82f6',  // Bright Blue
      fontFamily: 'Space Grotesk',
      templateId: 'modern'
    }
  },
  {
    ...sampleInvoice,
    id: 'demo-invoice-3',
    invoiceNumber: 'INV-2026-0040',
    issueDate: '2026-06-01',
    dueDate: '2026-06-15',
    status: 'overdue',
    items: [
      {
        id: 'item-3-1',
        description: 'Server Migration & Database Scaling Support (PostgreSQL Optimization)',
        quantity: 12,
        rate: 150.00,
        amount: 1800.00
      }
    ],
    taxRate: 0,
    discountRate: 0,
    shippingFee: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    theme: {
      primaryColor: '#1f2937', // Charcoal
      accentColor: '#10b981',  // Emerald Accent
      fontFamily: 'JetBrains Mono',
      templateId: 'dark'
    }
  }
];
