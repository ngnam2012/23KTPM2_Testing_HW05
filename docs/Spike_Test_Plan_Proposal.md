# Đề xuất Thiết kế Spike Test bằng JMeter cho EShop

Mục tiêu của Spike Test là đánh giá xem hệ thống có thể "sống sót" (survive) và phục hồi (recover) sau khi phải hứng chịu những đợt tăng tải đột biến hay không. Đặc biệt quan trọng với SUT này vì bộ nhớ dễ bị phình (Cart in-memory) và cơ chế khóa DB (SQLite lock) dễ gây nghẽn cổ chai.

## 1. Baseline threads (Tải nền)
- **Đề xuất**: **20 đến 22 Threads** (dựa trên mức tải ổn định của Load Test).
- **Justify**: Đây là mức tải mà SUT có thể xử lý trơn tru. Ta duy trì tải nền để kiểm tra xem sau khi Spike qua đi, hệ thống có trở lại trạng thái xử lý bình thường ở mức 22 threads hay không.

## 2. Spike threads (Đỉnh tải)
- **Đề xuất**: Tăng tải bằng cách **giảm Think-time về 0** thay vì tăng số lượng Threads ảo lên 100. Vẫn giữ nguyên 22 Threads nhưng tăng tối đa Request Per Second.
- **Justify**: Nếu dùng 100 threads với 22 tài khoản, nhiều threads sẽ tái sử dụng chung 1 tài khoản, dẫn đến Race Condition trên giỏ hàng (Cart) in-memory. Lỗi logic (đụng độ giỏ hàng) sẽ làm nhiễu kết quả của Spike Test. Việc đẩy mức độ Spike (Spike load) lúc này phải được thực hiện thông qua tăng tốc độ gửi request thay vì tăng số lượng Users (Threads).

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
Vì ta bị giới hạn ở 22 accounts và không thể sử dụng > 22 threads mà không làm hỏng dữ liệu, giải pháp JMeter Implementation cho Spike Test lúc này là **Sử dụng Timer động** thay vì Ultimate Thread Group.
- Vẫn dùng **Thread Group bình thường** với 22 Threads, lặp liên tục.
- Thiết lập một cấu trúc **If Controller** hoặc **JSR223 Timer** để tự động đặt Think-time (VD: 3000ms) ở chế độ Baseline. Khi đạt tới một số mốc thời gian (như phút thứ 5, 12, 19), Timer tự động chuyển về 0ms trong 1 phút để tạo Spike (tăng đột biến RPS) rồi lại tăng Think-time lên.
*(Nếu bắt buộc phải dùng Ultimate Thread Group với 100 threads, bạn bắt buộc phải có script sinh thêm 78 account nữa vào DB trước khi test).*

> [!WARNING]
> **Không Bóc tách hay Né tránh Bug Lockout**:
> Việc hệ thống bị timeout ở hàm băm mật khẩu `POST /login` khi nhận lượng RPS lớn và dẫn tới khóa tài khoản là một **đặc tính thất bại (Failure point)** của SUT.
> Bài test KHÔNG ĐƯỢC PHÉP dùng mẹo (như setup thread group) để vượt qua bước Login một lần duy nhất. Nếu test sụp đổ và Error Rate đạt 100% do account bị khóa, bạn phải báo cáo kết quả đó như một phát hiện quan trọng (Critical Finding) của Spike Test, thay vì tìm cách che giấu nó.
