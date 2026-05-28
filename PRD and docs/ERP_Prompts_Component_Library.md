# ERP — Vibe-Coding Prompts (Phase 6 onwards — Trimmed, Chunked, Slim Reviews)

## Completed: Phases 0–5, Design overhaul, Component library

## Sequence
```
6A.1 → Review → 6A.2 → Review
6B → Review
6C.1 → Review → 6C.2 → Review
7A → Review → 7B → Review
8A → Review → 8C → Review → 8B → Review
9.1 → Review
10.1 → Review
11.1 → Review
12.1 → Review
13A → Review → 13B → Final Review

16 builds + 15 reviews = 31 prompts
```

---

## PHASE 6A — Quotes

### PROMPT 6A.1

```
Continue building the ERP app. Use the existing Glass component library for all UI. Do not create custom styles.

Build the Quotes module — list page and create/edit form only.

LIST PAGE (/sales/quotes): Use ListPage.
- GlassTable columns: Quote number, Customer name, Date, Valid until, Amount (₹ formatted), Status GlassBadge (Draft/Sent/Accepted/Rejected/Expired)
- GlassButton "New quote" (primary)
- Filters: Customer GlassSelect, Status GlassSelect, Date range
- Click row → quote detail page (build in next prompt)
- EmptyState: "No quotes yet. Create your first quote."
- Pagination (20 per page)

CREATE/EDIT FORM (/sales/quotes/new, /sales/quotes/:id/edit): Use FormPage.
- GlassCard containing:
  - Customer GlassSelect (searchable, type=customer or both) — required
  - Branch GlassSelect (if multi-branch)
  - Quote date (default today), Valid until date (default +30 days)
  - LINE ITEMS SECTION — build as a reusable <LineItemsEditor> component:
    - Each line: Product search GlassSelect (name + SKU + price), Description (auto-fills, editable), Quantity, Unit price (auto-fills from selling_price, editable), Discount % (per-line only), Tax rate (auto-fills, read-only), Tax amount (calculated), Line total (calculated)
    - "Add line" GlassButton (secondary). Delete line (trash icon).
    - Cannot save with 0 lines — validation error
  - Summary: Subtotal, Total discount, Tax total, Grand total
  - Tax logic: customer billing state_code vs company state_code. Same = CGST (half) + SGST (half). Different = IGST. Round 2 decimals PER LINE, then sum. Show split clearly.
  - Notes textarea, Terms textarea
  - GlassButtons: "Save as draft" (secondary), "Save & send" (primary)

DOCUMENT NUMBER: Generate on first save. Format QT-0001. Atomic increment document_sequences.

IMPORTANT: Build <LineItemsEditor> as a standalone reusable component with props: lines, onChange, customerStateCode, companyStateCode. It will be reused in SOs and Invoices.

API: GET/POST/PUT/DELETE /api/v1/quotes
```

### REVIEW 6A.1

```
Check the Quotes list page and form compile and render without errors. Verify <LineItemsEditor> exists as a separate reusable component file (not inline). Confirm tax calculation splits CGST+SGST vs IGST based on state code comparison. Check quote number increments from document_sequences table.
```

---

### PROMPT 6A.2

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build Quote detail page and status actions.

DETAIL PAGE (/sales/quotes/:id): Use DetailPage.
- Header: Quote number + Status GlassBadge + customer name
- Actions by status:
  - Draft: "Edit" (secondary), "Send" (primary), "Delete" (danger)
  - Sent: "Mark Accepted" (primary), "Mark Rejected" (danger)
  - Accepted: "Create Sales Order" (primary) — navigates to /sales/orders/new with quote data pre-filled (customer, lines, notes). Does NOT auto-convert.
  - Rejected/Expired: read-only
- Info GlassCard: Customer (link), Quote date, Valid until, Branch
- Line items GlassTable with tax split columns
- Totals: Subtotal, Discount, CGST/SGST or IGST, Grand total
- Notes and Terms if present
- Auto-expire: if valid_until < today and status is draft/sent → show "Expired" badge

