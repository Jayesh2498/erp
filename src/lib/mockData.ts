import type {
  Contact, Product, Invoice, Quote, SalesOrder, PurchaseOrder,
  Bill, InventoryItem, Warehouse, JournalEntry, Account, FixedAsset,
  CreditNote, DebitNote, StockTransfer, StockAdjustment, Notification,
  WorkspaceSettings,
} from '@/types'

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'wh-1', name: 'Mumbai Main', is_default: true },
  { id: 'wh-2', name: 'Pune Branch', is_default: false },
]

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'c-1', workspace_id: 'ws-demo', name: 'Reliance Industries Ltd',
    type: 'customer', email: 'accounts@reliance.com', phone: '022-44477000',
    gstin: '27AAACR5055K1ZZ', pan: 'AAACR5055K',
    tax_treatment: 'registered', state_code: '27',
    billing_address: { line1: '3rd Floor, Maker Chambers IV, Nariman Point', city: 'Mumbai', state: 'Maharashtra', state_code: '27', pincode: '400021' },
    shipping_address: { line1: '3rd Floor, Maker Chambers IV, Nariman Point', city: 'Mumbai', state: 'Maharashtra', state_code: '27', pincode: '400021' },
    credit_limit: 5000000, payment_terms_days: 30,
    is_active: true, created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'c-2', workspace_id: 'ws-demo', name: 'Tata Consultancy Services',
    type: 'customer', email: 'vendor.payments@tcs.com', phone: '022-67789999',
    gstin: '27AABCT3518Q1ZZ', pan: 'AABCT3518Q',
    tax_treatment: 'registered', state_code: '27',
    billing_address: { line1: 'TCS House, Raveline Street, Fort', city: 'Mumbai', state: 'Maharashtra', state_code: '27', pincode: '400001' },
    credit_limit: 2000000, payment_terms_days: 45,
    is_active: true, created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'c-3', workspace_id: 'ws-demo', name: 'Infosys Limited',
    type: 'customer', email: 'procurement@infosys.com', phone: '080-28520261',
    gstin: '29AABCI1681G1ZZ', pan: 'AABCI1681G',
    tax_treatment: 'registered', state_code: '29',
    billing_address: { line1: 'Electronics City, Hosur Road', city: 'Bengaluru', state: 'Karnataka', state_code: '29', pincode: '560100' },
    credit_limit: 3000000, payment_terms_days: 30,
    is_active: true, created_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'c-4', workspace_id: 'ws-demo', name: 'Wipro Technologies',
    type: 'both', email: 'accounts@wipro.com', phone: '080-28440011',
    gstin: '29AAACW0588C1ZZ', pan: 'AAACW0588C',
    tax_treatment: 'registered', state_code: '29',
    billing_address: { line1: 'Doddakannelli, Sarjapur Road', city: 'Bengaluru', state: 'Karnataka', state_code: '29', pincode: '560035' },
    credit_limit: 1500000, payment_terms_days: 60,
    is_active: true, created_at: '2025-02-10T10:00:00Z',
  },
  {
    id: 'c-5', workspace_id: 'ws-demo', name: 'HCL Technologies Ltd',
    type: 'customer', email: 'finance@hcltech.com', phone: '0120-6125000',
    gstin: '09AAACH6468P1ZZ', pan: 'AAACH6468P',
    tax_treatment: 'registered', state_code: '09',
    billing_address: { line1: '806, Siddharth Tower, Nehru Place', city: 'New Delhi', state: 'Delhi', state_code: '07', pincode: '110019' },
    credit_limit: 1000000, payment_terms_days: 30,
    is_active: true, created_at: '2025-02-20T10:00:00Z',
  },
  {
    id: 'v-1', workspace_id: 'ws-demo', name: 'Intel India Pvt Ltd',
    type: 'vendor', email: 'procurement@intel.com', phone: '080-42267000',
    gstin: '29AAACI1681G1ZZ', pan: 'AAACI1681G',
    tax_treatment: 'registered', state_code: '29',
    billing_address: { line1: 'Bagmane Technology Park, C V Raman Nagar', city: 'Bengaluru', state: 'Karnataka', state_code: '29', pincode: '560093' },
    payment_terms_days: 30,
    is_active: true, created_at: '2025-01-05T10:00:00Z',
  },
  {
    id: 'v-2', workspace_id: 'ws-demo', name: 'Samsung India Electronics',
    type: 'vendor', email: 'b2b@samsung.com', phone: '1800-5-SAMSUNG',
    gstin: '27AAJCS9164G1ZZ', pan: 'AAJCS9164G',
    tax_treatment: 'registered', state_code: '27',
    billing_address: { line1: '6th Floor, DLF Centre, Sansad Marg', city: 'New Delhi', state: 'Delhi', state_code: '07', pincode: '110001' },
    payment_terms_days: 45,
    is_active: true, created_at: '2025-01-08T10:00:00Z',
  },
  {
    id: 'v-3', workspace_id: 'ws-demo', name: 'Arrow Electronics India',
    type: 'vendor', email: 'india@arrow.com', phone: '080-43542500',
    gstin: '29AAAAA0000A1Z5', pan: 'AAAAA0000A',
    tax_treatment: 'registered', state_code: '29',
    billing_address: { line1: 'Prestige Tech Park, Marathahalli', city: 'Bengaluru', state: 'Karnataka', state_code: '29', pincode: '560037' },
    payment_terms_days: 30,
    is_active: true, created_at: '2025-01-12T10:00:00Z',
  },
]

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1', workspace_id: 'ws-demo', name: 'Arc Reactor Mark IV',
    sku: 'ARC-004', type: 'product', hsn_sac_code: '85414000',
    category: 'Power Systems', description: 'Compact fusion-based power source, 3 GW output',
    selling_price: 125000, cost_price: 85000, tax_rate: 18,
    track_inventory: true, reorder_point: 5, is_active: true, created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'p-2', workspace_id: 'ws-demo', name: 'Iron Man Suit — Mark L',
    sku: 'IMS-050', type: 'product', hsn_sac_code: '73181500',
    category: 'Exosuits', description: 'Nano-tech titanium alloy battle suit',
    selling_price: 8500000, cost_price: 5200000, tax_rate: 28,
    track_inventory: true, reorder_point: 1, is_active: true, created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'p-3', workspace_id: 'ws-demo', name: 'Repulsor Gauntlet',
    sku: 'RPG-010', type: 'product', hsn_sac_code: '85299090',
    category: 'Weapons', description: 'High-energy repulsor beam gauntlet',
    selling_price: 45000, cost_price: 28000, tax_rate: 18,
    track_inventory: true, reorder_point: 10, is_active: true, created_at: '2025-01-05T10:00:00Z',
  },
  {
    id: 'p-4', workspace_id: 'ws-demo', name: 'JARVIS AI Module',
    sku: 'JAR-001', type: 'product', hsn_sac_code: '85176200',
    category: 'AI Systems', description: 'Embedded AI decision support module',
    selling_price: 275000, cost_price: 140000, tax_rate: 18,
    track_inventory: true, reorder_point: 3, is_active: true, created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'p-5', workspace_id: 'ws-demo', name: 'Vibranium Composite Plate',
    sku: 'VCP-100', type: 'product', hsn_sac_code: '72269100',
    category: 'Materials', description: 'Ultra-strong vibranium-titanium composite armor plate',
    selling_price: 185000, cost_price: 120000, tax_rate: 18,
    track_inventory: true, reorder_point: 20, is_active: true, created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'p-6', workspace_id: 'ws-demo', name: 'Holographic Display Unit',
    sku: 'HDU-025', type: 'product', hsn_sac_code: '85285200',
    category: 'Display Systems', description: '3D holographic projection unit, 360° view',
    selling_price: 65000, cost_price: 38000, tax_rate: 18,
    track_inventory: true, reorder_point: 8, is_active: true, created_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'p-7', workspace_id: 'ws-demo', name: 'Quantum Tunneling Chip',
    sku: 'QTC-007', type: 'product', hsn_sac_code: '85423100',
    category: 'AI Systems', description: 'Next-gen quantum processor for time-space calculations',
    selling_price: 980000, cost_price: 620000, tax_rate: 18,
    track_inventory: true, reorder_point: 2, is_active: true, created_at: '2025-02-10T10:00:00Z',
  },
  {
    id: 'p-8', workspace_id: 'ws-demo', name: 'Stark Defense Bundle',
    sku: 'SDB-001', type: 'product', hsn_sac_code: '85414000',
    category: 'Bundles', description: 'Bundle: 1 Suit + 2 Gauntlets + 1 Arc Reactor',
    selling_price: 9200000, cost_price: 5900000, tax_rate: 28,
    track_inventory: false, is_active: true, created_at: '2025-02-15T10:00:00Z',
  },
  {
    id: 'svc-1', workspace_id: 'ws-demo', name: 'Suit Maintenance & Calibration',
    sku: 'SVC-MC-01', type: 'service', hsn_sac_code: '998717',
    category: 'Maintenance Services', description: 'Full diagnostic + calibration service for exosuits',
    selling_price: 35000, cost_price: 15000, tax_rate: 18,
    track_inventory: false, is_active: true, created_at: '2025-02-20T10:00:00Z',
  },
  {
    id: 'svc-2', workspace_id: 'ws-demo', name: 'AI Training & Integration',
    sku: 'SVC-AI-01', type: 'service', hsn_sac_code: '998314',
    category: 'Professional Services', description: 'JARVIS AI custom training and system integration',
    selling_price: 150000, cost_price: 60000, tax_rate: 18,
    track_inventory: false, is_active: true, created_at: '2025-03-01T10:00:00Z',
  },
]

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1', number: 'INV-0001', customer_id: 'c-1', customer_name: 'Reliance Industries Ltd',
    date: '2026-05-01', due_date: '2026-05-31', place_of_supply: 'Maharashtra',
    status: 'paid',
    subtotal: 250000, tax_total: 45000, total_amount: 295000, amount_due: 0,
    lines: [
      { id: 'il-1', product_id: 'p-1', product_name: 'Arc Reactor Mark IV', description: 'Arc Reactor Mark IV', quantity: 2, unit_price: 125000, discount_pct: 0, tax_rate: 18, cgst: 22500, sgst: 22500, igst: 0, line_total: 295000 },
    ],
    payments: [{ id: 'pay-1', date: '2026-05-15', amount: 295000, method: 'NEFT', reference: 'NEFT/26051500001' }],
    notes: 'Thank you for your business.', created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'inv-2', number: 'INV-0002', customer_id: 'c-2', customer_name: 'Tata Consultancy Services',
    date: '2026-05-05', due_date: '2026-06-19', place_of_supply: 'Maharashtra',
    status: 'confirmed',
    subtotal: 275000, tax_total: 49500, total_amount: 324500, amount_due: 324500,
    lines: [
      { id: 'il-2', product_id: 'p-4', product_name: 'JARVIS AI Module', description: 'JARVIS AI Module', quantity: 1, unit_price: 275000, discount_pct: 0, tax_rate: 18, cgst: 24750, sgst: 24750, igst: 0, line_total: 324500 },
    ],
    notes: '', created_at: '2026-05-05T10:00:00Z',
  },
  {
    id: 'inv-3', number: 'INV-0003', customer_id: 'c-3', customer_name: 'Infosys Limited',
    date: '2026-04-15', due_date: '2026-05-15', place_of_supply: 'Karnataka',
    status: 'overdue',
    subtotal: 450000, tax_total: 81000, total_amount: 531000, amount_due: 531000,
    lines: [
      { id: 'il-3', product_id: 'p-3', product_name: 'Repulsor Gauntlet', description: 'Repulsor Gauntlet', quantity: 10, unit_price: 45000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 81000, line_total: 531000 },
    ],
    notes: '', created_at: '2026-04-15T10:00:00Z',
  },
  {
    id: 'inv-4', number: 'INV-0004', customer_id: 'c-4', customer_name: 'Wipro Technologies',
    date: '2026-05-10', due_date: '2026-07-09', place_of_supply: 'Karnataka',
    status: 'draft',
    subtotal: 185000, tax_total: 33300, total_amount: 218300, amount_due: 218300,
    lines: [
      { id: 'il-4', product_id: 'p-5', product_name: 'Vibranium Composite Plate', description: 'Vibranium Composite Plate', quantity: 1, unit_price: 185000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 33300, line_total: 218300 },
    ],
    notes: '', created_at: '2026-05-10T10:00:00Z',
  },
  {
    id: 'inv-5', number: 'INV-0005', customer_id: 'c-5', customer_name: 'HCL Technologies Ltd',
    date: '2026-05-12', due_date: '2026-06-11', place_of_supply: 'Delhi',
    status: 'partially_paid',
    subtotal: 130000, tax_total: 23400, total_amount: 153400, amount_due: 80000,
    lines: [
      { id: 'il-5a', product_id: 'p-6', product_name: 'Holographic Display Unit', description: 'Holographic Display Unit', quantity: 2, unit_price: 65000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 23400, line_total: 153400 },
    ],
    payments: [{ id: 'pay-2', date: '2026-05-20', amount: 73400, method: 'RTGS', reference: 'RTGS/26052000002' }],
    notes: '', created_at: '2026-05-12T10:00:00Z',
  },
]

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'qt-1', number: 'QT-0001', customer_id: 'c-1', customer_name: 'Reliance Industries Ltd',
    date: '2026-05-01', valid_until: '2026-05-31', status: 'accepted',
    subtotal: 1250000, tax_total: 225000, total_amount: 1475000,
    lines: [
      { id: 'ql-1', product_id: 'p-1', product_name: 'Arc Reactor Mark IV', description: 'Arc Reactor Mark IV', quantity: 10, unit_price: 125000, discount_pct: 0, tax_rate: 18, cgst: 112500, sgst: 112500, igst: 0, line_total: 1475000 },
    ],
    notes: 'Valid for 30 days from date of issue.', terms: 'Prices exclusive of GST. Payment: 50% advance.',
    branch: 'Mumbai HQ', created_at: '2026-05-01T09:00:00Z',
  },
  {
    id: 'qt-2', number: 'QT-0002', customer_id: 'c-2', customer_name: 'Tata Consultancy Services',
    date: '2026-05-10', valid_until: '2026-06-09', status: 'sent',
    subtotal: 550000, tax_total: 99000, total_amount: 649000,
    lines: [
      { id: 'ql-2', product_id: 'p-4', product_name: 'JARVIS AI Module', description: 'JARVIS AI Module x2', quantity: 2, unit_price: 275000, discount_pct: 0, tax_rate: 18, cgst: 49500, sgst: 49500, igst: 0, line_total: 649000 },
    ],
    notes: '', terms: 'Standard payment terms apply.',
    branch: 'Mumbai HQ', created_at: '2026-05-10T10:00:00Z',
  },
  {
    id: 'qt-3', number: 'QT-0003', customer_id: 'c-3', customer_name: 'Infosys Limited',
    date: '2026-05-15', valid_until: '2026-06-14', status: 'draft',
    subtotal: 185000, tax_total: 33300, total_amount: 218300,
    lines: [
      { id: 'ql-3', product_id: 'p-5', product_name: 'Vibranium Composite Plate', description: 'Vibranium Composite Plate', quantity: 1, unit_price: 185000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 33300, line_total: 218300 },
    ],
    notes: '', terms: '',
    branch: 'Mumbai HQ', created_at: '2026-05-15T10:00:00Z',
  },
]

