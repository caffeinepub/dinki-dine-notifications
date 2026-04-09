import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";

import List "mo:core/List";



actor {
  public type Timestamp = Time.Time;

  public type VehicleInfo = {
    make : Text;
    model : Text;
    color : Text;
    licensePlate : Text;
  };

  public type OrderStatus = {
    #pending;
    #preparing;
    #ready;
    #fulfilled;
    #cancelled;
  };

  public type OrderInput = {
    id : Nat;
    vehicleInfo : VehicleInfo;
    customerMobile : Text;
    items : [OrderItem];
    timestamp : Timestamp;
    status : OrderStatus;
    discount : Nat;
    discountType : Text; // "flat" or "percent"
    address : Text;
    gstNumber : Text;
  };

  public type Order = {
    id : Nat;
    vehicleInfo : VehicleInfo;
    customerMobile : Text;
    items : [OrderItem];
    timestamp : Timestamp;
    status : OrderStatus;
    discount : Nat;
    discountType : Text; // "flat" or "percent"
    cancellationReason : Text;
    address : Text;
    gstNumber : Text;
  };

  public type OrderItem = {
    name : Text;
    quantity : Nat;
    price : Nat;
  };

  public type Notification = {
    id : Nat;
    orderId : Nat;
    message : Text;
    acknowledged : Bool;
    timestamp : Timestamp;
  };

  public type NotificationInput = {
    orderId : Nat;
    message : Text;
  };

  public type MenuItem = {
    id : Nat;
    name : Text;
    category : Text;
    price : Nat;
    printerNumber : Nat;
    available : Bool;
  };

  module Notification {
    public func compare(n1 : Notification, n2 : Notification) : Order.Order {
      Nat.compare(n1.id, n2.id);
    };

    public func compareByTimestamp(n1 : Notification, n2 : Notification) : Order.Order {
      Int.compare(n1.timestamp, n2.timestamp);
    };
  };

  type InvoiceRecord = {
    orderId : Nat;
    invoiceNumber : Nat;
    timestamp : Time.Time;
    items : [OrderItem];
    packingCharge : Nat;
    deliveryCharge : Nat;
    totalAmount : Nat;
    paymentMode : Text;
    discount : Nat;
    discountType : Text;
  };

  public type InvoiceInput = {
    orderId : Nat;
    items : [OrderItem];
    packingCharge : Nat;
    deliveryCharge : Nat;
    totalAmount : Nat;
    paymentMode : Text;
    discount : Nat;
    discountType : Text;
  };

  stable var nextOrderId = 1;
  stable var nextNotificationId = 1;
  stable var nextMenuItemId = 1;
  // menuSeeded kept as stable for upgrade compatibility but no longer controls seeding
  stable var menuSeeded = true;
  // Absorbs the DEFAULT_MENU stable variable from previously deployed canister versions
  stable var DEFAULT_MENU : [(Text, Text, Nat, Nat)] = [];

  let orders = Map.empty<Nat, Order>();
  let notifications = Map.empty<Nat, Notification>();
  let menuItems = Map.empty<Nat, MenuItem>();

  // ── Menu APIs ──────────────────────────────────────────────────

  public query func getMenuItems() : async [MenuItem] {
    menuItems.values().toArray();
  };

  // No-op kept for API compatibility — menu is never auto-seeded with defaults
  public shared func initMenu() : async () {
    menuSeeded := true;
  };

  public shared ({ caller }) func addMenuItem(name : Text, category : Text, price : Nat, printerNumber : Nat) : async Nat {
    let id = nextMenuItemId;
    nextMenuItemId += 1;
    menuItems.add(id, { id; name; category; price; printerNumber; available = true });
    id;
  };

  public shared ({ caller }) func updateMenuItem(id : Nat, name : Text, category : Text, price : Nat, printerNumber : Nat, available : Bool) : async () {
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        menuItems.add(id, { item with name; category; price; printerNumber; available });
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(id : Nat) : async () {
    menuItems.remove(id);
  };

  // Clears menu to empty — no old defaults are re-loaded
  public shared ({ caller }) func resetMenuToDefaults() : async () {
    menuItems.clear();
    nextMenuItemId := 1;
    menuSeeded := true;
  };

  // Bulk-add menu items from CSV import.
  // Each tuple: (name, category, price, printerNumber, available)
  // Returns the number of items successfully added.
  public shared ({ caller }) func bulkAddMenuItems(items : [(Text, Text, Nat, Nat, Bool)]) : async Nat {
    var count = 0;
    items.forEach(func((name, category, price, printerNumber, available)) {
      let id = nextMenuItemId;
      nextMenuItemId += 1;
      menuItems.add(id, { id; name; category; price; printerNumber; available });
      count += 1;
    });
    count;
  };

  // Returns all current menu items as a stable snapshot array — safe backup.
  public query func getMenuBackup() : async [(Nat, Text, Text, Nat, Nat, Bool)] {
    menuItems.values().toArray().map<MenuItem, (Nat, Text, Text, Nat, Nat, Bool)>(
      func(item) { (item.id, item.name, item.category, item.price, item.printerNumber, item.available) }
    );
  };

  // Returns all menu items as CSV text: Name,Category,Price,PrinterNumber,Available
  public query func exportMenuCSV() : async Text {
    let header = "Name,Category,Price,PrinterNumber,Available";
    let rows = menuItems.values().toArray().map(
      func(item) {
        item.name # "," # item.category # "," # item.price.toText() # "," # item.printerNumber.toText() # "," # (if (item.available) "true" else "false")
      }
    );
    let allRows = [header].concat(rows);
    allRows.values().join("\n");
  };

  // ── Orders ──────────────────────────────────────────────────────

  public shared ({ caller }) func placeOrder(order : OrderInput) : async Nat {
    let orderId = nextOrderId;
    nextOrderId += 1;

    let newOrder : Order = {
      id = orderId;
      vehicleInfo = order.vehicleInfo;
      customerMobile = order.customerMobile;
      items = order.items;
      timestamp = order.timestamp;
      status = #pending;
      discount = order.discount;
      discountType = order.discountType;
      cancellationReason = "";
      address = order.address;
      gstNumber = order.gstNumber;
    };

    orders.add(orderId, newOrder);
    createNotification({
      orderId;
      message = "New order placed";
    });

    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat, reason : Text) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status = #cancelled;
          cancellationReason = reason;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  func addOrUpdateItems(orderId : Nat, newItems : [OrderItem], packingCharge : Nat, deliveryCharge : Nat, isFullUpdate : Bool) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedItems = newItems.map(
          func(item) {
            if (item.name == "Packing Charges") {
              { item with price = packingCharge };
            } else if (item.name == "Delivery Charge") {
              { item with price = deliveryCharge };
            } else {
              item;
            };
          }
        );

        let resultingItems = if (isFullUpdate) {
          updatedItems;
        } else {
          order.items.concat(updatedItems);
        };

        let updatedOrder = { order with items = resultingItems };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func addItemsToOrder(orderId : Nat, newItems : [OrderItem], packingCharge : Nat, deliveryCharge : Nat) : async () {
    await addOrUpdateItems(orderId, newItems, packingCharge, deliveryCharge, false);
  };

  public shared ({ caller }) func updateOrderItems(orderId : Nat, items : [OrderItem], packingCharge : Nat, deliveryCharge : Nat) : async () {
    await addOrUpdateItems(orderId, items, packingCharge, deliveryCharge, true);
  };

  public shared ({ caller }) func updateOrderDiscount(orderId : Nat, discount : Nat, discountType : Text) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          discount;
          discountType;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func updateOrderAddressGST(orderId : Nat, address : Text, gstNumber : Text) : async Bool {
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        orders.add(orderId, { order with address; gstNumber });
        true;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func getOrderById(id : Nat) : async Order {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public query ({ caller }) func getPendingOrders() : async [Order] {
    orders.values().toArray().filter(func(o) { o.status == #pending });
  };

  // ── Notifications ──────────────────────────────────────────────

  func createNotification(input : NotificationInput) {
    let notificationId = nextNotificationId;
    nextNotificationId += 1;

    let newNotification : Notification = {
      id = notificationId;
      orderId = input.orderId;
      message = input.message;
      acknowledged = false;
      timestamp = Time.now();
    };

    notifications.add(notificationId, newNotification);
  };

  public shared ({ caller }) func acknowledgeNotification(notificationId : Nat) : async () {
    switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notification) {
        let updatedNotification = { notification with acknowledged = true };
        notifications.add(notificationId, updatedNotification);
      };
    };
  };

  public shared ({ caller }) func acknowledgeAllNotifications() : async () {
    let allNotifications = notifications.toArray();
    notifications.clear();
    allNotifications.forEach(
      func((id, notification)) {
        notifications.add(id, { notification with acknowledged = true });
      }
    );
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    notifications.values().toArray().sort(Notification.compareByTimestamp);
  };

  public query ({ caller }) func getUnacknowledgedCount() : async Nat {
    var count = 0;
    notifications.keys().forEach(
      func(id) {
        switch (notifications.get(id)) {
          case (null) {};
          case (?notification) {
            if (not notification.acknowledged) {
              count += 1;
            };
          };
        };
      }
    );
    count;
  };

  public query ({ caller }) func getUnacknowledgedNotifications() : async [Notification] {
    notifications.values().toArray().filter(func(n) { not n.acknowledged });
  };

  // ── New Clear Functions ────────────────────────────────────────

  public shared func clearAllOrders() : async () {
    orders.clear();
    nextOrderId := 1;
  };

  public shared func clearAllNotifications() : async () {
    notifications.clear();
    nextNotificationId := 1;
  };

  public shared func clearAllData() : async () {
    await clearAllOrders();
    await clearAllNotifications();

  };
};
