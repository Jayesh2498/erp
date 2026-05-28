import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Users, Package, Warehouse, ShoppingCart, FileText,
  ClipboardList, Receipt, CreditCard, Truck, ShoppingBag, FileInput,
  FileSpreadsheet, FileMinus, BookOpen, List, BookMarked, Building2,
  RefreshCw, BarChart2, TrendingUp, Scale, Columns, Percent, DollarSign,
  Settings,
} from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  href: string
  icon: LucideIcon
  roles?: ('admin' | 'manager' | 'staff' | 'viewer')[]
  children?: NavItem[]
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'contacts', label: 'Contacts', href: '/contacts', icon: Users },
  { key: 'products', label: 'Products', href: '/products', icon: Package },
  { key: 'inventory', label: 'Inventory', href: '/inventory', icon: Warehouse },
  {
    key: 'sales', label: 'Sales', href: '/sales', icon: ShoppingCart,
    children: [
      { key: 'quotes', label: 'Quotes', href: '/sales/quotes', icon: FileText },
      { key: 'sales-orders', label: 'Sales Orders', href: '/sales/orders', icon: ClipboardList },
      { key: 'invoices', label: 'Invoices', href: '/sales/invoices', icon: Receipt },
      { key: 'credit-notes', label: 'Credit Notes', href: '/sales/credit-notes', icon: CreditCard },
      { key: 'challans', label: 'Delivery Challans', href: '/sales/challans', icon: Truck },
    ],
  },
  {
    key: 'purchasing', label: 'Purchasing', href: '/purchasing', icon: ShoppingBag,
    children: [
      { key: 'purchase-orders', label: 'Purchase Orders', href: '/purchasing/orders', icon: FileInput },
      { key: 'bills', label: 'Bills', href: '/purchasing/bills', icon: FileSpreadsheet },
      { key: 'debit-notes', label: 'Debit Notes', href: '/purchasing/debit-notes', icon: FileMinus },
    ],
  },
  {
    key: 'accounting', label: 'Accounting', href: '/accounting', icon: BookOpen,
    children: [
      { key: 'coa', label: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: List },
      { key: 'journal-entries', label: 'Journal Entries', href: '/accounting/journal-entries', icon: BookMarked },
      { key: 'fixed-assets', label: 'Fixed Assets', href: '/accounting/fixed-assets', icon: Building2 },
      { key: 'bank-recon', label: 'Bank Reconciliation', href: '/accounting/bank-reconciliation', icon: RefreshCw },
    ],
  },
  {
    key: 'reports', label: 'Reports', href: '/reports', icon: BarChart2,
    children: [
      { key: 'pnl', label: 'P&L', href: '/reports/pnl', icon: TrendingUp },
      { key: 'balance-sheet', label: 'Balance Sheet', href: '/reports/balance-sheet', icon: Scale },
      { key: 'trial-balance', label: 'Trial Balance', href: '/reports/trial-balance', icon: Columns },
      { key: 'tds', label: 'TDS Report', href: '/reports/tds', icon: Percent },
      { key: 'sales-reports', label: 'Sales Reports', href: '/reports/sales', icon: ShoppingCart },
      { key: 'stock-summary', label: 'Stock Summary', href: '/reports/stock', icon: Package },
      { key: 'cashflow', label: 'Cash Flow', href: '/reports/cashflow', icon: DollarSign },
      { key: 'gstr', label: 'GST Returns', href: '/reports/gstr1', icon: FileText },
    ],
  },
]

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { key: 'settings', label: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
]
