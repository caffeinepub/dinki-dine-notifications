# Dinki Pos – Customer Self-Ordering

## Current State
App has a staff-facing POS interface with tab-style ordering, menu admin, KOT printing, and invoice generation. The backend has `placeOrder`, `getMenuItems` APIs. No customer-facing view exists yet.

## Requested Changes (Diff)

### Add
- Customer ordering page accessible via URL param `?mode=customer` (no separate route needed)
- Customer page flow:
  1. Enter car/vehicle number (license plate text field)
  2. Browse time-based menu (same scheduling: Breakfast 7-12, NI/Chinese 11:30-22:30, Roti 11:30-15:30 & 19-22:30)
  3. Add items to cart with quantity controls
  4. See running total
  5. Submit order — calls `placeOrder` backend API
  6. Order confirmation screen shown to customer
- Staff side: customer-placed orders appear in Live Orders just like staff orders, with a notification alert labeled "Customer Order"
- Customer page is mobile-first, clean and simple (no admin/staff controls visible)

### Modify
- App.tsx: detect `?mode=customer` in URL and render CustomerOrder page instead of staff dashboard
- Notification message for customer orders: "New customer order – Car: [plate]"

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/CustomerOrder.tsx` — full customer ordering page
   - Car number entry screen → menu browsing screen → cart review → confirmation
   - Uses same menu scheduling logic as staff view
   - Calls `getMenuItems` and `placeOrder` from backend
2. Modify `App.tsx` to check `window.location.search` for `?mode=customer` and render `<CustomerOrder />` instead of main staff UI
3. The VehicleInfo fields (make, model, color) not relevant for customer — use licensePlate as car number, fill others with placeholder "N/A"
