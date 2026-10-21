import { describe, expect, it } from "vitest";
import { FIREBASE_PACKAGES, cutoffKey, cutoffsPassed, newAccount, nextCutoff, payoutValues, purchaseValues } from "./firebase-domain";
describe("Firebase financial rules", () => {
  it("creates the account with zero available and locked balances and the auth UID", () => {
    expect(newAccount("auth-uid", "user@example.com", "2026-10-21")).toEqual({ uid: "auth-uid", email: "user@example.com", availableBalance: 0, lockedBalance: 0, createdAt: "2026-10-21" });
  });
  it("offers the six requested prices", () => { expect(FIREBASE_PACKAGES.map(p => p.min_amount)).toEqual([20, 60, 120, 240, 360, 500]); });
  it("requires enough available balance", () => { expect(() => purchaseValues(19, 0, "starter")).toThrow("Saldo insuficiente"); });
  it("moves the package price from available to locked", () => {
    const result = purchaseValues(70, 20, "bronze");
    expect(result.availableBalance).toBe(10);
    expect(result.lockedBalance).toBe(80);
  });
  it("calculates five percent of principal daily", () => { expect(purchaseValues(120, 0, "silver").dailyReturn).toBe(6); });
  it("uses forty-two days for every package", () => { expect(FIREBASE_PACKAGES.map(p => p.duration_days)).toEqual([42, 42, 42, 42, 42, 42]); });
  it("targets the next 8:00 PM Venezuela cutoff (00:00 UTC next day)", () => {
    expect(nextCutoff(new Date("2026-10-21T04:07:00Z").getTime())).toBe(new Date("2026-10-22T00:00:00Z").getTime());
    expect(nextCutoff(new Date("2026-10-21T23:30:00Z").getTime())).toBe(new Date("2026-10-22T00:00:00Z").getTime());
    expect(nextCutoff(new Date("2026-10-22T05:00:00Z").getTime())).toBe(new Date("2026-10-23T00:00:00Z").getTime());
  });
  it("names the most recent cutoff by its Venezuela date", () => {
    expect(cutoffKey(new Date("2026-10-22T05:00:00Z").getTime())).toBe("2026-10-21");
  });
  it("counts only fixed cutoffs, never rolling 24-hour windows", () => {
    const now = new Date("2026-10-22T05:00:00Z").getTime();
    expect(cutoffsPassed("2026-10-20T05:00:00Z", now)).toBe(2);
    expect(cutoffsPassed("2026-10-21T05:00:00Z", now)).toBe(1);
    expect(cutoffsPassed("2026-10-22T02:00:00Z", now)).toBe(0);
    expect(cutoffsPassed("2026-10-22T04:30:00Z", now)).toBe(0);
  });
  it("moves the daily five percent from locked to available", () => {
    const now = new Date("2026-10-22T05:00:00Z").getTime();
    const result = payoutValues(10, 120, 120, 6, 0, now, "2026-10-21T05:00:00Z");
    expect(result.due).toBe(1);
    expect(result.amount).toBe(6);
    expect(result.availableBalance).toBe(16);
    expect(result.lockedBalance).toBe(114);
    expect(result.daysPaid).toBe(1);
    expect(result.status).toBe("active");
  });
  it("never pays more than the locked balance holds", () => {
    const now = new Date("2026-10-22T05:00:00Z").getTime();
    const result = payoutValues(0, 3, 120, 6, 0, now, "2026-10-21T05:00:00Z");
    expect(result.amount).toBe(3);
    expect(result.lockedBalance).toBe(0);
  });
  it("completes the subscription after forty-two paid days", () => {
    const now = new Date("2026-12-10T05:00:00Z").getTime();
    const result = payoutValues(0, 500, 500, 25, 41, now, "2026-10-20T05:00:00Z");
    expect(result.due).toBe(1);
    expect(result.daysPaid).toBe(42);
    expect(result.status).toBe("completed");
  });
});
