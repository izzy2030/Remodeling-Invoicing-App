# Project Scope: Remodeling Invoice App

## Overview & Goal
A clean, single-user web app for a remodeling company owner to:
- Log in securely
- Set up company branding once (name, contact info, address, logo, brand color)
- Create and manage clients
- Create simple invoices tied to clients
- Preview, download, and email professional branded PDF invoices directly from the app

**MVP scope:** Owner-only access. No multi-user, no payment processing, no client portal.

## Core Features
1. **Authentication**: Email/password login (single owner account)
2. **First-Time Setup**: On initial login, redirect to Settings if company details are missing
3. **Company Settings**
   - Edit: company name, phone, email, address
   - Upload logo (stored in storage bucket, overwrites previous)
   - Pick primary brand color (hex value)
   - Set default tax rate
   - All values used globally on invoices and emails
4. **Clients Management**
   - List all clients
   - Create new client: name, email (required), phone, address (required)
   - View client details + list of their invoices
5. **Invoice Creation**
   - Select a client first (client info auto-fills)
   - **Fields:**
     - Auto-generated sequential invoice number (e.g., INV-001, INV-002)
     - Invoice date (default today)
     - Due date
     - Project description (free text)
     - Labor section: up to 2 lines (description + amount each) → no tax
     - Materials section: up to 2 lines (description + amount each) → tax applied
     - Tax rate: pre-filled from settings default, but editable per invoice
     - Notes / payment terms section
   - **Auto-calculate:** labor subtotal, materials subtotal + tax, grand total
6. **Invoice View**
   - Preview the formatted invoice on screen
   - Generate and download PDF
   - Send email button: sends nicely formatted email to client’s email with PDF attached
7. **PDF Invoice Design**
   - Professional layout with:
     - Company logo + info header
     - Client info section
     - Project description
     - Clean table separating Labor and Materials lines
     - Totals section (subtotal, tax, grand total)
     - Notes at bottom
     - Accents and buttons using the brand color
8. **Email Delivery**
   - From: company email
   - To: client email
   - Subject: “Invoice INV-XXX from [Company Name]”
   - Polite body text (placeholder/template)
   - PDF attached

## Tech Stack
- **Framework:** Next.js 15 (App Router, Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend/Auth:** Supabase (PostgreSQL, Auth, Storage)
- **PDF Generation:** @react-pdf/renderer
- **Email:** Resend
- **UI:** Clean, mobile-responsive, professional

## Database Structure (Supabase Tables)
1. **clients**
   - id (uuid)
   - name, email, phone, address
   - created_at
2. **invoices**
   - id (uuid)
   - client_id (FK to clients)
   - invoice_number (unique text)
   - invoice_date, due_date
   - project_description
   - labor_line1_desc, labor_line1_amount
   - labor_line2_desc, labor_line2_amount (optional)
   - materials_line1_desc, materials_line1_amount
   - materials_line2_desc, materials_line2_amount (optional)
   - tax_rate, notes
   - created_at, updated_at
3. **settings** (single row only)
   - id (fixed to 1)
   - company_name, company_phone, company_email, company_address
   - default_tax_rate, next_invoice_number
   - logo_url, brand_color (hex)

## Page Structure
- `/login` → Authentication
- `/dashboard` → Overview & Quick Actions
- `/clients` → List & CRUD
- `/clients/[id]` → Client Details & Invoices
- `/invoices` → History
- `/invoices/new` → Selection & Form
- `/invoices/[id]` → View/Preview/Export
- `/settings` → Branding & Defaults

## Setup Requirements
- Supabase project with Auth enabled.
- Private storage bucket: `company-assets`.
- RLS policies to restrict data to the authenticated owner.
