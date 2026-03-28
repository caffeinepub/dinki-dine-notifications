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

  type Order = {
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

  let orders = Map.empty<Nat, Order>();
  let notifications = Map.empty<Nat, Notification>();

  // Orders
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

  // Notifications
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
};