API: POST /api/v1/quotes/:id/send, /accept, /reject
```

### REVIEW 6A.2

```
Check detail page renders all quote info and line items. Verify status transitions work (send, accept, reject). Confirm "Create Sales Order" navigates to SO form with quote data pre-filled. Check expired quotes show Expired badge.
```

---

## PHASE 6B — Sales Orders

### PROMPT 6B

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build Sales Orders. Reuse <LineItemsEditor>.

LIST PAGE (/sales/orders): Use ListPage.
- GlassTable: Order number, Customer, Date, Amount, Status GlassBadge (Draft/Confirmed/Partially Invoiced/Fully Invoiced/Cancelled)
- GlassButton "New order" (primary). Filters. EmptyState.

CREATE/EDIT (/sales/orders/new): Use FormPage.
- Same structure as quotes: Customer, Branch, Order date, Expected delivery date, <LineItemsEditor>, Notes, Terms
- If navigated from quote's "Create Sales Order": pre-fill customer, lines, notes, terms. Store quote_id.
- GlassButtons: "Save as draft", "Confirm order" (primary)

DETAIL PAGE (/sales/orders/:id): Use DetailPage.
- Same layout as quote detail, plus "quantity invoiced" column in line items
- Actions:
  - Draft: Edit, Confirm, Delete
  - Confirmed: "Create Invoice" (primary) — navigates to invoice form pre-filled. User selects which lines and quantities to invoice (partial invoicing).
  - Partially Invoiced: "Create Invoice" for remaining
  - Fully Invoiced: read-only
  - Cancel (danger + ConfirmModal) — only if no invoices created

PARTIAL INVOICING: Track quantity_invoiced per line. When creating invoice from SO, show remaining qty per line. When all fully invoiced → status = fully_invoiced.

DOCUMENT NUMBER: SO-0001, atomic increment.

API: CRUD /api/v1/sales-orders, POST /confirm, /cancel
```

### REVIEW 6B

```
Check SO list, form, and detail pages render. Verify pre-fill from quote works (customer + lines populated). Confirm partial invoicing: quantity_invoiced tracks per line, status auto-updates to fully_invoiced when complete. Check cancel blocked if invoices exist.
```

---

## PHASE 6C — Invoices, Payments, Credit Notes

### PROMPT 6C.1

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build Invoices — list, form, and the critical confirm action.

LIST PAGE (/sales/invoices): Use ListPage.
- GlassTable: Invoice number, Customer, Date, Due date, Amount, Amount due, Status GlassBadge (Draft/Confirmed/Partially Paid/Paid/Overdue/Cancelled/Credited)
- Overdue: if due_date < today AND status = confirmed → show "Overdue"
- GlassButton "New invoice". Filters. EmptyState.

CREATE (/sales/invoices/new): Use FormPage with <LineItemsEditor>.
- Invoice date, Due date (auto = invoice_date + customer.payment_terms_days)
- Place of supply state GlassSelect (determines CGST+SGST vs IGST)
- If from SO: pre-fill customer + lines with selectable quantities
- GlassButtons: "Save as draft", "Confirm invoice" (primary)

CONFIRM — CRITICAL (single DB transaction, all-or-nothing):
1. Generate number INV-0001
2. Calculate taxes per line (2 decimal rounding), sum
3. Deduct stock (track_inventory products only). Bundles: deduct components. Insufficient stock → rollback all, error.
4. GL: Debit AR (total), Credit Sales Revenue (subtotal), Credit CGST/SGST/IGST Output
5. Create stock_movements
6. Set amount_due = total_amount
7. If from SO: update quantity_invoiced, check if fully invoiced
8. Audit log
Any failure → rollback everything.

CREDIT LIMIT CHECK before confirm:
- 80% utilized → GlassToast warning, allow
- 100%+ → ConfirmModal blocking, admin-only override

