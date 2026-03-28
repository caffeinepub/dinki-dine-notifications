# Dinki Dine Veg Drive-In POS - Notifications System

## Current State
Empty backend (actor {}). No frontend App.tsx. Fresh project.

## Requested Changes (Diff)

### Add
- Full POS staff dashboard for Dinki Dine Veg Drive-In
- Order management: place orders (vehicle info, items, mobile number), view active orders
- Real-time notifications system: new order triggers notification with all order details
- Audible ringtone/alert that loops until staff acknowledges the order
- Notification panel showing pending (unacknowledged) and recent (acknowledged) notifications
- Staff can acknowledge/accept orders from the notification panel or order cards
- Settings: mute/unmute ringtone toggle
- Simulated "customer order" button for testing (since this is a POS demo)
- KPI metrics strip: pending orders, active drive-ins count

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Backend: orders CRUD with acknowledge, notifications list, mute settings per session
2. Frontend:
   - App shell with dark dashboard theme (charcoal/teal/orange palette)
   - Top nav bar with notification bell badge
   - Main 2-column layout: live orders list (left) + notifications panel (right)
   - Order cards with vehicle info, items, mobile, status, accept/fulfill button
   - Notification cards with teal left accent bar, looping alert sound on unacknowledged
   - Sound engine: Web Audio API oscillator as ringtone fallback (no external audio files needed)
   - Mute toggle in header/settings
   - Customer order placement form (simulate incoming orders)
   - KPI metrics row
   - Polling every 3s for new orders/notifications
