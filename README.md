# 🧾 Invoicely Studio

Invoicely Studio is a premium, beautifully crafted web application designed for freelancers, creators, and small businesses to generate and manage professional invoices with absolute simplicity.

Built with a focus on speed, aesthetics, and privacy, Invoicely Studio allows you to create high-fidelity invoices entirely in your browser without requiring any account sign-up.

---

## ✨ Features

- **🎨 Dynamic Theme Customization:** Tailor your invoices with curated templates (including Indigo and Emerald) and dynamic theme colors to match your brand identity.
- **🖋️ Digital Signatures:** Securely add professional digital signatures to your invoices before sharing.
- **📲 QR Code Payments:** Enable quick payments by dynamically generating payment QR codes on your invoices.
- **🌍 Multi-Currency & GST Support:** Configure currency symbols and GST/tax parameters with ease.
- **📁 Local Persistence & Backups:** Rest easy knowing your client and invoice templates are auto-saved locally. Easily export/import JSON backups of your data.
- **⚡ Performance-First UI:** Supercharged with lazy loading, skeleton screens, and custom interactive date pickers for a fluid, lag-free user experience.
- **📄 High-Fidelity PDF Export:** Generate compact, print-ready, and beautifully laid out PDFs matching exactly what you see on screen.

---

## 🚀 Getting Started

### Prerequisites

You only need **Node.js** installed on your system to run the application locally.

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/karthik558/InvoicelyStudio.git
   cd InvoicelyStudio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ Technology Stack

- **Framework:** React + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS & Vanilla CSS
- **PDF Generation:** `@react-pdf/renderer`

---

## 🔒 Privacy First

Invoicely Studio runs entirely on the client side. Your invoice data, client lists, and pricing settings are stored locally in your browser's storage and never transmitted to any external server.
