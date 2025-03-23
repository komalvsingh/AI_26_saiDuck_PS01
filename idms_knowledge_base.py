class IDMSKnowledgeBase:
    def __init__(self):
        # Initialize the IDMS ERP knowledge base
        self.idms_knowledge = """
# IDMS ERP System Knowledge Base

## 1. Overview of IDMS ERP System
The IDMS ERP System is a comprehensive enterprise resource planning solution designed specifically for manufacturing industries. It helps businesses streamline Sales, Purchase, Inventory, Production, Quality Control, Dispatch, Finance, and Accounts while ensuring full compliance with GST regulations.

## ERP Structure: Modules Overview
IDMS ERP consists of the following major modules:
- Sales & NPD: Manages quotations, sales orders, invoices, and dispatches.
- Planning: Aligns demand forecasting, material planning, and production schedules.
- Purchase: Handles procurement, supplier management, and purchase orders.
- Stores: Maintains stock levels, material movements, and inventory tracking.
- Production: Controls manufacturing processes, job work, and raw material consumption.
- Maintenance: Manages machine upkeep and preventive maintenance schedules.
- Quality: Ensures compliance through inspections and material validation.
- Dispatch & Logistics: Organizes shipments, transport partners, and delivery tracking.
- HR & Admin: Manages workforce, payroll, and employee records.
- Accounts & Finance: Tracks financial transactions, payments, GST compliance, and reporting.
- Settings: Provides system configuration, user access management, and role-based permissions.

## 2. Structure of Each Module: Masters, Transactions, and Reports
Each module in IDMS follows a three-tier data structure to ensure data integrity, efficiency, and traceability:

### A. Masters
- Masters store static or reference data that drive transactions.
- Examples:
  - Sales Master: Customer Master, SKU Master, Payment Terms
  - Purchase Master: Supplier Master, HSN Mapping
  - Inventory Master: Warehouse Locations, Stock Categories
  - Finance Master: Ledger Accounts, GST Configurations

### B. Transactions
- Transactions are dynamic operations performed in the ERP.
- Examples:
  - Sales Transactions: Sales Order, Dispatch Request, Invoice
  - Purchase Transactions: PO, Goods Receipt Note (GRN)
  - Inventory Transactions: Stock Issue, Stock Transfer
  - Finance Transactions: Payment Processing, Journal Entries

### C. Reports
- Reports provide real-time insights and data analysis.
- Examples:
  - Sales Reports: Order Confirmation Report, Sales Register
  - Purchase Reports: Outstanding PO Report, Purchase Register
  - Inventory Reports: Stock Aging, Reorder Levels
  - Finance Reports: GST Return Filing, Ledger Balance Reports

## 3. GST Integration in IDMS ERP
### A. GST Compliance in IDMS
The ERP ensures full GST compliance by:
1. Automating GST calculations in transactions.
2. Validating GSTIN of customers & suppliers.
3. Generating GST-compliant invoices and e-invoices.
4. Tracking GST filing deadlines and reports (GSTR-1, GSTR-3B, etc.).
5. E-Way Bill integration for transport tracking.

### B. Key GST Concepts in ERP
- HSN Code: Classification for goods taxation.
- SAC Code: Classification for service taxation.
- Tax Invoice: Official billing document with GST details.
- E-Invoice: Digital GST invoice validated by the Government.
- E-Way Bill: Document for goods transportation.
- Credit/Debit Notes: Adjustments to GST invoices.
- Reverse Charge Mechanism (RCM): GST liability shifts from supplier to recipient.

## 4. GST-Related FAQs
- GST Types: CGST, SGST, IGST, UTGST
- E-Invoicing Process
- E-Way Bill Requirements
- GST Returns: GSTR-1, GSTR-3B
- Input Tax Credit Management
- GST for Inter-State vs. Intra-State Transactions
- HSN/SAC Codes Compliance
- GST Compliance for Exempt and Zero-Rated Supplies
"""

        # Information about specific modules
        self.module_details = {
            "Sales_Module": {
                "What_It_Does": "Manages customer orders, invoices, shipments, and payments.",
                "Master_Data": {
                    "B2B_Customers": "Customer details, credit limits",
                    "SKU_Master": "Product details, pricing, HSN codes",
                    "Payment_Terms": "Payment conditions for customers",
                    "Logistics": "Shipping modes and partners"
                },
                "Transactions": [
                    "Quotation", "Sales Order (SO)", "Dispatch Request (DRN)", "Advanced Shipment Notice (ASN)",
                    "Proforma Invoice", "Service Invoice", "E-Way Bill",
                    "Sales Credit/Debit Notes", "Cancellation of SO/DRN"
                ],
                "Reports": [
                    "Sales Register", "Order Confirmation", "Inventory Reports"
                ],
                "Dependency": [
                    "Requires stock from Stores", "Needs approval from Finance for credit sales", "Dispatch is linked to Logistics"
                ]
            },
            "Purchase_Module": {
                "What_It_Does": "Procures raw materials and services required for production.",
                "Master_Data": {
                    "Supplier_Master": "Vendor details, credit terms",
                    "Item_Master": "Material descriptions, unit of measure",
                    "Payment_Terms": "Agreements with suppliers",
                    "GST/P": "HSN/SAC codes for taxation"
                },
                "Transactions": [
                    "Purchase Orders (PO)", "Supplementary PO (SPO)", "Amendments", "Cancellations",
                    "Purchase Debit Notes", "Job Work Orders (for outsourced production)"
                ],
                "Reports": [
                    "PO Status", "Outstanding POs", "Inventory Levels"
                ],
                "Dependency": [
                    "Linked with Stores for material availability", "Requires Finance approval for high-value purchases",
                    "Quality Control checks incoming material"
                ]
            },
            "Stores_Module": {
                "What_It_Does": "Manages inward and outward movement of raw materials, work-in-progress (WIP), and finished goods.",
                "Master_Data": {
                    "Inventory_Zones": "Main Store, Stock Preparation Store"
                },
                "Transactions": [
                    "Goods Receipt Note (GRN)", "Goods Issue Note (GIN)", "Stock Transfer (GTE – Intra-movement of material)"
                ],
                "Reports": [
                    "Stock Aging", "Reorder Level", "Inventory Reports"
                ],
                "Dependency": [
                    "Receives materials from Purchase", "Issues raw materials to Production", "Stores finished goods for Sales Dispatch"
                ]
            }
        }
        
        # GST-related FAQs
        self.gst_faqs = {
            "What is GST?": "GST (Goods and Services Tax) is an indirect tax levied on the supply of goods and services in India. It replaces multiple indirect taxes and ensures a unified taxation system.",
            
            "How does IDMS help in GST compliance?": "IDMS ERP integrates GST into every transaction, ensuring automatic tax calculations, validation of GSTIN, real-time invoice generation, and GST return filing support (GSTR-1, GSTR-3B, etc.).",
            
            "What are the different types of GST in IDMS?": "CGST (Central GST) and SGST (State GST) for intra-state sales, IGST (Integrated GST) for inter-state sales, and UTGST for sales within Union Territories.",
            
            "What is the role of HSN & SAC codes?": "HSN (Harmonized System of Nomenclature) codes classify goods, while SAC (Service Accounting Code) codes classify services for GST purposes. IDMS assigns these codes to each item and service for accurate taxation.",
            
            "How does E-Invoicing work in IDMS?": "E-invoices are generated digitally and validated through the Government's Invoice Registration Portal (IRP), which assigns a unique Invoice Reference Number (IRN) and QR code.",
            
            "When is an E-Way Bill required?": "If goods worth more than ₹50,000 are being transported, an E-Way Bill must be generated via IDMS. It contains transporter details, invoice information, and route details.",
            
            "What is the Reverse Charge Mechanism?": "Under RCM, instead of the supplier, the buyer is liable to pay GST to the government for certain transactions (e.g., purchases from unregistered dealers).",
            
            "How does IDMS generate GST returns?": "IDMS compiles sales and purchase data to generate GSTR-1 (Outward Supplies), GSTR-3B (Monthly Summary Return), and GSTR-2A (Auto-drafted Inward Supplies Report)."
        }

      