export const MOCK_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-1', number: 'SO-0001', customer_id: 'c-1', customer_name: 'Reliance Industries Ltd',
    date: '2026-05-05', expected_delivery: '2026-06-05',
    status: 'confirmed', quote_id: 'qt-1',
    subtotal: 1250000, tax_total: 225000, total_amount: 1475000,
    lines: [
      { id: 'sol-1', product_id: 'p-1', product_name: 'Arc Reactor Mark IV', description: 'Arc Reactor Mark IV', quantity: 10, quantity_invoiced: 2, unit_price: 125000, discount_pct: 0, tax_rate: 18, cgst: 112500, sgst: 112500, igst: 0, line_total: 1475000 },
    ],
    notes: 'Urgent — please expedite delivery.',
    terms: 'Standard terms apply.', branch: 'Mumbai HQ',
    created_at: '2026-05-05T10:00:00Z',
  },
  {
    id: 'so-2', number: 'SO-0002', customer_id: 'c-3', customer_name: 'Infosys Limited',
    date: '2026-05-15', expected_delivery: '2026-06-15',
    status: 'draft',
    subtotal: 900000, tax_total: 162000, total_amount: 1062000,
    lines: [
      { id: 'sol-2', product_id: 'p-3', product_name: 'Repulsor Gauntlet', description: 'Repulsor Gauntlet x20', quantity: 20, quantity_invoiced: 0, unit_price: 45000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 162000, line_total: 1062000 },
    ],
    notes: '', terms: '', branch: 'Mumbai HQ',
    created_at: '2026-05-15T10:00:00Z',
  },
]

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1', number: 'PO-0001', vendor_id: 'v-1', vendor_name: 'Intel India Pvt Ltd',
    date: '2026-05-02', expected_date: '2026-05-20',
    status: 'fully_received',
    subtotal: 620000, tax_total: 111600, total_amount: 731600,
    lines: [
      { id: 'pol-1', product_id: 'p-7', product_name: 'Quantum Tunneling Chip', description: 'Quantum Tunneling Chip', quantity: 1, quantity_received: 1, unit_price: 620000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 111600, line_total: 731600 },
    ],
    notes: '', created_at: '2026-05-02T10:00:00Z',
  },
  {
    id: 'po-2', number: 'PO-0002', vendor_id: 'v-2', vendor_name: 'Samsung India Electronics',
    date: '2026-05-08', expected_date: '2026-05-30',
    status: 'partially_received',
    subtotal: 570000, tax_total: 102600, total_amount: 672600,
    lines: [
      { id: 'pol-2', product_id: 'p-6', product_name: 'Holographic Display Unit', description: 'Holographic Display Unit', quantity: 15, quantity_received: 8, unit_price: 38000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 102600, line_total: 672600 },
    ],
    notes: '', created_at: '2026-05-08T10:00:00Z',
  },
  {
    id: 'po-3', number: 'PO-0003', vendor_id: 'v-3', vendor_name: 'Arrow Electronics India',
    date: '2026-05-18', expected_date: '2026-06-10',
    status: 'sent',
    subtotal: 1700000, tax_total: 306000, total_amount: 2006000,
    lines: [
      { id: 'pol-3', product_id: 'p-5', product_name: 'Vibranium Composite Plate', description: 'Vibranium Composite Plate', quantity: 50, quantity_received: 0, unit_price: 34000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 306000, line_total: 2006000 },
    ],
    notes: 'Rush order — needed for Stark Defense Bundle production.',
    created_at: '2026-05-18T10:00:00Z',
  },
]

