# Dinki Pos

## Current State
- CustomerOrder (?mode=customer, ?mode=drivein): Two-step flow — first screen is table/car form, second screen is the menu. Customers must submit the form before seeing any menu items.
- CustomerOrderUnified (?mode=order): Same two-step flow — form first, then 'View Menu' reveals the menu on a separate screen.
- MenuAdmin: PIN-protected menu editing is fully functional for staff/admin. No restriction exists in customer-facing modes.
- Notification/ringtone: useSound hook plays a beep on the staff dashboard only when unacknowledgedCount > 0. Customer ordering pages do NOT trigger any ringtone on staff devices.

## Requested Changes (Diff)

### Add
- Customer landing page: show the ordering form AND the menu side-by-side (or stacked on mobile) on the very first screen. Customers fill in their details at the top and can immediately browse the menu below without a separate 'View Menu' step.
- Notification ringtone on order-receiving devices: when a customer places an order, the staff dashboard's polling (every 3 seconds) will detect the new order. The existing useSound ringtone already fires when unacknowledgedCount > 0. Ensure notifications are created and unacknowledged on every new customer order so the ringtone triggers reliably on all logged-in staff devices.

### Modify
- CustomerOrder (?mode=customer and ?mode=drivein): Change from 2-step (form → menu) to single-page layout. Form fields appear at top, menu appears below in the same scroll. Place Order button remains at bottom as floating cart bar. Validation still requires table/car number before placing order (show inline error if they try to place without filling in details).
- CustomerOrderUnified (?mode=order): Same change — form fields at top of each tab, menu scrollable below. Remove separate 'form' screen state. The 'View Menu' button becomes redundant and is removed. Cart/Place Order still validates the form fields on submit.
- MenuAdmin: Remove any menu editing access from customer-facing pages. MenuAdmin is already only shown in the staff dashboard (AdminPinGate), so no change needed there — just confirm customer modes never expose it.

### Remove
- 'View Menu' / 'Start Ordering' step-change buttons from customer flows (menu is shown immediately on landing)
- The separate 'form' screen state in CustomerOrderUnified

## Implementation Plan
1. Refactor CustomerOrder component: remove screen state 'car'/'menu' split; load menu on mount; render form fields in a card at top, then menu items below; floating cart validates form on Place Order instead of on navigation.
2. Refactor CustomerOrderUnified component: remove screen='form' state; load menu on mount; render tab-specific form fields pinned to top, then scrollable menu below; floating cart validates on Place Order.
3. Confirm MenuAdmin is never accessible from customer mode pages (it is behind AdminPinGate — no change needed, just verify).
4. Sound/ringtone: the existing useSound already triggers on unacknowledgedCount > 0. Ensure backend placeOrder creates a notification entry that gets picked up by the staff dashboard polling. This is already in place per the backend design. No additional code change needed unless testing reveals the notification is not being created on customer self-orders.