API: CRUD /api/v1/invoices, POST /api/v1/invoices/:id/confirm
```

### REVIEW 6C.1

```
Check invoice confirm runs as a single transaction — if stock deduction fails, nothing is saved (no partial GL entries, no number consumed). Verify GL entry: total debits = total credits. Confirm stock_movements created. Check credit limit enforcement triggers at 80% and 100%.
```

---

### PROMPT 6C.2

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build Invoice detail page, payments, and credit notes.

INVOICE DETAIL (/sales/invoices/:id): Use DetailPage.
- Header: number + status + customer link
- Info GlassCards, Line items GlassTable with tax columns, Totals with Amount paid / Amount due
- Actions: Draft → Edit/Confirm/Delete. Confirmed+ → Record Payment/Create Credit Note/Download PDF. Paid → Credit Note/PDF.
- Payment history GlassCard: list of payments (date, amount, method, reference)

RECORD PAYMENT — GlassModal:
- Amount (default=amount_due), Date, Method GlassSelect, Reference, Notes
- On save: create payment, update invoice amounts. amount_due=0 → paid. >0 → partially_paid. GL: Debit Bank/Cash, Credit AR.
- payment > amount_due → error

CREDIT NOTES (/sales/credit-notes): ListPage + FormPage.
- List GlassTable: CN number, Customer, Original invoice, Date, Amount, Status
- Form: Customer (auto), Invoice GlassSelect (confirmed/partial/paid only), Date, Reason GlassSelect, "Return stock" checkbox, Lines pre-filled from invoice (quantities adjustable, cannot exceed original minus already credited, prices locked)
- Confirm CASCADE (single transaction):
  1. CN total <= invoice outstanding
  2. GL: Debit Sales Returns, Credit AR. Reverse tax (Debit CGST/SGST/IGST Output)
  3. Update invoice amount_due. If 0 → credited
  4. If return_stock: add stock, stock_movement (return_in)
  5. Audit log

E-INVOICING UI (on invoice detail page — for confirmed invoices only):
- If workspace setting "E-invoicing applicable" = true: show "Generate IRN" GlassButton with "Coming Soon" GlassBadge
- On click: GlassModal titled "E-Invoice Ready for Submission" showing:
  - Invoice JSON in GST e-invoice schema format (supplier GSTIN, buyer GSTIN, invoice number, date, line items, tax amounts)
  - "Copy JSON" GlassButton
  - Instructions: "Paste this on the IRP portal (einvoice1.gst.gov.in) to generate your IRN"
  - Note: "Direct IRN generation will be available soon"
- If einvoice_status = generated: show IRN number + Ack number prominently on detail page
- PDF: if irn present → print IRN + QR code. If is_irn_applicable but irn null → print "IRN Pending"

WORKSPACE SETTING (Settings > Company):
- "E-invoicing applicable" toggle (default off)
- When on: "Generate IRN" button appears on all confirmed invoices

COMING SOON PLACEHOLDERS:
- Invoices page: disabled GlassButton "AI Invoice" + "Coming Soon" GlassBadge
- Sales sidebar: "Delivery Challans" nav item with "Soon" badge → EmptyState page

API: POST /api/v1/invoices/:id/payments, CRUD /api/v1/credit-notes, POST /confirm
```

### REVIEW 6C.2

```
Check payment updates invoice amounts correctly and GL entry balances (Debit Bank = Credit AR). Verify credit note confirm runs as single transaction — GL reversed, tax reversed, stock returned if checked. Confirm CN cannot exceed invoice outstanding. Check e-invoicing JSON modal shows on confirmed invoices when workspace setting enabled. Check Coming Soon placeholders render.
```

---

## PHASE 7A — Purchase Orders & GRN

### PROMPT 7A

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build Purchase Orders and Goods Receipt. Reuse <LineItemsEditor>.