export const MOCK_BILLS: Bill[] = [
  {
    id: 'bill-1', number: 'BILL-0001', vendor_id: 'v-1', vendor_name: 'Intel India Pvt Ltd',
    date: '2026-05-20', due_date: '2026-06-19', po_id: 'po-1',
    status: 'paid',
    subtotal: 620000, tax_total: 111600, total_amount: 731600, amount_due: 0,
    lines: [
      { id: 'bl-1', product_id: 'p-7', product_name: 'Quantum Tunneling Chip', description: 'Quantum Tunneling Chip', quantity: 1, unit_price: 620000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 111600, line_total: 731600 },
    ],
    payments: [{ id: 'bpay-1', date: '2026-05-25', amount: 731600, method: 'NEFT', reference: 'NEFT/26052500003' }],
    created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'bill-2', number: 'BILL-0002', vendor_id: 'v-2', vendor_name: 'Samsung India Electronics',
    date: '2026-05-22', due_date: '2026-07-06',
    status: 'confirmed',
    subtotal: 304000, tax_total: 54720, total_amount: 358720, amount_due: 358720,
    lines: [
      { id: 'bl-2', product_id: 'p-6', product_name: 'Holographic Display Unit', description: '8 units @ ₹38,000', quantity: 8, unit_price: 38000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 54720, line_total: 358720 },
    ],
    created_at: '2026-05-22T10:00:00Z',
  },
]

