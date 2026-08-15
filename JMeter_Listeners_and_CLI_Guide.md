# Cấu hình Listeners và Lệnh chạy JMeter CLI cho 3 loại Test

Để tránh lặp lại và tận dụng tối đa thế mạnh của từng loại biểu đồ/báo cáo trong JMeter, dưới đây là đề xuất 3 Listener hoàn toàn khác biệt cho 3 kịch bản kiểm thử, kèm theo giải thích lý do lựa chọn.

## 1. Đề xuất Listeners (Cần cài JMeter Plugins Manager)

### A. Load Test: `Aggregate Report` (Báo cáo tổng hợp dạng bảng)
- **Mô tả**: Hiển thị bảng dữ liệu thống kê chi tiết cho từng HTTP Request bao gồm: Average, Median, 90% Line, 95% Line, 99% Line, Min, Max, Error %, và Throughput.
- **Tại sao phù hợp?**: Load Test là kịch bản chạy tải ở mức ổn định (Baseline) trong thời gian dài (5-10 phút). Mục đích chính là lấy ra các **con số cam kết** (SLA - Service Level Agreement) vững chắc. Bạn cần nhìn vào cột *90% Line* và *Error %* trong bảng Aggregate Report để chốt lại rằng: "Ở mức 22 threads, 90% số request của EShop được xử lý dưới 500ms, tỷ lệ lỗi 0%".

### B. Stress Test: `jp@gc - Response Times Over Time` (Biểu đồ đường thời gian)
- **Mô tả**: Vẽ một biểu đồ đường (Line chart) thể hiện sự thay đổi của Response Time (trục Y) trôi qua theo thời gian thực (trục X).
- **Tại sao phù hợp?**: Mục tiêu của Stress Test là tìm ra **Breaking Point** (điểm gãy). Trong Stress Test (sử dụng Concurrency Thread Group bước đều lên 100-150 threads), biểu đồ này sẽ ban đầu nằm phẳng lỳ ở dưới thấp. Đến một giây phút định mệnh (khi SQLite hết chịu nổi và bắt đầu lock), các đường biểu diễn (đặc biệt là API Checkout/Cart) sẽ dựng đứng vọt lên trời. Nhìn vào trục X của biểu đồ này, bạn sẽ đọc được chính xác hệ thống đã "vỡ trận" vào phút thứ mấy.

### C. Spike Test: `jp@gc - Active Threads Over Time` & `jp@gc - Transactions per Second (TPS)`
- **Mô tả**: Hai biểu đồ này vẽ hình dạng của các làn sóng (Waves). Trục Y là số lượng Thread đang sống (hoặc số giao dịch mỗi giây), trục X là thời gian.
- **Tại sao phù hợp?**: Spike Test thiết kế theo dạng ngọn núi nhấp nhô. Cái bạn cần kiểm chứng ở Spike Test không hẳn là tốc độ, mà là **Khả năng Phục hồi (Recovery)**. Khi sử dụng biểu đồ *Transactions per Second*, bạn sẽ thấy TPS vọt lên một ngọn núi lớn, sau đó tụt xuống một thung lũng (khoảng nghỉ). Quan trọng nhất là ở các thung lũng tiếp theo, TPS có quay lại mức Baseline đều đặn hay không (hay là hệ thống bị treo cứng, TPS rớt thẳng về 0 và mất dấu luôn). Biểu đồ này phản ánh tính đàn hồi của Node.js Event-loop rất trực quan.

---

## 2. Hướng dẫn chạy JMeter qua Command Line Interface (CLI)

Khi chạy test thực tế để lấy số liệu phân tích, **KHÔNG BAO GIỜ** chạy test trên giao diện GUI của JMeter. Giao diện GUI tiêu tốn cực nhiều RAM và sẽ tự crash chính máy load generator của bạn trước khi SUT bị sập.

Sử dụng lệnh CLI (Non-GUI mode) sau để chạy test, xuất file thô (`.jtl`) và tự động sinh ra thư mục Web HTML Report cực đẹp:

```bash
jmeter -n -t \path\to\your_test_plan.jmx -l \path\to\results.jtl -e -o \path\to\html_report_folder
```

**Giải thích các cờ (flags):**
- `-n`: Báo cho JMeter chạy ở chế độ **Non-GUI** (Không mở giao diện đồ họa).
- `-t [file.jmx]`: Đường dẫn tới file thiết kế kịch bản test (Test plan).
- `-l [file.jtl]`: Đường dẫn tới file log dữ liệu thô (.jtl hoặc .csv). JMeter sẽ lưu toàn bộ thời gian phản hồi của từng request vào đây. *(Lưu ý: File này chưa được tồn tại trước đó, nếu có hãy xóa đi hoặc đổi tên).*
- `-e`: Báo cho JMeter biết hãy tự động Generate (Tạo) **HTML Report Dashboard** ngay sau khi bài test kết thúc.
- `-o [folder]`: Đường dẫn tới thư mục sẽ chứa các file HTML, CSS, JS của báo cáo. *(Lưu ý: Thư mục này **bắt buộc phải là thư mục rỗng** hoặc chưa tồn tại).*

**Ví dụ thực tế trên Windows PowerShell (cho bài Load Test):**
```powershell
# Chuyển vào thư mục bin của JMeter
cd C:\apache-jmeter-5.6.3\bin

# Chạy test LoadTest.jmx, lưu vào kết quả loadtest_result.jtl, và xuất web report ra thư mục LoadTest_Report
.\jmeter.bat -n -t "C:\Users\admin\Documents\HCMUS\HK3 25-26\Software Testing\HW05\LoadTest.jmx" -l "C:\Users\admin\Documents\HCMUS\HK3 25-26\Software Testing\HW05\results\loadtest_result.jtl" -e -o "C:\Users\admin\Documents\HCMUS\HK3 25-26\Software Testing\HW05\reports\LoadTest_Report"
```

Khi chạy xong, bạn chỉ cần vào thư mục `reports\LoadTest_Report` và nhấp đúp vào file `index.html` để xem báo cáo tương tác cực kỳ chuyên nghiệp trực tiếp trên trình duyệt.
