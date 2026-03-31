# Dinki Pos – Drive-In Feature

## Current State

The app supports two ordering modes:
- **Dine-In**: Staff or customer selects a table from the floor grid; order identified by table code (e.g., "FF 12")
- **Takeaway**: Customer name + phone entered; `vehicleInfo.licensePlate` stored as "TAKEAWAY-{name}"

Customer self-ordering is available at `?mode=customer` showing a table picker then menu.

There is no Drive-In mode. The `vehicleInfo` struct (licensePlate, make, model, color) is underutilized — make/model/color are always "N/A".

## Requested Changes (Diff)

### Add
- Drive-In order type across the entire app
- Drive-In detection convention: `vehicleInfo.model === "DRIVE-IN"` flags an order as drive-in; `licensePlate` holds the actual car plate; `make` = car make; `color` = car color
- Drive-In self-ordering page at `?mode=drivein`: shows a large car 🚗 icon; clicking it opens a car details form (plate required, make/color optional), then shows the time-based menu for ordering
- Drive-In tab in NewOrderModal (staff) alongside Dine In and Take Away
- "Drive In Order" option in SideDrawer nav
- OrderCard: detect drive-in, show "Car" label instead of "Table", show make/color if available; KOT header updated
- IssueBillModal: show "Car:" instead of "Table:" for drive-in orders
- App.tsx: detect `?mode=drivein` URL param and render drive-in self-ordering screen

### Modify
- `CustomerOrder.tsx`: Refactor to support both `mode=customer` (table-based) and `mode=drivein` (car-based) modes. In drivein mode: landing screen shows a big car icon, tap opens car details form, fill details → browse menu → confirm order.
- `NewOrderModal.tsx`: Add third tab "Drive In"; drive-in shows car number input + optional make/color fields; no table picker.
- `SideDrawer.tsx`: Add Drive-In Order menu item.
- `App.tsx`: Add `mode=drivein` URL detection alongside existing `mode=customer`.
- `OrderCard.tsx`: Display drive-in badge, show car details in header; update KOT print to show car info.
- `IssueBillModal.tsx`: Show "Car:" line instead of "Table:" for drive-in orders.

### Remove
- Nothing removed; drive-in is purely additive.

## Implementation Plan

1. **CustomerOrder.tsx**: Accept a `mode` prop or detect URL param internally. In `drivein` mode: initial screen is a car-icon landing page; clicking the icon shows car details form (plate required, make/color optional); then flows to menu and confirm. In `customer` mode (existing): unchanged table picker flow.
2. **App.tsx**: Add `isDriveIn` check for `?mode=drivein`; render `<CustomerOrder mode="drivein" />` (or pass prop). Add `openNewOrder` support for type `"driveIn"`.
3. **NewOrderModal.tsx**: Add `"driveIn"` to order type state; add a third tab; show car details inputs; on submit set `vehicleInfo.model = "DRIVE-IN"` with actual plate/make/color.
4. **SideDrawer.tsx**: Add Drive-In Order nav item that calls `onOpenNewOrder("driveIn")`.
5. **OrderCard.tsx**: Helper `isDriveIn(order)` checks `order.vehicleInfo.model === "DRIVE-IN"`; update header label, KOT format.
6. **IssueBillModal.tsx**: Use same helper to show "Car:" for drive-in.
