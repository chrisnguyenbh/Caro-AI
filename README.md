# MiniGame Hub V3.1 — Pi Testnet A2U (No Test Code)

MiniGame Hub gồm 5 game HTML5 và backend Vercel để thử **Pi App-to-User (A2U) trên Testnet**.

## Environment Variables cần trên Vercel

Chỉ còn 3 biến:

- `PI_API_KEY` = API Key của paired Testnet app.
- `PI_WALLET_PRIVATE_SEED` = private seed của Testnet App Wallet.
- `A2U_TEST_AMOUNT` = `0.01`.

Không còn `A2U_TEST_CODE`, nên người test không phải nhập mã.

## Bảo mật

- Không commit API Key hoặc Private Seed lên GitHub.
- Chỉ đặt secret trong Vercel > Settings > Environment Variables.
- Endpoint vẫn bắt buộc người dùng có Pi access token hợp lệ và backend xác minh token qua `/v2/me`.
- Đây là bản phục vụ Testnet checklist. Không dùng như cơ chế phát thưởng production công khai.

## Test

Sau khi cấu hình Environment Variables và redeploy:

`https://<domain>/api/health`

Kết quả mong đợi:

```json
{"ok":true,"mode":"Pi Testnet A2U","configured":true}
```

Sau đó mở app qua Developer Sandbox của paired Testnet app, đăng nhập Pi và bấm nút nhận Test-Pi.

Lặp lại với 5 tài khoản/Testnet wallet khác nhau để đáp ứng điều kiện 5 unique wallets.
