# Đề xuất Thiết kế Spike Test bằng JMeter cho EShop

Mục tiêu của Spike Test là đánh giá xem hệ thống có thể "sống sót" (survive) và phục hồi (recover) sau khi phải hứng chịu những đợt tăng tải đột biến hay không. Đặc biệt quan trọng với SUT này vì bộ nhớ dễ bị phình (Cart in-memory) và cơ chế khóa DB (SQLite lock) dễ gây nghẽn cổ chai.

## 1. Baseline threads (Tải nền)
- **Đề xuất**: **20 đến 22 Threads** (dựa trên mức tải ổn định của Load Test).
- **Justify**: Đây là mức tải mà SUT có thể xử lý trơn tru. Ta duy trì tải nền để kiểm tra xem sau khi Spike qua đi, hệ thống có trở lại trạng thái xử lý bình thường ở mức 22 threads hay không.

## 2. Spike threads (Đỉnh tải)
- **Đề xuất**: **80 đến 100 Threads** (gấp khoảng **4 đến 5 lần** tải Baseline).
- **Justify**: Spike Test thường đẩy mức tải lên 3x - 5x so với tải thông thường (mô phỏng sự kiện Flash Sale hoặc gửi Push Notification). Nếu dùng 100 threads, SQLite sẽ lập tức bị contention (xung đột khóa ghi) dữ dội, đồng thời lượng Cart tạo ra in-memory sẽ tạo sức ép khổng lồ lên Garbage Collector của Node.js.

## 3. Spike duration (Thời gian kéo dài đỉnh tải)
- **Đề xuất**: **1 đến 2 phút** cho mỗi lần spike.
- **Justify**: Spike mô phỏng dòng người đổ xô vào ứng dụng tức thời. Nếu kéo dài quá lâu, nó sẽ trở thành Stress Test. Thời gian 1-2 phút là đủ để hàng đợi Node.js Event Loop phình to và SQLite lock bị kẹt.

## 4. Recovery period (Thời gian phục hồi)
- **Đề xuất**: **3 đến 5 phút** giữa các đợt Spike (trở về Baseline 22 threads).
- **Justify**: Điểm mấu chốt của Spike Test nằm ở Recovery.
   - Node.js (V8 Engine) cần thời gian (idle time) để kích hoạt quá trình Garbage Collection, thu hồi lại bộ nhớ từ hàng trăm object Cart rác.
   - Hàng đợi (Queue) của SQLite cần thời gian trống để giải quyết nốt các lệnh ghi (POST/PUT) bị tồn đọng và báo lỗi những giao dịch quá hạn.

## 5. Số lượng Spike
- **Đề xuất**: **2 đến 3 đợt Spike** trong toàn bộ kịch bản.
- **Justify**: Đợt Spike đầu tiên chứng minh hệ thống không bị sập lập tức. Đợt Spike thứ 2 và 3 chứng minh hệ thống không bị rò rỉ (leak) tài nguyên dài hạn. Nếu rò rỉ memory ở Cart không được dọn dẹp, đợt Spike thứ 3 có thể làm Node.js báo lỗi `Out of Memory` và sập hoàn toàn.

## 6. JMeter Implementation
Để vẽ được biểu đồ sóng (Spike), công cụ chuẩn mực nhất là **Plugin `bzm - Ultimate Thread Group`**. 
Cấu hình Schedule Record (Các hàng kịch bản):

1. **Hàng 1 (Baseline)**:
   - Start Threads: 22 | Initial Delay: 0 | Startup Time: 10s | Hold Load For: 1800s (30 phút) | Shutdown Time: 10s
2. **Hàng 2 (Spike 1)**:
   - Start Threads: 78 | Initial Delay: 300s (Phút thứ 5) | Startup Time: 10s | Hold Load: 60s | Shutdown Time: 10s
3. **Hàng 3 (Spike 2)**:
   - Start Threads: 78 | Initial Delay: 720s (Phút 12) | Startup Time: 10s | Hold Load: 60s | Shutdown Time: 10s
4. **Hàng 4 (Spike 3)**:
   - Start Threads: 78 | Initial Delay: 1140s (Phút 19) | Startup Time: 10s | Hold Load: 60s | Shutdown Time: 10s

*(Tổng số Threads tại đỉnh Spike = 22 Baseline + 78 Spike = 100 Threads).*

> [!WARNING]
> **Vấn đề Lockout Bug**: Giống như Stress Test, khi 100 threads dồn vào cùng một lúc, `POST /login` sẽ dễ bị timeout. Do SUT hiểu timeout là sai pass, 22 tài khoản test sẽ bị khóa sạch ngay ở Spike đầu tiên.
> **Workaround**: Bạn VẪN PHẢI bóc tách `POST /login` ra khỏi Ultimate Thread Group. Chạy Auth 1 lần trước đó để lưu mảng Token, sau đó bước vào Spike Test chỉ với các giao dịch nội bộ từ bước 2 đến bước 10. Lúc này, Spike Test sẽ hoàn toàn tập trung vào việc tra tấn Memory (bằng Cart in-memory) và Database (bằng Checkout/Cancel DB Lock).