export const MOCK_CREDIT_NOTES: CreditNote[] = [
  {
    id: 'cn-1', number: 'CN-0001', customer_id: 'c-3', customer_name: 'Infosys Limited',
    invoice_id: 'inv-3', invoice_number: 'INV-0003',
    date: '2026-05-20', reason: 'Goods damaged in transit — 2 units returned',
    status: 'confirmed', return_stock: true,
    subtotal: 90000, tax_total: 16200, total_amount: 106200,
    lines: [
      { id: 'cnl-1', product_id: 'p-3', product_name: 'Repulsor Gauntlet', description: 'Repulsor Gauntlet — 2 damaged units', quantity: 2, unit_price: 45000, discount_pct: 0, tax_rate: 18, cgst: 0, sgst: 0, igst: 16200, line_total: 106200 },
    ],
    created_at: '2026-05-20T10:00:00Z',
  },
]

export const MOCK_DEBIT_NOTES: DebitNote[] = [
  {
    id: 'dn-1', number: 'DN-0001', vendor_id: 'v-2', vendor_name: 'Samsung India Electronics',
    bill_id: 'bill-2', bill_number: 'BILL-0002',
    date: '2026-05-24', reason: 'Short shipment — 3 units missing from delivery',
    status: 'confirmed',
    subtotal: 114000, tax_total: 20520, total_amount: 134520,
    lines: [
      { id: 'dnl-1', product_id: 'p-6', product_name: 'Holographic Display Unit', description: '3 units @ ₹38,000', quantity: 3, unit_price: 38000, tax_rate: 18, line_total: 134520 },
    ],
    created_at: '2026-05-24T10:00:00Z',
  },
]

