<div align="center">
  <img src="assets/logo.png" alt="Invoicely Studio Logo" width="200" />

  # Invoicely Studio

  A premium, client-side invoice generator designed for freelancers, creators, and small businesses. Create, manage, and export professional invoices instantly and securely.
</div>

---

## Overview

Invoicely Studio provides a modern, intuitive workspace to craft beautifully styled invoices without the need for user accounts, subscriptions, or server-side data storage. With a focus on speed, elegant aesthetics, and absolute data privacy, it is the perfect tool for independent professionals who want to streamline their billing workflow.

## Key Features

* **Dynamic Theme Customization:** Tailor your invoices using premium templates (such as Indigo and Emerald) and custom color palettes to align with your brand identity.
* **Digital Signatures:** Easily apply secure, professional digital signatures directly to your document.
* **Integrated Payment QR Codes:** Prompt quicker payments by adding dynamically generated payment QR codes directly onto your invoices.
* **Taxation & Multi-Currency Support:** Easily configure currency symbols and localized tax models (including detailed GST configurations).
* **Local Persistence & JSON Backups:** All client, invoice, and template settings auto-save to your browser's local storage. Export or import full JSON backups whenever you need them.
* **Performance-First Design:** Implements lazy loading, skeleton screens, and a custom date-picker interface for a fluid and responsive editing workflow.
* **High-Fidelity PDF Export:** Generate print-ready, pixel-perfect PDFs featuring optimized layouts (with compact formatting options).

## Getting Started

### Prerequisites

* Node.js (v16.x or higher recommended)
* npm or yarn

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/karthik558/InvoicelyStudio.git
   cd InvoicelyStudio
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Architecture & Technology Stack

* **Frontend Framework:** React with TypeScript
* **Development Environment:** Vite
* **Styling:** Tailwind CSS & Vanilla CSS
* **PDF Engine:** `@react-pdf/renderer`

## Privacy & Security

Invoicely Studio operates entirely in the browser. No invoice details, client listings, financial structures, or signatures are sent to external servers. Your data stays completely under your control within your local browser storage.
