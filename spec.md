# Dinki Pos

## Current State

The app is a full-stack restaurant POS supporting Dine-In, Takeaway, and Drive-In modes. Backend uses Motoko with orders, notifications, and menu items stored in Maps. Frontend is React/TypeScript with components for: OrderCard, NewOrderModal, IssueBillModal, MenuAdmin, InvoiceListScreen, OrderListScreen, DayEndReport, SummaryOfDay, UserManagement, SettingsPanel, SideDrawer, TableGridView.

Current Order model: id, vehicleInfo (licensePlate, make, model, color), customerMobile, items (name, price, quantity), timestamp, status (pending/preparing/ready/fulfilled).

Reports: Day-end report (printable), Summary of Day. Order List shows all orders with status filter. Invoice List shows fulfilled orders with print.

No cancellation system, no discount support, no printer configuration, no advanced reporting (daily/weekly/monthly/yearly breakdown, tax reports, category/user/floor/staff-wise sales), no invoice editing for closed orders.

## Requested Changes (Diff)

### Add
1. **Closed Order Edit/Backup**: From Invoice List, allow editing a closed/fulfilled order — modify items, quantities, charges, discount; reprint invoice. Store edit history as backup.
2. **Invoice Editing**: Edit issued invoices — adjust items, add/remove items, change packing/delivery charges, apply discount. Show edit history.
3. **Reports Module** (new ReportsScreen component with sub-tabs):
   - Daily / Weekly / Monthly / Yearly revenue reports with date range selector
   - Tax Report: SGST + CGST breakdown by day/week/month/year
   - Category-wise Sales Report: revenue and quantity per menu category
   - User Sales Report: orders placed per staff user
   - Floor-wise Sales Report: revenue per floor section (DG, DM, SG, SM, FF, FFD)
   - Staff-wise Sales Report: revenue attributed to each staff member
4. **Printer Configuration**: Settings screen section for configuring up to 4 printers — name, connection type (Bluetooth, WiFi, USB, Cloud), IP address/MAC/port, test print button. Stored in localStorage.
5. **Order List Enhancements**:
   - Separate tabs: All Orders / Cancelled Orders / Cancelled Order Summary
   - Reason for cancellation field when cancelling an order
   - Cancelled Order Summary: count, total value, reasons breakdown
6. **Discount on Order Total**: In IssueBillModal and closed order editor — allow entering a flat (₹) or percentage (%) discount on the order total before grand total. Discount applied after tax, before final total. Stored on the order.
7. **Cancel Order**: Button on OrderCard for pending/preparing orders to cancel with a reason. Updates order status to #cancelled in backend.

### Modify
1. **Backend Order model**: Add `discount` field (Nat, represents paisa or percentage point), `discountType` (text: "flat" or "percent"), `cancellationReason` (Text), and update `OrderStatus` to include `#cancelled`.
2. **Backend APIs**: Add `cancelOrder(orderId, reason)`, `updateOrderDiscount(orderId, discount, discountType)`, `updateOrderItems(orderId, items, packingCharge, deliveryCharge)` for editing closed orders.
3. **IssueBillModal**: Add discount input (flat/%) before grand total. Grand total = itemsTotal + tax + packing + delivery - discount.
4. **InvoiceListScreen**: Add Edit button per closed order that opens an invoice editor modal. Add reprint with updated totals.
5. **OrderCard**: Add Cancel button (for pending/preparing) that prompts for cancellation reason.
6. **SideDrawer / AppView**: Add `reports` view. Wire the existing "Reports" nav item to navigate to the new ReportsScreen. Add "Cancelled Orders" nav entry.
7. **App.tsx**: Add routes for `reports` and `cancelledOrders` views. Pass discount data through to order placement and bill issuance.
8. **OrderListScreen**: Add Cancelled tab, show cancellation reason on expanded cancelled orders.
9. **SettingsPanel**: Add Printer Configuration section with CRUD for up to 4 printers.

### Remove
- Nothing removed; printer "coming soon" toast replaced with real configuration.

## Implementation Plan

1. **Backend (Motoko)**:
   - Add `#cancelled` to `OrderStatus`
   - Add `discount: Nat`, `discountType: Text`, `cancellationReason: Text` to `Order` type
   - Add `cancelOrder(orderId: Nat, reason: Text): async ()`
   - Add `updateOrderItems(orderId: Nat, items: [OrderItem], packingCharge: Nat, deliveryCharge: Nat): async ()` for editing closed orders
   - Add `updateOrderDiscount(orderId: Nat, discount: Nat, discountType: Text): async ()`
   - Update `backend.d.ts` with new types and methods

2. **Frontend — New Components**:
   - `ReportsScreen.tsx`: Tabbed report viewer with Daily/Weekly/Monthly/Yearly, Tax, Category, User, Floor, Staff sub-reports. Date range picker. Print support.
   - `PrinterConfigModal.tsx`: CRUD UI for 4 printers with connection type selector (Bluetooth/WiFi/USB/Cloud), IP/port/MAC fields, test print.
   - `CancelOrderModal.tsx`: Simple modal with reason text input and confirm button.
   - `InvoiceEditModal.tsx`: Edit closed order items, quantities, charges, discount. Show edit history. Reprint.

3. **Frontend — Modified Components**:
   - `SideDrawer.tsx`: Wire "Reports" to `reports` view; add "Cancelled Orders" nav item mapping to `cancelledOrders` view.
   - `App.tsx`: Add `reports` and `cancelledOrders` to `AppView` type and routing.
   - `OrderCard.tsx`: Add "Cancel" button for pending/preparing, opens `CancelOrderModal`.
   - `IssueBillModal.tsx`: Add discount field (flat/%), recalculate grand total.
   - `InvoiceListScreen.tsx`: Add Edit button per row, opens `InvoiceEditModal`. Show discount on rows.
   - `OrderListScreen.tsx`: Add Cancelled tab; show reason in expanded row for cancelled orders.
   - `SettingsPanel.tsx`: Add Printer Configuration section.
   - `backend.ts` / `backend.d.ts`: Reflect new backend types and calls.
