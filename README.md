# Đi đâu cùng nhau — NHTC

Website so sánh 7 tour, lịch trình, bảng so sánh tối đa 4 tour, tính ngân sách và bình chọn trên trình duyệt.

Không cần database, SMTP hay biến môi trường. Phiếu lưu trên từng máy; muốn tổng phiếu cả nhóm thì mới cần database.

## Đưa lên Vercel

1. Push repo `https://github.com/DangLy1102/tour_tb_nhtc.git`.
2. Vercel → Add New → Project → Import repo đó.
3. Preset **Next.js**, Node 22.x. Install `npm ci`, Build `npm run build`.
4. Deploy. Không điền Environment Variables.

## Chạy trên máy

```sh
npm ci
npm run dev
```
