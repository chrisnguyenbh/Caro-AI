# MiniGame Hub — Pi Mainnet / Step 10 Debug

This package is arranged for Vercel with `api/` at the repository root.

## Mainnet U2A flow

1. `Pi.init({ version: "2.0", sandbox: false })`
2. `Pi.authenticate(["username", "payments"], ...)`
3. `Pi.createPayment(...)`
4. `onReadyForServerApproval(paymentId)` -> `POST /api/approve`
5. Pi Wallet signs the transaction
6. `onReadyForServerCompletion(paymentId, txid)` -> `POST /api/complete`

## Debug routes

- `GET /api/health`
- `GET /api/pi-key-test` — tests whether the configured key is accepted by Pi without exposing it.
- `GET /api/payment?paymentId=...` — fetches one payment using the server key.

The `/api/approve` response includes `debugId`, `paymentId`, Pi HTTP status, response body, and duration. Never put the API key or wallet seed in frontend code or GitHub.

## Vercel

Set `PI_API_KEY` in Vercel Production Environment Variables to the **Mainnet** API key for this app, then redeploy.
