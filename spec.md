# Dinki Pos — Version 37 Bug Fix Spec

## Current State
Dinki Pos is a full-stack restaurant POS with Motoko backend (ICP canister) and React frontend. Menu items are stored in the backend canister. Customer self-ordering is supported via QR codes. Version 36 is deployed.

## Requested Changes (Diff)

### Add
- Customer form (table picker / car details) must always be visible at top of customer ordering pages on first load — do not require scrolling or a separate step
- Menu editing (MenuAdmin) must be accessible from customer-facing pages only for admin (PIN-protected), not visible to regular customers
- Out-of-stock toggle must block items from showing in customer ordering pages

### Modify
1. **Backend: `menuSeeded` must be `stable`** — currently `var menuSeeded = false` resets on every canister upgrade, causing `initMenu()` to re-seed default menu and wipe all custom edits. Fix: declare as `stable var menuSeeded = false`.
2. **Backend: `nextMenuItemId` must be `stable`** — same issue, must persist across upgrades.
3. **Backend: `clearAllData` must NOT reset menu** — currently `clearAllData()` calls `resetMenuToDefaults()`, wiping all custom menu items when staff clears order data. Remove `resetMenuToDefaults()` from `clearAllData()`.
4. **CustomerOrder.tsx**: Customer form (table picker for dine-in / car details for drive-in) and menu should both be visible on the initial load screen without scrolling — form stays at top, menu below it on the same page. Already partially done in v35 but form may be hidden on some screen sizes.
5. **CustomerOrderUnified.tsx**: Same fix — form visible at top, menu below, no extra step.
6. **DriveInMenuDisplay.tsx** (`?mode=menuonly`): This is the "Menu Only" / view-only QR code page. It must NOT show any "Place Order" button or cart. Currently it already shows menu without ordering. Verify it is truly read-only (no order flow, no cart). It must remain strictly view-only.
7. **App.tsx — Mobile KPI row**: KPI cards (Pending Orders, Active Tables, Total Orders, Total Items) are placed after the main content but are hidden on mobile because the bottom padding (`pb-24`) is insufficient and the FAB button covers them. Fix: move KPI row ABOVE the tabs/orders section on mobile, or add sufficient bottom padding so they are always visible above the FAB.
8. **All customer-facing pages**: Must load menu from backend (same source as Menu Admin), not use any hardcoded or separate fallback menu format. `initMenu()` must not re-seed if menu items already exist.

### Remove
- Nothing to remove

## Implementation Plan

1. **main.mo**: Add `stable` keyword to `menuSeeded` and `nextMenuItemId`. Remove `resetMenuToDefaults()` call from `clearAllData()`.
2. **useMenu.ts**: Remove the `initMenu()` call on mount (it's now safe because backend protects via `menuSeeded`, but since `menuSeeded` is stable we don't need a client-side init call anymore). Or keep it — it's safe since `seedMenu()` checks `menuSeeded` first.
3. **App.tsx**: Move KPI grid row to BEFORE the tabs/orders section on mobile layout, and ensure `pb-24` on main gives enough room for FAB + KPI cards.
4. **CustomerOrder.tsx**: Ensure the ordering form section is always visible at top (not collapsed or hidden) and the menu flows below it. No layout changes needed if already correct — just verify scroll/overflow.
5. **CustomerOrderUnified.tsx**: Same — form always visible at top with menu below.
6. **DriveInMenuDisplay.tsx**: Verify no cart/order buttons; it's already view-only.
