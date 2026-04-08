import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Printer,
  QrCode,
  Star,
} from "lucide-react";
import { useState } from "react";

const APP_BASE = "https://dinki-dine-drive-in-pos-v3v.caffeine.xyz";

interface QREntry {
  id: string;
  label: string;
  description: string;
  url: string;
  icon: string;
  colorClass: string;
  borderClass: string;
  labelColorClass: string;
  featured?: boolean;
}

const QR_ENTRIES: QREntry[] = [
  {
    id: "landing",
    label: "Customer Landing Page",
    description:
      "The main QR code for your restaurant. Customers choose Dine-In, Drive-In, Takeaway, or View Menu from one beautiful page.",
    url: `${APP_BASE}/?mode=qrlanding`,
    icon: "⭐",
    colorClass: "bg-gradient-to-br from-orange-500/15 to-amber-500/10",
    borderClass: "border-orange-400/50",
    labelColorClass: "text-orange-400",
    featured: true,
  },
  {
    id: "dine-in",
    label: "Dine-In Customer Ordering",
    description: "Customers scan this QR code to order from their table.",
    url: `${APP_BASE}/?mode=customer`,
    icon: "🍽️",
    colorClass: "bg-teal-500/10",
    borderClass: "border-teal-500/30",
    labelColorClass: "text-teal-400",
  },
  {
    id: "drive-in",
    label: "Drive-In Self-Ordering",
    description:
      "Customers scan to place orders from their car. Car number required.",
    url: `${APP_BASE}/?mode=drivein`,
    icon: "🚗",
    colorClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
    labelColorClass: "text-yellow-400",
  },
  {
    id: "menu-only",
    label: "Menu Display (View Only)",
    description:
      "Browse-only menu — no ordering. Perfect for customers to check items before approaching the counter.",
    url: `${APP_BASE}/?mode=menuonly`,
    icon: "👁️",
    colorClass: "bg-orange-500/10",
    borderClass: "border-orange-500/30",
    labelColorClass: "text-orange-400",
  },
  {
    id: "unified",
    label: "Unified Order Page",
    description:
      "Single page for Drive-In, Takeaway, and Delivery — share with all customers.",
    url: `${APP_BASE}/?mode=order`,
    icon: "📱",
    colorClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    labelColorClass: "text-blue-400",
  },
];

function QRCard({ entry }: { entry: QREntry }) {
  const [copied, setCopied] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(entry.url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_e) {
      const el = document.createElement("textarea");
      el.value = entry.url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR – ${entry.label}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
            h1 { font-size: 20px; margin-bottom: 8px; }
            p { font-size: 13px; color: #555; margin-bottom: 20px; }
            img { width: 240px; height: 240px; margin: 0 auto; display: block; }
            .url { font-size: 11px; color: #888; margin-top: 12px; word-break: break-all; }
            .brand { font-size: 16px; font-weight: bold; color: #ea580c; margin-top: 16px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>${entry.icon} ${entry.label}</h1>
          <p>${entry.description}</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(entry.url)}" alt="QR Code" />
          <div class="url">${entry.url}</div>
          <div class="brand">Dinki Pos</div>
          <br/>
          <button class="no-print" onclick="window.print()" style="padding:8px 20px;font-size:14px;">Print</button>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div
      data-ocid="qr_codes.card"
      className={`rounded-xl border-2 p-4 flex flex-col gap-4 ${entry.colorClass} ${entry.borderClass} ${entry.featured ? "shadow-md" : ""}`}
    >
      {/* Label row */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{entry.icon}</span>
          <h3 className={`text-sm font-bold ${entry.labelColorClass} flex-1`}>
            {entry.label}
          </h3>
          {entry.featured && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5 flex-shrink-0">
              <Star className="w-2.5 h-2.5 fill-current" />
              Recommended
            </span>
          )}
        </div>
        <p className="text-xs text-din-muted leading-relaxed">
          {entry.description}
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div
          className={`bg-white rounded-xl p-3 shadow-sm ${entry.featured ? "ring-2 ring-orange-400/30" : ""}`}
        >
          <img
            src={qrUrl}
            alt={`QR for ${entry.label}`}
            width={180}
            height={180}
            className="rounded"
            loading="lazy"
          />
        </div>
      </div>

      {/* URL */}
      <p className="text-[10px] text-din-muted/70 break-all font-mono text-center">
        {entry.url}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          data-ocid="qr_codes.secondary_button"
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium bg-din-surface-alt border border-din-border text-din-muted hover:text-din-text hover:bg-din-surface transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy Link
            </>
          )}
        </button>
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="qr_codes.link"
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium bg-din-surface-alt border border-din-border text-din-muted hover:text-din-text hover:bg-din-surface transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </a>
        <button
          type="button"
          data-ocid="qr_codes.primary_button"
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium bg-din-surface-alt border border-din-border text-din-muted hover:text-din-text hover:bg-din-surface transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Print QR
        </button>
      </div>
    </div>
  );
}

interface QRCodesPanelProps {
  onBack: () => void;
}

export function QRCodesPanel({ onBack }: QRCodesPanelProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-din-surface border-b border-din-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            data-ocid="qr_codes.button"
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-din-surface-alt text-din-muted hover:text-din-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-din-teal" />
            <div>
              <h1 className="text-base font-bold text-din-text leading-none">
                QR Codes &amp; Customer Links
              </h1>
              <p className="text-[11px] text-din-muted mt-0.5">
                Print these for your restaurant
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Tip Banner */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
          <Star className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-din-muted leading-relaxed">
            <span className="font-semibold text-orange-400">Tip:</span> Print
            the <strong className="text-din-text">Customer Landing Page</strong>{" "}
            QR and place it on all tables and at the entrance. Customers can
            pick their ordering mode from one page.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QR_ENTRIES.map((entry) => (
            <QRCard key={entry.id} entry={entry} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-din-border py-3 px-4 text-center">
        <p className="text-[11px] text-din-muted">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-din-teal hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