export const MOCK_INVENTORY: InventoryItem[] = [
  { product_id: 'p-1', product_name: 'Arc Reactor Mark IV', sku: 'ARC-004', warehouse_id: 'wh-1', warehouse_name: 'Mumbai Main', quantity: 12, committed_quantity: 8, reorder_point: 5 },
  { product_id: 'p-1', product_name: 'Arc Reactor Mark IV', sku: 'ARC-004', warehouse_id: 'wh-2', warehouse_name: 'Pune Branch', quantity: 3, committed_quantity: 0, reorder_point: 2 },
  { product_id: 'p-2', product_name: 'Iron Man Suit — Mark L', sku: 'IMS-050', warehouse_id: 'wh-1', warehouse_name: 'Mumbai Main', quantity: 2, committed_quantity: 0, reorder_point: 1 },
  { product_id: 'p-3', product_name: 'Repulsor Gauntlet', sku: 'RPG-010', warehouse_id: 'wh-1', warehouse_name: 'Mumbai Main', quantity: 35, committed_quantity: 20, reorder_point: 10 },
  { product_id: 'p-3', product_name: 'Repulsor Gauntlet', sku: 'RPG-010', warehouse_id: 'wh-2', warehouse_name: 'Pune Branch', quantity: 8, committed_quantity: 0, reorder_point: 5 },
  { product_id: 'p-4', product_name: 'JARVIS AI Module', sku: 'JAR-001', warehouse_id: 'wh-1', warehouse_name: 'Mumbai Main', quantity: 4, committed_quantity: 1, reorder_point: 3 },
  { product_id: 'p-5', product_name: 'Vibranium Composite Plate', sku: 'VCP-100', warehouse_id: 'wh-1', warehouse_name: 'Mumbai Main', quantity: 15, committed_quantity: 0, reorder_point: 20 },
  { product_id: 'p-5', product_name: 'Vibranium Composite Plate', sku: 'VCP-100', warehouse_id: 'wh-2', warehouse_name: 'Pune Branch', quantity: 5, committed_quantity: 0, reorder_point: 10 },
  { product_id: 'p-6', product_name: 'Holographic Display Unit', sku: 'HDU-025', warehouse_id: 'wh-1', warehouse_name: 'Mumbai Main', quantity: 8, committed_quantity: 2, reorder_point: 8 },
  { product_id: 'p-7', product_name: 'Quantum Tunneling Chip', sku: 'QTC-007', warehouse_id: 'wh-1', warehouse_name: 'Mumbai Main', quantity: 1, committed_quantity: 0, reorder_point: 2 },
]

