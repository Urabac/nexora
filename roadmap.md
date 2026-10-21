# Firebase integration
- [x] Connect Firebase Auth registration/login and mandatory users/{uid} creation; real registration reads back a zero-balance account.
- [x] Read Firestore balances and subscriptions; implement atomic package purchase and insufficient-balance validation.
- [x] Keep deposit requests for independent external approval; remove all internal administration.
- [x] Add security rules and six financial tests; verify registration, dashboard readback, insufficient-balance rejection, and removed admin pages.
- [x] Restructure Firestore data: users availableBalance/lockedBalance, subscriptions userId/packageName/amountInvested, deposits reference field; rules, server functions, UI and tests updated.
- [x] Fixed 8:00 PM VET daily cutoff: 5% moves from lockedBalance to availableBalance, lastProfitUpdate stamped, dashboard countdown, dev-only simulate button; 12 tests passing, verified in preview.
- [ ] Deploy and verify the restrictive Firestore rules — blocked: no Firebase deployment authorization.
- [ ] Verify a funded purchase and external balance credits — blocked: no funded Firebase test account or external payment-system access.
- [ ] Schedule the real daily 8:00 PM VET payout run (external system or cron) — the simulate function is development-only.
