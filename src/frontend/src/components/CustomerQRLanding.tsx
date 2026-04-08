import {
  Car,
  ChevronRight,
  MapPin,
  ShoppingBag,
  Truck,
  Utensils,
} from "lucide-react";

const APP_BASE = "https://dinki-dine-drive-in-pos-v3v.caffeine.xyz";

interface LandingCard {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  url: string;
  gradient: string;
  iconBg: string;
}

const CARDS: LandingCard[] = [
  {
    icon: <Utensils className="w-7 h-7" />,
    emoji: "🍽️",
    title: "Dine-In Order",
    subtitle: "Order from your table — pick your table and browse the menu",
    url: `${APP_BASE}/?mode=customer`,
    gradient: "from-orange-500 to-orange-400",
    iconBg: "bg-orange-100 text-orange-600",
  },
  {
    icon: <Car className="w-7 h-7" />,
    emoji: "🚗",
    title: "Drive-In Order",
    subtitle: "Order from your car — just enter your car number",
    url: `${APP_BASE}/?mode=drivein`,
    gradient: "from-amber-500 to-amber-400",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    icon: <ShoppingBag className="w-7 h-7" />,
    emoji: "🛍️",
    title: "Takeaway / Delivery",
    subtitle: "Order for pickup or home delivery",
    url: `${APP_BASE}/?mode=order`,
    gradient: "from-green-500 to-emerald-400",
    iconBg: "bg-green-100 text-green-600",
  },
  {
    icon: <Truck className="w-7 h-7" />,
    emoji: "📋",
    title: "View Menu Only",
    subtitle: "Browse our full menu without placing an order",
    url: `${APP_BASE}/?mode=menuonly`,
    gradient: "from-blue-500 to-blue-400",
    iconBg: "bg-blue-100 text-blue-600",
  },
];

export function CustomerQRLanding() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 text-white px-5 pt-10 pb-14 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-sm mx-auto text-center">
          {/* Logo mark */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-none mb-1">
            Dinki Pos
          </h1>
          <p className="text-orange-100 text-sm font-medium">
            Dine-In · Drive-In · Takeaway · Delivery
          </p>

          <div className="mt-5 inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            Kitchen Open — Order Now
          </div>
        </div>
      </div>

      {/* Welcome card that overlaps hero */}
      <div className="relative max-w-sm mx-auto w-full px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Welcome to</p>
            <p className="text-sm font-bold text-gray-800">
              Dinki Pos Restaurant
            </p>
          </div>
        </div>
      </div>

      {/* Order Type Cards */}
      <main className="flex-1 max-w-sm mx-auto w-full px-4 py-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
          How would you like to order?
        </p>

        <div className="space-y-3">
          {CARDS.map((card) => (
            <a
              key={card.url}
              href={card.url}
              data-ocid="qr_landing.card"
              className="group block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-center p-4 gap-4">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg} group-hover:scale-105 transition-transform`}
                >
                  {card.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{card.emoji}</span>
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {card.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                {/* Arrow */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${card.gradient} text-white group-hover:scale-110 transition-transform shadow-sm`}
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Scan a category QR or tap above to start your order
        </p>
      </main>

      {/* Footer */}
      <footer className="py-5 px-4 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Powered by Dinki Pos · © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
