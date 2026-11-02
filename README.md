# Đi đâu cùng nhau — NHTC

Website so sánh tour, bảng so sánh, tính ngân sách. Xem tour không cần đăng nhập. Bình chọn bằng Google Workspace `@nhtc.com.vn`.

## Đăng nhập Google (bắt buộc để vote)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → tạo OAuth client loại **Web application**.
2. Authorized JavaScript origins: `http://localhost:3000` và domain Vercel.
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<domain-vercel>/api/auth/callback/google`
4. OAuth consent: nếu workspace NHTC cho phép, chọn **Internal** (chỉ mail `@nhtc.com.vn`).
5. Điền `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET` vào `.env.local` và Vercel Environment Variables. Tạo secret: `npx auth secret`.

Mail không phải `@nhtc.com.vn` sẽ bị từ chối dù Google xác thực thành công.

## Phiếu cả nhóm trên Vercel

Local: phiếu ghi `data/votes.json`. Vercel filesystem không giữ được — vào project Vercel → **Storage → Create KV**, rồi Redeploy. Biến `KV_REST_API_URL` / `KV_REST_API_TOKEN` được gắn sẵn.

## Đưa lên Vercel

1. Push repo `https://github.com/DangLy1102/tour_tb_nhtc.git`.
2. Vercel → Import, Node 22.x.
3. Environment Variables: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_TRUST_HOST=true`.
4. (Khuyến nghị) Storage → KV để tổng phiếu cả nhóm.

## Chạy trên máy

```sh
npm ci
npm run dev
```
