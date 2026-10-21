import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { cutoffKey, cutoffsPassed, newAccount, payoutValues, purchaseValues } from "./firebase-domain";

const PROJECT = "atelier-536a6";
const ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const NAME_ROOT = ROOT.slice("https://firestore.googleapis.com/v1/".length);
type Fields = Record<string, { stringValue?: string; doubleValue?: number; integerValue?: string; timestampValue?: string }>;
function fields(data: Record<string, string | number>): Fields {
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === "number" ? { doubleValue: v } : { stringValue: v }]));
}
function decode(data: { fields?: Fields }) {
  return Object.fromEntries(Object.entries(data.fields ?? {}).map(([k, v]) => [k, v.stringValue ?? v.doubleValue ?? (v.integerValue ? Number(v.integerValue) : v.timestampValue)]));
}
async function responseJson(response: Response) {
  const json = await response.json();
  if (!response.ok) {
    const code = json.error?.message ?? json.error?.status ?? "";
    if (code.includes("PERMISSION_DENIED")) throw new Error("Firestore no permite esta operación. Revisa las reglas de acceso del proyecto Firebase.");
    if (code.includes("CONFIGURATION_NOT_FOUND") || code.includes("OPERATION_NOT_ALLOWED")) throw new Error("Activa el acceso por correo y contraseña en Firebase Authentication.");
    if (code.includes("EMAIL_EXISTS")) throw new Error("Este correo ya tiene una cuenta. Inicia sesión.");
    if (code.includes("INVALID_LOGIN_CREDENTIALS") || code.includes("INVALID_PASSWORD") || code.includes("EMAIL_NOT_FOUND")) throw new Error("Correo o contraseña incorrectos.");
    if (code.includes("API_KEY_INVALID")) throw new Error("La clave guardada no es válida para Firebase Authentication.");
    throw new Error("Firebase no pudo completar la operación. Comprueba la configuración del proyecto e inténtalo de nuevo.");
  }
  return json;
}
async function identity(key: string, action: string, body: object) {
  return responseJson(await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${encodeURIComponent(key)}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  }));
}
async function firestore(token: string, path: string, method = "GET", body?: object) {
  return responseJson(await fetch(`${ROOT}${path}`, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }));
}
async function verify(key: string) {
  const header = getRequestHeader("Authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("Inicia sesión para continuar.");
  const token = header.slice(7);
  const result = await identity(key, "lookup", { idToken: token });
  const user = result.users?.[0];
  if (!user?.localId) throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
  return { token, uid: String(user.localId), email: String(user.email) };
}
async function ensureAccount(token: string, uid: string, email: string) {
  const response = await fetch(`${ROOT}/users/${uid}`, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status !== 404) return responseJson(response);
  const result = await fetch(`${ROOT}/users?documentId=${encodeURIComponent(uid)}`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: fields(newAccount(uid, email, new Date().toISOString())) }),
  });
  if (result.status === 409) return firestore(token, `/users/${uid}`);
  return responseJson(result);
}
export const firebaseAuthenticate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ email: z.string().trim().email(), password: z.string().min(6), register: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env["GOOGLE_API_KEY"];
    if (!key) throw new Error("Falta la clave de Firebase guardada.");
    const result = await identity(key, data.register ? "signUp" : "signInWithPassword", { email: data.email, password: data.password, returnSecureToken: true });
    // Never navigate until the mandatory Firestore document exists. Login repairs partial registrations.
    await ensureAccount(result.idToken, result.localId, result.email);
    return { user: { id: result.localId as string, uid: result.localId as string, email: result.email as string }, idToken: result.idToken as string, refreshToken: result.refreshToken as string, expiresAt: Date.now() + Number(result.expiresIn) * 1000 };
  });
export const firebaseRefresh = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ refreshToken: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env["GOOGLE_API_KEY"];
    if (!key) throw new Error("Firebase indisponible.");
    const result = await responseJson(await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(key)}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: data.refreshToken }).toString() }));
    return { idToken: result.id_token as string, refreshToken: result.refresh_token as string, expiresAt: Date.now() + Number(result.expires_in) * 1000 };
  });
