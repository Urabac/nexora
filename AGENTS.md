# Architecture
- Firebase Authentication and Firestore are the source of truth for customer identity and finances; existing Cloud data is not merged into Firebase balances.
- Firebase REST calls run inside server functions with the saved API key; user ID tokens authorize Firestore requests under its security rules, without exposing the saved key.
- Package purchases commit the account deduction and subscription together with version preconditions and an idempotency ID; rules must validate the corresponding paired writes.
- Payment approval and daily balance credits belong to the independent external payment system; no administrative UI or privileged approval endpoints exist in this app.
- The unused generated Cloud server client is excluded from the TypeScript project because Firebase replaced its consumers; do not modify generated integration files.