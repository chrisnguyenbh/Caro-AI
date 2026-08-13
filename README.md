# MiniGame Hub V3.2 — Pi Testnet Developer Checklist

MiniGame Hub gồm 5 game HTML5 và hai flow thanh toán Testnet:

1. **User-to-App (U2A)** — flow chính để hoàn thành Developer Checklist: frontend gọi `Pi.createPayment()`, server approval, người dùng xác nhận trong Pi Wallet, rồi server completion.
2. **App-to-User (A2U)** — flow reward cũ được giữ riêng để thử app gửi Test-Pi cho user.

Theo Pi Developer Guide, bước **“Process a transaction on your app”** yêu cầu app xử lý một **User-to-App Pi Transaction**. Vì vậy nút `Thanh toán 0.01 Test-Pi` mới là nút dùng cho checklist; A2U không thay thế bước này.

## Environment Variables trên Vercel

- `PI_API_KEY` = API Key của paired Testnet app.
- `PI_WALLET_PRIVATE_SEED` = private seed của Testnet App Wallet (chỉ cần cho A2U reward).
- `A2U_TEST_AMOUNT` = `0.01` (tùy chọn).

Không commit API Key hoặc private seed vào GitHub.

## Cách test Step 10

1. Deploy project lên production URL đã cấu hình trong Developer Portal.
2. Mở đúng app đó bằng **Pi Browser / Developer Sandbox**.
3. Bấm **Đăng nhập Pi** và cấp quyền `username` + `payments`.
4. Bấm **Thanh toán 0.01 Test-Pi**.
5. Pi Wallet sẽ mở payment sheet.
6. Xác nhận giao dịch bằng Test-Pi.
7. SDK gọi `/api/approve` khi payment sẵn sàng để server approval.
8. Sau khi người dùng gửi transaction lên blockchain, SDK gọi `/api/complete` với `paymentId` + `txid`.
9. Chờ trạng thái giao dịch hoàn tất rồi quay lại Developer Portal kiểm tra bước 10.

## Kiểm tra backend

`https://<domain>/api/health`

Kết quả mong đợi:

```json
{"ok":true,"mode":"Pi Testnet A2U","configured":true}
```

Lưu ý: endpoint health hiện kiểm tra cấu hình A2U nên có thể yêu cầu `PI_WALLET_PRIVATE_SEED`. Nếu bạn chỉ test U2A, `PI_API_KEY` là secret quan trọng cho `/api/approve` và `/api/complete`.