export const firebaseDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["GOOGLE_API_KEY"];
  if (!key) throw new Error("Firebase indisponible.");
  const { token, uid, email } = await verify(key);
  const account = decode(await ensureAccount(token, uid, email));
  const query = async (collection: string, field: string) => {
    const rows = await firestore(token, ":runQuery", "POST", { structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: { stringValue: uid } } } } });
    return rows.filter((r: { document?: object }) => r.document).map((r: { document: { name: string; fields: Fields } }) => ({ ...decode(r.document), id: r.document.name.split("/").pop() }));
  };
  const [subscriptions, deposits] = await Promise.all([query("subscriptions", "userId"), query("deposits", "userId")]);
  const enriched = subscriptions.map((s: Record<string, string | number>) => {
    const amountInvested = Number(s.amountInvested ?? 0);
    const dailyReturn = Number(s.dailyReturn ?? amountInvested * 0.05);
    const daysCompleted = Math.min(42, Number(s.daysPaid ?? cutoffsPassed(String(s.createdAt))));
    const earned = dailyReturn * daysCompleted;
    return { ...s, earned, daysCompleted };
  });
  return {
    availableBalance: Number(account.availableBalance ?? account.balance ?? 0),
    lockedBalance: Number(account.lockedBalance ?? 0),
    earned: enriched.reduce((sum: number, s: { earned: number }) => sum + s.earned, 0),
    subscriptions: enriched as Record<string, string | number>[],
    deposits: deposits as Record<string, string | number>[],
  };
});
export const firebasePurchase = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ packageId: z.string(), purchaseId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env["GOOGLE_API_KEY"];
    if (!key) throw new Error("Firebase indisponible.");
    const { token, uid } = await verify(key);
    const id = `${uid}_${data.purchaseId}`;
    const previous = await fetch(`${ROOT}/subscriptions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (previous.ok) return { ok: true };
    if (previous.status !== 404) await responseJson(previous);
    const account = await firestore(token, `/users/${uid}`);
    const decoded = decode(account);
    const purchase = purchaseValues(Number(decoded.availableBalance ?? decoded.balance ?? 0), Number(decoded.lockedBalance ?? 0), data.packageId);
    const subscription = { userId: uid, packageName: purchase.pkg.name, amountInvested: purchase.pkg.min_amount, dailyReturn: purchase.dailyReturn, status: "active", createdAt: new Date().toISOString(), lastProfitUpdate: "", daysPaid: 0 };
    await firestore(token, ":commit", "POST", { writes: [
      { update: { name: `${NAME_ROOT}/users/${uid}`, fields: fields({ availableBalance: purchase.availableBalance, lockedBalance: purchase.lockedBalance, lastSubscriptionId: id }) }, updateMask: { fieldPaths: ["availableBalance", "lockedBalance", "lastSubscriptionId"] }, currentDocument: { updateTime: account.updateTime } },
      { update: { name: `${NAME_ROOT}/subscriptions/${id}`, fields: fields(subscription) }, currentDocument: { exists: false } },
    ] });
    return { ok: true };
  });
export const firebaseDeposit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ amount: z.number().finite().positive(), reference: z.string().trim().min(6) }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env["GOOGLE_API_KEY"];
    if (!key) throw new Error("Firebase indisponible.");
    const { token, uid, email } = await verify(key);
    await firestore(token, "/deposits", "POST", { fields: fields({ userId: uid, userEmail: email, amount: data.amount, reference: data.reference, status: "pending", createdAt: new Date().toISOString() }) });
    return { ok: true };
  });
// Development-only manual run of the fixed 8:00 PM (UTC-4) payout cutoff.
export const firebaseSimulateCutoff = createServerFn({ method: "POST" }).handler(async () => {
  if (!import.meta.env.DEV) throw new Error("La simulación solo está disponible en desarrollo.");
  const key = process.env["GOOGLE_API_KEY"];
  if (!key) throw new Error("Firebase indisponible.");
  const { token, uid } = await verify(key);
  const account = await firestore(token, `/users/${uid}`);
  const decoded = decode(account);
  const rows = await firestore(token, ":runQuery", "POST", { structuredQuery: { from: [{ collectionId: "subscriptions" }], where: { fieldFilter: { field: { fieldPath: "userId" }, op: "EQUAL", value: { stringValue: uid } } } } });
  const subscriptions = rows.filter((r: { document?: object }) => r.document).map((r: { document: { name: string; fields: Fields } }) => ({ ...decode(r.document), id: r.document.name.split("/").pop() as string }));
  let available = Number(decoded.availableBalance ?? decoded.balance ?? 0);
  let locked = Number(decoded.lockedBalance ?? 0);
  let credited = 0;
  const now = Date.now();
  for (const s of subscriptions) {
    if (s.status !== "active") continue;
    const amountInvested = Number(s.amountInvested ?? 0);
    const dailyReturn = Number(s.dailyReturn ?? amountInvested * 0.05);
    const payout = payoutValues(available, locked, amountInvested, dailyReturn, Number(s.daysPaid ?? 0), now, String(s.createdAt), 1);
    if (payout.due <= 0 || payout.amount <= 0) continue;
    available = payout.availableBalance;
    locked = payout.lockedBalance;
    credited += payout.amount;
    await firestore(token, `:commit`, "POST", { writes: [
      { update: { name: `${NAME_ROOT}/users/${uid}`, fields: fields({ availableBalance: available, lockedBalance: locked }) }, updateMask: { fieldPaths: ["availableBalance", "lockedBalance"] } },
      { update: { name: `${NAME_ROOT}/subscriptions/${s.id}`, fields: fields({ lastProfitUpdate: cutoffKey(now), daysPaid: payout.daysPaid, status: payout.status }) }, updateMask: { fieldPaths: ["lastProfitUpdate", "daysPaid", "status"] } },
    ] });
  }
  return { ok: true, credited, cutoff: cutoffKey(now) };
});
