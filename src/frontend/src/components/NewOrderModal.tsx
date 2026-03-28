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
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { OrderInput } from "../backend";
import { OrderStatus } from "../backend";

// ── Time helpers ──────────────────────────────────────────────
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

// ── Menu schedule ─────────────────────────────────────────────
type TimeSlot = { start: [number, number]; end: [number, number] };

interface MenuItem {
  name: string;
  price: number;
  category: "Breakfast" | "North Indian" | "Chinese" | "Roti";
  slots: TimeSlot[];
}

const ALL_MENU_ITEMS: MenuItem[] = [
  // ── Breakfast  07:00 – 12:00 ──────────────────────────────
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

  // ── North Indian  11:30 – 22:30 ───────────────────────────
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

  // ── Chinese  11:30 – 22:30 ────────────────────────────────
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

  // ── Roti  11:30–15:30 & 19:00–22:30 ──────────────────────
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

function isAvailableNow(item: MenuItem): boolean {
  return item.slots.some((s) => inRange(s.start, s.end));
}

// ── Component ─────────────────────────────────────────────────
interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (order: OrderInput) => Promise<void>;
}

export function NewOrderModal({ open, onClose, onSubmit }: NewOrderModalProps) {
  const [make, setMake] = useState("");
  const [color, setColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refresh every minute so availability updates live
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Re-compute available items whenever time changes
  const availableItems = ALL_MENU_ITEMS.filter(isAvailableNow);

  // Group by category (only categories that have at least one available item)
  const categories = Array.from(new Set(availableItems.map((i) => i.category)));

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

    const items = availableItems
      .filter((m) => selectedItems.has(m.name))
      .map((m) => ({ name: m.name, quantity: 1n, price: BigInt(m.price) }));

    const order: OrderInput = {
      id: 0n,
      status: OrderStatus.pending,
      vehicleInfo: {
        make: make.trim(),
        model: "",
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
      setMake("");
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

  const timeStr = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="new_order.dialog"
        className="bg-din-surface border-din-border text-din-text max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-din-text flex items-center justify-between">
            New Customer Order
            <span className="flex items-center gap-1 text-xs font-normal text-din-muted">
              <Clock className="w-3.5 h-3.5" />
              {timeStr}
            </span>
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
                  placeholder="e.g. Maruti Swift"
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
              <div className="col-span-2">
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

          {/* Menu Items — grouped by category */}
          <div>
            <h3 className="text-xs font-semibold text-din-teal uppercase tracking-wider mb-3">
              Menu Items
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
                      {/* Category header */}
                      <div
                        className={`flex items-center justify-between px-2 py-1 rounded mb-2 border text-xs font-semibold ${CATEGORY_COLORS[cat]}`}
                      >
                        <span>{cat}</span>
                        <span className="font-normal opacity-75">
                          {CATEGORY_SCHEDULE[cat]}
                        </span>
                      </div>
                      {/* Items grid */}
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
            disabled={isSubmitting || availableItems.length === 0}
            className="bg-din-orange hover:bg-din-orange/80 text-white font-semibold"
          >
            {isSubmitting ? "Placing..." : "Place Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