POs (/purchasing/orders): ListPage + FormPage + DetailPage.
- Same pattern as Sales Orders but for vendors
- Vendor GlassSelect (type=vendor or both). Unit price defaults to cost_price.
- Tax: vendor state vs company state → CGST+SGST or IGST
- Status: Draft/Sent/Partially Received/Fully Received/Cancelled
- Actions: Edit (draft), Send, Receive Goods, Cancel
- Document number PO-0001

RECEIVE GOODS (GRN) — from PO detail "Receive Goods" button:
- GlassModal: Warehouse GlassSelect, Receipt date, Lines showing Ordered/Previously received/Receiving now (cannot exceed remaining)
- NO serial/batch tracking
- On confirm (single transaction): Create GRN (GRN-0001), add stock to warehouse, stock_movements (type=purchase), update PO quantities. Fully received → fully_received. Partial → partially_received.

COMING SOON: Disabled section on GRN form: "Serial & Batch Tracking — Coming Soon" GlassCard

API: CRUD /api/v1/purchase-orders, POST /send, POST /receive, GET /api/v1/grn
```

### REVIEW 7A

```
Check GRN confirm adds stock and creates stock_movements in a single transaction. Verify PO status updates correctly (partially/fully received). Confirm receiving more than ordered is blocked. Check "Serial & Batch Tracking Coming Soon" renders.
```

---

## PHASE 7B — Bills, Payments & Debit Notes

### PROMPT 7B

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build Vendor Bills, Bill Payments, and Debit Notes.

BILLS (/purchasing/bills): ListPage + FormPage + DetailPage.
- Link to PO optional (auto-fills lines). Bill date, Due date.
- Confirm (single transaction): Generate BILL-0001. GL: Debit Purchase + Debit GST Input (CGST/SGST/IGST), Credit AP. Set amount_due.
- Detail: same pattern as invoice detail. Actions: Record Payment, Create Debit Note, Download PDF.

BILL PAYMENTS — GlassModal: same as customer payments. GL: Debit AP, Credit Bank/Cash.

DEBIT NOTES (/purchasing/debit-notes): ListPage + FormPage.
- Mirror of credit notes for vendor side.
- Lines from original bill, quantities adjustable, prices locked. "Return stock" checkbox.
- Confirm CASCADE (single transaction):
  1. DN total <= bill outstanding
  2. GL: Debit AP, Credit Purchase Returns. Reverse ITC (Credit GST Input)
  3. Update bill amount_due. If 0 → returned
  4. If return_stock: deduct from warehouse, stock_movement (return_out)
  5. Audit log

API: CRUD /api/v1/bills, POST /confirm, POST /payments, CRUD /api/v1/debit-notes, POST /confirm
```

### REVIEW 7B

```
Check bill confirm GL: Debit Purchase + GST Input = Credit AP (balanced). For TDS-applicable vendor payment, verify GL splits correctly: Debit AP = Credit Bank (net) + Credit TDS Payable. Confirm below-threshold vendors skip TDS. Verify debit note cascade runs as single transaction — GL reversed, ITC reversed, stock deducted if checked.
```

---

## PHASE 8A — Chart of Accounts & Journal Entries

### PROMPT 8A

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build Chart of Accounts and Journal Entries.

CHART OF ACCOUNTS (/accounting/chart-of-accounts): PageLayout.
- Tree view in GlassCard grouped by type (Assets/Liabilities/Equity/Revenue/Expenses)
- Each: code, name, type, balance from GL. System accounts have lock icon.
- Add account GlassModal. Edit name/code (except system). Soft-delete only if no GL entries.

JOURNAL ENTRIES (/accounting/journal-entries): ListPage.
- GlassTable: Entry number, Date, Reference, Description, Amount, Status GlassBadge
- Detail: lines with Account/Debit/Credit. Total row MUST balance (red if not).
- Manual entry (admin only): FormPage. Date, Description, Lines (Account GlassSelect, Debit, Credit — only one > 0). Min 2 lines. Debits MUST = Credits or reject. Post = immutable.

GL VALIDATION: Database-level CHECK — SUM(debit) = SUM(credit) per entry. Reject unbalanced.

