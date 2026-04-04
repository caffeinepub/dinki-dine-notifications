import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";

module {
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
    #cancelled;
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

  type MenuItem = {
    id : Nat;
    name : Text;
    category : Text;
    price : Nat;
    printerNumber : Nat;
    available : Bool;
  };

  type OldOrder = {
    id : Nat;
    vehicleInfo : VehicleInfo;
    customerMobile : Text;
    items : [OrderItem];
    timestamp : Timestamp;
    status : {
      #pending;
      #preparing;
      #ready;
      #fulfilled;
    };
  };

  type OldActor = {
    orders : Map.Map<Nat, OldOrder>;
    notifications : Map.Map<Nat, Notification>;
    menuItems : Map.Map<Nat, MenuItem>;
    nextOrderId : Nat;
    nextNotificationId : Nat;
    nextMenuItemId : Nat;
    menuSeeded : Bool;
  };

  type NewOrder = {
    id : Nat;
    vehicleInfo : VehicleInfo;
    customerMobile : Text;
    items : [OrderItem];
    timestamp : Timestamp;
    status : {
      #pending;
      #preparing;
      #ready;
      #fulfilled;
      #cancelled;
    };
    discount : Nat;
    discountType : Text;
    cancellationReason : Text;
  };

  type NewActor = {
    orders : Map.Map<Nat, NewOrder>;
    notifications : Map.Map<Nat, Notification>;
    menuItems : Map.Map<Nat, MenuItem>;
    nextOrderId : Nat;
    nextNotificationId : Nat;
    nextMenuItemId : Nat;
    menuSeeded : Bool;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          id = oldOrder.id;
          vehicleInfo = oldOrder.vehicleInfo;
          customerMobile = oldOrder.customerMobile;
          items = oldOrder.items;
          timestamp = oldOrder.timestamp;
          status = switch (oldOrder.status) {
            case (#pending) { #pending };
            case (#preparing) { #preparing };
            case (#ready) { #ready };
            case (#fulfilled) { #fulfilled };
          };
          discount = 0;
          discountType = "flat";
          cancellationReason = "";
        };
      }
    );
    {
      old with
      orders = newOrders;
    };
  };
};
