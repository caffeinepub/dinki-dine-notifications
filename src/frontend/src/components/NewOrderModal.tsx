import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { OrderInput } from "../backend";
import { OrderStatus } from "../backend";

const MENU_ITEMS = [
  { name: "Paneer Tikka", price: 250 },
  { name: "Veg Burger", price: 150 },
  { name: "Masala Dosa", price: 120 },
  { name: "Aloo Paratha", price: 100 },
  { name: "Mango Lassi", price: 80 },
  { name: "Veg Biryani", price: 200 },
  { name: "Spring Rolls", price: 130 },
  { name: "Gulab Jamun", price: 60 },
];

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (order: OrderInput) => Promise<void>;
}

export function NewOrderModal({ open, onClose, onSubmit }: NewOrderModalProps) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleItem = (name: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSubmit = async () => {
    setError("");
    if (
      !make.trim() ||
      !model.trim() ||
      !color.trim() ||
      !licensePlate.trim() ||
      !mobile.trim()
    ) {
      setError("Please fill in all vehicle and contact fields.");
      return;
    }
    if (selectedItems.size === 0) {
      setError("Please select at least one item.");
      return;
    }

    const items = MENU_ITEMS.filter((m) => selectedItems.has(m.name)).map(
      (m) => ({
        name: m.name,
        quantity: 1n,
        price: BigInt(m.price),
      }),
    );

    const order: OrderInput = {
      id: 0n,
      status: OrderStatus.pending,
      vehicleInfo: {
        make: make.trim(),
        model: model.trim(),
        color: color.trim(),
        licensePlate: licensePlate.trim(),
      },
      customerMobile: mobile.trim(),
      timestamp: BigInt(Date.now()) * 1_000_000n,
      items,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(order);
      // Reset
      setMake("");
      setModel("");
      setColor("");
      setLicensePlate("");
      setMobile("");
      setSelectedItems(new Set());
      onClose();
    } catch (_e) {
      setError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="new_order.dialog"
        className="bg-din-surface border-din-border text-din-text max-w-md max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-din-text">
            New Customer Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Vehicle Info */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-din-teal uppercase tracking-wider">
              Vehicle Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-din-muted">Make</Label>
                <Input
                  data-ocid="new_order.input"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Maruti"
                  className="bg-din-surface-alt border-din-border text-din-text placeholder:text-din-muted/50 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-din-muted">Model</Label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Swift"
                  className="bg-din-surface-alt border-din-border text-din-text placeholder:text-din-muted/50 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-din-muted">Color</Label>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Red"
                  className="bg-din-surface-alt border-din-border text-din-text placeholder:text-din-muted/50 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-din-muted">License Plate</Label>
                <Input
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="KA01AB1234"
                  className="bg-din-surface-alt border-din-border text-din-text placeholder:text-din-muted/50 h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div>
            <Label className="text-xs text-din-muted">Customer Mobile</Label>
            <Input
              data-ocid="new_order.search_input"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 98765 43210"
              className="bg-din-surface-alt border-din-border text-din-text placeholder:text-din-muted/50 h-8 text-sm"
            />
          </div>

          {/* Menu Items */}
          <div>
            <h3 className="text-xs font-semibold text-din-teal uppercase tracking-wider mb-2">
              Menu Items
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {MENU_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 p-2 rounded bg-din-surface-alt border border-din-border cursor-pointer hover:border-din-teal/50 transition-colors"
                  onClick={() => toggleItem(item.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      toggleItem(item.name);
                  }}
                >
                  <Checkbox
                    checked={selectedItems.has(item.name)}
                    onCheckedChange={() => toggleItem(item.name)}
                    className="border-din-border data-[state=checked]:bg-din-teal data-[state=checked]:border-din-teal"
                  />
                  <div>
                    <p className="text-xs font-medium text-din-text">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-din-muted">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p
              data-ocid="new_order.error_state"
              className="text-xs text-din-red"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            data-ocid="new_order.cancel_button"
            variant="outline"
            onClick={onClose}
            className="border-din-border text-din-muted hover:bg-din-surface-alt"
          >
            Cancel
          </Button>
          <Button
            data-ocid="new_order.submit_button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-din-orange hover:bg-din-orange/80 text-white font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : null}
            {isSubmitting ? "Placing..." : "Place Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