TDS CONFIGURATION (/settings/tds, admin only):
- GlassTable of TDS rates: Section (194C/194J/194I/194H/194A/Other), Rate %, Threshold ₹. Editable.
- Pre-populate with standard Indian TDS rates: 194C=1%/2% (individual/company), 194J=10%, 194I=10%, 194H=5%, 194A=10%
- Threshold: 194C=₹1L/year, 194J=₹30k/year, 194I=₹2.4L/year, 194H=₹15k/year, 194A=₹40k/year

TDS PAYABLE ACCOUNT: Ensure "TDS Payable" exists as a system Liability account in Chart of Accounts.

FIXED ASSETS DEFAULT ACCOUNTS: Ensure these exist in Chart of Accounts:
- "Depreciation Expense" (Expense type)
- "Accumulated Depreciation — Equipment" (Liability/Contra-Asset type)
- "Accumulated Depreciation — Vehicles" (same)
- "Accumulated Depreciation — Computers" (same)
- "Accumulated Depreciation — Furniture" (same)
- "Accumulated Depreciation — Buildings" (same)

COMING SOON: "Bank Reconciliation" in sidebar with "Soon" badge → EmptyState page.

API: CRUD /api/v1/chart-of-accounts, GET/POST /api/v1/gl/entries, CRUD /api/v1/tds-rates
```

### REVIEW 8A

```
Check all default accounts exist (Cash, Bank, AR, AP, GST Output CGST/SGST/IGST, GST Input CGST/SGST/IGST, Sales Revenue, Sales Returns, Purchase, Purchase Returns). Verify manual journal entry with unbalanced debits is rejected at DB level. Confirm posted entries cannot be edited.
```

---

## PHASE 8C — Fixed Assets

### PROMPT 8C

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build the Fixed Assets module.

FIXED ASSETS LIST (/accounting/fixed-assets): Use ListPage.
- GlassTable: Asset name, Category, Purchase date, Cost (₹), Accumulated depreciation (₹), Net book value (₹), Status GlassBadge (Active/Fully Depreciated/Disposed)
- GlassButton "Add asset" (primary), GlassButton "Run depreciation" (secondary)
- Filters: Category, Status

ADD/EDIT ASSET: Use FormPage.
- Name GlassInput, Category GlassSelect (Equipment/Vehicle/Furniture/Computer/Building/Other)
- Vendor GlassSelect (from contacts, optional), Purchase date, Purchase cost
- Depreciation method GlassSelect: SLM (Straight Line Method) or WDV (Written Down Value)
- Useful life (years) GlassInput, Salvage value GlassInput
- GL asset account GlassSelect (from COA — Equipment, Vehicles, etc.)
- On save: GL entry — Debit selected asset account, Credit AP (if vendor selected) or Bank/Cash

ASSET DETAIL: Use DetailPage.
- All asset info, Current net book value, Depreciation schedule GlassTable (month, opening NBV, depreciation, closing NBV)
- "Dispose asset" GlassButton (danger) → GlassModal: Disposal date, Sale proceeds. On confirm:
  - GL: Debit Bank/Cash (proceeds), Debit Accumulated Depreciation (full accumulated), Credit Asset account (full cost)
  - Profit = proceeds - NBV → if positive: Credit Profit on Disposal (Revenue). If negative: Debit Loss on Disposal (Expense).
  - Status = Disposed

RUN DEPRECIATION — GlassModal triggered from list page:
- Month/Year picker (default: current month)
- Preview table: Asset name, Method, Opening NBV, Depreciation this month, Closing NBV
- SLM formula: (Purchase cost - Salvage value) / (Useful life years × 12) per month — constant
- WDV formula: (Current NBV × Annual rate%) / 12 per month — declining. Annual rate = 1 - (Salvage/Cost)^(1/years)
- Skip assets that are fully depreciated (NBV <= salvage value) or disposed
- Idempotent: if depreciation already run for this month → show warning, do not run again
- On confirm: one journal entry per asset — Debit Depreciation Expense, Credit Accumulated Depreciation. Update accumulated_depreciation and net_book_value on asset record.

BALANCE SHEET INTEGRATION: Fixed Assets section on balance sheet shows: Cost − Accumulated Depreciation = Net Book Value grouped by category.

API: CRUD /api/v1/fixed-assets, POST /api/v1/fixed-assets/run-depreciation, GET /api/v1/fixed-assets/:id/schedule
```

