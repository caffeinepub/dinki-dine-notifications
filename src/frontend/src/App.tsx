import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Bell,
  Car,
  CheckCheck,
  Clock,
  Plus,
  Settings,
  ShoppingBag,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Notification, Order, OrderInput, OrderItem } from "./backend";
import { OrderStatus } from "./backend";
import { CustomerOrder } from "./components/CustomerOrder";
import { KpiCard } from "./components/KpiCard";
import { MenuAdmin } from "./components/MenuAdmin";
import { NewOrderModal } from "./components/NewOrderModal";
import { NotificationItem } from "./components/NotificationItem";
import { OrderCard } from "./components/OrderCard";
import { useActor } from "./hooks/useActor";
import { useMenu } from "./hooks/useMenu";
import { loadMutePref, saveMutePref, useSound } from "./hooks/useSound";

const isCustomerMode =
  new URLSearchParams(window.location.search).get("mode") === "customer";

export default function App() {
  // Customer self-ordering mode
  if (isCustomerMode) {
    return <CustomerOrder />;
  }

  return <StaffDashboard />;
}

function StaffDashboard() {
  const { actor } = useActor();
  const { menuItems, reloadMenu } = useMenu();

  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(loadMutePref);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showMenuAdmin, setShowMenuAdmin] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "preparing" | "ready" | "fulfilled"
  >("all");

  const seenNotifIds = useRef<Set<string>>(new Set());
  const notificationsRef = useRef<Notification[]>([]);
  const unacknowledgedCount = notifications.filter(
    (n) => !n.acknowledged,
  ).length;

  // Apply dark class to html
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Sound system
  useSound(unacknowledgedCount, isMuted);

  const fetchData = useCallback(async () => {
    if (!actor) return;
    try {
      const [fetchedOrders, fetchedNotifs] = await Promise.all([
        actor.getAllOrders(),
        actor.getNotifications(),
      ]);
      setOrders(
        fetchedOrders.slice().sort((a, b) => Number(b.timestamp - a.timestamp)),
      );

      // Detect new notifications
      const newNotifs = fetchedNotifs.filter(
        (n) => !n.acknowledged && !seenNotifIds.current.has(n.id.toString()),
      );
      if (newNotifs.length > 0 && seenNotifIds.current.size > 0) {
        for (const n of newNotifs) {
          toast(n.message, {
            description: `Order #${Number(n.orderId).toString().padStart(4, "0")}`,
            duration: 5000,
          });
        }
      }
      for (const n of fetchedNotifs.filter((n) => !n.acknowledged)) {
        seenNotifIds.current.add(n.id.toString());
      }

      const sorted = fetchedNotifs
        .slice()
        .sort((a, b) => Number(b.timestamp - a.timestamp));
      const sliced = sorted.slice(0, 20);
      setNotifications(sliced);
      notificationsRef.current = sliced;
    } catch (_e) {
      // silently fail polls
    }
  }, [actor]);

  useEffect(() => {
    if (!actor) return;
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [actor, fetchData]);

  const handleUpdateStatus = async (orderId: bigint, status: OrderStatus) => {
    if (!actor) return;
    try {
      await actor.updateOrderStatus(orderId, status);
      // Auto-acknowledge all notifications for this order so ringtone stops
      const relatedNotifs = notificationsRef.current.filter(
        (n) => !n.acknowledged && n.orderId === orderId,
      );
      await Promise.all(
        relatedNotifs.map((n) => actor.acknowledgeNotification(n.id)),
      );
      await fetchData();
      toast.success(
        `Order #${Number(orderId).toString().padStart(4, "0")} updated to ${status}`,
      );
    } catch (_e) {
      toast.error("Failed to update order status");
    }
  };

  const handleAcknowledge = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.acknowledgeNotification(id);
      await fetchData();
    } catch (_e) {
      toast.error("Failed to acknowledge notification");
    }
  };

  const handleAcknowledgeAll = async () => {
    if (!actor) return;
    try {
      await actor.acknowledgeAllNotifications();
      await fetchData();
      toast.success("All notifications acknowledged");
    } catch (_e) {
      toast.error("Failed to acknowledge notifications");
    }
  };

  const handlePlaceOrder = async (order: OrderInput) => {
    if (!actor) throw new Error("Actor not ready");
    await actor.placeOrder(order);
    await fetchData();
    toast.success("Order placed successfully!");
  };

  const handleAddItems = async (
    orderId: bigint,
    newItems: OrderItem[],
    packingCharge: bigint,
    deliveryCharge: bigint,
  ) => {
    if (!actor) throw new Error("Actor not ready");
    await actor.addItemsToOrder(
      orderId,
      newItems,
      packingCharge,
      deliveryCharge,
    );
    await fetchData();
    toast.success(
      `Items added to Order #${Number(orderId).toString().padStart(4, "0")}`,
    );
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      saveMutePref(next);
      return next;
    });
  };

  const filteredOrders = orders.filter(
    (o) => filter === "all" || o.status === filter,
  );

  // KPI calculations
  const pendingCount = orders.filter(
    (o) => o.status === OrderStatus.pending,
  ).length;
  const activeCount = orders.filter(
    (o) => o.status === OrderStatus.preparing || o.status === OrderStatus.ready,
  ).length;
  const totalOrders = orders.length;
  const totalItems = orders.reduce(
    (s, o) => s + o.items.reduce((si, i) => si + Number(i.quantity), 0),
    0,
  );

  const FILTER_PILLS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "fulfilled", label: "Fulfilled" },
  ] as const;

  // Shared orders section content
  const ordersSection = (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-din-text">Live Orders</h2>
        <div className="flex items-center gap-1 flex-wrap">
          {FILTER_PILLS.map((pill) => (
            <button
              type="button"
              key={pill.key}
              data-ocid="orders.tab"
              onClick={() => setFilter(pill.key)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors border ${
                filter === pill.key
                  ? "bg-din-teal/20 border-din-teal/50 text-din-teal"
                  : "border-din-border text-din-muted hover:text-din-text hover:border-din-muted"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1 pr-2">
        {filteredOrders.length === 0 ? (
          <div
            data-ocid="orders.empty_state"
            className="flex flex-col items-center justify-center h-48 text-din-muted"
          >
            <ShoppingBag className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No orders yet</p>
            <p className="text-xs opacity-60">New orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredOrders.map((order, i) => (
              <OrderCard
                key={order.id.toString()}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onAddItems={handleAddItems}
                index={i + 1}
                menuItems={menuItems}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );

  // Shared notifications section content
  const notificationsSection = (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-din-text">Order Notifications</h2>
        {unacknowledgedCount > 0 && (
          <Button
            data-ocid="notifications.primary_button"
            size="sm"
            variant="outline"
            onClick={handleAcknowledgeAll}
            className="h-7 text-xs px-2 border-din-border text-din-muted hover:bg-din-surface-alt flex items-center gap-1"
          >
            <CheckCheck className="w-3 h-3" />
            Ack All
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div
            data-ocid="notifications.empty_state"
            className="flex flex-col items-center justify-center h-48 text-din-muted"
          >
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs opacity-60">Alerts appear here</p>
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {notifications.map((notif, i) => (
              <NotificationItem
                key={notif.id.toString()}
                notification={notif}
                onAcknowledge={handleAcknowledge}
                index={i + 1}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );

  // If menu admin is open, render it full-screen
  if (showMenuAdmin) {
    return (
      <>
        <Toaster position="top-right" theme="dark" />
        <MenuAdmin
          menuItems={menuItems}
          onBack={() => setShowMenuAdmin(false)}
          onReload={reloadMenu}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" theme="dark" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-din-surface border-b border-din-border shadow-card">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 mr-4">
            <div className="w-8 h-8 rounded-full bg-din-teal/20 border border-din-teal/40 flex items-center justify-center">
              <Car className="w-4 h-4 text-din-teal" />
            </div>
            <div>
              <span className="font-bold text-din-text text-sm leading-none block">
                Dinki Dine
              </span>
              <span className="text-[10px] text-din-muted leading-none">
                Drive-in &amp; Dine-in
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {["Dashboard", "Active Orders", "Kitchen", "Reports"].map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  data-ocid="nav.link"
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    item === "Dashboard"
                      ? "text-din-teal border-b-2 border-din-teal"
                      : "text-din-muted hover:text-din-text"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
            {/* Menu admin button */}
            <button
              type="button"
              data-ocid="nav.link"
              onClick={() => setShowMenuAdmin(true)}
              className="px-3 py-1.5 text-xs font-medium rounded transition-colors text-din-muted hover:text-din-text flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              Menu
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Live pill */}
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-din-green/10 border border-din-green/30">
              <span className="w-1.5 h-1.5 rounded-full bg-din-green animate-pulse2" />
              <span className="text-[10px] font-semibold text-din-green">
                Live
              </span>
            </span>

            {/* Mute toggle */}
            <button
              type="button"
              data-ocid="settings.toggle"
              onClick={toggleMute}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                isMuted
                  ? "bg-din-red/10 border-din-red/30 text-din-red"
                  : "bg-din-teal/10 border-din-teal/30 text-din-teal"
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              {isMuted ? "Muted" : "Sound On"}
            </button>

            {/* Bell */}
            <button
              type="button"
              data-ocid="notifications.button"
              className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-din-surface-alt transition-colors"
            >
              <Bell className="w-4.5 h-4.5 text-din-muted" />
              {unacknowledgedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-din-red text-white text-[9px] font-bold flex items-center justify-center animate-pulse2">
                  {unacknowledgedCount > 9 ? "9+" : unacknowledgedCount}
                </span>
              )}
            </button>

            {/* Mobile menu admin shortcut */}
            <button
              type="button"
              data-ocid="nav.link"
              onClick={() => setShowMenuAdmin(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-din-surface-alt transition-colors"
              title="Menu Admin"
            >
              <Settings className="w-4 h-4 text-din-muted" />
            </button>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-din-teal/20 border border-din-teal/40 flex items-center justify-center">
                <span className="text-[10px] font-bold text-din-teal">S</span>
              </div>
              <span className="text-xs font-medium text-din-text hidden sm:block">
                Staff
              </span>
            </div>

            {/* New Order */}
            <Button
              data-ocid="orders.open_modal_button"
              size="sm"
              onClick={() => setShowNewOrderModal(true)}
              className="h-8 text-xs px-3 bg-din-orange hover:bg-din-orange/80 text-white font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Order
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-4">
        {/* Mobile: tabs layout */}
        <div className="md:hidden">
          <Tabs defaultValue="orders">
            <TabsList className="w-full mb-3 bg-din-surface-alt border border-din-border">
              <TabsTrigger
                value="orders"
                data-ocid="orders.tab"
                className="flex-1 text-xs data-[state=active]:bg-din-teal/20 data-[state=active]:text-din-teal"
              >
                Live Orders{pendingCount > 0 ? ` (${pendingCount})` : ""}
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                data-ocid="notifications.tab"
                className="flex-1 text-xs data-[state=active]:bg-din-teal/20 data-[state=active]:text-din-teal"
              >
                Notifications
                {unacknowledgedCount > 0 ? ` (${unacknowledgedCount})` : ""}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="flex flex-col">
              {ordersSection}
            </TabsContent>
            <TabsContent value="notifications" className="flex flex-col">
              {notificationsSection}
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: side-by-side panels */}
        <div className="hidden md:flex gap-4 h-[calc(100vh-13rem)]">
          {/* Live Orders (70%) */}
          <section className="flex-[7] flex flex-col min-w-0">
            {ordersSection}
          </section>

          {/* Notifications Panel (30%) */}
          <aside className="flex-[3] flex flex-col min-w-0">
            {notificationsSection}
          </aside>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <KpiCard
            label="Pending Orders"
            value={pendingCount}
            accent="orange"
            icon={<Clock className="w-4 h-4" />}
          />
          <KpiCard
            label="Active Drive-ins"
            value={activeCount}
            accent="teal"
            icon={<Activity className="w-4 h-4" />}
          />
          <KpiCard
            label="Total Orders"
            value={totalOrders}
            accent="green"
            icon={<Car className="w-4 h-4" />}
          />
          <KpiCard
            label="Total Items"
            value={totalItems}
            accent="red"
            icon={<ShoppingBag className="w-4 h-4" />}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-din-border py-3 px-4 text-center">
        <p className="text-[11px] text-din-muted">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-din-teal hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* New Order Modal */}
      <NewOrderModal
        open={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onSubmit={handlePlaceOrder}
        onAddToTab={handleAddItems}
        existingOrders={orders}
        backendMenuItems={menuItems}
      />
    </div>
  );
}
