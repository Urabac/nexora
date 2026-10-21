export const FIREBASE_PACKAGES = [
  { id: "starter", name: "Starter", min_amount: 20, daily_interest: 0.05, duration_days: 42 },
  { id: "bronze", name: "Bronze", min_amount: 60, daily_interest: 0.05, duration_days: 42 },
  { id: "silver", name: "Silver", min_amount: 120, daily_interest: 0.05, duration_days: 42 },
  { id: "gold", name: "Gold", min_amount: 240, daily_interest: 0.05, duration_days: 42 },
  { id: "platinum", name: "Platinum", min_amount: 360, daily_interest: 0.05, duration_days: 42 },
  { id: "diamond", name: "Diamond", min_amount: 500, daily_interest: 0.05, duration_days: 42 },
];

// Daily payout cutoff: 8:00 PM Venezuela (UTC-4) = 00:00 UTC of the next day.
const VET_OFFSET_MS = 4 * 3600000;
const DAY_MS = 86400000;

export function nextCutoff(now = Date.now()) {
  return Math.ceil(now / DAY_MS) * DAY_MS;
}
export function cutoffKey(now = Date.now()) {
  // VET calendar date of the most recent 8:00 PM cutoff.
  return new Date(nextCutoff(now) - DAY_MS - VET_OFFSET_MS).toISOString().slice(0, 10);
}
export function cutoffsPassed(createdAt: string, now = Date.now()) {
  const count = Math.floor(now / DAY_MS) - Math.floor(new Date(createdAt).getTime() / DAY_MS);
  return Math.min(42, Math.max(0, count));
}
export function payoutValues(availableBalance: number, lockedBalance: number, amountInvested: number, dailyReturn: number, daysPaid: number, now = Date.now(), createdAt = "", minimumDue = 0) {
  const due = Math.min(42 - daysPaid, Math.max(minimumDue, cutoffsPassed(createdAt, now) - daysPaid));
  const amount = Math.max(0, Math.min(dailyReturn * due, lockedBalance, amountInvested * 0.05 * 42 - daysPaid * dailyReturn));
  const paid = daysPaid + Math.max(0, due);
  return {
    due,
    amount,
    availableBalance: availableBalance + amount,
    lockedBalance: lockedBalance - amount,
    daysPaid: paid,
    status: paid >= 42 ? "completed" : "active",
  };
}
export function purchaseValues(availableBalance: number, lockedBalance: number, packageId: string) {
  const pkg = FIREBASE_PACKAGES.find(p => p.id === packageId);
  if (!pkg) throw new Error("Paquete no disponible.");
  if (!Number.isFinite(availableBalance) || availableBalance < pkg.min_amount) throw new Error(`Saldo insuficiente. Necesitas ${pkg.min_amount} USDT.`);
  return { pkg, availableBalance: availableBalance - pkg.min_amount, lockedBalance: lockedBalance + pkg.min_amount, dailyReturn: pkg.min_amount * 0.05 };
}
export function newAccount(uid: string, email: string, createdAt: string) {
  return { uid, email, availableBalance: 0, lockedBalance: 0, createdAt };
}