export const MOCK_STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 'tr-1', number: 'TRF-0001',
    from_warehouse_id: 'wh-1', from_warehouse_name: 'Mumbai Main',
    to_warehouse_id: 'wh-2', to_warehouse_name: 'Pune Branch',
    date: '2026-05-10', status: 'completed',
    lines: [
      { id: 'trl-1', product_id: 'p-1', product_name: 'Arc Reactor Mark IV', quantity: 3 },
      { id: 'trl-2', product_id: 'p-3', product_name: 'Repulsor Gauntlet', quantity: 5 },
    ],
    created_at: '2026-05-10T10:00:00Z',
  },
]

export const MOCK_STOCK_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-1', number: 'ADJ-0001',
    warehouse_id: 'wh-1', warehouse_name: 'Mumbai Main',
    date: '2026-05-05', reason: 'Physical count discrepancy',
    lines: [
      { id: 'adjl-1', product_id: 'p-6', product_name: 'Holographic Display Unit', current_qty: 10, new_qty: 8 },
    ],
    created_at: '2026-05-05T10:00:00Z',
  },
]

export const MOCK_ACCOUNTS: Account[] = [
  // Assets
  { id: 'acc-1010', code: '1010', name: 'Cash in Hand', type: 'asset', balance: 125000, is_system: true, is_active: true },
  { id: 'acc-1020', code: '1020', name: 'Bank — HDFC Current A/c', type: 'asset', balance: 4820000, is_system: true, is_active: true },
  { id: 'acc-1030', code: '1030', name: 'Bank — ICICI Savings', type: 'asset', balance: 1250000, is_system: false, is_active: true },
  { id: 'acc-1100', code: '1100', name: 'Accounts Receivable', type: 'asset', balance: 1528900, is_system: true, is_active: true },
  { id: 'acc-1200', code: '1200', name: 'Inventory — Raw Material', type: 'asset', balance: 3200000, is_system: true, is_active: true },
  { id: 'acc-1210', code: '1210', name: 'Inventory — Finished Goods', type: 'asset', balance: 8500000, is_system: false, is_active: true },
  { id: 'acc-1300', code: '1300', name: 'Prepaid Expenses', type: 'asset', balance: 85000, is_system: false, is_active: true },
  { id: 'acc-1400', code: '1400', name: 'Input CGST', type: 'asset', balance: 245000, is_system: true, is_active: true },
  { id: 'acc-1410', code: '1410', name: 'Input SGST', type: 'asset', balance: 245000, is_system: true, is_active: true },
  { id: 'acc-1420', code: '1420', name: 'Input IGST', type: 'asset', balance: 380000, is_system: true, is_active: true },
  { id: 'acc-1500', code: '1500', name: 'Fixed Assets — Machinery', type: 'asset', balance: 12000000, is_system: false, is_active: true },
  { id: 'acc-1510', code: '1510', name: 'Fixed Assets — Computers', type: 'asset', balance: 850000, is_system: false, is_active: true },
  { id: 'acc-1520', code: '1520', name: 'Accum. Depreciation — Machinery', type: 'asset', balance: -2400000, is_system: false, is_active: true },
  // Liabilities
  { id: 'acc-2100', code: '2100', name: 'Accounts Payable', type: 'liability', balance: 1092320, is_system: true, is_active: true },
  { id: 'acc-2200', code: '2200', name: 'Output CGST Payable', type: 'liability', balance: 160650, is_system: true, is_active: true },
  { id: 'acc-2210', code: '2210', name: 'Output SGST Payable', type: 'liability', balance: 160650, is_system: true, is_active: true },
  { id: 'acc-2220', code: '2220', name: 'Output IGST Payable', type: 'liability', balance: 256500, is_system: true, is_active: true },
  { id: 'acc-2300', code: '2300', name: 'TDS Payable', type: 'liability', balance: 45000, is_system: true, is_active: true },
  { id: 'acc-2400', code: '2400', name: 'Salary Payable', type: 'liability', balance: 380000, is_system: false, is_active: true },
  { id: 'acc-2500', code: '2500', name: 'Advance from Customers', type: 'liability', balance: 200000, is_system: false, is_active: true },
  { id: 'acc-2600', code: '2600', name: 'Term Loan — SBI', type: 'liability', balance: 5000000, is_system: false, is_active: true },
  // Equity
  { id: 'acc-3100', code: '3100', name: 'Share Capital', type: 'equity', balance: 10000000, is_system: true, is_active: true },
  { id: 'acc-3200', code: '3200', name: 'Retained Earnings', type: 'equity', balance: 8240000, is_system: true, is_active: true },
  { id: 'acc-3300', code: '3300', name: 'General Reserve', type: 'equity', balance: 2000000, is_system: false, is_active: true },
  // Revenue
  { id: 'acc-4100', code: '4100', name: 'Sales — Products', type: 'revenue', balance: 18500000, is_system: true, is_active: true },
  { id: 'acc-4110', code: '4110', name: 'Sales — Services', type: 'revenue', balance: 2800000, is_system: false, is_active: true },
  { id: 'acc-4200', code: '4200', name: 'Sales Returns & Allowances', type: 'revenue', balance: -215000, is_system: false, is_active: true },
  { id: 'acc-4300', code: '4300', name: 'Other Income', type: 'revenue', balance: 125000, is_system: false, is_active: true },
  { id: 'acc-4400', code: '4400', name: 'Interest Income', type: 'revenue', balance: 85000, is_system: false, is_active: true },
  // Expenses
  { id: 'acc-5100', code: '5100', name: 'Cost of Goods Sold', type: 'expense', balance: 11200000, is_system: true, is_active: true },
  { id: 'acc-5200', code: '5200', name: 'Salaries & Wages', type: 'expense', balance: 3800000, is_system: false, is_active: true },
  { id: 'acc-5300', code: '5300', name: 'Rent Expense', type: 'expense', balance: 480000, is_system: false, is_active: true },
  { id: 'acc-5400', code: '5400', name: 'Depreciation Expense', type: 'expense', balance: 960000, is_system: true, is_active: true },
  { id: 'acc-5500', code: '5500', name: 'Office Expenses', type: 'expense', balance: 125000, is_system: false, is_active: true },
  { id: 'acc-5600', code: '5600', name: 'Marketing & Advertising', type: 'expense', balance: 280000, is_system: false, is_active: true },
  { id: 'acc-5700', code: '5700', name: 'Bank Charges', type: 'expense', balance: 18000, is_system: false, is_active: true },
  { id: 'acc-5800', code: '5800', name: 'Professional Fees', type: 'expense', balance: 150000, is_system: false, is_active: true },
  { id: 'acc-5900', code: '5900', name: 'Travel & Conveyance', type: 'expense', balance: 95000, is_system: false, is_active: true },
  { id: 'acc-6000', code: '6000', name: 'Insurance Expense', type: 'expense', balance: 72000, is_system: false, is_active: true },
  { id: 'acc-6100', code: '6100', name: 'Electricity & Utilities', type: 'expense', balance: 84000, is_system: false, is_active: true },
  { id: 'acc-6200', code: '6200', name: 'Repairs & Maintenance', type: 'expense', balance: 45000, is_system: false, is_active: true },
  { id: 'acc-6300', code: '6300', name: 'Interest Expense', type: 'expense', balance: 300000, is_system: false, is_active: true },
  { id: 'acc-6400', code: '6400', name: 'Sundry Expenses', type: 'expense', balance: 32000, is_system: false, is_active: true },
  { id: 'acc-6500', code: '6500', name: 'TDS Expense', type: 'expense', balance: 45000, is_system: true, is_active: true },
]

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je-1', number: 'JE-0001', date: '2026-05-01',
    description: 'Sales invoice INV-0001 — Reliance Industries', reference: 'INV-0001',
    status: 'posted',
    lines: [
      { id: 'jel-1', account_id: 'acc-1100', account_name: 'Accounts Receivable', debit: 295000, credit: 0 },
      { id: 'jel-2', account_id: 'acc-4100', account_name: 'Sales — Products', debit: 0, credit: 250000 },
      { id: 'jel-3', account_id: 'acc-2200', account_name: 'Output CGST Payable', debit: 0, credit: 22500 },
      { id: 'jel-4', account_id: 'acc-2210', account_name: 'Output SGST Payable', debit: 0, credit: 22500 },
    ],
    created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'je-2', number: 'JE-0002', date: '2026-05-15',
    description: 'Payment received for INV-0001', reference: 'NEFT/26051500001',
    status: 'posted',
    lines: [
      { id: 'jel-5', account_id: 'acc-1020', account_name: 'Bank — HDFC Current A/c', debit: 295000, credit: 0 },
      { id: 'jel-6', account_id: 'acc-1100', account_name: 'Accounts Receivable', debit: 0, credit: 295000 },
    ],
    created_at: '2026-05-15T10:00:00Z',
  },
  {
    id: 'je-3', number: 'JE-0003', date: '2026-05-20',
    description: 'Salary payment for April 2026', reference: 'SAL/APR/2026',
    status: 'posted',
    lines: [
      { id: 'jel-7', account_id: 'acc-5200', account_name: 'Salaries & Wages', debit: 380000, credit: 0 },
      { id: 'jel-8', account_id: 'acc-1020', account_name: 'Bank — HDFC Current A/c', debit: 0, credit: 380000 },
    ],
    created_at: '2026-05-20T10:00:00Z',
  },
]

