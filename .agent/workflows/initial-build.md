---
description: initial build of the remodeling invoice app based on the scope
---

# Workflow: Initial Build

Follow these steps to implement the Remodeling Invoice App as defined in `.agent/scope.md`.

## Phase 1: Foundation & Supabase Setup
1. Verify Supabase connection environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. Create Database Schema in Supabase (Clients, Invoices, Settings tables).
3. Set up Storage Bucket (`company-assets`) for logos.
4. Implement Middleware for Authentication (protecting all routes except `/login`).

## Phase 2: Core Components & Layout
1. Create a global Layout with sidebar navigation.
2. Implement custom UI components (Button, Input, Card) using Tailwind CSS.
3. Set up the Theme system to use the `brand_color` from settings.

## Phase 3: Company Settings & Onboarding
1. Build the `/settings` page.
2. Implement logo upload to Supabase Storage.
3. Create "First-time setup" logic to redirect users to settings if data is missing.

## Phase 4: Client Management
1. Build the `/clients` list page.
2. Build the "Add Client" modal/form.
3. Build the `/clients/[id]` detail page.

## Phase 5: Invoice Engine
1. Implement the Invoice Creation form (`/invoices/new`).
2. Add auto-formatting for invoice numbers and calculations (Tax/Labor/Materials).
3. Build the PDF generation service using `@react-pdf/renderer`.

## Phase 6: Emailing & Polish
1. Integrate Resend for sending invoices via email.
2. Create the invoice preview and detail view (`/invoices/[id]`).
3. Final UI polish and mobile responsiveness check.
