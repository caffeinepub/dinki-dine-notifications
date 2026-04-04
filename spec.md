# Dinki Pos

## Current State
- Version 30 is live with Drive-In, Dine-In, Takeaway support
- Live Orders page filters out fulfilled/cancelled orders via `liveOrders` state
- `handleUpdateStatus` does optimistic removal of fulfilled orders from `liveOrders`
- New Order modal has 3 tabs: Dine In, Take Away, Drive In — all equal flex-1 width
- CustomerOrder component handles `?mode=customer` (table) and `?mode=drivein` (car) URL modes
- No unified customer self-ordering page exists
- No Drive-In menu-only display page exists
- App URL: `https://dinki-dine-drive-in-pos-v3v.caffeine.xyz`

## Requested Changes (Diff)

### Add
1. **Drive-In Menu-Only Display Page** (`?mode=menuonly`)
   - Shows available menu items grouped by category with time-based schedule
   - Read-only display — no ordering, no cart, no form
   - Shows Dinki Pos branding with Car icon
   - QR code and link for this page displayed in Settings/QR section so staff can print it
   - Accessible via Settings drawer: "Drive-In QR" section

2. **Unified Customer Self-Ordering Page** (`?mode=order`)
   - Single page with three sections/tabs: Drive-In, Takeaway, Online Delivery
   - Each section has its own format:
     - **Drive-In**: Car plate + make + color form → menu → place order (model=DRIVE-IN)
     - **Takeaway**: Name + phone form → menu → place order (TAKEAWAY prefix)
     - **Online Delivery**: Name + phone + address form → menu → place order (DELIVERY prefix)
   - QR code + shareable link for this page shown in Settings/QR section
   - Each order type is clearly visually separated
   - All sections show available menu items (time-scheduled) from backend

3. **QR Codes Section in Settings**
   - Add a "QR Codes & Links" section in the Settings panel or as a drawer menu item
   - Shows 3 QR codes with labels and copy link buttons:
     - Dine-In customer ordering: `?mode=customer`
     - Drive-In self-ordering: `?mode=drivein`
     - Drive-In menu only: `?mode=menuonly`
     - Unified self-ordering: `?mode=order`
   - QR codes generated using a simple SVG/canvas QR library or inline generation

### Modify
1. **Live Orders page filter**: Ensure `filteredOrders` absolutely never includes fulfilled or cancelled orders. Add explicit double-filter at render time as safety net.
2. **New Order modal Drive-In tab**: Force tab container to use `display: flex` with `min-width: 0` and ensure each button has `width: 33.33%` not just `flex-1`. Add `overflow: hidden` protection.
3. **App.tsx mode routing**: Add `?mode=menuonly` and `?mode=order` routes.

### Remove
- Nothing removed

## Implementation Plan
1. Create `CustomerOrderUnified.tsx` — new unified self-ordering page with Drive-In / Takeaway / Online Delivery tabs, each with their own form + menu + checkout flow
2. Create `DriveInMenuDisplay.tsx` — read-only menu display for Drive-In QR code page
3. Update `App.tsx`:
   - Add mode checks for `menuonly` → `<DriveInMenuDisplay />` and `order` → `<CustomerOrderUnified />`
   - Add double-filter safety net to `filteredOrders` to guarantee no fulfilled/cancelled
4. Update `NewOrderModal.tsx`:
   - Replace `flex-1` with explicit `w-1/3` and `min-w-0` on tab buttons
   - Add `style={{minWidth: 0, width: '33.333%'}}` inline to guarantee equal sizing
5. Create/Update `QRCodesPanel.tsx` or add QR section to `SettingsPanel.tsx`:
   - Show QR codes for all customer-facing URLs using a QR code generator
   - Add to SideDrawer navigation
