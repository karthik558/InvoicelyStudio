/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { Invoice, InvoiceTheme, getCurrencyFormatter } from '../types';

// Register standard fonts
try {
  Font.register({
    family: 'Inter',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf', fontWeight: 400 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf', fontWeight: 500 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf', fontWeight: 700 },
    ],
  });

  Font.register({
    family: 'Space Grotesk',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-400-normal.ttf', fontWeight: 400 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-500-normal.ttf', fontWeight: 500 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-700-normal.ttf', fontWeight: 700 },
    ],
  });

  Font.register({
    family: 'Playfair Display',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-400-normal.ttf', fontWeight: 400 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-normal.ttf', fontWeight: 700 },
    ],
  });

  Font.register({
    family: 'JetBrains Mono',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf', fontWeight: 400 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-700-normal.ttf', fontWeight: 700 },
    ],
  });
} catch (e) {
  console.warn('Could not register external fonts in react-pdf:', e);
}

// Function to register custom uploaded font if present
export const registerCustomFont = (name: string, dataUrl: string) => {
  try {
    Font.register({
      family: name,
      src: dataUrl,
    });
  } catch (e) {
    console.error('Failed to register custom font in PDF:', e);
  }
};

// Formatter helper
const formatCurrency = (val: number) => {
  try {
    return getCurrencyFormatter('USD').format(val);
  } catch (e) {
    return `$${val.toFixed(2)}`;
  }
};

