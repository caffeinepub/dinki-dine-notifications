import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActor } from "@caffeineai/core-infrastructure";
import { Minus, Percent, Plus, Printer, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createActor } from "../backend";
import type { Order, OrderItem } from "../backend";

const SPECIAL_ITEMS = ["Packing Charges", "Delivery Charge"];
const GST_KEY = "dinki_daily_gst";
const ADDRESS_KEY = "dinki_restaurant_address";

function fmt(amount: number): string {
  return `\u20B9${amount.toFixed(2)}`;
}

interface EditableItem {
  name: string;
  price: number;
  quantity: number;
}

interface InvoiceEditModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSave: (
    orderId: bigint,
    items: OrderItem[],
    packingCharge: bigint,
    deliveryCharge: bigint,
    discount: bigint,
    discountType: string,
  ) => Promise<void>;
}

export function InvoiceEditModal({
  open,
  order,
  onClose,
  onSave,
}: InvoiceEditModalProps) {
  const { actor } = useActor(createActor);
  const [items, setItems] = useState<EditableItem[]>([]);
  const [packingCharge, setPackingCharge] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Address & GST fields
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [saveGstAsDefault, setSaveGstAsDefault] = useState(false);

  useEffect(() => {
    if (!order || !open) return;
    const regular = order.items
      .filter((i) => !SPECIAL_ITEMS.includes(i.name))
      .map((i) => ({
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity),
      }));
    setItems(regular);

    const packing = order.items.find((i) => i.name === "Packing Charges");
    const delivery = order.items.find((i) => i.name === "Delivery Charge");
    setPackingCharge(packing ? Number(packing.price) : 0);
    setDeliveryCharge(delivery ? Number(delivery.price) : 0);

    const disc = Number(order.discount ?? 0n);
    const dtype = order.discountType ?? "flat";
    setDiscountAmount(disc > 0 ? disc / 100 : 0);
    setDiscountType(dtype === "percent" ? "percent" : "flat");

    // Load address & GST: use order-level if present, else defaults
    const savedAddress = localStorage.getItem(ADDRESS_KEY) ?? "";
    const savedGst = localStorage.getItem(GST_KEY) ?? "";
    setAddress((order as Order & { address?: string }).address ?? savedAddress);
    setGstNumber(
      (order as Order & { gstNumber?: string }).gstNumber ?? savedGst,
    );
    setSaveGstAsDefault(false);

    setNewItemName("");
    setNewItemPrice(0);
    setNewItemQty(1);
  }, [order, open]);

  if (!order) return null;

  const orderId = Number(order.id).toString().padStart(4, "0");
  const itemsTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const sgst = itemsTotal * 0.025;
  const cgst = itemsTotal * 0.025;
  const subtotal = itemsTotal + sgst + cgst + packingCharge + deliveryCharge;
  let discountValue = 0;
  if (discountAmount > 0) {
    discountValue =
      discountType === "percent"
        ? subtotal * (discountAmount / 100)
        : discountAmount;
  }
  const grandTotal = Math.max(0, subtotal - discountValue);

  const updateQty = (idx: number, delta: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const updatePrice = (idx: number, price: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, price: Math.max(0, price) } : item,
      ),
    );
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addNewItem = () => {
    if (!newItemName.trim() || newItemPrice <= 0 || newItemQty <= 0) return;
    setItems((prev) => [
      ...prev,
      { name: newItemName.trim(), price: newItemPrice, quantity: newItemQty },
    ]);
    setNewItemName("");
    setNewItemPrice(0);
    setNewItemQty(1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Persist GST as default if checked
      if (saveGstAsDefault && gstNumber.trim()) {
        localStorage.setItem(GST_KEY, gstNumber.trim());
      }

      const orderItems: OrderItem[] = items.map((i) => ({
        name: i.name,
        price: BigInt(Math.round(i.price)),
        quantity: BigInt(i.quantity),
      }));
      const packing = BigInt(Math.round(packingCharge));
      const delivery = BigInt(Math.round(deliveryCharge));
      const storedDiscount = BigInt(Math.round(discountAmount * 100));
      await onSave(
        order.id,
        orderItems,
        packing,
        delivery,
        storedDiscount,
        discountType,
      );

      // Save address/GST to backend (optional – graceful fallback)
      if (actor && (address.trim() || gstNumber.trim())) {
        try {
          await (
            actor as unknown as Record<
              string,
              (...args: unknown[]) => Promise<void>
            >
          ).updateOrderAddressGST?.(order.id, address.trim(), gstNumber.trim());
        } catch {
          // Backend method may not exist yet; ignore
        }
      }

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const isDriveIn = order.vehicleInfo.model === "DRIVE-IN";
    const isTakeAway =
      order.vehicleInfo.licensePlate?.startsWith("TAKEAWAY-") ?? false;
    const upiUrl = `upi://pay?pa=Paytm-31587057%40ptys&pn=DinkiDine&am=${grandTotal.toFixed(2)}&cu=INR`;
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    const locationLabel = isDriveIn
      ? "Car No"
      : isTakeAway
        ? "Customer"
        : "Table";
    const locationValue = isDriveIn
      ? order.vehicleInfo.licensePlate
      : isTakeAway
        ? order.vehicleInfo.licensePlate.replace("TAKEAWAY-", "")
        : order.vehicleInfo.licensePlate;

    const addressLine = address.trim()
      ? `<div style="font-size:10px;color:#555;margin-bottom:2px">${address.trim().replace(/\n/g, "<br/>")}</div>`
      : "";
    const gstLine = gstNumber.trim()
      ? `<div style="font-size:10px;color:#555">GSTIN: ${gstNumber.trim()}</div>`
      : "";

    w.document.write(`
      <html><head><title>Invoice #${orderId}</title></head>
      <body style="font-family:monospace;font-size:12px;padding:20px;max-width:300px;margin:0 auto">
      <div style="text-align:center">
        <b>DINKI POS</b><br/>
        <span style="font-size:11px">Dine-In &amp; Takeaway</span>
      </div>
      ${addressLine}
      ${gstLine}
      <div style="text-align:center;font-size:11px;margin-top:2px">
        <b>Invoice #${orderId}</b> (REVISED)
      </div>
      <hr/><div>${locationLabel}: ${locationValue}</div><hr/>
      ${items.map((i) => `<div style="display:flex;justify-content:space-between"><span>${i.name} x${i.quantity}</span><span>${fmt(i.price * i.quantity)}</span></div>`).join("")}
      <hr/>
      <div style="display:flex;justify-content:space-between"><span>Items Total</span><span>${fmt(itemsTotal)}</span></div>
      <div style="display:flex;justify-content:space-between"><span>SGST (2.5%)</span><span>${fmt(sgst)}</span></div>
      <div style="display:flex;justify-content:space-between"><span>CGST (2.5%)</span><span>${fmt(cgst)}</span></div>
      ${packingCharge > 0 ? `<div style="display:flex;justify-content:space-between"><span>Packing</span><span>${fmt(packingCharge)}</span></div>` : ""}
      ${deliveryCharge > 0 ? `<div style="display:flex;justify-content:space-between"><span>Delivery</span><span>${fmt(deliveryCharge)}</span></div>` : ""}
      ${discountValue > 0 ? `<div style="display:flex;justify-content:space-between;color:green"><span>Discount${discountType === "percent" ? ` (${discountAmount}%)` : ""}</span><span>-${fmt(discountValue)}</span></div>` : ""}
      <hr/><div style="display:flex;justify-content:space-between;font-weight:bold"><span>GRAND TOTAL</span><span>${fmt(grandTotal)}</span></div>
      <div style="text-align:center;margin-top:10px">
        <p style="font-size:10px">Scan to Pay</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiUrl)}" width="120" height="120"/>
        <p style="font-size:9px">Paytm-31587057@ptys</p>
      </div>
      <p style="text-align:center;font-size:10px">Thank you for dining with us!</p>
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="invoice_edit.dialog"
        className="bg-din-surface border-din-border text-din-text max-w-lg w-full"
      >
        <DialogHeader>
          <DialogTitle className="text-din-text flex items-center justify-between">
            <span>Edit Invoice</span>
            <span className="text-din-teal font-mono text-sm">
              Order #{orderId}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-4">
            {/* Order ID banner */}
            <div className="bg-din-teal/10 border border-din-teal/30 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-din-muted">Order ID</span>
              <span className="text-sm font-bold font-mono text-din-teal">
                #{orderId}
              </span>
            </div>

            {/* Address field */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-din-text">
                Address
              </Label>
              <textarea
                data-ocid="invoice_edit.input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Restaurant address (optional)"
                rows={2}
                className="w-full text-xs bg-din-surface-alt border border-din-border rounded-md px-3 py-2 text-din-text placeholder:text-din-muted/50 resize-none focus:outline-none focus:border-din-teal/60"
              />
            </div>

            {/* GST Number field */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-din-text">
                GST No.
              </Label>
              <Input
                data-ocid="invoice_edit.input"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="e.g. 27AABCU9603R1ZX"
                className="h-7 text-xs bg-din-surface-alt border-din-border text-din-text uppercase"
              />
              <div className="flex items-center gap-2 mt-1">
                <Checkbox
                  id="save-gst-default"
                  data-ocid="invoice_edit.toggle"
                  checked={saveGstAsDefault}
                  onCheckedChange={(v) => setSaveGstAsDefault(v === true)}
                  className="border-din-border data-[state=checked]:bg-din-teal data-[state=checked]:border-din-teal"
                />
                <label
                  htmlFor="save-gst-default"
                  className="text-[11px] text-din-muted cursor-pointer"
                >
                  Save as today's default GST number
                </label>
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-din-text">
                Order Items
              </Label>
              {items.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="flex items-center gap-2 bg-din-surface-alt border border-din-border rounded-md px-3 py-2"
                >
                  <span className="flex-1 text-xs text-din-text truncate">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      data-ocid={`invoice_edit.secondary_button.${idx + 1}`}
                      onClick={() => updateQty(idx, -1)}
                      className="w-5 h-5 rounded bg-din-border hover:bg-din-muted/20 flex items-center justify-center text-din-muted"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-6 text-center text-xs text-din-text">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      data-ocid={`invoice_edit.secondary_button.${idx + 1}`}
                      onClick={() => updateQty(idx, 1)}
                      className="w-5 h-5 rounded bg-din-border hover:bg-din-muted/20 flex items-center justify-center text-din-muted"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={item.price}
                    onChange={(e) => updatePrice(idx, Number(e.target.value))}
                    className="w-20 h-6 text-xs bg-din-surface border-din-border text-din-text text-right px-1.5"
                  />
                  <button
                    type="button"
                    data-ocid={`invoice_edit.delete_button.${idx + 1}`}
                    onClick={() => removeItem(idx)}
                    className="w-5 h-5 flex items-center justify-center text-din-red/60 hover:text-din-red transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p
                  className="text-xs text-din-muted text-center py-2"
                  data-ocid="invoice_edit.empty_state"
                >
                  No items. Add items below.
                </p>
              )}
            </div>

            {/* Add new item */}
            <div className="border border-din-border/60 rounded-lg p-3 space-y-2">
              <Label className="text-xs font-semibold text-din-text">
                Add Item
              </Label>
              <div className="flex gap-2">
                <Input
                  data-ocid="invoice_edit.input"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name"
                  className="flex-1 h-7 text-xs bg-din-surface-alt border-din-border text-din-text"
                />
                <Input
                  type="number"
                  min={0}
                  value={newItemPrice || ""}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  placeholder="Price"
                  className="w-20 h-7 text-xs bg-din-surface-alt border-din-border text-din-text"
                />
                <Input
                  type="number"
                  min={1}
                  value={newItemQty}
                  onChange={(e) =>
                    setNewItemQty(Math.max(1, Number(e.target.value)))
                  }
                  placeholder="Qty"
                  className="w-14 h-7 text-xs bg-din-surface-alt border-din-border text-din-text"
                />
                <Button
                  data-ocid="invoice_edit.primary_button"
                  size="sm"
                  onClick={addNewItem}
                  disabled={!newItemName.trim() || newItemPrice <= 0}
                  className="h-7 text-xs px-2 bg-din-teal/20 border border-din-teal/40 text-din-teal hover:bg-din-teal/30"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Charges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-din-muted">
                  Packing Charges (\u20B9)
                </Label>
                <Input
                  data-ocid="invoice_edit.input"
                  type="number"
                  min={0}
                  value={packingCharge || ""}
                  onChange={(e) =>
                    setPackingCharge(Math.max(0, Number(e.target.value)))
                  }
                  placeholder="0"
                  className="h-7 text-xs bg-din-surface-alt border-din-border text-din-text"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-din-muted">
                  Delivery Charge (\u20B9)
                </Label>
                <Input
                  data-ocid="invoice_edit.input"
                  type="number"
                  min={0}
                  value={deliveryCharge || ""}
                  onChange={(e) =>
                    setDeliveryCharge(Math.max(0, Number(e.target.value)))
                  }
                  placeholder="0"
                  className="h-7 text-xs bg-din-surface-alt border-din-border text-din-text"
                />
              </div>
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-din-text flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-din-teal" />
                Discount
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex rounded-md border border-din-border overflow-hidden">
                  <button
                    type="button"
                    data-ocid="invoice_edit.toggle"
                    onClick={() => setDiscountType("flat")}
                    className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      discountType === "flat"
                        ? "bg-din-teal/20 text-din-teal"
                        : "text-din-muted hover:text-din-text"
                    }`}
                  >
                    \u20B9 Flat
                  </button>
                  <button
                    type="button"
                    data-ocid="invoice_edit.toggle"
                    onClick={() => setDiscountType("percent")}
                    className={`px-2.5 py-1 text-[11px] font-medium transition-colors border-l border-din-border ${
                      discountType === "percent"
                        ? "bg-din-teal/20 text-din-teal"
                        : "text-din-muted hover:text-din-text"
                    }`}
                  >
                    <Percent className="w-3 h-3 inline" /> %
                  </button>
                </div>
                <Input
                  data-ocid="invoice_edit.input"
                  type="number"
                  min={0}
                  max={discountType === "percent" ? 100 : undefined}
                  value={discountAmount || ""}
                  onChange={(e) =>
                    setDiscountAmount(Math.max(0, Number(e.target.value)))
                  }
                  placeholder={
                    discountType === "percent" ? "0\u2013100" : "Amount"
                  }
                  className="flex-1 h-7 text-xs bg-din-surface-alt border-din-border text-din-text"
                />
              </div>
            </div>

            {/* Totals preview */}
            <div className="bg-din-surface-alt border border-din-border rounded-lg p-3 space-y-1 text-xs">
              <div className="flex justify-between text-din-muted">
                <span>Items Total</span>
                <span>{fmt(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-din-muted">
                <span>SGST (2.5%)</span>
                <span>{fmt(sgst)}</span>
              </div>
              <div className="flex justify-between text-din-muted">
                <span>CGST (2.5%)</span>
                <span>{fmt(cgst)}</span>
              </div>
              {packingCharge > 0 && (
                <div className="flex justify-between text-din-muted">
                  <span>Packing</span>
                  <span>{fmt(packingCharge)}</span>
                </div>
              )}
              {deliveryCharge > 0 && (
                <div className="flex justify-between text-din-muted">
                  <span>Delivery</span>
                  <span>{fmt(deliveryCharge)}</span>
                </div>
              )}
              {discountValue > 0 && (
                <div className="flex justify-between text-din-green">
                  <span>
                    Discount
                    {discountType === "percent" ? ` (${discountAmount}%)` : ""}
                  </span>
                  <span>-{fmt(discountValue)}</span>
                </div>
              )}
              <div className="border-t border-din-border/60 pt-1.5 flex justify-between font-bold text-din-text">
                <span>Grand Total</span>
                <span className="text-din-teal">{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-2">
          <Button
            data-ocid="invoice_edit.secondary_button"
            variant="outline"
            onClick={handlePrint}
            className="border-din-border text-din-muted hover:bg-din-surface-alt h-8 text-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print
          </Button>
          <Button
            data-ocid="invoice_edit.cancel_button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 border-din-border text-din-muted hover:bg-din-surface-alt h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            data-ocid="invoice_edit.save_button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-din-teal hover:bg-din-teal/80 text-white font-semibold h-8 text-xs"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