### REVIEW 8C

```
Check depreciation formulas: SLM gives constant amount each month, WDV gives declining amount. Verify GL entries balance (Debit Depreciation Expense = Credit Accumulated Depreciation). Confirm running depreciation twice for same month is blocked. Check disposal GL: Debit Accum Dep + Debit Bank − Credit Asset = Profit/Loss correctly.
```

---

## PHASE 8B — Financial Reports

### PROMPT 8B

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build P&L, Balance Sheet, and Trial Balance.

P&L (/reports/pnl): PageLayout. Date range picker (default current fiscal month). Branch filter. GlassCard report: Revenue accounts → less COGS → Gross Profit → less Expenses → Net Profit. All from GL. GlassButton "Export PDF".

BALANCE SHEET (/reports/balance-sheet): PageLayout. As-of date. GlassCard: Assets / Liabilities / Equity. MUST show balance check: Assets - Liabilities - Equity = 0. RED warning if not zero.

TRIAL BALANCE (/reports/trial-balance): PageLayout. As-of date. GlassTable: Account code, Name, Debit, Credit. Totals MUST be equal. RED if not.

TDS REPORT (/reports/tds): Use PageLayout.
- Period filter (monthly, quarterly, April-March FY)
- GlassTable: Vendor name, PAN, TDS Section, Gross payments, TDS deducted, Net paid, Payment dates
- Totals row at bottom
- GlassButton "Export PDF"
- Coming Soon: "Form 26Q Export" GlassBadge on a disabled GlassButton

COMING SOON: GlassCards for "Cash Flow Statement", "GSTR-1", "GSTR-3B", "Comparison Reports", "Form 26Q" — each with "Coming Soon" badge.

API: GET /api/v1/reports/pnl, /balance-sheet, /trial-balance, /tds + /export?format=pdf
```

### REVIEW 8B

```
Run trial balance — total debits must equal total credits. If not, STOP and fix before proceeding. Run balance sheet — Assets must equal Liabilities + Equity (including fixed assets at net book value). Check TDS Payable appears as liability if any TDS was deducted. Verify TDS report shows correct vendor-wise breakdown. Check all Coming Soon cards render.
```

---

## PHASE 9 — Dashboard & Reports

### PROMPT 9.1

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build Dashboard and basic reports.

DASHBOARD (/dashboard):
- Greeting: "Good morning/afternoon/evening, {name}"
- 4 StatCards with sparklines: Revenue this month (% change), Receivables (overdue count), Payables (overdue count), Cash position (from GL)
- Revenue chart GlassCard (Chart.js or Recharts, sunset tones)
- Recent activity GlassCard: last 10 transactions with ActivityDots + timestamps + links
- Quick actions GlassCard: Create Invoice (primary), Record Payment, Create PO, Add Contact (secondary)
- Business snapshot GlassCard: Revenue target progress bar (sunset gradient), Outstanding, Pending POs, Low stock count
- Manager/Staff: scoped to branches. Viewer: quick actions hidden.

REPORTS (/reports): PageLayout. GlassCard tiles:
1. Sales by Customer — date range, GlassTable (customer, revenue, invoices, outstanding)
2. Sales by Product — date range, GlassTable (product, qty, revenue, margin)
3. Aging Receivables — buckets Current/1-30/31-60/61-90/90+, from invoice due dates
4. Aging Payables — same for bills
5. Stock Summary — per warehouse, qty, value, reorder status
Each: date range picker, branch filter, "Export PDF" GlassButton.

API: GET /api/v1/dashboard, GET /api/v1/reports/sales-by-customer, /sales-by-product, /aging-receivables, /aging-payables, /stock-summary
```