const getStyles = (theme: InvoiceTheme) => {
  const primary = theme.primaryColor || '#0f766e';
  const accent = theme.accentColor || '#b45309';
  const templateId = theme.templateId || 'teal';
  const isDark = templateId === 'dark';
  const isCompact = theme.pdfLayout === 'compact';
  const pagePadding = isCompact ? 24 : 40;
  
  // Font fallback matching
  let selectedFont = 'Helvetica';
  if (theme.fontFamily === 'custom' && theme.customFontName) {
    selectedFont = theme.customFontName;
  } else if (['Inter', 'Space Grotesk', 'Playfair Display', 'JetBrains Mono'].includes(theme.fontFamily)) {
    selectedFont = theme.fontFamily;
  }

  return StyleSheet.create({
    page: {
      padding: pagePadding,
      fontFamily: selectedFont,
      fontSize: isCompact ? 8 : 9,
      lineHeight: isCompact ? 1.3 : 1.4,
      backgroundColor: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#f3f4f6' : '#1f2937',
    },
    
    // Header Structures based on Templates
    headerTeal: {
      backgroundColor: primary,
      padding: isCompact ? 16 : 24,
      marginHorizontal: -pagePadding,
      marginTop: -pagePadding,
      marginBottom: isCompact ? 12 : 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTealLeft: {
      flexDirection: 'column',
    },
    headerTealRight: {
      alignItems: 'flex-end',
    },
    headerTealTitle: {
      fontSize: isCompact ? 20 : 24,
      fontWeight: 'bold',
      color: '#ffffff',
      letterSpacing: 1,
      lineHeight: 1.25,
    },
    headerTealSubtitle: {
      fontSize: isCompact ? 9 : 10,
      color: '#e2e8f0',
      marginTop: isCompact ? 4 : 6,
      lineHeight: 1.2,
    },

    headerClassic: {
      borderBottomWidth: isCompact ? 2 : 3,
      borderBottomColor: primary,
      paddingBottom: isCompact ? 10 : 15,
      marginBottom: isCompact ? 12 : 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    headerModern: {
      marginBottom: isCompact ? 15 : 25,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    modernBar: {
      width: 4,
      backgroundColor: primary,
      position: 'absolute',
      left: -pagePadding,
      top: 0,
      bottom: 0,
    },

    headerSimple: {
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      paddingBottom: isCompact ? 8 : 12,
      marginBottom: isCompact ? 10 : 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    headerDark: {
      backgroundColor: '#1f2937',
      padding: isCompact ? 16 : 24,
      marginHorizontal: -pagePadding,
      marginTop: -pagePadding,
      marginBottom: isCompact ? 12 : 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: primary,
    },

    headerIndigo: {
      backgroundColor: primary,
      padding: isCompact ? 16 : 24,
      marginHorizontal: -pagePadding,
      marginTop: -pagePadding,
      marginBottom: isCompact ? 12 : 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: accent,
    },

    headerEmerald: {
      backgroundColor: primary,
      padding: isCompact ? 16 : 24,
      marginHorizontal: -pagePadding,
      marginTop: -pagePadding,
      marginBottom: isCompact ? 12 : 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: accent,
    },

    // Standard elements
    logo: {
      width: isCompact ? 45 : 60,
      height: isCompact ? 45 : 60,
      objectFit: 'contain',
    },
    logoContainer: {
      marginBottom: isCompact ? 6 : 10,
    },
    
    titleText: {
       fontSize: isCompact ? 16 : 20,
       fontWeight: 'bold',
       color: isDark ? '#ffffff' : primary,
       lineHeight: 1.25,
    },
    invoiceMetaContainer: {
      marginTop: isCompact ? 3 : 5,
    },
    metaRow: {
      flexDirection: 'row',
      marginBottom: isCompact ? 2 : 3,
    },
    metaLabel: {
      fontWeight: 'bold',
      width: isCompact ? 70 : 80,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    metaValue: {
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      fontSize: 8,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginTop: 5,
    },

    // Addresses Block
    addressSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: isCompact ? 12 : 20,
    },
    addressBlock: {
      width: '46%',
    },
    addressTitle: {
      fontSize: isCompact ? 8 : 9,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: isDark ? accent : primary,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
      paddingBottom: isCompact ? 2 : 4,
      marginBottom: isCompact ? 4 : 6,
    },
    addressText: {
      fontSize: isCompact ? 7.5 : 8,
      color: isDark ? '#d1d5db' : '#4b5563',
      lineHeight: isCompact ? 1.25 : 1.3,
    },

    // Table elements
    table: {
      marginTop: isCompact ? 5 : 10,
      marginBottom: isCompact ? 10 : 20,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: templateId === 'teal' ? '#f0fdfa' : (isDark ? '#1f2937' : '#f9fafb'),
      borderBottomWidth: 2,
      borderBottomColor: primary,
      paddingVertical: isCompact ? 4 : 6,
      paddingHorizontal: 8,
    },
    tableHeaderDark: {
      flexDirection: 'row',
      backgroundColor: '#1f2937',
      borderBottomWidth: 2,
      borderBottomColor: primary,
      paddingVertical: isCompact ? 4 : 6,
      paddingHorizontal: 8,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#f3f4f6',
      paddingVertical: isCompact ? 5 : 8,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
    colDesc: {
      flex: 3,
      paddingRight: 10,
    },
    colQty: {
      width: 50,
      textAlign: 'center',
    },
    colRate: {
      width: 80,
      textAlign: 'right',
    },
    colAmt: {
      width: 90,
      textAlign: 'right',
      fontWeight: 'bold',
    },
    headerText: {
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : primary,
      fontSize: isCompact ? 7.5 : 8,
      textTransform: 'uppercase',
    },
    itemDescText: {
      fontSize: isCompact ? 8 : 8.5,
      color: isDark ? '#ffffff' : '#1f2937',
    },
    itemNumText: {
      fontSize: isCompact ? 8 : 8.5,
      color: isDark ? '#d1d5db' : '#4b5563',
    },

    // Summary block
    summarySection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: isCompact ? 5 : 10,
      marginBottom: isCompact ? 10 : 20,
    },
    notesBlock: {
      width: '52%',
    },
    totalsBlock: {
      width: '40%',
      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
      padding: isCompact ? 6 : 10,
      borderRadius: 4,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: isCompact ? 2 : 4,
      fontSize: isCompact ? 8 : 8.5,
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#374151' : '#e5e7eb',
      paddingTop: isCompact ? 4 : 6,
      marginTop: isCompact ? 4 : 6,
      fontSize: isCompact ? 9 : 10,
      fontWeight: 'bold',
    },
    grandTotalText: {
      color: primary,
    },

    // Bank and terms section
    footerSection: {
      marginTop: isCompact ? 10 : 15,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#374151' : '#e5e7eb',
      paddingTop: isCompact ? 6 : 10,
    },
    sectionTitle: {
      fontSize: isCompact ? 7.5 : 8,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: isDark ? accent : primary,
      marginBottom: 4,
    },
    footerText: {
      fontSize: isCompact ? 7 : 7.5,
      color: isDark ? '#9ca3af' : '#6b7280',
      lineHeight: isCompact ? 1.2 : 1.3,
    },
    bankGrid: {
      flexDirection: 'row',
      marginTop: 4,
      marginBottom: 4,
    },
    bankCol: {
      width: '33%',
      fontSize: isCompact ? 7 : 7.5,
    },
    bankLabel: {
      color: '#6b7280',
      fontSize: isCompact ? 6.5 : 7,
    },
    bankVal: {
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    paymentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    paymentLeft: {
      flex: 1,
      marginRight: 10,
    },
    paymentQr: {
      width: isCompact ? 50 : 65,
      height: isCompact ? 50 : 65,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#e5e7eb',
      borderRadius: 4,
      padding: 2,
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    platformWatermark: {
      marginTop: isCompact ? 12 : 20,
      paddingTop: isCompact ? 6 : 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1e293b' : '#f1f5f9',
      borderTopStyle: 'dashed',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      opacity: 0.35,
    },
    platformWatermarkText: {
      fontSize: 6.5,
      color: isDark ? '#94a3b8' : '#64748b',
    }
  });
};

interface InvoicePDFDocumentProps {
  invoice: Invoice;
}

export const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({ invoice }) => {
  const { theme, sender, receiver, items, invoiceNumber, issueDate, dueDate, status, taxRate, discountRate, shippingFee, notes, terms } = invoice;
  const styles = getStyles(theme);
  const isDark = theme.templateId === 'dark';

  const formatCurrency = (val: number) => {
    try {
      return getCurrencyFormatter(invoice.currency).format(val);
    } catch (e) {
      return `$${val.toFixed(2)}`;
    }
  };
  
  // Calculate Totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountAmount = subtotal * (discountRate / 100);
  const gstEnabled = !!invoice.gstEnabled;
  const taxAmount = gstEnabled ? 0 : (subtotal - discountAmount) * (taxRate / 100);
  const gstAmount = gstEnabled ? (subtotal - discountAmount) * ((invoice.gstRate || 0) / 100) : 0;
  const total = subtotal - discountAmount + taxAmount + gstAmount + shippingFee;

  // Status colors
  const statusColors = {
    paid: { bg: '#dcfce7', text: '#166534' },
    pending: { bg: '#fef3c7', text: '#92400e' },
    overdue: { bg: '#fee2e2', text: '#991b1b' },
  };

  const currentStatusStyle = statusColors[status] || statusColors.pending;

  // Custom font registration hook-like action
  if (theme.fontFamily === 'custom' && theme.customFontName && theme.customFontUrl) {
    registerCustomFont(theme.customFontName, theme.customFontUrl);
  }

  // Render Teal template header
  const renderTealHeader = () => (
    <View style={styles.headerTeal} fixed>
      <View style={[styles.headerTealLeft, { maxWidth: '60%', flex: 1, marginRight: 20 }]}>
        <Text style={styles.headerTealTitle}>INVOICE</Text>
        <Text style={styles.headerTealSubtitle}>No: {invoiceNumber}</Text>
      </View>
      <View style={[styles.headerTealRight, { maxWidth: '40%', shrink: 0 }]}>
        {sender.logoUrl ? (
          <Image src={sender.logoUrl} style={styles.logo} />
        ) : (
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'right' }}>
            {sender.name || 'Your Company'}
          </Text>
        )}
      </View>
    </View>
  );

  // Render Dark template header
  const renderDarkHeader = () => (
    <View style={styles.headerDark} fixed>
      <View style={{ flexDirection: 'column', maxWidth: '60%', flex: 1, marginRight: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>INVOICE</Text>
        <Text style={{ fontSize: 9, color: theme.primaryColor, marginTop: 4 }}>{invoiceNumber}</Text>
      </View>
      <View style={{ maxWidth: '40%', shrink: 0, alignItems: 'flex-end' }}>
        {sender.logoUrl ? (
          <Image src={sender.logoUrl} style={styles.logo} />
        ) : (
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'right' }}>
            {sender.name || 'Your Company'}
          </Text>
        )}
      </View>
    </View>
  );

  // Render Indigo template header
  const renderIndigoHeader = () => (
    <View style={styles.headerIndigo} fixed>
      <View style={{ flexDirection: 'column', maxWidth: '60%', flex: 1, marginRight: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1.5 }}>INVOICE</Text>
        <Text style={{ fontSize: 9, color: theme.accentColor || '#fda4af', marginTop: 4, fontWeight: 'bold' }}>No: {invoiceNumber}</Text>
      </View>
      <View style={{ maxWidth: '40%', shrink: 0, alignItems: 'flex-end' }}>
        {sender.logoUrl ? (
          <Image src={sender.logoUrl} style={styles.logo} />
        ) : (
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'right' }}>
            {sender.name || 'Your Company'}
          </Text>
        )}
      </View>
    </View>
  );

  // Render Emerald template header
  const renderEmeraldHeader = () => (
    <View style={styles.headerEmerald} fixed>
      <View style={{ flexDirection: 'column', maxWidth: '60%', flex: 1, marginRight: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1 }}>INVOICE</Text>
        <Text style={{ fontSize: 9, color: theme.accentColor || '#fef08a', marginTop: 4, fontWeight: 'bold' }}>No: {invoiceNumber}</Text>
      </View>
      <View style={{ maxWidth: '40%', shrink: 0, alignItems: 'flex-end' }}>
        {sender.logoUrl ? (
          <Image src={sender.logoUrl} style={styles.logo} />
        ) : (
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'right' }}>
            {sender.name || 'Your Company'}
          </Text>
        )}
      </View>
    </View>
  );

  // Render Classic template header
  const renderClassicHeader = () => (
    <View style={styles.headerClassic} fixed>
      <View style={{ maxWidth: '60%', flex: 1, marginRight: 20 }}>
        {sender.logoUrl ? (
          <Image src={sender.logoUrl} style={styles.logo} />
        ) : (
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.primaryColor }}>
            {sender.name || 'Your Company'}
          </Text>
        )}
      </View>
      <View style={{ alignItems: 'flex-end', maxWidth: '40%', shrink: 0 }}>
        <Text style={styles.titleText}>INVOICE</Text>
        <Text style={{ fontSize: 10, color: '#4b5563', marginTop: 4 }}>#{invoiceNumber}</Text>
      </View>
    </View>
  );

  // Render Modern template header
  const renderModernHeader = () => (
    <View style={styles.headerModern} fixed>
      <View style={styles.modernBar} />
      <View style={{ flex: 1, marginRight: 20, maxWidth: '60%' }}>
        {sender.logoUrl && <Image src={sender.logoUrl} style={[styles.logo, { marginBottom: 5 }]} />}
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>{sender.name || 'Your Company'}</Text>
        <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 2 }}>{sender.email}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', maxWidth: '40%', shrink: 0 }}>
        <Text style={[styles.titleText, { letterSpacing: 2 }]}>INVOICE</Text>
        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>#{invoiceNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: currentStatusStyle.bg, color: currentStatusStyle.text, marginTop: 4 }]}>
          <Text>{status}</Text>
        </View>
      </View>
    </View>
  );

  // Render Simple template header
  const renderSimpleHeader = () => (
    <View style={styles.headerSimple} fixed>
      <View style={{ flex: 1, marginRight: 20, maxWidth: '60%' }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827' }}>{sender.name || 'Your Company'}</Text>
        <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 3 }}>Invoice No: {invoiceNumber}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', maxWidth: '40%', shrink: 0 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', color: '#111827' }}>INVOICE</Text>
        <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 3 }}>Issue Date: {issueDate}</Text>
      </View>
    </View>
  );

  const renderHeaderByTemplate = () => {
    switch (theme.templateId) {
      case 'teal':
        return renderTealHeader();
      case 'dark':
        return renderDarkHeader();
      case 'indigo':
        return renderIndigoHeader();
      case 'emerald':
        return renderEmeraldHeader();
      case 'classic':
        return renderClassicHeader();
      case 'modern':
        return renderModernHeader();
      case 'simple':
        return renderSimpleHeader();
      default:
        return renderTealHeader();
    }
  };

  return (
    <Document title={`Invoice_${invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        
        {/* Dynamic Header */}
        {renderHeaderByTemplate()}

        {/* Invoice Meta details (Only for layouts that don't have them in header already) */}
        {theme.templateId !== 'modern' && theme.templateId !== 'simple' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.templateId === 'dark' ? '#ffffff' : '#1f2937' }}>
                Invoice Details
              </Text>
              <View style={styles.invoiceMetaContainer}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Invoice No:</Text>
                  <Text style={styles.metaValue}>{invoiceNumber}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Issue Date:</Text>
                  <Text style={styles.metaValue}>{issueDate}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Due Date:</Text>
                  <Text style={styles.metaValue}>{dueDate}</Text>
                </View>
              </View>
            </View>
            
            <View style={{ alignItems: 'right' }}>
              <Text style={{ fontSize: 8.5, color: theme.templateId === 'dark' ? '#9ca3af' : '#6b7280', textTransform: 'uppercase' }}>
                Status
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: currentStatusStyle.bg, color: currentStatusStyle.text }]}>
                <Text>{status}</Text>
              </View>
            </View>
          </View>
        )}

        {/* If Simple, we show compact dates */}
        {theme.templateId === 'simple' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
            <Text style={{ fontSize: 8 }}><Text style={{ fontWeight: 'bold' }}>Invoice Date:</Text> {issueDate}</Text>
            <Text style={{ fontSize: 8 }}><Text style={{ fontWeight: 'bold' }}>Due Date:</Text> {dueDate}</Text>
            <Text style={{ fontSize: 8, textTransform: 'uppercase', fontWeight: 'bold', color: currentStatusStyle.text }}>
              {status}
            </Text>
          </View>
        )}

        {/* Addresses Section */}
        <View style={styles.addressSection}>
          {/* Bill From (Seller) */}
          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>Bill From</Text>
            <Text style={[styles.addressText, { fontWeight: 'bold', marginBottom: 2, fontSize: 8.5, color: theme.templateId === 'dark' ? '#ffffff' : '#111827' }]}>
              {sender.name}
            </Text>
            <Text style={styles.addressText}>{sender.address}</Text>
            <Text style={styles.addressText}>Email: {sender.email}</Text>
            {sender.phone && <Text style={styles.addressText}>Phone: {sender.phone}</Text>}
            {sender.taxId && <Text style={styles.addressText}>Tax ID / VAT: {sender.taxId}</Text>}
          </View>

          {/* Bill To (Buyer) */}
          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>Bill To</Text>
            <Text style={[styles.addressText, { fontWeight: 'bold', marginBottom: 2, fontSize: 8.5, color: theme.templateId === 'dark' ? '#ffffff' : '#111827' }]}>
              {receiver.name}
            </Text>
            <Text style={styles.addressText}>{receiver.address}</Text>
            <Text style={styles.addressText}>Email: {receiver.email}</Text>
            {receiver.phone && <Text style={styles.addressText}>Phone: {receiver.phone}</Text>}
            {receiver.taxId && <Text style={styles.addressText}>Tax ID / VAT: {receiver.taxId}</Text>}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.colDesc}>
              <Text style={styles.headerText}>Item & Description</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={[styles.headerText, { textAlign: 'center' }]}>Qty</Text>
            </View>
            <View style={styles.colRate}>
              <Text style={[styles.headerText, { textAlign: 'right' }]}>Rate</Text>
            </View>
            <View style={styles.colAmt}>
              <Text style={[styles.headerText, { textAlign: 'right' }]}>Amount</Text>
            </View>
          </View>

          {/* Table Rows */}
          {items.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.itemDescText}>{item.description}</Text>
              </View>
              <View style={styles.colQty}>
                <Text style={[styles.itemNumText, { textAlign: 'center' }]}>{item.quantity}</Text>
              </View>
              <View style={styles.colRate}>
                <Text style={[styles.itemNumText, { textAlign: 'right' }]}>{formatCurrency(item.rate)}</Text>
              </View>
              <View style={styles.colAmt}>
                <Text style={[styles.itemNumText, { textAlign: 'right', fontWeight: 'bold', color: theme.templateId === 'dark' ? '#ffffff' : '#111827' }]}>
                  {formatCurrency(item.quantity * item.rate)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary and Notes section */}
        <View style={styles.summarySection}>
          {/* Notes and terms */}
          <View style={styles.notesBlock}>
            {notes ? (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.footerText}>{notes}</Text>
              </View>
            ) : null}
            
            {terms ? (
              <View>
                <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                <Text style={styles.footerText}>{terms}</Text>
              </View>
            ) : null}
          </View>

          {/* Totals Summary */}
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={{ color: '#6b7280' }}>Subtotal:</Text>
              <Text style={{ fontWeight: 'bold' }}>{formatCurrency(subtotal)}</Text>
            </View>
            
            {discountRate > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ color: '#6b7280' }}>Discount ({discountRate}%):</Text>
                <Text style={{ color: '#b91c1c', fontWeight: 'bold' }}>-{formatCurrency(discountAmount)}</Text>
              </View>
            )}

             {!gstEnabled && taxRate > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ color: '#6b7280' }}>Tax ({taxRate}%):</Text>
                <Text style={{ fontWeight: 'bold' }}>{formatCurrency(taxAmount)}</Text>
              </View>
            )}

            {invoice.gstEnabled && invoice.gstRate !== undefined && invoice.gstRate > 0 && (
              (() => {
                const type = invoice.gstType || 'igst';
                const rate = invoice.gstRate;
                const halfRate = rate / 2;
                const halfAmount = gstAmount / 2;

                if (type === 'cgst_sgst') {
                  return (
                    <>
                      <View style={styles.totalRow}>
                        <Text style={{ color: '#6b7280' }}>CGST ({halfRate}%):</Text>
                        <Text style={{ fontWeight: 'bold' }}>{formatCurrency(halfAmount)}</Text>
                      </View>
                      <View style={styles.totalRow}>
                        <Text style={{ color: '#6b7280' }}>SGST ({halfRate}%):</Text>
                        <Text style={{ fontWeight: 'bold' }}>{formatCurrency(halfAmount)}</Text>
                      </View>
                    </>
                  );
                } else if (type === 'cgst_utgst') {
                  return (
                    <>
                      <View style={styles.totalRow}>
                        <Text style={{ color: '#6b7280' }}>CGST ({halfRate}%):</Text>
                        <Text style={{ fontWeight: 'bold' }}>{formatCurrency(halfAmount)}</Text>
                      </View>
                      <View style={styles.totalRow}>
                        <Text style={{ color: '#6b7280' }}>UTGST ({halfRate}%):</Text>
                        <Text style={{ fontWeight: 'bold' }}>{formatCurrency(halfAmount)}</Text>
                      </View>
                    </>
                  );
                } else if (type === 'vat') {
                  return (
                    <View style={styles.totalRow}>
                      <Text style={{ color: '#6b7280' }}>VAT ({rate}%):</Text>
                      <Text style={{ fontWeight: 'bold' }}>{formatCurrency(gstAmount)}</Text>
                    </View>
                  );
                } else if (type === 'cess') {
                  return (
                    <View style={styles.totalRow}>
                      <Text style={{ color: '#6b7280' }}>CESS ({rate}%):</Text>
                      <Text style={{ fontWeight: 'bold' }}>{formatCurrency(gstAmount)}</Text>
                    </View>
                  );
                } else {
                  return (
                    <View style={styles.totalRow}>
                      <Text style={{ color: '#6b7280' }}>IGST ({rate}%):</Text>
                      <Text style={{ fontWeight: 'bold' }}>{formatCurrency(gstAmount)}</Text>
                    </View>
                  );
                }
              })()
            )}

            {shippingFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ color: '#6b7280' }}>Shipping:</Text>
                <Text style={{ fontWeight: 'bold' }}>{formatCurrency(shippingFee)}</Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={{ fontWeight: 'bold', color: theme.templateId === 'dark' ? '#ffffff' : '#111827' }}>Total Due:</Text>
              <Text style={[styles.grandTotalText, { color: theme.primaryColor }]}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment / Bank Details if enabled */}
        {(sender.bankName || sender.bankAccount || sender.paymentDetails || sender.paymentQrLink || sender.paymentQrImage) && (
          <View style={styles.footerSection} wrap={false}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            
            <View style={styles.paymentContainer}>
              <View style={styles.paymentLeft}>
                {sender.bankName && (
                  <View style={styles.bankGrid}>
                    <View style={styles.bankCol}>
                      <Text style={styles.bankLabel}>Bank Name</Text>
                      <Text style={styles.bankVal}>{sender.bankName}</Text>
                    </View>
                    {sender.bankAccount && (
                      <View style={styles.bankCol}>
                        <Text style={styles.bankLabel}>Account Number</Text>
                        <Text style={styles.bankVal}>{sender.bankAccount}</Text>
                      </View>
                    )}
                    {sender.bankRouting && (
                      <View style={styles.bankCol}>
                        <Text style={styles.bankLabel}>Routing Number</Text>
                        <Text style={styles.bankVal}>{sender.bankRouting}</Text>
                      </View>
                    )}
                  </View>
                )}

                {sender.paymentDetails && (
                  <Text style={[styles.footerText, { marginTop: 4 }]}>
                    <Text style={{ fontWeight: 'bold', color: isDark ? '#ffffff' : '#374151' }}>Payment Instructions: </Text>
                    {sender.paymentDetails}
                  </Text>
                )}
              </View>

              {/* QR Code section in PDF */}
              {(sender.paymentQrLink || sender.paymentQrImage) && (
                <View style={styles.paymentQr}>
                  <Image 
                    src={sender.paymentQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(sender.paymentQrLink || '')}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Platform Watermark */}
        <View style={styles.platformWatermark} wrap={false}>
          <Text style={styles.platformWatermarkText}>Invoice generated using Invoicely Studio</Text>
          <Text style={styles.platformWatermarkText}>invoicely.samsproject.in</Text>
        </View>

      </Page>
    </Document>
  );
};
