# ERP — Complete Product Specification

> Use this as the single source of truth when building with Claude Code.

---

## 1. Product Overview

**App name:** ERP (brand appears ONLY on login page)
**Platform:** SuperAGI marketplace app
**Target:** Indian SMBs
**Multi-tenant:** Yes — each SuperAGI workspace = isolated ERP instance
**Pricing:** Fully free, no restrictions
**Currency:** INR only, Indian number format (₹12,45,000)
**Tax system:** GST-compliant (CGST+SGST for intra-state, IGST for inter-state)
**Fiscal year:** April–March (configurable)

---

## 2. Design System — Snow Glass

**Style:** Frosted glass panels with warm sunset gradient accents on near-white background

**Light mode:**
- Page background: #FAFAF8 (snow white)
- Glass panels: `linear-gradient(145deg, rgba(255,245,238,0.5), rgba(255,232,214,0.35), rgba(255,224,204,0.25), rgba(255,240,230,0.4))` with `backdrop-filter: blur(20px)`, border `1px solid rgba(255,220,200,0.4)`
- Frosted shine: `::after` pseudo on top 35-45% of each panel (white-to-transparent gradient)
- Text: #3D2E22 (primary), #8B7B6E (secondary), #B0A090 (tertiary)

**Dark mode:**
- Page background: #141210
- Glass panels: `rgba(60,40,25,0.45)` warm dark brown tints, border `rgba(120,80,40,0.2)`
- Text: #F5EDE5, #A09585, #6B5F52

**Sunset gradient:** `linear-gradient(135deg, #FF6B6B 0%, #FF8E53 40%, #FFC94D 100%)`
Appears on: primary buttons, active nav item, stat card top accent bar, navbar bottom accent line, user avatar, chart bars, "View all" links, progress bars

**Does NOT appear on:** card backgrounds, inputs, table text, badges, secondary buttons

**Border radius:** 18-22px cards, 12-14px buttons/inputs/rows, 999px pills/badges/avatar

**Text color rule:** ALL amounts/numbers use default text color. Green/red ONLY for change indicators (+18.2%) and status badges (Paid/Overdue).

**Component library:** GlassCard, StatCard, GlassTable, GlassButton (primary/secondary/danger/ghost), GlassInput, GlassSelect, GlassBadge, GlassModal, GlassToast (success/error/warning), PageLayout, ListPage, DetailPage, FormPage, EmptyState, SkeletonLoader, ConfirmModal, SunsetGradientText, ActivityDot, SearchBar, Sidebar, Navbar

---

## 3. Auth & Multi-Tenancy

**Architecture:** Shared database with workspace_id on every table. Separate user accounts per workspace (same email can exist in different workspaces).

**Login flow:** 3-field sequential — Workspace ID → Email → Password
- Workspace ID validates first (shows company name on success)
- JWT (24hr) in httpOnly cookie + refresh token (7 days)
- Rate limit: 5 attempts/email/15min then 30min lockout
- Generic errors ("Invalid email or password") — never reveal whether user exists