export const MOCK_FIXED_ASSETS: FixedAsset[] = [
  {
    id: 'fa-1', name: 'CNC Machining Centre — Model X500',
    category: 'Machinery', purchase_date: '2023-04-01', purchase_cost: 4500000,
    vendor_id: 'v-3', vendor_name: 'Arrow Electronics India',
    depreciation_method: 'slm', useful_life_years: 10, salvage_value: 450000,
    accumulated_depreciation: 810000, net_book_value: 3690000,
    gl_account: '1500', status: 'active', created_at: '2023-04-01T10:00:00Z',
  },
  {
    id: 'fa-2', name: 'Dell PowerEdge R740 Server',
    category: 'Computers & IT', purchase_date: '2024-01-15', purchase_cost: 480000,
    vendor_id: 'v-1', vendor_name: 'Intel India Pvt Ltd',
    depreciation_method: 'wdv', useful_life_years: 5, salvage_value: 48000,
    accumulated_depreciation: 96000, net_book_value: 384000,
    gl_account: '1510', status: 'active', created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'fa-3', name: 'Office Furniture — Conference Room',
    category: 'Furniture & Fixtures', purchase_date: '2022-07-01', purchase_cost: 285000,
    depreciation_method: 'slm', useful_life_years: 8, salvage_value: 28500,
    accumulated_depreciation: 113156, net_book_value: 171844,
    gl_account: '1500', status: 'active', created_at: '2022-07-01T10:00:00Z',
  },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1', type: 'overdue', title: 'Invoice Overdue',
    message: 'INV-0003 from Infosys Limited is 12 days overdue (₹5,31,000)',
    is_read: false, created_at: '2026-05-27T08:00:00Z', link: '/sales/invoices/inv-3',
  },
  {
    id: 'notif-2', type: 'low_stock', title: 'Low Stock Alert',
    message: 'Vibranium Composite Plate (Mumbai Main) is below reorder point',
    is_read: false, created_at: '2026-05-26T14:00:00Z', link: '/inventory',
  },
  {
    id: 'notif-3', type: 'low_stock', title: 'Low Stock Alert',
    message: 'Quantum Tunneling Chip (Mumbai Main) is below reorder point',
    is_read: false, created_at: '2026-05-26T14:00:00Z', link: '/inventory',
  },
  {
    id: 'notif-4', type: 'payment', title: 'Payment Received',
    message: 'Payment of ₹2,95,000 received for INV-0001',
    is_read: true, created_at: '2026-05-15T11:00:00Z', link: '/sales/invoices/inv-1',
  },
  {
    id: 'notif-5', type: 'info', title: 'Purchase Order Sent',
    message: 'PO-0003 sent to Arrow Electronics India',
    is_read: true, created_at: '2026-05-18T10:00:00Z', link: '/purchasing/orders/po-3',
  },
]

export const MOCK_WORKSPACE_SETTINGS: WorkspaceSettings = {
  company_name: 'Stark Industries Pvt Ltd',
  gstin: '27AABCS1429B1ZB',
  pan: 'AABCS1429B',
  state_code: '27',
  fiscal_year_start: '04-01',
  e_invoicing: false,
  address: {
    line1: 'Stark Tower, Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    state_code: '27',
    pincode: '400021',
  },
}