### REVIEW 9

```
Check dashboard stat cards pull correct data from DB (revenue = sum confirmed invoices this month, receivables = sum unpaid, cash = GL bank+cash). Verify aging report buckets calculate from invoice due_date. Confirm viewer role has quick actions hidden.
```

---

## PHASE 10 — AI Features

### PROMPT 10.1

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build 3 AI features. LLM API (Anthropic or OpenAI) configurable via env variable.

1. GSTIN AUTO-FILL: POST /api/v1/ai/autofill-gstin. Input { gstin }. Returns company details. "Auto-fill" GlassButton next to GSTIN fields (company setup + contact forms). Graceful fallback if unavailable.

2. AI CHAT: POST /api/v1/ai/chat. Input { message }. LLM generates SQL → execute read-only scoped to workspace_id → natural language response. SECURITY: must include workspace_id, reject DROP/DELETE/UPDATE/INSERT/ALTER. Frontend: floating "Ask AI" GlassButton on dashboard → GlassCard chat widget, session-only.

3. SMART REORDER: GET /api/v1/ai/reorder-suggestions. Pure calc: avg daily sales (90d), days until stockout, flag if <=14 days. Dashboard GlassCard with "Create PO" GlassButton per item.

Rules: drafts only, never auto-write, rate limit 20/user/hr, log to audit, graceful degradation.

COMING SOON: Disabled "Create with AI" GlassButton + "Coming Soon" badge on invoices page.

API: /api/v1/ai/autofill-gstin, /chat, /reorder-suggestions
```

### REVIEW 10

```
Check AI chat endpoint rejects dangerous SQL (DROP, DELETE, UPDATE). Verify workspace_id is always injected into generated queries. Confirm rate limiting blocks 21st request. Check graceful fallback when LLM API key is missing.
```

---

## PHASE 11 — Notifications

### PROMPT 11.1

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build in-app notifications (2 types).

1. PAYMENT OVERDUE: On dashboard load, find invoices where status=confirmed, due_date < today, no notification in last 7 days. Create for all workspace users.

2. LOW STOCK: After stock-changing operations, if quantity <= reorder_point. Max one per product per day.

UI: Bell in navbar — unread count badge (red, max "9+"). Click → dropdown GlassCard with last 20 notifications (icon, title, message, relative time, read/unread). Click → navigate + mark read. "Mark all as read" link. EmptyState if none.

API: GET /api/v1/notifications, /unread-count, PUT /:id/read, /mark-all-read
```

### REVIEW 11

```
Check overdue notification created only once per invoice per 7 days (no duplicates). Verify low stock notification fires max once per product per day. Confirm clicking notification marks it read and navigates correctly.
```

---

## PHASE 12 — Demo Workspace

### PROMPT 12.1

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build demo workspace with seed data.

WORKSPACE: slug "DEMO", "Stark Industries Pvt Ltd", GSTIN 27AADCS0472N1Z1, Maharashtra.
USERS: admin/manager/staff @demo.com, password demo1234. Staff = Delhi only.
BRANCHES: Mumbai HQ (default, MH 27), Delhi Warehouse (DL 07).
CONTACTS: 5 customers (Metro Retail, City Electronics ₹5L credit limit, Northern Traders inter-state, Sharma & Sons unregistered, TechZone inter-state) + 3 vendors (Samsung, LG, Cable World).
PRODUCTS: 10 (3 electronics, 3 accessories with HDMI variants, 1 bundle, 3 services).
INVENTORY: across both warehouses as specified in planning doc.

TRANSACTIONS (3 months, ALL with proper GL + stock movements):
Month 1: QT-0001→SO-0001→INV-0001 Metro (PAID). PO-0001 Samsung (received, paid). INV-0002 City (PAID).
Month 2: INV-0003 Northern inter-state (PARTIAL). INV-0004 TechZone (PAID). PO-0002 Cable World (partial). CN-0001 vs INV-0001. TRF-0001 Mumbai→Delhi.
Current: INV-0005 Sharma (OVERDUE). QT-0002 Metro (PENDING). PO-0003 LG (SENT).