**Middleware stack (on every /api/v1/* except /auth/*):**
1. workspaceMiddleware — extracts JWT, injects workspace_id filter on all DB queries
2. permissionMiddleware — checks RBAC matrix, logs denied attempts to audit_logs

**RBAC — 4 roles:**

| Resource | Admin | Manager | Staff | Viewer |
|----------|-------|---------|-------|--------|
| Contacts | VCUD | VCU | VCU | V |
| Products | VCUD | VCU | VC | V |
| Quotes | VCUD | VCUD | VCU | V |
| Sales Orders | VCUD | VCU | VCU | V |
| Invoices | VCUD | VCU | VC | V |
| Credit Notes | VCUD | VC | — | V |
| Purchase Orders | VCUD | VCU | VC | V |
| Bills | VCUD | VCU | VC | V |
| Debit Notes | VCUD | VC | — | V |
| Payments | VCUD | VCU | VC | V |
| Inventory | VCUD | VCU | VU | V |
| Transfers | VCUD | VCU | VC | V |
| Reports | VE | VE | V | V |
| GL/Accounting | VCUD | V | — | V |
| Settings/Users | VCUD | — | — | — |

V=view, C=create, U=update, D=delete, E=export

**Invite flows:** Magic link (creates inactive user) + Temp password (must_change_password=true)

---

## 4. Modules & Features

### 4.1 Organization & Setup
- Company profile (name, address, GSTIN, PAN, logo)
- Fiscal year configuration (default April)
- Multi-branch support (name, address, state, GSTIN per branch)
- User management (invite, assign roles, assign branches, deactivate)
- Custom fields (text/number/date/dropdown per entity type)
- Onboarding wizard (full-screen, 4 steps: company → fiscal year → first products → first customer)
- Audit trail (append-only, immutable log of all actions)

### 4.2 Contacts
- Unified contact book (customers, vendors, or both)
- Billing + shipping addresses per contact
- Tax info: tax treatment (registered/unregistered/overseas), GSTIN, PAN
- Credit limit enforcement (warning at 80%, block at 100% — admin override)
- Payment terms (Net 15/30/45/60/90 days)
- Activity timeline (all linked transactions)
- AI duplicate detection (name similarity, exact phone/email/GSTIN match, merge with reference update)
- Custom fields support

### 4.3 Products & Services
- Product/Service toggle (services skip inventory fields)
- SKU (auto-generate or manual), HSN/SAC code
- Selling price, Cost price, Tax rate (GST: 0/5/12/18/28%)
- Categories (2-level tree)
- Variants (attribute-based: Color × Size → auto-generate combinations, each with own SKU/price/stock)
- Bundles/Composites (parent product = list of component products with quantities)
- Track inventory toggle, Track serial numbers toggle, Track batches toggle
- Reorder point per product
- Custom fields support

### 4.4 Inventory & Warehouse
- Multi-warehouse support (default warehouse on setup)
- Stock tracking: quantity, committed_quantity, available = qty - committed
- Stock adjustments (draft → confirm, with GL journal entry, cannot undo)
- Inter-warehouse transfers (draft → in_transit → partial_received → completed)
  - Source stock deducted on initiate, destination added on receive
  - Partial receipt + shortage handling (damaged/lost)
- Low stock alerts (quantity <= reorder_point → notification)
- Stock movements log (every change creates a record with type + reference)
- Race condition protection: SELECT FOR UPDATE for stock changes
- AI smart reorder suggestions (avg daily sales, days to stockout)

### 4.5 Sales

**Quotes:**
- Create/edit with line items (product, qty, price, discount %, tax)
- Status: Draft → Sent → Accepted/Rejected/Expired
- Auto-expire when valid_until passes
- "Create Sales Order" from accepted quote (pre-fills SO form, user reviews)

**Sales Orders:**
- Create directly or from quote
- Status: Draft → Confirmed → Partially Invoiced → Fully Invoiced / Cancelled
- Partial invoicing: track quantity_invoiced per line, user selects lines+quantities when creating invoice

**Invoices:**
- Status: Draft → Confirmed → Partially Paid → Paid / Overdue / Cancelled / Credited
- Overdue detection: due_date < today auto-flags
- GST calculation: CGST+SGST (intra-state) or IGST (inter-state) based on place of supply
- Per-line discount (% only). Round tax to 2 decimals per line, then sum.
- **Confirm is a CRITICAL single transaction:**
  1. Generate number (INV-0001)
  2. Calculate taxes
  3. Deduct stock (bundles → deduct components). Insufficient → rollback all.
  4. GL: Debit AR, Credit Sales Revenue + CGST/SGST/IGST Output
  5. Create stock_movements
  6. Set amount_due
  7. Update SO quantity_invoiced if linked
  8. Audit log
- Credit limit check before confirm

**Payments:**
- Record against invoice. Partial or full.
- GL: Debit Bank/Cash, Credit AR
- Status auto-update: partially_paid or paid

**Credit Notes:**
- Against a specific invoice. Lines pre-filled (quantities adjustable, prices locked).
- "Return stock" checkbox
- **Confirm CASCADE (single transaction):**
  1. CN amount <= invoice outstanding
  2. GL: Debit Sales Returns, Credit AR. Reverse tax.
  3. Update invoice amount_due
  4. If return_stock: add stock back, stock_movement
  5. Audit log

### 4.6 Purchasing

**Purchase Orders:**
- Same line items pattern as sales. Unit price defaults to cost_price.
- Status: Draft → Sent → Partially Received → Fully Received / Cancelled

**Goods Receipt (GRN):**
- From PO: select warehouse, enter quantities received per line (cannot exceed ordered)
- Single transaction: create GRN, add stock, stock_movements, update PO quantities

**Vendor Bills:**
- Link to PO optional (auto-fills lines)
- Confirm: GL: Debit Purchase + GST Input, Credit AP

**Bill Payments:**
- GL: Debit AP, Credit Bank/Cash

**Debit Notes:**
- Mirror of credit notes for vendor side
- Confirm CASCADE: GL reversal, ITC reversal, stock return, bill update

### 4.7 Accounting & Finance

**Chart of Accounts:**
- Default ~45 Indian accounts (Cash, Bank, AR, AP, Inventory, GST Output CGST/SGST/IGST, GST Input CGST/SGST/IGST, Sales Revenue, Sales Returns, Purchase, Purchase Returns, Operating Expenses, TDS Payable, Depreciation Expense, Accumulated Depreciation, etc.)
- System accounts locked (cannot delete/change type)
- Add custom accounts

**Journal Entries:**
- Most auto-generated by invoices, bills, payments, credit/debit notes, adjustments
- Manual entry: admin only, debits MUST equal credits (DB-level validation)
- Posted entries immutable

**Reports (V1):**
- P&L: date range, branch filter, derived from GL. Revenue - COGS - Expenses = Net Profit. PDF export.
- Balance Sheet: as-of date. Assets = Liabilities + Equity validation (red warning if fails).
- Trial Balance: as-of date. Total debits = Total credits validation.

### 4.8 Dashboard & Reports

**Dashboard:**
- Time-based greeting
- 4 StatCards with sparklines: Revenue (% change), Receivables (overdue count), Payables (overdue count), Cash position
- Revenue chart (sunset-toned bars)
- Recent activity feed (last 10 with ActivityDots + links)
- Quick actions: Create Invoice, Record Payment, Create PO, Add Contact
- Business snapshot: revenue target progress bar, outstanding, pending POs, low stock count
- Role-based: Manager/Staff scoped to branches, Viewer has no quick actions

**Reports:**
- Sales by Customer (revenue, invoice count, outstanding per customer)
- Sales by Product (qty sold, revenue, margin %)
- Aging Receivables (Current/1-30/31-60/61-90/90+ day buckets)
- Aging Payables (same structure)
- Stock Summary (per warehouse, qty, value, reorder status)
- All: date range picker, branch filter, PDF export

### 4.9 TDS (Tax Deducted at Source)

Mandatory for Indian businesses making certain vendor payments (rent, professional fees, contractor payments, etc.).

**TDS Rates setup (admin):**
- Section (194C Contractors, 194J Professional/Technical, 194I Rent, 194H Commission, 194A Interest, Others)
- Rate % and threshold amount (TDS applies only if cumulative payment to vendor in FY exceeds threshold)
- Assign applicable TDS section to each vendor (on contact form: "TDS applicable" toggle + section + rate)

**TDS on Bill Payments:**
- When recording payment for a TDS-applicable vendor: show TDS amount = payment × rate
- Payment split: Gross = Net paid + TDS deducted
- GL: Debit AP (gross), Credit Bank/Cash (net), Credit TDS Payable
- Cumulative payment tracker per vendor per FY (for threshold check)

**TDS Report:**
- Vendor-wise: vendor name, PAN, section, gross payments, TDS deducted, net paid
- Period filter (monthly, quarterly, FY). PDF export.
- Coming Soon: Form 26Q data export

### 4.10 Fixed Assets

Tracks owned assets (equipment, vehicles, computers, furniture). Required for accurate balance sheet.

**Asset Master (/accounting/fixed-assets):** ListPage + FormPage
- Name, Category (Equipment/Vehicle/Furniture/Computer/Building/Other)
- Purchase date, Vendor (from contacts), Purchase cost
- Depreciation method: SLM (Straight Line) or WDV (Written Down Value — common in India)
- Useful life (years), Salvage value
- GL asset account (from COA). Status: Active / Fully Depreciated / Disposed

**GL on Purchase:** Debit Asset account (full cost), Credit AP or Bank

**Monthly Depreciation Run:**
- Button: "Run depreciation for [Month Year]"
- SLM: (Cost - Salvage) / useful life months — constant per month
- WDV: (Net book value × rate%) / 12 — declining per month
- Creates journal entry per asset: Debit Depreciation Expense, Credit Accumulated Depreciation
- Idempotent: prevents running same month twice
- Updates net_book_value on asset record

**Asset Disposal:** Debit Bank (proceeds) + Debit Accumulated Depreciation, Credit Asset account. Profit/loss auto-calculated.

**Balance Sheet:** Fixed Assets section = Cost − Accumulated Depreciation = Net Book Value per category

### 4.11 E-Invoicing

Mandatory in India for turnover > ₹5 crore. Requires IRN from GST portal (NIC API).

**V1 — Schema + UI only, API integration Coming Soon:**
- Invoice fields: is_irn_applicable, irn, ack_no, ack_date, qr_code_data, einvoice_status (not_applicable/pending/generated/failed)
- Workspace setting: "E-invoicing applicable" toggle
- On invoice detail: "Generate IRN" button → GlassModal showing invoice JSON in GST schema format (user copies to IRP portal manually). "Coming Soon" badge until API live.
- PDF: print IRN + QR code if present. Print "IRN Pending" if applicable but not yet generated.

### 4.12 AI Features
1. **GSTIN Auto-fill:** Enter GSTIN → auto-populate company name, address, state. Used in company setup + contact forms. Graceful fallback.
2. **Ask-anything Chat:** Natural language → SQL (read-only, workspace-scoped) → answer. Security: reject DDL/DML, require workspace_id. Session-only history.
3. **Smart Reorder:** Pure calculation — avg daily sales (90d), days to stockout, flag urgent. Dashboard card with "Create PO" shortcut per item.

### 4.13 Notifications (In-app only)
- Payment overdue: auto-detect on dashboard load, max 1 per invoice per 7 days
- Low stock: triggered after stock changes, max 1 per product per day
- Bell icon with unread count badge, dropdown with last 20, click → navigate + mark read

### 4.14 Platform
- Global search: Ctrl+K, searches contacts/products/documents by name/number/SKU, grouped results
- PDF template: one reusable template for invoices/quotes/SOs/POs/credit notes/debit notes. Company header, line items with tax split, amount in Indian English words, footer.
- Audit log: admin view with filters (date, user, action, resource type), expandable JSON diff
- Mobile responsive: sidebar → hamburger at 375px, tables → stacked cards, modals → fullscreen
- Theme toggle: light/dark, localStorage persistence, 350ms transition

---

## 5. Coming Soon Features (V2)

These have placeholder pages with EmptyState + "Coming Soon" badge:

- Delivery Challans (dispatch tracking separate from invoicing)
- Bank Reconciliation (match bank statements with ERP transactions)
- Cash Flow Statement
- GSTR-1 / GSTR-3B Reports (GST filing format export)
- Comparison Reports (MoM/YoY analysis)
- AI Natural Language Invoice Creation
- Data Import from CSV/Excel
- Data Export to CSV/Excel
- Serial/Batch Tracking during Goods Receipt
- Form 26Q export (TDS quarterly return)
- E-invoicing IRN generation via NIC API (schema + UI already built in V1)

---

## 6. Database Schema (49 tables)

Every table has workspace_id (except workspaces). All money DECIMAL(15,2). All dates TIMESTAMPTZ (store UTC, display IST). Soft deletes (is_active). audit_logs is append-only.

**Auth & Org:** workspaces, erp_users, branches, user_branches, refresh_tokens, audit_logs
**Contacts:** contacts, contact_addresses
**Products:** product_categories, products, product_variants, product_variant_attributes, composite_products
**Inventory:** warehouses, inventory, serial_numbers, batches, stock_movements, inventory_adjustments, adjustment_lines, transfer_orders, transfer_order_lines
**Sales:** quotes, quote_lines, sales_orders, sales_order_lines, invoices (+ irn/ack_no/ack_date/qr_code_data/einvoice_status fields), invoice_lines, delivery_challans, challan_lines, credit_notes, credit_note_lines, customer_payments
**Purchasing:** purchase_orders, purchase_order_lines, goods_receipt_notes, grn_lines, vendor_bills, bill_lines, debit_notes, debit_note_lines, vendor_payments
**Accounting:** chart_of_accounts, journal_entries, journal_entry_lines, fixed_assets, asset_depreciation_entries, tds_rates, tds_deductions
**System:** document_sequences, notifications, custom_field_definitions, custom_field_values

---

## 7. API Conventions

- REST, /api/v1/{resource}, plural nouns
- Cursor-based pagination (default 20, max 100)
- snake_case keys, prefixed IDs (inv_xxx, cust_xxx)
- ISO 8601 dates, amounts as numbers, enums as strings
- State changes as POST actions (e.g., /invoices/:id/confirm)
- Error codes: 400/401/403/404/409/422/429/500

---

## 8. Document Numbering

Auto-increment per workspace via document_sequences table:
- INV-0001 (invoices), QT-0001 (quotes), SO-0001 (sales orders)
- PO-0001 (purchase orders), GRN-0001, BILL-0001
- CN-0001 (credit notes), DN-0001 (debit notes)
- TRF-0001 (transfers), ADJ-0001 (adjustments), JE-0001 (journal entries)

---

## 9. Critical Business Rules

1. **GST calculation:** Compare customer/vendor billing state_code vs company state_code. Same = CGST (half rate) + SGST (half rate). Different = IGST (full rate). Round to 2 decimals per line, then sum.
2. **Invoice confirm** is an all-or-nothing DB transaction — number generation + tax calc + stock deduction + GL entries + stock movements. Any failure rolls back everything.
3. **Credit note confirm** is a cascade transaction — GL reversal + tax reversal + invoice update + optional stock return.
4. **Debit note confirm** is the purchasing mirror of credit notes.
5. **Stock adjustments** with GL impact (single transaction, irreversible).
6. **Transfers** use in-transit tracking — source deducted on initiate, destination added on receive.
7. **Journal entries** MUST always balance — database-level CHECK that SUM(debit) = SUM(credit).
8. **Trial balance** must always balance. Balance sheet equation must hold. If either fails, GL entries from earlier phases have bugs.
9. **Credit limit enforcement** at 80% (warning) and 100% (blocking with admin override).
10. **Amounts** never colored — always default text color. Green/red only for indicators and badges.
11. **TDS deduction** changes payment GL split — Gross amount settles AP, net goes to Bank, difference goes to TDS Payable. Never record TDS on non-TDS vendors.
12. **Depreciation run** is idempotent — check for existing entry before creating. Never create duplicate depreciation for same asset + month.
13. **Fixed asset disposal** must zero out the asset: accumulated depreciation clears, asset account clears, difference = profit/loss on disposal.

---

## 10. Demo Workspace

- Workspace slug: DEMO
- Org: Stark Industries Pvt Ltd, Maharashtra
- 3 users (admin/manager/staff), 2 branches (Mumbai/Delhi)
- 8 contacts, 10 products (with variants + bundle + services)
- 3 months of transactions with proper GL + stock movements
- Demo banner on every page, settings locked, transactions allowed
- Daily reset endpoint
