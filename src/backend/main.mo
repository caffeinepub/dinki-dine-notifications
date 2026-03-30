import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";



actor {
  type Timestamp = Time.Time;

  type VehicleInfo = {
    make : Text;
    model : Text;
    color : Text;
    licensePlate : Text;
  };

  type OrderStatus = {
    #pending;
    #preparing;
    #ready;
    #fulfilled;
  };

  type OrderInput = {
    id : Nat;
    vehicleInfo : VehicleInfo;
    customerMobile : Text;
    items : [OrderItem];
    timestamp : Timestamp;
    status : OrderStatus;
  };

  public type Order = {
    id : Nat;
    vehicleInfo : VehicleInfo;
    customerMobile : Text;
    items : [OrderItem];
    timestamp : Timestamp;
    status : OrderStatus;
  };

  type OrderItem = {
    name : Text;
    quantity : Nat;
    price : Nat;
  };

  type Notification = {
    id : Nat;
    orderId : Nat;
    message : Text;
    acknowledged : Bool;
    timestamp : Timestamp;
  };

  type NotificationInput = {
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

  var nextOrderId = 1;
  var nextNotificationId = 1;
  var nextMenuItemId = 1;
  var menuSeeded = false;

  let orders = Map.empty<Nat, Order>();
  let notifications = Map.empty<Nat, Notification>();
  let menuItems = Map.empty<Nat, MenuItem>();

  // Seed default menu items
  func seedMenu() {
    if (menuSeeded) return;
    menuSeeded := true;

    let defaults : [(Text, Text, Nat, Nat)] = [
      // Breakfast - printer 1
      ("Masala Dosa", "Breakfast", 120, 1),
      ("Idli Sambar", "Breakfast", 90, 1),
      ("Medu Vada", "Breakfast", 80, 1),
      ("Upma", "Breakfast", 70, 1),
      ("Aloo Paratha", "Breakfast", 100, 1),
      ("Poha", "Breakfast", 60, 1),
      ("Mango Lassi", "Breakfast", 80, 1),
      ("Filter Coffee", "Breakfast", 50, 1),
      // North Indian - printer 2
      ("Paneer Tikka", "North Indian", 250, 2),
      ("Dal Makhani", "North Indian", 180, 2),
      ("Veg Biryani", "North Indian", 200, 2),
      ("Shahi Paneer", "North Indian", 220, 2),
      ("Matar Paneer", "North Indian", 200, 2),
      ("Chole Bhature", "North Indian", 160, 2),
      ("Gulab Jamun", "North Indian", 60, 2),
      // Chinese - printer 3
      ("Spring Rolls", "Chinese", 130, 3),
      ("Veg Fried Rice", "Chinese", 150, 3),
      ("Hakka Noodles", "Chinese", 140, 3),
      ("Manchurian", "Chinese", 160, 3),
      ("Chilli Paneer", "Chinese", 180, 3),
      ("Veg Soup", "Chinese", 90, 3),
      // Roti - printer 4
      ("Butter Roti", "Roti", 30, 4),
      ("Phulka", "Roti", 25, 4),
      ("Tandoori Roti", "Roti", 40, 4),
      ("Butter Naan", "Roti", 60, 4),
      ("Laccha Paratha", "Roti", 70, 4),
    ];

    for ((name, category, price, printer) in defaults.vals()) {
      let id = nextMenuItemId;
      nextMenuItemId += 1;
      menuItems.add(id, {
        id;
        name;
        category;
        price;
        printerNumber = printer;
        available = true;
      });
    };
  };

  // Ensure menu is seeded on every call
  func ensureSeeded() {
    if (not menuSeeded) { seedMenu() };
  };

  // ── Menu APIs ──────────────────────────────────────────────────

  public query func getMenuItems() : async [MenuItem] {
    if (not menuSeeded) {
      // Return default items inline for query (can't mutate in query)
      let defaults : [(Text, Text, Nat, Nat)] = [
        ("Masala Dosa", "Breakfast", 120, 1),
        ("Idli Sambar", "Breakfast", 90, 1),
        ("Medu Vada", "Breakfast", 80, 1),
        ("Upma", "Breakfast", 70, 1),
        ("Aloo Paratha", "Breakfast", 100, 1),
        ("Poha", "Breakfast", 60, 1),
        ("Mango Lassi", "Breakfast", 80, 1),
        ("Filter Coffee", "Breakfast", 50, 1),
        ("Paneer Tikka", "North Indian", 250, 2),
        ("Dal Makhani", "North Indian", 180, 2),
        ("Veg Biryani", "North Indian", 200, 2),
        ("Shahi Paneer", "North Indian", 220, 2),
        ("Matar Paneer", "North Indian", 200, 2),
        ("Chole Bhature", "North Indian", 160, 2),
        ("Gulab Jamun", "North Indian", 60, 2),
        ("Spring Rolls", "Chinese", 130, 3),
        ("Veg Fried Rice", "Chinese", 150, 3),
        ("Hakka Noodles", "Chinese", 140, 3),
        ("Manchurian", "Chinese", 160, 3),
        ("Chilli Paneer", "Chinese", 180, 3),
        ("Veg Soup", "Chinese", 90, 3),
        ("Butter Roti", "Roti", 30, 4),
        ("Phulka", "Roti", 25, 4),
        ("Tandoori Roti", "Roti", 40, 4),
        ("Butter Naan", "Roti", 60, 4),
        ("Laccha Paratha", "Roti", 70, 4),
      ];
      return Array.tabulate<MenuItem>(defaults.size(), func(i) {
        let (name, category, price, printer) = defaults[i];
        { id = i + 1; name; category; price; printerNumber = printer; available = true }
      });
    };
    menuItems.values().toArray();
  };

  public shared func initMenu() : async () {
    seedMenu();
  };

  public shared func addMenuItem(name : Text, category : Text, price : Nat, printerNumber : Nat) : async Nat {
    ensureSeeded();
    let id = nextMenuItemId;
    nextMenuItemId += 1;
    menuItems.add(id, { id; name; category; price; printerNumber; available = true });
    id;
  };

  public shared func updateMenuItem(id : Nat, name : Text, category : Text, price : Nat, printerNumber : Nat, available : Bool) : async () {
    ensureSeeded();
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        menuItems.add(id, { item with name; category; price; printerNumber; available });
      };
    };
  };

  public shared func deleteMenuItem(id : Nat) : async () {
    ensureSeeded();
    menuItems.remove(id);
  };

  public shared func resetMenuToDefaults() : async () {
    menuItems.clear();
    nextMenuItemId := 1;
    menuSeeded := false;
    seedMenu();
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

  public shared ({ caller }) func addItemsToOrder(orderId : Nat, newItems : [OrderItem], packingCharge : Nat, deliveryCharge : Nat) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedItems = order.items.concat(newItems);

        let updatedWithCharges = updatedItems.map(
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

        let updatedOrder = { order with items = updatedWithCharges };
        orders.add(orderId, updatedOrder);
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
    await resetMenuToDefaults();
  };
};
