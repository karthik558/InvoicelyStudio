/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDFDocument } from './InvoicePDF';
import { Download } from 'lucide-react';
import { Invoice } from '../types';

interface PDFExporterProps {
  activeInvoice: Invoice;
}

export const PDFExporter: React.FC<PDFExporterProps> = ({ activeInvoice }) => {
  return (
    <PDFDownloadLink
      key={`${activeInvoice?.id}-${activeInvoice?.updatedAt}`}
      document={<InvoicePDFDocument invoice={activeInvoice} />}
      fileName={`Invoice_${activeInvoice?.status === 'advance_paid' ? 'ADV_' : activeInvoice?.status === 'pending' ? 'PEN_' : activeInvoice?.status === 'paid' ? 'PAID_' : activeInvoice?.status === 'overdue' ? 'OVD_' : ''}${activeInvoice?.invoiceNumber || 'draft'}.pdf`}
      className="flex items-center justify-center h-9 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10 transition-colors text-white cursor-pointer shrink-0"
      title="Export PDF"
    >
      {({ loading }) => (
        <div className="flex items-center">
          <Download className="w-4 h-4 text-[#C69A5D]" />
          <span className="hidden sm:inline ml-1.5 text-xs font-semibold">
            {loading ? 'Compiling...' : 'Export PDF'}
          </span>
        </div>
      )}
    </PDFDownloadLink>
  );
};
