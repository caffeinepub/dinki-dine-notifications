import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  // ── Old types (from previously deployed canister) ──────────────
  type OldTimestamp = Time.Time;

  type OldVehicleInfo = {
    make : Text;
    model : Text;
    color : Text;
    licensePlate : Text;
  };

  type OldOrderStatus = {
    #pending;
    #preparing;
    #ready;
    #fulfilled;
    #cancelled;
  };

  type OldOrderItem = {
    name : Text;
    quantity : Nat;
    price : Nat;
  };

  type OldOrder = {
    id : Nat;
    vehicleInfo : OldVehicleInfo;
    customerMobile : Text;
    items : [OldOrderItem];
    timestamp : OldTimestamp;
    status : OldOrderStatus;
    discount : Nat;
    discountType : Text;
    cancellationReason : Text;
  };

  type OldNotification = {
    id : Nat;
    orderId : Nat;
    message : Text;
    acknowledged : Bool;
    timestamp : OldTimestamp;
  };

  type OldMenuItem = {
    id : Nat;
    name : Text;
    category : Text;
    price : Nat;
    printerNumber : Nat;
    available : Bool;
  };

  // ── New types (matching current main.mo) ───────────────────────
  type NewOrder = {
    id : Nat;
    vehicleInfo : OldVehicleInfo;
    customerMobile : Text;
    items : [OldOrderItem];
    timestamp : OldTimestamp;
    status : OldOrderStatus;
    discount : Nat;
    discountType : Text;
    cancellationReason : Text;
    address : Text;
    gstNumber : Text;
  };

  // ── State record types ─────────────────────────────────────────
  type OldActor = {
    orders : Map.Map<Nat, OldOrder>;
    notifications : Map.Map<Nat, OldNotification>;
    menuItems : Map.Map<Nat, OldMenuItem>;
    var nextOrderId : Nat;
    var nextNotificationId : Nat;
    var nextMenuItemId : Nat;
    var menuSeeded : Bool;
    var DEFAULT_MENU : [(Text, Text, Nat, Nat)];
  };

  type NewActor = {
    orders : Map.Map<Nat, NewOrder>;
    notifications : Map.Map<Nat, OldNotification>;
    menuItems : Map.Map<Nat, OldMenuItem>;
    var nextOrderId : Nat;
    var nextNotificationId : Nat;
    var nextMenuItemId : Nat;
    var menuSeeded : Bool;
    var DEFAULT_MENU : [(Text, Text, Nat, Nat)];
  };

  public func run(old : OldActor) : NewActor {
    let migratedOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, o) {
        { o with address = ""; gstNumber = "" }
      }
    );
    {
      orders = migratedOrders;
      notifications = old.notifications;
      menuItems = old.menuItems;
      var nextOrderId = old.nextOrderId;
      var nextNotificationId = old.nextNotificationId;
      var nextMenuItemId = old.nextMenuItemId;
      var menuSeeded = old.menuSeeded;
      var DEFAULT_MENU = old.DEFAULT_MENU;
    };
  };
};
