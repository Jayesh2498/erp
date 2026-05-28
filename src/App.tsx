import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Loader2 } from 'lucide-react'

/* ── Lazy page imports ─────────────────────────────────────── */
const Login = React.lazy(() => import('@/pages/Login'))
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))

// Contacts
const ContactsList = React.lazy(() => import('@/pages/contacts/ContactsList'))
const ContactForm = React.lazy(() => import('@/pages/contacts/ContactForm'))
const ContactDetail = React.lazy(() => import('@/pages/contacts/ContactDetail'))

// Products
const ProductsList = React.lazy(() => import('@/pages/products/ProductsList'))
const ProductForm = React.lazy(() => import('@/pages/products/ProductForm'))
const ProductDetail = React.lazy(() => import('@/pages/products/ProductDetail'))

// Inventory
const InventoryList = React.lazy(() => import('@/pages/inventory/InventoryList'))
const AdjustmentForm = React.lazy(() => import('@/pages/inventory/AdjustmentForm'))
const TransfersList = React.lazy(() => import('@/pages/inventory/TransfersList'))
const TransferForm = React.lazy(() => import('@/pages/inventory/TransferForm'))

// Sales
const QuotesList = React.lazy(() => import('@/pages/sales/QuotesList'))
const QuoteForm = React.lazy(() => import('@/pages/sales/QuoteForm'))
const QuoteDetail = React.lazy(() => import('@/pages/sales/QuoteDetail'))
const SalesOrdersList = React.lazy(() => import('@/pages/sales/SalesOrdersList'))
const SalesOrderForm = React.lazy(() => import('@/pages/sales/SalesOrderForm'))
const SalesOrderDetail = React.lazy(() => import('@/pages/sales/SalesOrderDetail'))
const InvoicesList = React.lazy(() => import('@/pages/sales/InvoicesList'))
const InvoiceForm = React.lazy(() => import('@/pages/sales/InvoiceForm'))
const InvoiceDetail = React.lazy(() => import('@/pages/sales/InvoiceDetail'))
const CreditNotesList = React.lazy(() => import('@/pages/sales/CreditNotesList'))
const CreditNoteForm = React.lazy(() => import('@/pages/sales/CreditNoteForm'))

// Purchasing
const PurchaseOrdersList = React.lazy(() => import('@/pages/purchasing/PurchaseOrdersList'))
const PurchaseOrderForm = React.lazy(() => import('@/pages/purchasing/PurchaseOrderForm'))
const PurchaseOrderDetail = React.lazy(() => import('@/pages/purchasing/PurchaseOrderDetail'))
const BillsList = React.lazy(() => import('@/pages/purchasing/BillsList'))
const BillForm = React.lazy(() => import('@/pages/purchasing/BillForm'))
const BillDetail = React.lazy(() => import('@/pages/purchasing/BillDetail'))
const DebitNotesList = React.lazy(() => import('@/pages/purchasing/DebitNotesList'))
const DebitNoteForm = React.lazy(() => import('@/pages/purchasing/DebitNoteForm'))

// Accounting
const ChartOfAccounts = React.lazy(() => import('@/pages/accounting/ChartOfAccounts'))
const JournalEntriesList = React.lazy(() => import('@/pages/accounting/JournalEntriesList'))
const JournalEntryForm = React.lazy(() => import('@/pages/accounting/JournalEntryForm'))
const FixedAssetsList = React.lazy(() => import('@/pages/accounting/FixedAssetsList'))
const FixedAssetForm = React.lazy(() => import('@/pages/accounting/FixedAssetForm'))
const FixedAssetDetail = React.lazy(() => import('@/pages/accounting/FixedAssetDetail'))

// Reports
const ReportsPage = React.lazy(() => import('@/pages/reports/ReportsPage'))
const PnLReport = React.lazy(() => import('@/pages/reports/PnLReport'))
const BalanceSheet = React.lazy(() => import('@/pages/reports/BalanceSheet'))
const TrialBalance = React.lazy(() => import('@/pages/reports/TrialBalance'))
const TDSReport = React.lazy(() => import('@/pages/reports/TDSReport'))
const SalesReports = React.lazy(() => import('@/pages/reports/SalesReports'))
const StockSummary = React.lazy(() => import('@/pages/reports/StockSummary'))

// Settings
const Settings = React.lazy(() => import('@/pages/settings/Settings'))

// Coming Soon
const ComingSoon = React.lazy(() => import('@/pages/ComingSoon'))

/* ── Page loader fallback ──────────────────────────────────── */
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <Loader2 size={28} className="animate-spin" style={{ color: 'rgb(var(--sunset-orange))' }} />
    </div>
  )
}

