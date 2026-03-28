import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Car,
  CheckCircle2,
  ChefHat,
  Clock,
  Package,
  Phone,
} from "lucide-react";
import type { Order } from "../backend";
import { OrderStatus } from "../backend";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: bigint, status: OrderStatus) => void;
  index: number;
}

function formatTime(timestampNs: bigint): string {
  const ms = Number(timestampNs) / 1_000_000;
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    [OrderStatus.pending]: {
      label: "Pending",
      className: "bg-din-orange/20 text-din-orange border-din-orange/30",
    },
    [OrderStatus.preparing]: {
      label: "Preparing",
      className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    [OrderStatus.ready]: {
      label: "Ready",
      className: "bg-din-green/20 text-din-green border-din-green/30",
    },
    [OrderStatus.fulfilled]: {
      label: "Fulfilled",
      className: "bg-din-muted/20 text-din-muted border-din-muted/30",
    },
  };

const VEHICLE_COLORS: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  white: "#f8fafc",
  black: "#1f2937",
  silver: "#94a3b8",
  gray: "#6b7280",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  maroon: "#9f1239",
  brown: "#92400e",
};

export function OrderCard({ order, onUpdateStatus, index }: OrderCardProps) {
  const statusCfg = STATUS_CONFIG[order.status];
  const vehicleColorHex =
    VEHICLE_COLORS[order.vehicleInfo.color.toLowerCase()] ?? "#94a3b8";
  const totalItems = order.items.reduce((s, i) => s + Number(i.quantity), 0);

  return (
    <div
      data-ocid={`orders.item.${index}`}
      className="bg-din-surface border border-din-border rounded-lg p-4 shadow-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20"
            style={{ backgroundColor: vehicleColorHex }}
          />
          <span className="text-sm font-semibold text-din-text">
            {order.vehicleInfo.color} {order.vehicleInfo.make}{" "}
            {order.vehicleInfo.model}
          </span>
          <span className="text-xs font-mono text-din-muted bg-din-surface-alt px-2 py-0.5 rounded border border-din-border">
            {order.vehicleInfo.licensePlate}
          </span>
        </div>
        <Badge
          className={`text-[10px] border ${statusCfg.className} bg-transparent`}
        >
          {statusCfg.label}
        </Badge>
      </div>

      {/* Order meta */}
      <div className="flex items-center gap-4 mb-3 text-xs text-din-muted">
        <span className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          Order #{Number(order.id).toString().padStart(4, "0")}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(order.timestamp)}
        </span>
        <span className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          {order.customerMobile}
        </span>
      </div>

      {/* Items */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {order.items.map((item) => (
            <span
              key={item.name}
              className="text-[11px] px-2 py-0.5 rounded bg-din-surface-alt border border-din-border text-din-text"
            >
              {item.name} ×{Number(item.quantity)}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-din-muted mt-1">
          {totalItems} item{totalItems !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {order.status === OrderStatus.pending && (
          <Button
            data-ocid={`orders.primary_button.${index}`}
            size="sm"
            onClick={() => onUpdateStatus(order.id, OrderStatus.preparing)}
            className="h-7 text-xs px-3 bg-din-orange hover:bg-din-orange/80 text-white font-semibold"
          >
            <ChefHat className="w-3 h-3 mr-1" />
            Accept
          </Button>
        )}
        {order.status === OrderStatus.preparing && (
          <Button
            data-ocid={`orders.primary_button.${index}`}
            size="sm"
            onClick={() => onUpdateStatus(order.id, OrderStatus.ready)}
            className="h-7 text-xs px-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Mark Ready
          </Button>
        )}
        {order.status === OrderStatus.ready && (
          <Button
            data-ocid={`orders.primary_button.${index}`}
            size="sm"
            onClick={() => onUpdateStatus(order.id, OrderStatus.fulfilled)}
            className="h-7 text-xs px-3 bg-din-green hover:bg-din-green/80 text-white font-semibold"
          >
            <Car className="w-3 h-3 mr-1" />
            Fulfill
          </Button>
        )}
        {order.status === OrderStatus.fulfilled && (
          <span className="text-xs text-din-muted flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-din-green" />
            Completed
          </span>
        )}
      </div>
    </div>
  );
}
