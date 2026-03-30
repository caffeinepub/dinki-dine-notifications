import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface VehicleInfo {
    model: string;
    licensePlate: string;
    make: string;
    color: string;
}
export interface Notification {
    id: bigint;
    orderId: bigint;
    acknowledged: boolean;
    message: string;
    timestamp: Timestamp;
}
export interface OrderInput {
    id: bigint;
    status: OrderStatus;
    vehicleInfo: VehicleInfo;
    customerMobile: string;
    timestamp: Timestamp;
    items: Array<OrderItem>;
}
export interface OrderItem {
    name: string;
    quantity: bigint;
    price: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    vehicleInfo: VehicleInfo;
    customerMobile: string;
    timestamp: Timestamp;
    items: Array<OrderItem>;
}
export enum OrderStatus {
    preparing = "preparing",
    pending = "pending",
    fulfilled = "fulfilled",
    ready = "ready"
}
export interface MenuItem {
    id: bigint;
    name: string;
    category: string;
    price: bigint;
    printerNumber: bigint;
    available: boolean;
}
export interface backendInterface {
    acknowledgeAllNotifications(): Promise<void>;
    acknowledgeNotification(notificationId: bigint): Promise<void>;
    addItemsToOrder(orderId: bigint, newItems: Array<OrderItem>, packingCharge: bigint, deliveryCharge: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getNotifications(): Promise<Array<Notification>>;
    getOrderById(id: bigint): Promise<Order>;
    getPendingOrders(): Promise<Array<Order>>;
    getUnacknowledgedCount(): Promise<bigint>;
    getUnacknowledgedNotifications(): Promise<Array<Notification>>;
    placeOrder(order: OrderInput): Promise<bigint>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    getMenuItems(): Promise<Array<MenuItem>>;
    initMenu(): Promise<void>;
    addMenuItem(name: string, category: string, price: bigint, printerNumber: bigint): Promise<bigint>;
    updateMenuItem(id: bigint, name: string, category: string, price: bigint, printerNumber: bigint, available: boolean): Promise<void>;
    deleteMenuItem(id: bigint): Promise<void>;
    resetMenuToDefaults(): Promise<void>;
}
