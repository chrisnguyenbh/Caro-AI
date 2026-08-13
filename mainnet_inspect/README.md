# MiniGame Hub — Pi Mainnet

This build is configured for the Pi Mainnet production app.

## Step 10: User-to-App payment

The frontend uses `Pi.createPayment()` and the backend exposes:
- `POST /api/approve`
- `POST /api/complete`
- `POST /api/cancel`
- `GET /api/health`

Set `PI_API_KEY` in Vercel to the API key shown in the **Mainnet Minigame** project in the Pi Developer Portal. Do not use a Testnet API key.

The production SDK is initialized with `sandbox: false`.

## Deploy

1. Upload/deploy this project to the production URL registered for the Mainnet app.
2. In Vercel, set `PI_API_KEY` for Production.
3. Redeploy after changing environment variables.
4. Open the app in Pi Browser.
5. Log in, then tap **Thanh toán 0.01 Pi**.
6. Pi Wallet should become interactive after server approval; confirm the transaction.
7. The app calls server completion after Pi provides the txid.

Check `/api/health` and confirm `network: "Pi Mainnet"`, `sandbox: false`, `configured: true`.

A2U reward code from the old Testnet build is intentionally not used for Step 10.

## Debug Approval build
This build intentionally exposes safe approval diagnostics in the UI and server response.
It never displays or logs `PI_API_KEY`.

When approval fails, note the `HTTP Pi` status and `Debug ID` shown in the payment status.
The server log for `/api/approve` also records the payment ID, upstream status, and duration, but never the API key.

Optional payment lookup after a failed attempt:
`GET /api/payment?paymentId=...`

Do not publish this debug build permanently. After the root cause is identified, replace `/api/approve` with the normal production handler and remove `/api/payment`.