DEMO RULES: Amber banner "Demo workspace. Data resets daily." Block settings/user changes with toast. Allow transactions. Reset endpoint POST /api/v1/admin/reset-demo (secret key). Sequences: INV=6, QT=3, SO=2, PO=4, CN=2, TRF=2.
```

### REVIEW 12

```
Login as admin@demo.com/demo1234/DEMO — works. Check trial balance balances (CRITICAL — stop if not). Verify demo banner shows, settings blocked with toast, new invoice creation works. Confirm staff@demo.com only sees Delhi data.
```

---

## PHASE 13A — Search + PDF

### PROMPT 13A

```
Continue building the ERP app. Use the existing Glass component library for all UI.

Build Global Search and PDF template.

SEARCH: Wire up SearchBar component. Ctrl+K opens, Escape closes. Debounced 300ms. Search across contacts, products, invoice/quote/SO/PO/bill/CN/DN numbers. Grouped results in dropdown GlassCard. Click → navigate. API: GET /api/v1/search?q=term (ILIKE, scoped to workspace).

PDF: ONE reusable template for invoices, quotes, SOs, POs, credit notes, debit notes. Header (logo + company info) → title bar ("TAX INVOICE" etc.) → doc details → line items table (HSN, qty, price, discount, CGST+SGST or IGST, total) → summary → amount in Indian English words → terms → footer. "Download PDF" GlassButton on every document detail page.
```

### REVIEW 13A

```
Check search returns grouped results from multiple tables. Verify PDF generates with correct title per document type and amount-in-words is accurate (e.g., ₹2,65,500 → "Two Lakh Sixty-Five Thousand Five Hundred"). Confirm PDF includes company header and tax breakdown.
```

---

## PHASE 13B — Audit Log + Coming Soon + Polish

### PROMPT 13B

```
Continue building the ERP app. Use the existing Glass component library for all UI.

1. AUDIT LOG (/settings/audit-log, admin only): ListPage. GlassTable: Timestamp, User, Action GlassBadge, Resource type, Resource ID (link), Changes (expandable JSON diff). Filters: date range, user, action, resource type. Read-only.

2. COMING SOON PAGES — proper EmptyState pages for:
   /sales/challans → "Delivery Challans — Coming Soon"
   /accounting/bank-reconciliation → "Bank Reconciliation — Coming Soon"
   /reports/cashflow → "Cash Flow Statement — Coming Soon"
   /reports/gstr1 → "GSTR-1 — Coming Soon"
   /reports/gstr3b → "GSTR-3B — Coming Soon"
   /reports/comparison → "Comparison Reports — Coming Soon"
   /settings/import → "Data Import — Coming Soon"
   Add sidebar nav items with small "Soon" text badge.

3. POLISH:
   - SkeletonLoader on every list page while loading
   - EmptyState on every list page
   - Form validation inline on blur (red border + error text)
   - Responsive 375px: sidebar→hamburger, tables→cards, modals→fullscreen
   - Keyboard: Tab forms, Enter submit, Escape close
   - Page titles: "Invoices | ERP" etc.
   - Favicon: "E" icon
```

### REVIEW 13B — Final

```
Run full end-to-end: create customer → product → stock adjustment → quote → SO → invoice → confirm → payment → credit note → check trial balance still balances. If it balances and all pages render without errors, the app is ready. Check all Coming Soon pages render. Verify dark mode works across all pages.
```

---

## Summary

```
Total remaining: 16 build + 15 review = 31 prompts
Reviews are 3-4 lines each — code-level checks only, YOU test the UI manually.

Added features: TDS (bill payments + report), Fixed Assets (depreciation + disposal), E-invoicing (schema + UI placeholder).
```
