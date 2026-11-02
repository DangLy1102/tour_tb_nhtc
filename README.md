# Đi đâu cùng nhau — bản Vercel cho NHTC

Mã nguồn đầy đủ của website so sánh 7 tour, lịch trình, bảng so sánh tối đa 4 tour, tính ngân sách và bình chọn chung.

## Bản chuyển đổi

- Next.js App Router chạy trực tiếp trên Vercel; không dùng Vinext/Cloudflare Workers/D1.
- PostgreSQL lưu phiếu, mã đăng nhập và phiên đăng nhập bền vững. Khuyên dùng Neon qua Vercel Marketplace.
- Đăng nhập bằng mã 6 chữ số gửi qua SMTP. Chỉ email có domain chính xác `nhtc.com.vn` được chấp nhận.
- Một email có một phiếu. Đổi phiếu dùng UPSERT nguyên tử; rút phiếu xóa đúng phiếu của email đang đăng nhập.
- API không tin email, voter ID hay header danh tính do trình duyệt gửi. Danh tính lấy từ phiên cookie HttpOnly trên máy chủ.
- Mã đăng nhập có hạn 10 phút, dùng một lần, khóa sau 5 lần nhập sai; giới hạn gửi lại 60 giây, 5 lần/email/giờ và 20 lần/IP/giờ.
- Tài liệu PDF cũng yêu cầu đăng nhập. Kết quả chung không công khai email người bình chọn.

## 1. Đưa mã nguồn vào GitHub

1. Giải nén toàn bộ gói này.
2. Tạo repository GitHub riêng, ví dụ `di-dau-tour-nhtc`.
3. Upload nội dung bên trong thư mục dự án vào gốc repository. `package.json` phải ở gốc.
4. Bao gồm `.gitignore`, `.env.example`, ảnh và thư mục `sources` chứa 4 PDF.
5. Không upload `.env.local`, `node_modules`, `.next` hoặc bất kỳ mật khẩu thật nào.

## 2. Tạo project Vercel

1. Vercel → Add New/Create New → Project → Import repository GitHub vừa tạo.
2. Project Name: `di-dau-tour-nhtc` hoặc một tên còn trống.
3. Framework Preset: **Next.js**; Root Directory: gốc repository.
4. Install Command: `npm ci`; Build Command: `npm run build`; Output Directory: để mặc định Next.js, KHÔNG nhập `public` hoặc `dist`.
5. Node.js 22.x hoặc 24.x. Các cài đặt có sẵn trong `vercel.json`.
6. Có thể deploy giao diện đăng nhập trước, nhưng đăng nhập/bình chọn chỉ hoạt động sau khi làm các bước database và SMTP dưới đây.

## 3. Database PostgreSQL

1. Trong project Vercel → Storage/Marketplace → chọn Neon Postgres và kết nối vào project. Xem gói/phí nhà cung cấp trước khi xác nhận.
2. Đảm bảo biến `DATABASE_URL` được thêm cho Production và Development (Preview nếu cần).
3. Trong SQL Editor của database, chạy toàn bộ nội dung `scripts/schema.sql` một lần.
4. Hoặc từ máy đã cài Node, tạo `.env.local` rồi chạy `npm run db:migrate`.
5. Dùng connection URL có TLS theo yêu cầu nhà cung cấp; không tắt xác minh chứng chỉ.

Schema tạo bằng `IF NOT EXISTS`, không xóa dữ liệu đang có. Các lần sửa schema sau cần migration có kiểm soát. Các phiếu ở website ChatGPT Sites cũ KHÔNG tự chuyển sang database mới.

## 4. Cấu hình biến môi trường

Vercel → Project → Settings → Environment Variables:

| Tên | Nội dung |
| --- | --- |
| `DATABASE_URL` | Connection URL PostgreSQL của Neon/nhà cung cấp |
| `ALLOWED_EMAIL_DOMAIN` | `nhtc.com.vn` |
| `AUTH_SECRET` | Chuỗi ngẫu nhiên từ 32 ký tự trở lên |
| `SMTP_HOST` | Máy chủ SMTP gửi email |
| `SMTP_PORT` | `587` (STARTTLS) hoặc `465` (TLS) |
| `SMTP_USER` | Tài khoản SMTP |
| `SMTP_PASSWORD` | Mật khẩu ứng dụng/API SMTP của tài khoản gửi |
| `SMTP_FROM` | Địa chỉ gửi được nhà cung cấp SMTP cho phép, ví dụ `NHTC Tour <no-reply@nhtc.com.vn>` |

Dùng SMTP của công ty hoặc dịch vụ email đã xác minh tên miền. Không cần thay DNS nếu nhà cung cấp hiện tại đã có SMTP hoạt động cho địa chỉ gửi.

Tạo AUTH_SECRET trên máy của bạn:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Các giá trị bí mật đặt trong Settings của Vercel, không đưa vào GitHub. Sau khi thêm/sửa biến môi trường: Redeploy để bản chạy nhận cấu hình mới.

## 5. Kiểm tra sau triển khai

1. Mở domain production được Vercel cấp; trang sẽ chuyển sang `/login`.
2. Email ngoài `@nhtc.com.vn` phải bị từ chối.
3. Nhập email công ty đang dùng → nhận mã → đăng nhập.
4. Chọn tour → số phiếu tăng một. Đổi tour → tổng số phiếu giữ nguyên. Tải lại → phiếu vẫn còn.
5. Đăng nhập cùng email trên thiết bị khác → thấy cùng lựa chọn.
6. Rút phiếu → tổng giảm một. Đăng xuất → không thể gọi API bình chọn hay mở PDF.
7. Dùng email công ty thứ hai để xác nhận tổng phiếu được chia sẻ giữa hai người.

Vercel Deployment Protection có thể chặn đồng nghiệp trước trang đăng nhập của ứng dụng. Chỉ thay đổi cấu hình bảo vệ deployment sau khi xác nhận muốn cho họ truy cập. Ứng dụng luôn kiểm tra mã email công ty; không chỉ kiểm tra phần đuôi email trên giao diện.

## Chạy trên máy

```sh
npm ci
# Sao chép .env.example thành .env.local và điền cấu hình
npm run db:migrate
npm run dev
```

Chạy bản production: `npm run build`, rồi `npm start`.

## Kiểm tra đã thực hiện khi chuyển đổi

- Build production Next.js và TypeScript.
- Unit tests: domain chính xác (chặn domain giả và subdomain), mã gắn với email/secret, token phiên ngẫu nhiên, chặn POST khác origin.
- HTTP kiểm tra trang đăng nhập và các đường dẫn bảo vệ khi chưa đăng nhập.

Chưa kiểm tra gửi email thật và bình chọn với PostgreSQL production vì chưa có DATABASE_URL/SMTP của bạn. Không có mật khẩu thật hay dữ liệu phiếu cũ trong gói mã nguồn này.

## Vận hành

- Giá tour là bản đối chiếu 02/11/2026, không tự cập nhật. Chỉnh `app/data.ts` khi có báo giá mới.
- Chi phí tính trong website là dự trù; các phụ thu bằng USD được quy đổi theo tỷ giá giả định hiển thị trong công cụ.
- Có thể dọn `tour_sessions` hết hạn và `tour_mail_requests` cũ định kỳ; giữ thời gian đủ cho nhu cầu vận hành. Mã/phiên hết hạn không được chấp nhận dù chưa xóa hàng.
- Đây là bản bàn giao mã nguồn; file ZIP không phải URL Vercel đã triển khai.
