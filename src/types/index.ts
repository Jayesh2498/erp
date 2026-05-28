export interface Address {
  line1: string
  city: string
  state: string
  state_code: string
  pincode: string
}

export interface Contact {
  id: string
  workspace_id: string
  name: string
  type: 'customer' | 'vendor' | 'both'
  email?: string
  phone?: string
  website?: string
  gstin?: string
  pan?: string
  tax_treatment: 'registered' | 'unregistered' | 'overseas'
  state_code?: string
  billing_address?: Address
  shipping_address?: Address
  credit_limit?: number
  payment_terms_days?: number
  notes?: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  workspace_id: string
  name: string
  sku: string
  type: 'product' | 'service'
  hsn_sac_code?: string
  category?: string
  description?: string
  selling_price: number
  cost_price: number
  tax_rate: number
  track_inventory: boolean
  reorder_point?: number
  is_active: boolean
  created_at: string
}

export interface InvoiceLine {
  id: string
  product_id: string
  product_name: string
  description: string
  quantity: number
  unit_price: number
  discount_pct: number
  tax_rate: number
  cgst: number
  sgst: number
  igst: number
  line_total: number
}

export interface Invoice {
  id: string
  number: string
  customer_id: string
  customer_name: string
  date: string
  due_date: string
  place_of_supply?: string
  status: 'draft' | 'confirmed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'credited'
  subtotal: number
  tax_total: number
  total_amount: number
  amount_due: number
  lines: InvoiceLine[]
  notes?: string
  terms?: string
  payments?: Payment[]
  so_id?: string
  created_at: string
}

export interface Payment {
  id: string
  date: string
  amount: number
  method: string
  reference?: string
}

export interface QuoteLine {
  id: string
  product_id: string
  product_name: string
  description: string
  quantity: number
  unit_price: number
  discount_pct: number
  tax_rate: number
  cgst: number
  sgst: number
  igst: number
  line_total: number
}

export interface Quote {
  id: string
  number: string
  customer_id: string
  customer_name: string
  date: string
  valid_until: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  subtotal: number
  tax_total: number
  total_amount: number
  lines: QuoteLine[]
  notes?: string
  terms?: string
  branch?: string
  created_at: string
}

export interface SOLine {
  id: string
  product_id: string
  product_name: string
  description: string
  quantity: number
  quantity_invoiced: number
  unit_price: number
  discount_pct: number
  tax_rate: number
  cgst: number
  sgst: number
  igst: number
  line_total: number
}

export interface SalesOrder {
  id: string
  number: string
  customer_id: string
  customer_name: string
  date: string
  expected_delivery?: string
  status: 'draft' | 'confirmed' | 'partially_invoiced' | 'fully_invoiced' | 'cancelled'
  quote_id?: string
  subtotal: number
  tax_total: number
  total_amount: number
  lines: SOLine[]
  notes?: string
  terms?: string
  branch?: string
  created_at: string
}

export interface POLine {
  id: string
  product_id: string
  product_name: string
  description: string
  quantity: number
  quantity_received: number
  unit_price: number
  discount_pct: number
  tax_rate: number
  cgst: number
  sgst: number
  igst: number
  line_total: number
}

export interface PurchaseOrder {
  id: string
  number: string
  vendor_id: string
  vendor_name: string
  date: string
  expected_date?: string
  status: 'draft' | 'sent' | 'partially_received' | 'fully_received' | 'cancelled'
  subtotal: number
  tax_total: number
  total_amount: number
  lines: POLine[]
  notes?: string
  created_at: string
}

export interface BillLine {
  id: string
  product_id: string
  product_name: string
  description: string
  quantity: number
  unit_price: number
  discount_pct: number
  tax_rate: number
  cgst: number
  sgst: number
  igst: number
  line_total: number
}

export interface Bill {
  id: string
  number: string
  vendor_id: string
  vendor_name: string
  date: string
  due_date: string
  po_id?: string
  status: 'draft' | 'confirmed' | 'partially_paid' | 'paid' | 'overdue'
  subtotal: number
  tax_total: number
  total_amount: number
  amount_due: number
  lines: BillLine[]
  notes?: string
  payments?: Payment[]
  created_at: string
}

export interface CreditNoteLine {
  id: string
  product_id: string
  product_name: string
  description: string
  quantity: number
  unit_price: number
  discount_pct: number
  tax_rate: number
  cgst: number
  sgst: number
  igst: number
  line_total: number
}

export interface CreditNote {
  id: string
  number: string
  customer_id: string
  customer_name: string
  invoice_id: string
  invoice_number: string
  date: string
  reason: string
  status: 'draft' | 'confirmed'
  return_stock: boolean
  subtotal: number
  tax_total: number
  total_amount: number
  lines: CreditNoteLine[]
  created_at: string
}

export interface DebitNoteLine {
  id: string
  product_id: string
  product_name: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  line_total: number
}

export interface DebitNote {
  id: string
  number: string
  vendor_id: string
  vendor_name: string
  bill_id?: string
  bill_number?: string
  date: string
  reason: string
  status: 'draft' | 'confirmed'
  subtotal: number
  tax_total: number
  total_amount: number
  lines: DebitNoteLine[]
  created_at: string
}

export interface InventoryItem {
  id: string
  product_id: string
  product_name: string
  sku: string
  warehouse_id: string
  warehouse_name: string
  quantity: number
  committed_quantity: number
  reorder_point: number
}

export interface Warehouse {
  id: string
  name: string
  is_default: boolean
}

export interface StockTransfer {
  id: string
  number: string
  from_warehouse_id: string
  from_warehouse_name: string
  to_warehouse_id: string
  to_warehouse_name: string
  date: string
  status: 'draft' | 'completed'
  lines: TransferLine[]
  notes?: string
  created_at: string
}

export interface TransferLine {
  id: string
  product_id: string
  product_name: string
  quantity: number
}

export interface StockAdjustment {
  id: string
  number: string
  warehouse_id: string
  warehouse_name: string
  date: string
  reason: string
  notes?: string
  lines: AdjustmentLine[]
  created_at: string
}

export interface AdjustmentLine {
  id: string
  product_id: string
  product_name: string
  current_qty: number
  new_qty: number
}

export interface JELine {
  id: string
  account_id: string
  account_name: string
  debit: number
  credit: number
  description?: string
}

export interface JournalEntry {
  id: string
  number: string
  date: string
  description: string
  reference?: string
  status: 'draft' | 'posted'
  lines: JELine[]
  created_at: string
}

export interface Account {
  id: string
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  balance: number
  is_system: boolean
  is_active: boolean
  parent_id?: string
}

export interface FixedAsset {
  id: string
  name: string
  category: string
  purchase_date: string
  purchase_cost: number
  vendor_id?: string
  vendor_name?: string
  depreciation_method: 'slm' | 'wdv'
  useful_life_years: number
  salvage_value: number
  accumulated_depreciation: number
  net_book_value: number
  gl_account?: string
  status: 'active' | 'fully_depreciated' | 'disposed'
  created_at: string
}

export interface Notification {
  id: string
  type: 'overdue' | 'low_stock' | 'payment' | 'info'
  title: string
  message: string
  is_read: boolean
  created_at: string
  link?: string
}

export interface WorkspaceSettings {
  company_name: string
  gstin: string
  pan: string
  state_code: string
  fiscal_year_start: string
  e_invoicing: boolean
  address?: Address
}
