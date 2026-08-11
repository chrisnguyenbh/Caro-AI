# MiniGame Hub V3 — Pi Testnet A2U

MiniGame Hub gồm 5 game HTML5:

1. Elemental Core Shooter
2. Bubble Shooter
3. Maze Chase
4. Block Puzzle
5. 2048

Bản V3 bổ sung backend Vercel cho **Pi App-to-User (A2U) Testnet reward** để phục vụ yêu cầu Developer Checklist: paired Testnet app gửi A2U tới 5 unique wallets.

## Các file mới

- `api/a2u-reward.js` — xác minh Pi access token qua `/v2/me`, tạo A2U payment, submit lên Pi Testnet và complete payment.
- `api/health.js` — kiểm tra backend đã được cấu hình environment variables hay chưa, không tiết lộ secret.
- `package.json` — dùng package chính thức `pi-backend`.
- `privacy.html` — Privacy Policy URL.
- `terms.html` — Terms of Service URL.
- `.env.example` — chỉ là tên biến mẫu, không chứa secret thật.

## Bảo mật

**Không bao giờ** đặt API Key hoặc App Wallet Private Seed trong HTML/JS frontend hay commit lên GitHub.

Các secret phải được cấu hình tại Vercel:

`Project > Settings > Environment Variables`

Thêm 4 biến:

- `PI_API_KEY` = API Key của **paired Testnet app**.
- `PI_WALLET_PRIVATE_SEED` = private seed của **Testnet App Wallet** (chuỗi bắt đầu bằng `S`, không phải passphrase ví cá nhân).
- `A2U_TEST_CODE` = mã tạm do bạn tự đặt, ví dụ một chuỗi khó đoán. Tester phải nhập mã này trước khi nhận Test-Pi.
- `A2U_TEST_AMOUNT` = `0.01` (khuyên dùng lượng Test-Pi nhỏ).

Sau khi thêm/sửa Environment Variables, redeploy Vercel.

## Test backend

Mở:

`https://<domain-vercel-cua-ban>/api/health`

Kết quả mong đợi:

```json
{"ok":true,"mode":"Pi Testnet A2U","configured":true,"codeRequired":true}
```

Nếu `configured:false`, chưa cấu hình đủ `PI_API_KEY` hoặc `PI_WALLET_PRIVATE_SEED`.

## Flow test 5 unique wallets

1. App vẫn giữ `sandbox: true` trong `assets/pi.js`.
2. Mở app qua Pi Developer Sandbox của **paired Testnet app**.
3. Tester đăng nhập Pi.
4. Nhập `A2U_TEST_CODE` vào ô Testnet A2U Reward.
5. Bấm **Nhận Test-Pi**.
6. Chờ trạng thái `✅` và transaction ID.
7. Lặp lại bằng 4 tài khoản Pi/Testnet wallet khác, tổng cộng 5 unique wallets.
8. Quay lại Mainnet app > Apply for Mainnet App Wallet và kiểm tra requirement.

## Privacy / Terms URLs

Sau deploy:

- `https://<domain>/privacy.html`
- `https://<domain>/terms.html`

Có thể điền Privacy Policy URL vào form Apply Mainnet App Wallet.

## Lưu ý

- A2U hiện được dùng cho Testnet checklist. Không thay `sandbox: true` thành `false` trong giai đoạn này.
- Backend xác minh access token bằng Pi `/v2/me` trước khi dùng uid.
- Endpoint reward giới hạn amount server-side tối đa 0.1 Pi; mặc định 0.01 Test-Pi.
- Endpoint có cơ chế tiếp tục một incomplete A2U test payment nếu lần gọi trước bị gián đoạn.
- Bản demo không có database dài hạn để chống claim lặp tuyệt đối. Giữ `A2U_TEST_CODE` riêng tư và chỉ bật trong thời gian test checklist.
