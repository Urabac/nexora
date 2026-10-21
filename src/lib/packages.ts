export interface InvestPackage {
  id: string;
  name: string;
  price: number;
  dailyRate: number;
  days: number;
  tag: string;
  accent: string;
}

export const PACKAGES: InvestPackage[] = [
  { id: "starter", name: "Starter", price: 20, dailyRate: 5, days: 42, tag: "Comienza fácil", accent: "from-sky-500 to-blue-700" },
  { id: "bronze", name: "Bronze", price: 60, dailyRate: 5, days: 42, tag: "Para constantes", accent: "from-amber-600 to-orange-800" },
  { id: "silver", name: "Silver", price: 120, dailyRate: 5, days: 42, tag: "Más popular", accent: "from-slate-300 to-slate-600" },
  { id: "gold", name: "Gold", price: 240, dailyRate: 5, days: 42, tag: "Recomendado", accent: "from-yellow-400 to-amber-700" },
  { id: "platinum", name: "Platinum", price: 360, dailyRate: 5, days: 42, tag: "Inversor pro", accent: "from-indigo-400 to-indigo-800" },
  { id: "diamond", name: "Diamond", price: 500, dailyRate: 5, days: 42, tag: "Élite", accent: "from-cyan-300 to-blue-700" },
];

export const totalReturn = (p: InvestPackage) => p.price * (p.dailyRate / 100) * p.days;