/* ── App ────────────────────────────────────────────────────── */
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Contacts */}
        <Route path="/contacts" element={<ProtectedRoute><ContactsList /></ProtectedRoute>} />
        <Route path="/contacts/new" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />
        <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
        <Route path="/contacts/:id/edit" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />

        {/* Products */}
        <Route path="/products" element={<ProtectedRoute><ProductsList /></ProtectedRoute>} />
        <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/products/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />

        {/* Inventory */}
        <Route path="/inventory" element={<ProtectedRoute><InventoryList /></ProtectedRoute>} />
        <Route path="/inventory/adjustments/new" element={<ProtectedRoute><AdjustmentForm /></ProtectedRoute>} />
        <Route path="/inventory/transfers" element={<ProtectedRoute><TransfersList /></ProtectedRoute>} />
        <Route path="/inventory/transfers/new" element={<ProtectedRoute><TransferForm /></ProtectedRoute>} />

        {/* Sales */}
        <Route path="/sales/quotes" element={<ProtectedRoute><QuotesList /></ProtectedRoute>} />
        <Route path="/sales/quotes/new" element={<ProtectedRoute><QuoteForm /></ProtectedRoute>} />
        <Route path="/sales/quotes/:id" element={<ProtectedRoute><QuoteDetail /></ProtectedRoute>} />
        <Route path="/sales/quotes/:id/edit" element={<ProtectedRoute><QuoteForm /></ProtectedRoute>} />
        <Route path="/sales/orders" element={<ProtectedRoute><SalesOrdersList /></ProtectedRoute>} />
        <Route path="/sales/orders/new" element={<ProtectedRoute><SalesOrderForm /></ProtectedRoute>} />
        <Route path="/sales/orders/:id" element={<ProtectedRoute><SalesOrderDetail /></ProtectedRoute>} />
        <Route path="/sales/orders/:id/edit" element={<ProtectedRoute><SalesOrderForm /></ProtectedRoute>} />
        <Route path="/sales/invoices" element={<ProtectedRoute><InvoicesList /></ProtectedRoute>} />
        <Route path="/sales/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
        <Route path="/sales/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
        <Route path="/sales/invoices/:id/edit" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
        <Route path="/sales/credit-notes" element={<ProtectedRoute><CreditNotesList /></ProtectedRoute>} />
        <Route path="/sales/credit-notes/new" element={<ProtectedRoute><CreditNoteForm /></ProtectedRoute>} />
        <Route path="/sales/challans" element={<ProtectedRoute><ComingSoon title="Delivery Challans" description="Delivery challan management is coming soon." /></ProtectedRoute>} />

        {/* Purchasing */}
        <Route path="/purchasing/orders" element={<ProtectedRoute><PurchaseOrdersList /></ProtectedRoute>} />
        <Route path="/purchasing/orders/new" element={<ProtectedRoute><PurchaseOrderForm /></ProtectedRoute>} />
        <Route path="/purchasing/orders/:id" element={<ProtectedRoute><PurchaseOrderDetail /></ProtectedRoute>} />
        <Route path="/purchasing/orders/:id/edit" element={<ProtectedRoute><PurchaseOrderForm /></ProtectedRoute>} />
        <Route path="/purchasing/bills" element={<ProtectedRoute><BillsList /></ProtectedRoute>} />
        <Route path="/purchasing/bills/new" element={<ProtectedRoute><BillForm /></ProtectedRoute>} />
        <Route path="/purchasing/bills/:id" element={<ProtectedRoute><BillDetail /></ProtectedRoute>} />
        <Route path="/purchasing/debit-notes" element={<ProtectedRoute><DebitNotesList /></ProtectedRoute>} />
        <Route path="/purchasing/debit-notes/new" element={<ProtectedRoute><DebitNoteForm /></ProtectedRoute>} />

        {/* Accounting */}
        <Route path="/accounting/chart-of-accounts" element={<ProtectedRoute><ChartOfAccounts /></ProtectedRoute>} />
        <Route path="/accounting/journal-entries" element={<ProtectedRoute><JournalEntriesList /></ProtectedRoute>} />
        <Route path="/accounting/journal-entries/new" element={<ProtectedRoute><JournalEntryForm /></ProtectedRoute>} />
        <Route path="/accounting/fixed-assets" element={<ProtectedRoute><FixedAssetsList /></ProtectedRoute>} />
        <Route path="/accounting/fixed-assets/new" element={<ProtectedRoute><FixedAssetForm /></ProtectedRoute>} />
        <Route path="/accounting/fixed-assets/:id/edit" element={<ProtectedRoute><FixedAssetForm /></ProtectedRoute>} />
        <Route path="/accounting/fixed-assets/:id" element={<ProtectedRoute><FixedAssetDetail /></ProtectedRoute>} />
        <Route path="/accounting/bank-reconciliation" element={<ProtectedRoute><ComingSoon title="Bank Reconciliation" description="Bank reconciliation is coming soon." /></ProtectedRoute>} />

        {/* Reports */}
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/reports/pnl" element={<ProtectedRoute><PnLReport /></ProtectedRoute>} />
        <Route path="/reports/balance-sheet" element={<ProtectedRoute><BalanceSheet /></ProtectedRoute>} />
        <Route path="/reports/trial-balance" element={<ProtectedRoute><TrialBalance /></ProtectedRoute>} />
        <Route path="/reports/tds" element={<ProtectedRoute><TDSReport /></ProtectedRoute>} />
        <Route path="/reports/sales" element={<ProtectedRoute><SalesReports /></ProtectedRoute>} />
        <Route path="/reports/stock" element={<ProtectedRoute><StockSummary /></ProtectedRoute>} />
        <Route path="/reports/cashflow" element={<ProtectedRoute><ComingSoon title="Cash Flow Statement" description="Cash flow statement is coming soon." /></ProtectedRoute>} />
        <Route path="/reports/gstr1" element={<ProtectedRoute><ComingSoon title="GSTR-1" description="GST return filing is coming soon." /></ProtectedRoute>} />

        {/* Settings */}
        <Route path="/settings/*" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
