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
import { Clock, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Order, OrderItem } from "../backend";

function toMinutes(h: number, m: number) {
  return h * 60 + m;
}
function nowMinutes() {
  const d = new Date();
  return toMinutes(d.getHours(), d.getMinutes());
}
function inRange(start: [number, number], end: [number, number]) {
  const now = nowMinutes();
  return now >= toMinutes(...start) && now < toMinutes(...end);
}

type TimeSlot = { start: [number, number]; end: [number, number] };

interface MenuItem {
  name: string;
  price: number;
  category: "Breakfast" | "North Indian" | "Chinese" | "Roti";
  slots: TimeSlot[];
}

const ALL_MENU_ITEMS: MenuItem[] = [
  {
    name: "Masala Dosa",
    price: 120,
    category: "Breakfast",
    slots: [{ start: [7, 0], end: [12, 0] }],
  },
  {
    name: "Idli Sambar",
    price: 90,
    category: "Breakfast",
    slots: [{ start: [7, 0], end: [12, 0] }],
  },
  {
    name: "Medu Vada",
    price: 80,
    category: "Breakfast",
    slots: [{ start: [7, 0], end: [12, 0] }],
  },
  {
    name: "Upma",
    price: 70,
    category: "Breakfast",
    slots: [{ start: [7, 0], end: [12, 0] }],
  },
  {
    name: "Aloo Paratha",
    price: 100,
    category: "Breakfast",
    slots: [{ start: [7, 0], end: [12, 0] }],
  },
  {
    name: "Poha",
    price: 60,
    category: "Breakfast",
    slots: [{ start: [7, 0], end: [12, 0] }],
  },
  {
    name: "Mango Lassi",
    price: 80,
    category: "Breakfast",
    slots: [{ start: [7, 0], end: [12, 0] }],
  },
  {
    name: "Filter Coffee",
    price: 50,
    category: "Breakfast",
    slots: [{ start: [7, 0], end: [12, 0] }],
  },
  {
    name: "Paneer Tikka",
    price: 250,
    category: "North Indian",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Dal Makhani",
    price: 180,
    category: "North Indian",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Veg Biryani",
    price: 200,
    category: "North Indian",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Shahi Paneer",
    price: 220,
    category: "North Indian",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Matar Paneer",
    price: 200,
    category: "North Indian",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Chole Bhature",
    price: 160,
    category: "North Indian",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Gulab Jamun",
    price: 60,
    category: "North Indian",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Spring Rolls",
    price: 130,
    category: "Chinese",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Veg Fried Rice",
    price: 150,
    category: "Chinese",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Hakka Noodles",
    price: 140,
    category: "Chinese",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Manchurian",
    price: 160,
    category: "Chinese",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Chilli Paneer",
    price: 180,
    category: "Chinese",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Veg Soup",
    price: 90,
    category: "Chinese",
    slots: [{ start: [11, 30], end: [22, 30] }],
  },
  {
    name: "Butter Roti",
    price: 30,
    category: "Roti",
    slots: [
      { start: [11, 30], end: [15, 30] },
      { start: [19, 0], end: [22, 30] },
    ],
  },
  {
    name: "Phulka",
    price: 25,
    category: "Roti",
    slots: [
      { start: [11, 30], end: [15, 30] },
      { start: [19, 0], end: [22, 30] },
    ],
  },
  {
    name: "Tandoori Roti",
    price: 40,
    category: "Roti",
    slots: [
      { start: [11, 30], end: [15, 30] },
      { start: [19, 0], end: [22, 30] },
    ],
  },
  {
    name: "Butter Naan",
    price: 60,
    category: "Roti",
    slots: [
      { start: [11, 30], end: [15, 30] },
      { start: [19, 0], end: [22, 30] },
    ],
  },
  {
    name: "Laccha Paratha",
    price: 70,
    category: "Roti",
    slots: [
      { start: [11, 30], end: [15, 30] },
      { start: [19, 0], end: [22, 30] },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Breakfast: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  "North Indian": "text-orange-400 border-orange-500/30 bg-orange-500/10",
  Chinese: "text-red-400 border-red-500/30 bg-red-500/10",
  Roti: "text-amber-300 border-amber-400/30 bg-amber-400/10",
};

const CATEGORY_SCHEDULE: Record<string, string> = {
  Breakfast: "07:00 – 12:00",
  "North Indian": "11:30 – 22:30",
  Chinese: "11:30 – 22:30",
  Roti: "11:30–15:30 & 19:00–22:30",
};

const SPECIAL_ITEMS = ["Packing Charges", "Delivery Charge"];

function isAvailableNow(item: MenuItem): boolean {
  return item.slots.some((s) => inRange(s.start, s.end));
}

interface AddItemsModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (
    orderId: bigint,
    newItems: OrderItem[],
    packingCharge: bigint,
    deliveryCharge: bigint,
  ) => Promise<void>;
}

export function AddItemsModal({
  open,
  order,
  onClose,
  onSubmit,
}: AddItemsModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [packingCharge, setPackingCharge] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Pre-fill existing packing/delivery
  useEffect(() => {
    if (open && order) {
      const existingPacking = order.items.find(
        (i) => i.name === "Packing Charges",
      );
      const existingDelivery = order.items.find(
        (i) => i.name === "Delivery Charge",
      );
      setPackingCharge(
        existingPacking ? Number(existingPacking.price).toString() : "",
      );
      setDeliveryCharge(
        existingDelivery ? Number(existingDelivery.price).toString() : "",
      );
    }
  }, [open, order]);

  const availableItems = ALL_MENU_ITEMS.filter(isAvailableNow);
  const categories = Array.from(new Set(availableItems.map((i) => i.category)));

  const toggleItem = (name: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const reset = () => {
    setSelectedItems(new Set());
    setPackingCharge("");
    setDeliveryCharge("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!order) return;
    setError("");
    if (selectedItems.size === 0) {
      setError("Please select at least one item to add.");
      return;
    }

    const newItems: OrderItem[] = availableItems
      .filter((m) => selectedItems.has(m.name))
      .map((m) => ({ name: m.name, quantity: 1n, price: BigInt(m.price) }));

    const packingAmt = Number.parseFloat(packingCharge);
    const deliveryAmt = Number.parseFloat(deliveryCharge);
    const packingBigInt =
      !Number.isNaN(packingAmt) && packingAmt > 0
        ? BigInt(Math.round(packingAmt))
        : 0n;
    const deliveryBigInt =
      !Number.isNaN(deliveryAmt) && deliveryAmt > 0
        ? BigInt(Math.round(deliveryAmt))
        : 0n;

    setIsSubmitting(true);
    try {
      await onSubmit(order.id, newItems, packingBigInt, deliveryBigInt);
      reset();
      onClose();
    } catch (_e) {
      setError("Failed to add items. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeStr = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Running bill preview with new selections
  const existingRegular =
    order?.items.filter((i) => !SPECIAL_ITEMS.includes(i.name)) ?? [];
  const newSelected = availableItems.filter((m) => selectedItems.has(m.name));
  const existingTotal = existingRegular.reduce(
    (s, i) => s + Number(i.price) * Number(i.quantity),
    0,
  );
  const newTotal = newSelected.reduce((s, m) => s + m.price, 0);
  const combinedItemsTotal = existingTotal + newTotal;
  const sgst = combinedItemsTotal * 0.025;
  const cgst = combinedItemsTotal * 0.025;
  const packingNum = Number.parseFloat(packingCharge) || 0;
  const deliveryNum = Number.parseFloat(deliveryCharge) || 0;
  const grandTotal =
    combinedItemsTotal + sgst + cgst + packingNum + deliveryNum;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="add_items.dialog"
        className="bg-din-surface border-din-border text-din-text max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-din-text flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-din-teal" />
              Add Items to Tab
            </span>
            <span className="flex items-center gap-1 text-xs font-normal text-din-muted">
              <Clock className="w-3.5 h-3.5" />
              {timeStr}
            </span>
          </DialogTitle>
        </DialogHeader>

        {order && (
          <div className="bg-din-teal/10 border border-din-teal/30 rounded px-3 py-2 text-xs text-din-teal">
            Tab: {order.vehicleInfo.color} {order.vehicleInfo.make} ·{" "}
            {order.vehicleInfo.licensePlate}
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* Menu Items */}
          <div>
            <h3 className="text-xs font-semibold text-din-teal uppercase tracking-wider mb-3">
              Add Menu Items
            </h3>
            {availableItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-din-muted">
                <Clock className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm font-medium">
                  Kitchen is closed right now
                </p>
                <p className="text-xs opacity-60 mt-1">
                  No items available at {timeStr}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => {
                  const catItems = availableItems.filter(
                    (i) => i.category === cat,
                  );
                  return (
                    <div key={cat}>
                      <div
                        className={`flex items-center justify-between px-2 py-1 rounded mb-2 border text-xs font-semibold ${CATEGORY_COLORS[cat]}`}
                      >
                        <span>{cat}</span>
                        <span className="font-normal opacity-75">
                          {CATEGORY_SCHEDULE[cat]}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {catItems.map((item) => (
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
                              <p className="text-[10px] text-din-muted">
                                ₹{item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Extra Charges */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-din-teal uppercase tracking-wider">
              Extra Charges (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-din-muted">
                  Packing Charges (₹)
                </Label>
                <Input
                  data-ocid="add_items.input"
                  type="number"
                  min="0"
                  value={packingCharge}
                  onChange={(e) => setPackingCharge(e.target.value)}
                  placeholder="0"
                  className="bg-din-surface-alt border-din-border text-din-text placeholder:text-din-muted/50 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-din-muted">
                  Delivery Charge (₹)
                </Label>
                <Input
                  data-ocid="add_items.input"
                  type="number"
                  min="0"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  placeholder="0"
                  className="bg-din-surface-alt border-din-border text-din-text placeholder:text-din-muted/50 h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Running Bill Preview */}
          <div className="border border-din-border/60 rounded p-3 bg-din-surface-alt">
            <p className="text-[10px] font-semibold text-din-teal uppercase tracking-wider mb-2">
              Running Bill
            </p>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[11px] text-din-muted">
                <span>Items Total</span>
                <span>₹{combinedItemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-din-muted">
                <span>SGST (2.5%)</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-din-muted">
                <span>CGST (2.5%)</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              {packingNum > 0 && (
                <div className="flex justify-between text-[11px] text-din-muted">
                  <span>Packing</span>
                  <span>₹{packingNum.toFixed(2)}</span>
                </div>
              )}
              {deliveryNum > 0 && (
                <div className="flex justify-between text-[11px] text-din-muted">
                  <span>Delivery</span>
                  <span>₹{deliveryNum.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-din-border/60 mt-1.5 pt-1.5 flex justify-between text-[12px] font-semibold">
              <span className="text-din-text">Grand Total</span>
              <span className="text-din-teal">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <p
              data-ocid="add_items.error_state"
              className="text-xs text-din-red"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            data-ocid="add_items.cancel_button"
            variant="outline"
            onClick={handleClose}
            className="border-din-border text-din-muted hover:bg-din-surface-alt"
          >
            Cancel
          </Button>
          <Button
            data-ocid="add_items.submit_button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedItems.size === 0}
            className="bg-din-teal hover:bg-din-teal/80 text-white font-semibold"
          >
            {isSubmitting ? "Adding..." : "Add to Tab"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
